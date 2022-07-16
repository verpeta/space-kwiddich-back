// import messageHandlers from './handlers/message.handlers.js'

const userHandlers = require ("./handlers/user.handlers");

var players = {};
var star = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50
};
var scores = {
    blue: 0,
    red: 0
};

/**
 * @param {Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, *>} io
 * @param {Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, *>} socket
 */
module.exports.onConnection = (io, socket) => {
    console.log('a user connected');
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 150) + 50,
        y: Math.floor(Math.random() * 300) + 50,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) === 0) ? 'red' : 'blue'
    };

    socket.emit('currentPlayers', players);

    // send the star object to the new player
    socket.emit('starLocation', star);
// send the current scores
    socket.emit('scoreUpdate', scores);

    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function () {
        console.log('user disconnected');
        delete players[socket.id];
        io.emit('disconnected', socket.id);
    });

    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('starCollected', function () {
        if (players[socket.id].team === 'red') {
            scores.red += 10;
        } else {
            scores.blue += 10;
        }
        star.x = Math.floor(Math.random() * 700) + 50;
        star.y = Math.floor(Math.random() * 500) + 50;
        io.emit('starLocation', star);
        io.emit('scoreUpdate', scores);
    });
};


