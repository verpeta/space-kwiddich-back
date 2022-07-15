'use strict';

const path   = require('path');
const router = require('express').Router();

module.exports = (app) => {
    router.get('/robots.txt', (req, res) => {
        res.sendFile(path.join(app.getConfig().publicPath, 'robots.txt'));
    });

    return router;
};
