'use strict';

const RecordPresentInToDoListError  = require('./Error/RecordPresentInToDoListError');
const RecordNotFoundInToDoListError = require('./Error/RecordNotFoundInToDoListError');

class ToDoList {
    constructor() {
        this._elements = [];
    }

    /**
     * @return {Array.<ToDoRecord>}
     */
    getRecords() {
        return this._elements;
    }

    /**
     * @param {ToDoRecord} toDoRecord
     * @return {boolean}
     */
    hasRecord(toDoRecord) {
        return this._elements.some(element => element.getText() === toDoRecord.getText());
    }

    /**
     * @param {ToDoRecord} toDoRecord
     * @throws RecordPresentInToDoListError
     */
    addRecord(toDoRecord) {
        if (!this.hasRecord(toDoRecord)) {
            this._elements.push(toDoRecord);
        } else {
            throw new RecordPresentInToDoListError(toDoRecord);
        }
    }

    /**
     * @param {ToDoRecord} toDoRecord
     * @throws RecordNotFoundInToDoListError
     */
    removeRecord(toDoRecord) {
        if (this.hasRecord(toDoRecord)) {
            this._elements = this._elements.filter(element => element.getText() !== toDoRecord.getText());
        } else {
            throw new RecordNotFoundInToDoListError(toDoRecord);
        }
    }
}

module.exports = ToDoList;
