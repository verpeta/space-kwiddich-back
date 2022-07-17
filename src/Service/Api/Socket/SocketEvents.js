// import messageHandlers from './handlers/message.handlers.js'

const userHandlers = require("./handlers/user.handlers");

var players = {};
var star = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50
};
var scores = {
    blue: 0,
    red: 0
};

module.exports = class SocketEvents {
    #logger;
    #io;
    #playersService;

    constructor(opts) {
        this.#io = opts.io;
        this.#logger = opts.logger;
        this.#playersService = opts.playersService;
    }

    onConnection(socket) {
        this.#onNewUserConnected(socket);
        const currentPlayer = socket.player;

        socket.on('disconnect', function () {
            console.log('user disconnected');
            delete this.#playersService.removePlayer(socket);
            this.#io.emit('player-gone', socket.id);
        }.bind(this));

        socket.on('playerMovement', function (movementData) {
            currentPlayer.x = movementData.x;
            currentPlayer.y = movementData.y;
            currentPlayer.rotation = movementData.rotation;
            // emit a message to all players about the player that moved
            socket.broadcast.emit('playerMoved', currentPlayer);
        }.bind(this));

        socket.on('starCollected', function () {
            if (currentPlayer.team === 'red') {
                scores.red += 10;
            } else {
                scores.blue += 10;
            }
            star.x = Math.floor(Math.random() * 700) + 50;
            star.y = Math.floor(Math.random() * 500) + 50;
            this.#io.emit('starLocation', star);
            this.#io.emit('scoreUpdate', scores);
        }.bind(this));
    }

    #onNewUserConnected(socket) {
        console.debug('a user connected');
        console.debug(socket.handshake.auth);
        if (!socket.handshake.auth || !socket.handshake.auth.user) {
            throw new Error("Auth required");
        }

        socket.player = this.#playersService.updatePlayer(socket.handshake.auth.user,
            {
                nickname: socket.handshake.auth.user,
                rotation: 0,
                x: Math.floor(Math.random() * 150) + 50,
                y: Math.floor(Math.random() * 300) + 50,
                playerId: socket.id,
                team: (Math.floor(Math.random() * 2) === 0) ? 'red' : 'blue'
            });

        socket.emit('currentPlayers', this.#playersService.getPlayersList());
        socket.emit('starLocation', star);
        socket.emit('scoreUpdate', scores);

        socket.broadcast.emit('newPlayer', socket.player);
    }
};
