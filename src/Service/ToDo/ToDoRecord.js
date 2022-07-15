'use strict';

class ToDoRecord {
    /**
     * @param {string} text
     */
    constructor(text) {
        this._text = text;
    }

    /**
     * @return {string}
     */
    getText() {
        return this._text;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @return {string}
     */
    toJSON() {
        return this._text;
    }
}

module.exports = ToDoRecord;
