'use strict';

const ExtendableError = require('src/Error/ExtendableError');

class RecordPresentInToDoListError extends ExtendableError {
    /**
     * @param {ToDoRecord} record
     */
    constructor(record) {
        super(`Record "${record.getText()}" present in to do list`);
    }
}

module.exports = RecordPresentInToDoListError;
