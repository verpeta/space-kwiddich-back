'use strict';

const path   = require('path');
const router = require('express').Router();

module.exports = (app) => {
    router.get('/favicon.ico', (req, res) => {
        res.sendFile(path.join(app.getConfig().publicPath, 'favicon.ico'));
    });

    return router;
};
