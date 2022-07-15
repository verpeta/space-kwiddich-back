'use strict';

const clone = require('clone');
const winston = require('winston');
const Sentry = require('@sentry/node');

class SentryTransport extends winston.Transport {
    /**
     * @param {object} options
     */
    constructor(options) {
        options.name = 'sentry';
        options.handleExceptions = options.handleExceptions || false;
        options.level = options.level || 'error';

        super(options);

        this._sentryDsn = options.sentryDsn || '';
        this._environment = process.env.NODE_ENV || 'undefined';
        this._levels = new Map([
            ['silly', 'debug'],
            ['verbose', 'debug'],
            ['info', 'info'],
            ['debug', 'debug'],
            ['warn', 'warning'],
            ['error', 'error']
        ]);
    }

    /**
     * Initializes custom sentry transport
     *
     * @return {SentryTransport}
     */
    create() {
        Sentry.init({
            dsn: this._sentryDsn,
            environment: this._environment,
        });

        return this;
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * @param {string} level
     * @param {string} message
     * @param {object} meta
     * @param {function} callback
     */
    log(level, message, meta = {}, callback) {
        if (meta instanceof Error) {
            const error = clone(meta);
            const sentryMeta = {
                level: this._levels.get(level)
            };

            if (error.extra) {
                sentryMeta.extra = error.extra;
                delete error.extra;
            }

            Sentry.captureException(error, sentryMeta);
            this.emit('logged');

            if (callback) {
                callback(null, true);
            }
        }
    }
}

module.exports = SentryTransport;
