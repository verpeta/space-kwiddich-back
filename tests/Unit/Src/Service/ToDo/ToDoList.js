'use strict';

const ToDoRecord                    = require('src/Service/ToDo/ToDoRecord');
const ToDoList                      = require('src/Service/ToDo/ToDoList');
const RecordPresentInToDoListError  = require('src/Service/ToDo/Error/RecordPresentInToDoListError');
const RecordNotFoundInToDoListError = require('src/Service/ToDo/Error/RecordNotFoundInToDoListError');

const assert = require('chai').assert;
const sinon  = require('sinon');

describe('src/service/to-do/ToDoRecord', () => {
    it('records are correctly added', () => {
        const list = new ToDoList();

        assert.empty(list.getRecords());

        const record1 = sinon.createStubInstance(ToDoRecord);
        record1.getText.returns('record1');

        list.addRecord(record1);
        assert.isOk(record1.getText.notCalled);

        assert.isTrue(list.hasRecord(record1));
        assert.strictEqual(record1.getText.callCount, 2);

        const record2 = sinon.createStubInstance(ToDoRecord);
        record2.getText.returns('record2');

        list.addRecord(record2);

        assert.isOk(record2.getText.calledOnce);

        assert.isTrue(list.hasRecord(record2));
        assert.strictEqual(record2.getText.callCount, 4);

        const record3 = sinon.createStubInstance(ToDoRecord);
        record3.getText.returns('record3');

        assert.isFalse(list.hasRecord(record3));
        assert.strictEqual(record3.getText.callCount, 2);
    });

    it('duplicate record not added', () => {
        const list = new ToDoList();

        assert.empty(list.getRecords());

        const record1 = sinon.createStubInstance(ToDoRecord);
        record1.getText.returns('record1');

        list.addRecord(record1);

        assert.isOk(record1.getText.notCalled);

        assert.throws(() => list.addRecord(record1), RecordPresentInToDoListError);
        assert.isOk(record1.getText.calledThrice);
    });

    it('records are correctly removed', () => {
        const list = new ToDoList();

        assert.empty(list.getRecords());

        const record1 = sinon.createStubInstance(ToDoRecord);
        record1.getText.returns('record1');

        list.addRecord(record1);
        assert.isTrue(list.hasRecord(record1));

        const record2 = sinon.createStubInstance(ToDoRecord);
        record2.getText.returns('record2');

        list.addRecord(record2);
        assert.isTrue(list.hasRecord(record2));

        const record3 = sinon.createStubInstance(ToDoRecord);
        record3.getText.returns('record3');

        assert.isFalse(list.hasRecord(record3));

        list.removeRecord(record1);

        assert.isFalse(list.hasRecord(record1));
        assert.strictEqual(record1.getText.callCount, 11);

        assert.isTrue(list.hasRecord(record2));
        assert.strictEqual(record2.getText.callCount, 9);

        assert.isFalse(list.hasRecord(record3));
        assert.strictEqual(record2.getText.callCount, 10);

        list.removeRecord(record2);

        assert.isFalse(list.hasRecord(record1));
        assert.strictEqual(record1.getText.callCount, 11);

        assert.isFalse(list.hasRecord(record2));
        assert.strictEqual(record2.getText.callCount, 14);

        assert.isFalse(list.hasRecord(record3));
        assert.strictEqual(record2.getText.callCount, 14);

        assert.throws(() => list.removeRecord(record3), RecordNotFoundInToDoListError);

        assert.isFalse(list.hasRecord(record1));
        assert.strictEqual(record1.getText.callCount, 11);

        assert.isFalse(list.hasRecord(record2));
        assert.strictEqual(record2.getText.callCount, 14);

        assert.isFalse(list.hasRecord(record3));
        assert.strictEqual(record2.getText.callCount, 14);
    });
});
