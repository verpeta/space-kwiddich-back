const _ = require("lodash");
module.exports = class PlayersService {
    #players = [];
    #logger;

    constructor(opts) {
        this.#logger = opts.logger;
    }

    addPlayer(playerData) {
        console.log("Added Player", playerData);
        this.#players.push(playerData);

        return playerData;
    }

    getPlayer(id) {
        console.log(this.#players);
        return _.find(this.#players, {id: id});
    }

    updatePlayer(nickname, newData) {
        const id = _.findIndex(this.#players, {nickname:nickname});
        if (id === -1) {
            throw new Error("User cannot be updated. Nickname not found - " + nickname);
        }
        return this.#players[id] = newData;
    }

    getPlayerByNickname(nickname) {
        const tmp = _.find(this.#players, {nickname: nickname});
        console.log("search", nickname, this.#players, tmp);

        return tmp;
    }

    getLastPlayer() {
        const tmp =this.#players.filter(x => x != null && x.team)
            .slice(-1)
            [0];
        console.log("last", tmp);

        return tmp;

        // return this.#players.filter(x => x != null)
        //     .slice(-1)
        //     [0]
    }

    removePlayer(socket) {
        this.#logger.debug('Removed player - ' + socket.player.nickname);
        delete (this.#players[_.findIndex(this.#players, {playerId: socket.id})]);
    }

    getPlayersList() {
        return this.#players;
    }
}
