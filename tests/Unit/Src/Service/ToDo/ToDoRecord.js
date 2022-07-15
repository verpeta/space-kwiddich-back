'use strict';

const ToDoRecord = require('src/Service/ToDo/ToDoRecord');

const assert = require('chai').assert;

describe('src/service/to-do/ToDoRecord', () => {
    it('properties are correctly set', () => {
        const text   = 'some text';
        const record = new ToDoRecord(text);

        assert.strictEqual(record.getText(), text);
    });

    it('properties are correctly JSON-encoded', () => {
        const text   = 'some text';
        const record = new ToDoRecord(text);

        assert.strictEqual(JSON.stringify(record), JSON.stringify(text));
    });
});
