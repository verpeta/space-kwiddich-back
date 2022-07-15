'use strict';

const util = require('util');

/**
 * @return {Function}
 */
exports.timestampFormatter = () => {
    return function () {
        const seconds = Date.now() + '';

        return seconds.slice(0, -3) + '.' + seconds.slice(-3);
    };
};

/**
 * This formatter add Error.stack instances to "Meta" section, using "options.meta.stack" property.
 *
 * The only exception if logger called with Error and meta: "logger(new Error(), {foo: 'bar'})".
 * In this case, "options.message" is stringified Error, and "options.meta" property is {foo: 'bar'}.
 *
 * @return {Function}
 */
exports.messageFormatter = () => {
    return function (options) {
        const meta     = Object.assign({}, options.meta);
        let stackTrace = '';

        if (meta.stack) {
            stackTrace = '.\nStack: ' + meta.stack;
            delete meta.stack;
        }

        const message = options.message ? (' ' + options.message + '. ') : ' ';
        const stringifiedMeta = Object.keys(meta).length > 0 ?
            ('Meta: ' + util.inspect(meta, {depth: 4, breakLength: Infinity}) + stackTrace) :
            '';

        return `[${options.timestamp()}][${options.level.toUpperCase()}]${message}${stringifiedMeta}`;
    };
};

/**
 * This function create object that used for write logs outside Logger
 * @param {string} type
 * @param {Error} error
 * @return {{message: string, formattedMessage: string, formattedException: string}}
 */
exports.errorFormatter = (type, error) => {
    const date             = Date.now() / 1000;
    const message          = error.message || error;
    const formattedMessage = `[${date}] ${type}: ${message}`;

    return {
        message:            message,
        formattedMessage:   formattedMessage,
        formattedException: util.inspect(error, {depth: 2})
    };
};
