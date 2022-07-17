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
        const response = {players: pService.getPlayersList()};

        res.send(response);
    });

    router.post(`/api/user/add`, async (req, res) => {
        const pService = req.container.resolve('playersService');
        const pData = req.body;

        if (pService.getPlayerByNickname(pData.nickname)) {
            res.send({
                errors: [
                    'Choose another nickname.'
                ]
            });
            return;
        }

        await pService.addPlayer(pData);
        const response = {players: pService.getPlayersList()};

        res.send(response);
    });

    return router;
};
