'use strict';

const router = require('express').Router();

const version = 'v1';

module.exports = (app) => {
    router.get(`/api/${version}/main`, (req, res) => {
        const response = {message: 'API main page'};

        res.send(response);
    });

    router.get(`/api/user/all`, (req, res) => {
        const pService = req.container.resolve('playersService');
        const response = pService.getPlayersList();

        res.send(response);
    });

    router.post(`/api/user/add`, (req, res) => {
        const pService = req.container.resolve('playersService');
        pService.addPlayer(req.body.id);
        const response = pService.getPlayersList();

        res.send(response);
    });

    return router;
};
