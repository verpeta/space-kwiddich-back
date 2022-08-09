'use strict';

const http = require('http');
const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid/v4');
const bodyParser = require('body-parser');
const express = require('express');
const {Server} = require("socket.io");
const {createContainer, asValue, InjectionMode, Lifetime} = require('awilix')
const {scopePerRequest} = require('awilix-express')
const cors = require("cors");


class ApiApplication extends EventEmitter {

    static get STATUS_STOPPED() {
        return 1;
    }

    static get STATUS_STARTING() {
        return 2;
    }

    static get STATUS_STARTED() {
        return 3;
    }

    static get STATUS_STOPPING() {
        return 4;
    }

    /**
     * @param {{}} config
     * @param {RouteLoader} routeLoader
     * @param {winston} logger
     */
    constructor(config, routeLoader, logger) {
        super();
        this._config = config;
        this._routeLoader = routeLoader;
        this._logger = logger;

        this._id = uuid();
        /** @type {express|undefined} **/
        this._app = undefined;
        /** @type {Server|undefined} **/
        this._server = undefined;
        this._status = ApiApplication.STATUS_STOPPED;

        this._onServerError = this._onServerError.bind(this);
    }

    /**
     * @return {{}}
     */
    getConfig() {
        return this._config;
    }

    /**
     * @return {string}
     */
    getId() {
        return this._id;
    }

    /**
     * @return {number}
     */
    getPort() {
        return this._config.port;
    }

    /**
     * @return {express}
     */
    getApp() {
        return this._app;
    }

    /**
     * @return {winston}
     */
    getLogger() {
        return this._logger;
    }

    /**
     * @return {ApiApplication}
     */
    async bootstrap() {
        const app = express();

        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
        app.use(cors({ origin: [this._config.ALLOWED_ORIGIN], }))



        // Di
        await this.#initDI()

        app.use(scopePerRequest(this.container))
        app.use((req, res, next) => {
            req.container.register({
                currentUser: asValue(115)
            })

            return next()
        })


        await this._routeLoader.load(this, app, this._config.rootPath, this._config.routeDirPaths);

        this._app = app;

        return this;
    }

    async #initDI() {
        this.container = createContainer({
            injectionMode: InjectionMode.PROXY
        });
        const opts = {
            formatName: 'camelCase',
            cwd: __dirname,
            resolverOptions: {
                lifetime: Lifetime.SINGLETON,
            }
        }
        this.container.register({
            logger: asValue(this._logger),
        })
        await this.container.loadModules(
            [
                'Service/Api/*/*.js',
            ],
            opts,
        )
    }

    /**
     * @return {Promise}
     */
    start() {
        return new Promise((resolve, reject) => {
            if (this._status !== ApiApplication.STATUS_STOPPED) {
                return reject(new Error('Service is already started or is starting right now'));
            }

            const server = http.createServer(this._app);

            const io = new Server(server, {
                cors: {
                    origin: this._config.ALLOWED_ORIGIN,
                    credentials: true
                }
            });

            this.container.register({
                io: asValue(io)
            });

            io.on('connection', (socket) => {
                const ss = this.container.cradle.socketEvents;
                ss.onConnection(socket);
            })

            const onInitError = (error) => {
                this._status = ApiApplication.STATUS_STOPPED;
                reject(error);
            };

            const onListening = () => {
                server.removeListener('error', onInitError);
                server.on('error', this._onServerError);

                this._server = server;
                this._status = ApiApplication.STATUS_STARTED;

                resolve();
            };

            server.listen(this._config.port);
            server.once('error', onInitError);
            server.once('listening', onListening);

            this._status = ApiApplication.STATUS_STARTING;
        });
    }

    /**
     * @return {Promise}
     */
    stop() {
        return new Promise((resolve, reject) => {
            if (this._status !== ApiApplication.STATUS_STARTED) {
                reject(new Error('Service is not started'));
            }

            this._status = ApiApplication.STATUS_STOPPING;

            this._server.close(() => {
                this._status = ApiApplication.STATUS_STOPPED;
                this._server = undefined;
                resolve();
            });
        });
    }

    _onServerError(err) {
        this.emit('error', err);
    }
}

module.exports = ApiApplication;
