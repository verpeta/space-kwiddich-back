'use strict';

const ExtendableError = require('src/Error/ExtendableError');

class RecordNotFoundInToDoListError extends ExtendableError {
    /**
     * @param {ToDoRecord} record
     */
    constructor(record) {
        super(`Record "${record.getText()}" not found in to do list`);
    }
}

module.exports = RecordNotFoundInToDoListError;
