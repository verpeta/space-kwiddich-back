'use strict';

const path            = require('path');
const config          = require('config');
const winston         = require('winston');
const supertest       = require('supertest');
const RouteLoader     = require('src/Service/RouteLoader');
const ToDoApplication = require('src/ToDoApplication');
const ToDoList        = require('src/Service/ToDo/ToDoList');

const assert = require('chai').assert;
const sinon  = require('sinon');

/**
 * @return {express}
 */
async function createToDoApplication(toDoListMock = undefined, loggerMock = undefined) {
    const rootPath   = path.join(__dirname + '/../../../../');
    const publicPath = path.join(rootPath, '/public');

    const toDoApplicationConfig = Object.assign(
        {
            rootPath:   rootPath,
            publicPath: publicPath
        },
        config.toDoApp
    );

    const routeLoader = new RouteLoader(false);
    const toDoList    = toDoListMock ? toDoListMock : new ToDoList();

    const app = new ToDoApplication(toDoApplicationConfig, routeLoader, loggerMock, toDoList);

    await app.bootstrap();

    return app.getApp();
}

describe('TODO route tests', () => {
    it('GET:/todo: should return empty todo list', async () => {

        const app = await createToDoApplication();

        const result = await supertest(app).get('/todo');

        const expectedResponse   = [];
        const expectedStatusCode = 200;

        assert.deepEqual(result.body, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });

    it('GET:/todo: should fail with unknown error', async () => {
        const error = new Error('error');

        const logger = sinon.createStubInstance(winston.Logger);

        logger.error = sinon.stub();

        const toDoList = sinon.createStubInstance(ToDoList);
        toDoList.getRecords.throws(error);

        const app = await createToDoApplication(toDoList, logger);

        const result = await supertest(app).get('/todo');

        assert.isOk(logger.error.calledOnce);
        assert.isOk(logger.error.calledWithExactly(error.message, error));

        const expectedResponse   = 'Something goes wrong while record list getting.';
        const expectedStatusCode = 500;

        assert.strictEqual(result.text, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });

    it('POST:/todo: should fail with invalid new todo', async () => {

        const app = await createToDoApplication();

        const result = await supertest(app).post('/todo');

        const expectedResponse   = 'Record filed "text" is required.';
        const expectedStatusCode = 400;

        assert.strictEqual(result.text, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });

    it('POST:/todo: should add new todo', async () => {

        const app    = await createToDoApplication();
        const record = {text: 'my new todo'};

        const result = await supertest(app).post('/todo').send(record);

        const expectedResponse   = `Record "${record.text}" was added.`;
        const expectedStatusCode = 200;

        assert.strictEqual(result.text, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });

    it('POST:/todo: should not add duplicated todo', async () => {

        const app    = await createToDoApplication();
        const record = {text: 'my new todo'};

        const resultCreate1 = await supertest(app).post('/todo').send(record);

        const createExpectedResponse1   = `Record "${record.text}" was added.`;
        const createExpectedStatusCode1 = 200;

        assert.strictEqual(resultCreate1.text, createExpectedResponse1);
        assert.strictEqual(resultCreate1.statusCode, createExpectedStatusCode1);

        const resultCreate2 = await supertest(app).post('/todo').send(record);

        const createExpectedResponse2   = `Record "${record.text}" already added.`;
        const createExpectedStatusCode2 = 400;

        assert.strictEqual(resultCreate2.text, createExpectedResponse2);
        assert.strictEqual(resultCreate2.statusCode, createExpectedStatusCode2);
    });

    it('POST:/todo: should fail with unknown error', async () => {
        const error = new Error('error');

        const logger = sinon.createStubInstance(winston.Logger);

        logger.error = sinon.stub();

        const toDoList = sinon.createStubInstance(ToDoList);
        toDoList.addRecord.throws(error);

        const app    = await createToDoApplication(toDoList, logger);
        const record = {text: 'my new todo'};

        const result = await supertest(app).post('/todo').send(record);

        assert.isOk(logger.error.calledOnce);
        assert.isOk(logger.error.calledWithExactly(error.message, error));

        const expectedResponse   = 'Something goes wrong while record adding.';
        const expectedStatusCode = 500;

        assert.strictEqual(result.text, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });

    it('DELETE:/todo: should fail with invalid new todo', async () => {

        const app = await createToDoApplication();

        const result = await supertest(app).delete('/todo');

        const expectedResponse   = 'Record filed "text" is required.';
        const expectedStatusCode = 400;

        assert.strictEqual(result.text, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });

    it('DELETE:/todo: should fail with delete unknown todo', async () => {

        const app    = await createToDoApplication();
        const record = {text: 'my new todo'};

        const result = await supertest(app).delete('/todo').send(record);

        const expectedResponse   = `Record "${record.text}" not found.`;
        const expectedStatusCode = 404;

        assert.strictEqual(result.text, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });

    it('DELETE:/todo: should remove todo', async () => {

        const app    = await createToDoApplication();
        const record = {text: 'my new todo'};

        const resultCreate = await supertest(app).post('/todo').send(record);

        const createExpectedResponse   = `Record "${record.text}" was added.`;
        const createExpectedStatusCode = 200;

        assert.strictEqual(resultCreate.text, createExpectedResponse);
        assert.strictEqual(resultCreate.statusCode, createExpectedStatusCode);

        const resultDelete = await supertest(app).delete('/todo').send(record);

        const deleteExpectedResponse   = `Record "${record.text}" was removed.`;
        const deleteExpectedStatusCode = 200;

        assert.strictEqual(resultDelete.text, deleteExpectedResponse);
        assert.strictEqual(resultDelete.statusCode, deleteExpectedStatusCode);
    });

    it('DELETE:/todo: should fail with unknown error', async () => {
        const error = new Error('error');

        const logger = sinon.createStubInstance(winston.Logger);

        logger.error = sinon.stub();

        const toDoList = sinon.createStubInstance(ToDoList);
        toDoList.removeRecord.throws(error);

        const app    = await createToDoApplication(toDoList, logger);
        const record = {text: 'my new todo'};

        const result = await supertest(app).delete('/todo').send(record);

        assert.isOk(logger.error.calledOnce);
        assert.isOk(logger.error.calledWithExactly(error.message, error));

        const expectedResponse   = 'Something goes wrong while record removing.';
        const expectedStatusCode = 500;

        assert.strictEqual(result.text, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });
});
