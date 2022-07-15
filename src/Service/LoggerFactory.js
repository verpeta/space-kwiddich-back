'use strict';

const winston = require('winston');

const {
    SentryTransport,
    ConsoleTransport,
    FileTransport
} = require('src/Service/Logger/Transport');

class LoggerFactory {

    /**
     * @return {winston.Logger}
     */
    create(config) {
        const transports = [];

        const factories = {
            console: ConsoleTransport,
            file: FileTransport,
            sentry: SentryTransport
        };

        const addTransport = function (transport) {
            const options = config[transport];

            const factory = factories[transport];

            if (factory) {
                const instance = new factory(options).create();

                if (instance) {
                    transports.push(instance);
                } else {
                    console.warn(`Transport ${transport} not created`);
                }
            } else {
                console.error(`Transport ${transport} not supported`);
            }
        };

        Object.keys(config).forEach(addTransport);

        // noinspection UnnecessaryLocalVariableJS
        const logger = new winston.createLogger({
            transports:  transports,
         //   exitOnError: false,
          //  emitErrs:    true
        });

        return logger;
    }
}

module.exports = LoggerFactory;
