'use strict';

const _                             = require('lodash');
const router                        = require('express').Router();
const ToDoRecord                    = require('src/Service/ToDo/ToDoRecord');
const RecordPresentInToDoListError  = require('src/Service/ToDo/Error/RecordPresentInToDoListError');
const RecordNotFoundInToDoListError = require('src/Service/ToDo/Error/RecordNotFoundInToDoListError');

module.exports = (app) => {
    router.get('/todo', (req, res) => {
        try {
            const response = app.getToDoList().getRecords();

            res.send(response);
        } catch (e) {
            app.getLogger().error(e.message, e);
            res.status(500).send('Something goes wrong while record list getting.');
        }
    });

    router.post('/todo', (req, res) => {
        const recordText = req.body.text;

        try {
            if (_.isUndefined(recordText)) {
                res.status(400).send('Record filed "text" is required.');
                return;
            }

            const record = new ToDoRecord(recordText);

            app.getToDoList().addRecord(record);

            res.send(`Record "${record.getText()}" was added.`);
        } catch (e) {
            if (e instanceof RecordPresentInToDoListError) {
                res.status(400).send(`Record "${recordText}" already added.`);
            } else {
                app.getLogger().error(e.message, e);
                res.status(500).send('Something goes wrong while record adding.');
            }
        }
    });

    router.delete('/todo', (req, res) => {
        const recordText = req.body.text;

        try {
            if (_.isUndefined(recordText)) {
                res.status(400).send('Record filed "text" is required.');
                return;
            }

            const record = new ToDoRecord(recordText);

            app.getToDoList().removeRecord(record);

            res.send(`Record "${record.getText()}" was removed.`);
        } catch (e) {
            if (e instanceof RecordNotFoundInToDoListError) {
                res.status(404).send(`Record "${recordText}" not found.`);
            } else {
                app.getLogger().error(e.message, e);
                res.status(500).send('Something goes wrong while record removing.');
            }
        }
    });

    return router;
};
