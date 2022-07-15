'use strict';

const http         = require('http');
const EventEmitter = require('events').EventEmitter;
const uuid         = require('uuid/v4');
const bodyParser   = require('body-parser');
const express      = require('express');

class ToDoApplication extends EventEmitter {

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
     * @param {ToDoList} toDoList
     */
    constructor(config, routeLoader, logger, toDoList) {
        super();
        this._config      = config;
        this._routeLoader = routeLoader;
        this._logger      = logger;
        this._toDoList    = toDoList;

        this._id = uuid();
        /** @type {express|undefined} **/
        this._app = undefined;
        /** @type {Server|undefined} **/
        this._server = undefined;
        this._status = ToDoApplication.STATUS_STOPPED;

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
     * @return {ToDoList}
     */
    getToDoList() {
        return this._toDoList;
    }

    /**
     * @return {ToDoApplication}
     */
    async bootstrap() {
        const app = express();

        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

        await this._routeLoader.load(this, app, this._config.rootPath, this._config.routeDirPaths);

        this._app = app;

        return this;
    }

    /**
     * @return {Promise}
     */
    start() {
        return new Promise((resolve, reject) => {
            if (this._status !== ToDoApplication.STATUS_STOPPED) {
                return reject(new Error('Service is already started or is starting right now'));
            }

            const server = http.createServer(this._app);

            const onInitError = (error) => {
                this._status = ToDoApplication.STATUS_STOPPED;
                reject(error);
            };

            const onListening = () => {
                server.removeListener('error', onInitError);
                server.on('error', this._onServerError);
                this._server = server;
                this._status = ToDoApplication.STATUS_STARTED;
                resolve();
            };

            server.listen(this._config.port);
            server.once('error', onInitError);
            server.once('listening', onListening);
            this._status = ToDoApplication.STATUS_STARTING;
        });
    }

    /**
     * @return {Promise}
     */
    stop() {
        return new Promise((resolve, reject) => {
            if (this._status !== ToDoApplication.STATUS_STARTED) {
                reject(new Error('Service is not started'));
            }

            this._status = ToDoApplication.STATUS_STOPPING;

            this._server.close(() => {
                this._status = ToDoApplication.STATUS_STOPPED;
                this._server = undefined;

                resolve();
            });
        });
    }

    _onServerError(err) {
        this.emit('error', err);
    }
}

module.exports = ToDoApplication;
