'use strict';

const path = require('path');
const rootPath = path.join(__dirname, '..');

require('app-module-path').addPath(rootPath);

const config = require('config');

const ConfigValidator = require('src/Service/ConfigValidator');

const validator = new ConfigValidator();
validator.validate(config);
