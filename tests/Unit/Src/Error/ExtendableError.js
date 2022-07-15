'use strict';

const ExtendableError = require('src/Error/ExtendableError');

const assert = require('chai').assert;

describe('src/error/ExtendableError', () => {
    it('should set correct name', () => {
        const error = new ExtendableError();

        assert.strictEqual(error.name, 'ExtendableError');
    });

    it('should be correctly created with empty message and without extra', () => {
        const message = '';
        const extra   = undefined;

        const error = new ExtendableError();

        const expectedToStringMessage = error.name;

        assert.strictEqual(error.message, message);
        assert.strictEqual(error.extra, extra);
        assert.strictEqual(error.toString(), expectedToStringMessage);
    });

    it('should be correctly created with non-empty message and without extra', () => {
        const message = 'ololo';
        const extra   = undefined;

        const error = new ExtendableError(message, extra);

        const expectedToStringMessage = `${error.name}: ${message}`;

        assert.strictEqual(error.message, message);
        assert.strictEqual(error.extra, extra);
        assert.strictEqual(error.toString(), expectedToStringMessage);
    });

    it('should be correctly created with empty message and with extra', () => {
        const message = '';
        const extra   = {foo: {bar: 'baz'}};

        const error = new ExtendableError(message, extra);

        const expectedToStringMessage = `${error.name} Extra: ${JSON.stringify(extra)}`;

        assert.strictEqual(error.message, message);
        assert.deepEqual(error.extra, extra);
        assert.strictEqual(error.toString(), expectedToStringMessage);
    });

    it('should be correctly created with non-empty message and with extra', () => {
        const message = 'ololo';
        const extra   = {foo: {bar: 'baz'}};

        const error = new ExtendableError(message, extra);

        const expectedToStringMessage = `${error.name}: ${message} Extra: ${JSON.stringify(extra)}`;

        assert.strictEqual(error.message, message);
        assert.deepEqual(error.extra, extra);
        assert.strictEqual(error.toString(), expectedToStringMessage);
    });
});
