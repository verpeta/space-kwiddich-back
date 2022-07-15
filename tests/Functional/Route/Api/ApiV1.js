'use strict';

const path           = require('path');
const config         = require('config');
const supertest      = require('supertest');
const RouteLoader    = require('src/Service/RouteLoader');
const ApiApplication = require('src/ApiApplication');

const assert  = require('chai').assert;
const version = 'v1';

/**
 * @return {express}
 */
async function createApiApplication() {
    const rootPath   = path.join(__dirname + '/../../../../');
    const publicPath = path.join(rootPath, '/public');

    const apiApplicationConfig = Object.assign(
        {
            rootPath:   rootPath,
            publicPath: publicPath
        },
        config.apiApp
    );

    const routeLoader = new RouteLoader(false);

    const app = new ApiApplication(apiApplicationConfig, routeLoader);

    await app.bootstrap();

    return app.getApp();
}

describe('API route tests', () => {
    it(`GET:/api/${version}/main: should return correct response`, async () => {

        const app = await createApiApplication();

        const result = await supertest(app).get(`/api/${version}/main`);

        const expectedResponse   = {message: 'API main page'};
        const expectedStatusCode = 200;

        assert.deepEqual(result.body, expectedResponse);
        assert.strictEqual(result.statusCode, expectedStatusCode);
    });
});
