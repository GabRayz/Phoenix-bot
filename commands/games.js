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
        "game",
        "2048"
    ];
    static description = "Jouer à des mini-jeux.";

    /**
     * List of currently playing instances of games
     */
    static currentGames = [];

    static async call(message, Phoenix) {
        if (message.args.length == 0 && ['game', 'games'].includes(message.command))
            this.displayScoreBoard(message.channel);
        else if (message.args.length == 0)
            this.startGame(message.command, message);
        else if (message.args.length == 1) {
            this.startGame(message.args[0], message);
        }else if (message.args.length == 2) {
            if (message.args[1] == 'start')
                this.startGame(message.args[0], message);
            else if (message.args[1] == 'stop')
                this.stopGame(message.args[0], message.author.tag);
        }
    }

    static displayScoreBoard(channel) {
        channel.send('Liste des jeux: \n - 2048');
        // TODO : display a scoreboard
    }

    static startGame(name, message) {
        Object.keys(games).forEach(game => {
            if (games[game] && games[game].alias.includes(name)) {
                // Instantiate a new game and add it to the current games
                let newGame = new games[game](message, this.getRandomId());
                this.currentGames.push(newGame);
                newGame.on('end', this.removeGame);
            }
        })
    }

    static stopGame(name, authorTag) {
        // Find a game with the corresponding name and player.
        let game = this.currentGames.find(game => game && game.alias.includes(name) && game.players.find(player => player.tag == authorTag));
        if (game)
            game.stop();
    }

    static getRandomId() {
        while (true) {
            let id = Math.floor(Math.random() * (999999 - 100000)) + 100000;
            let taken = this.currentGames.find(game => game && game.gameId == id);
            if (!taken)
                return id;
        }
    }

    /**
     * Remove a finished game from the list of currently played games.
     * @param {*} gameId 
     */
    static removeGame(gameId) {
        console.log('remove game');
        let index = Games.currentGames.findIndex(game => game && game.gameId == gameId);
        if (index >= 0)
            Games.currentGames[index] = null;
    }
}
