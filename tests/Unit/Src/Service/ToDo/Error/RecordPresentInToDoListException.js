'use strict';

const RecordPresentInToDoListError = require('src/Service/ToDo/Error/RecordPresentInToDoListError');
const ToDoRecord                   = require('src/Service/ToDo/ToDoRecord');

const assert = require('chai').assert;
const sinon  = require('sinon');

describe('src/service/to-do/error/RecordPresentInToDoListError', () => {
    it('should return message with correct ToDoRecord text', () => {
        const message = 'ololo';
        const record  = sinon.createStubInstance(ToDoRecord);

        record.getText.returns(message);

        const error = new RecordPresentInToDoListError(record);

        assert.isOk(record.getText.calledOnce);

        assert.strictEqual(
            `Record "${message}" present in to do list`,
            error.message
        );
    });
});
