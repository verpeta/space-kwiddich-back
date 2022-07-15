'use strict';

const router = require('express').Router();

const version = 'v1';

module.exports = (app) => {
    router.get(`/api/${version}/main`, (req, res) => {
        const response = {message: 'API main page'};

        res.send(response);
    });

    return router;
};
