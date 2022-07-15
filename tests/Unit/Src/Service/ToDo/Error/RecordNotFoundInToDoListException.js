'use strict';

const RecordNotFoundInToDoListError = require('src/Service/ToDo/Error/RecordNotFoundInToDoListError');
const ToDoRecord                    = require('src/Service/ToDo/ToDoRecord');

const assert = require('chai').assert;
const sinon  = require('sinon');

describe('src/service/to-do/error/RecordNotFoundInToDoListError', () => {
    it('should return message with correct ToDoRecord text', () => {
        const message = 'ololo';
        const record  = sinon.createStubInstance(ToDoRecord);

        record.getText.returns(message);

        const error = new RecordNotFoundInToDoListError(record);

        assert.isOk(record.getText.calledOnce);

        assert.strictEqual(
            `Record "${message}" not found in to do list`,
            error.message
        );
    });
});
