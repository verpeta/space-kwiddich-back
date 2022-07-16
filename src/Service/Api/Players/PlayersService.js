module.exports = class PlayersService {
    #players = [5,67];
    #logger;

    constructor(opts) {
         this.#logger = opts.logger;
        this.currentUser = opts.currentUser;
        this.#logger.debug(opts.currentUser);
    }

    addPlayer(playerData) {
        this.#players.push(playerData);
    }

    removePlayer(playerData) {
        this.#logger.debug(this.#players.find(playerData));
    }

    getPlayersList() {
        return this.#players;
    }
}
