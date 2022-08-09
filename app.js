'use strict';

require('app-module-path').addPath(__dirname);

const path             = require('path');
const config           = require('config');
const ConfigValidator  = require('src/Service/ConfigValidator');
const RouteLoader      = require('src/Service/RouteLoader');
const ToDoApplication  = require('src/ToDoApplication');
const ToDoList         = require('src/Service/ToDo/ToDoList');
const ApiApplication   = require('src/ApiApplication');
const LoggerFactory    = require('src/Service/LoggerFactory');
const {errorFormatter} = require('src/Helper/formatter');

const rootPath   = __dirname;
const publicPath = path.join(rootPath, '/public');

try {
    const configValidator = new ConfigValidator();
    configValidator.validate(config);
} catch (err) {
    const formattedConfigError = errorFormatter('Config error', err);

    console.log(formattedConfigError.formattedMessage, formattedConfigError.formattedException);
    process.exit(1);
}

const routeLoader = new RouteLoader();

const logger = new LoggerFactory().create(config.logger);

const toDoApplicationConfig = Object.assign(
    {
        rootPath:   rootPath,
        publicPath: publicPath
    },
    config.toDoApp
);

const toDoList        = new ToDoList();
const toDoApplication = new ToDoApplication(toDoApplicationConfig, routeLoader, logger, toDoList);

const apiApplicationConfig = Object.assign(
    {
        rootPath:   rootPath,
        publicPath: publicPath
    },
    config.apiApp
);

const apiApplication = new ApiApplication(apiApplicationConfig, routeLoader, logger);

async function startApplications() {
    await Promise.all([toDoApplication.bootstrap(), apiApplication.bootstrap()]);
    await Promise.all([toDoApplication.start(), apiApplication.start()]);

    logger.info(`ToDo Application "${toDoApplication.getId()}" started.`);
    logger.info(`API Application "${apiApplication.getId()}" started.`);

    const onAppError = (err) => {
        logger.error(err);
        logger.info('Going to stop service'); // in critical services without state this action may be omitted
        process.nextTick(() => stopApplications(true));
    };

    [toDoApplication, apiApplication].forEach(app => {
        app.on('error', onAppError);
    });
}

async function stopApplications(emergency = false) {
    // stop applications here, de-register from Consul, etc.

    try {
        await Promise.all([toDoApplication.stop(), apiApplication.stop()]);
        logger.info(`ToDo Application "${toDoApplication.getId()}" stopped.`);
        logger.info(`API Application "${apiApplication.getId()}" stopped.`);
    } catch (err) {
        logger.error(`At least one of application has failed to stop, error = ${err}`);
        emergency = true;
    }

    try {
        logger.close();

        setTimeout(() => process.exit(emergency ? 1 : 0), 1000);
    } catch (err) {
        const formattedLoggerErr = errorFormatter('Logger error', err);

        console.log(formattedLoggerErr.formattedMessage, formattedLoggerErr.formattedException);

        setTimeout(() => process.exit(emergency ? 1 : 0), 1000);
    }
}

startApplications().catch(err => {
    console.log(err)
    logger.error(err);
    logger.close();

    setTimeout(() => process.exit(1), 1000);
});

process.on('SIGTERM', stopApplications);
process.on('SIGINT', stopApplications);

process.on('unhandledRejection', reason => {
    logger.error(reason.message || reason, reason);
});

process.on('uncaughtException', uncaughtException => {
    const formattedUncaughtException = errorFormatter('uncaughtException', uncaughtException);

    console.log(formattedUncaughtException.formattedMessage, formattedUncaughtException.formattedException);
    logger.error(formattedUncaughtException.message, uncaughtException, transportError => {
        if (transportError) {
            const formattedTransportError = errorFormatter('transportError', transportError);

            console.log(formattedTransportError.formattedMessage, formattedTransportError.formattedException);
        }

        // close connections, stop services and after that call logger.close()
        logger.close();

        setTimeout(() => process.exit(1), 1000);
    });
});

logger.on('error', (err, transport) => {
    const transportName           = (transport && transport.name) ? transport.name : 'unnamedTransport';
    const formattedTransportError = errorFormatter(`${transportName} error`, err);

    console.log(formattedTransportError.formattedMessage, formattedTransportError.formattedException);
});
