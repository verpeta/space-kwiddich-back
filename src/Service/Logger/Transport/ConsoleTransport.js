'use strict';

const winston = require('winston');
const {
    timestampFormatter,
    messageFormatter
} = require('src/Helper/formatter');

class ConsoleTransport {
    /**
     * @param {object} options
     */
    constructor(options = {}) {
        this._handleExceptions = options.handleExceptions || false;
        this._level            = options.level || 'debug';
    }

    /**
     * @return {winston.Transport}
     */
    create() {
        return new (winston.transports.Console)(
            {
                handleExceptions: this._handleExceptions,
                timestamp:        timestampFormatter(),
                formatter:        messageFormatter(),
                level:            this._level,
            }
        );
    }
}

module.exports = ConsoleTransport;
