let Command = require('../src/Command');
let games = {
    TwoK48: require('./2048.js')
}

module.exports = class Games extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'games';
    static alias = [
        "games",
        "game"
    ];
    static description = "Jouer à des mini-jeux.";

    static currentGames = [];

    static async call(message, Phoenix) {
        if (message.args.length == 0) {

        }else if (message.args.length == 1) {
            this.startGame(message.args[0], message);
        }else if (message.args.length == 2) {
            if (message.args[1] == 'start')
                this.startGame(message.args[0], message);
            else if (message.args[1] == 'stop')
                this.stopGame(message.args[0], message.author.tag);
        }
    }

    static startGame(name, message) {
        Object.keys(games).forEach(game => {
            if (games[game].alias.includes(name)) {
                this.currentGames.push(new games[game](message));
            }
        })
    }

    static stopGame(name, authorTag) {
        let game = this.currentGames.find(game => game.alias.includes(name) && game.players.find(player => player.tag == authorTag));
        game.stop();
    }
}
