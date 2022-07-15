'use strict';

const winston = require('winston');
const fs = require('fs');
const path = require('path');

require('winston-daily-rotate-file');

const {
    timestampFormatter,
    messageFormatter
} = require('src/Helper/formatter');

class FileTransport {
    /**
     * @param {object} options
     * @param {string} options.filename
     */
    constructor(options = {}) {
        if (!options.filename) {
            throw new Error('File name is required for FileTransport');
        }

        this._filename         = options.filename;
        this._datePattern      = options.datePattern || 'yyyy-MM-dd.';
        this._prepend          = true;
        this._handleExceptions = options.handleExceptions || false;
        this._level            = options.level || 'info';
    }

    /**
     * @return {winston.Transport}
     */
    create() {
        this._createNonExistentDirectories(this._filename);

        return new (winston.transports.DailyRotateFile)(
            {
                filename:         this._filename,
                datePattern:      this._datePattern,
                prepend:          this._prepend,
                handleExceptions: this._handleExceptions,
                timestamp:        timestampFormatter(),
                formatter:        messageFormatter(),
                level:            this._level,
            }
        );
    }

    /**
     * Recursively creates non-existent directories in the path where log file must be created
     *
     * @param fileName of the log file
     * @private
     * @return {this}
     */
    _createNonExistentDirectories(fileName) {
        const logFolder = path.dirname(fileName);

        if (!fs.existsSync(logFolder)) {
            fs.mkdirSync(logFolder, {recursive: true});
        }

        return this;
    }
}

module.exports = FileTransport;
