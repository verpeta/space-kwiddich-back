'use strict';

const jsonSchema = require('jsonschema');

class ConfigValidator {
    constructor() {
        this._jsonSchemaValidator = new jsonSchema.Validator();
        this._isSchemasInitialized = false;
    }

    _addSchemas() {
        if (this._isSchemasInitialized) {
            return this;
        }

        this._rootSchema   = require('schema/config/root.json');
        this._jsonSchemaValidator.addSchema(require('schema/config/logger.json'), '/logger');
        this._jsonSchemaValidator.addSchema(require('schema/config/toDoApp.json'), '/toDoApp');
        this._jsonSchemaValidator.addSchema(require('schema/config/apiApp.json'), '/apiApp');
        this._isSchemasInitialized = true;

        return this;
    }

    /**
     * @throws jsonSchema.ValidatorResultError
     * @param {{}} config
     */
    validate(config) {
        this._addSchemas();

        this._jsonSchemaValidator.validate(
            config,
            this._rootSchema,
            { throwAll: false, required: true, allowUnknownAttributes: true }
        );
    }
}

module.exports = ConfigValidator;
