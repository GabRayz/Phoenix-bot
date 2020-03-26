let Phoenix = require('../index');
let Game = require('../src/Game');

module.exports = class TwoK48 extends Game {
    static name = '2048';
    static alias = [
        "2048",
        ""
    ];
    static description = "Jouons à 2048";
    
    constructor(message) {
        super(message);
        this.ids = []
        this.names = ['2048_2', '2048_4', '2048_8', '2048_16', '2048_32', '2048_64', '2048_128', '2048_512', '2048_1024', '2048_2048', '2048_4096'];
        this.getIDs();
        this.board = [];
        this.boardMsg;
        this.isLoading = false;

        this.alias = TwoK48.alias;
        this.start();
    }

    static async call(message, Phoenix) {
        if (this.ids.length == 0)
            if (!this.getIDs()) return;
        if (!this.isPlaying)
            this.start(message.author.tag);
        else if (message.args.length == 1 && message.args[0] == 'stop' && this.isPlaying)
            this.stop();
    }

    async start() {
        this.isPlaying = true;
        Phoenix.activities++;
        this.player = this.players[0];
        this.boardMsg = await this.channel.send('Chargement de la partie...');
        await this.boardMsg.react('⬅️');
        await this.boardMsg.react('⬆️');
        await this.boardMsg.react('⬇️');
        await this.boardMsg.react('➡️');
        this.board = this.createEmptyBoard();
        this.placeFirstTiles();

        await this.draw();

        Phoenix.bot.on('messageReactionAdd', (messageReaction, user) => {
            if (user.tag == this.player.tag && !this.isLoading)
                this.onPlay(this.emojiToMove(messageReaction.emoji.name));
        })
        Phoenix.bot.on('messageReactionRemove', (messageReaction, user) => {
            if (user.tag == this.player.tag && !this.isLoading)
                this.onPlay(this.emojiToMove(messageReaction.emoji.name));
        })
    }

    async onPlay(move) {
        if (move == null) return;
        if (this.move(move)) {
            this.isLoading = true;
            await this.draw();
            this.placeRandom(move);
            await this.draw();
            
            if (this.isGameOver()) {
                this.stop();
            }
            this.isLoading = false;
        }
    }

    isGameOver() {
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if (this.canMove(i, j, i - 1, j)) return false;
                if (this.canMove(i, j, i + 1, j)) return false;
                if (this.canMove(i, j, i, j - 1)) return false;
                if (this.canMove(i, j, i, j + 1)) return false;
            }
        }
        return true;
    }

    canMove(x, y, newX, newY) {
        if (newX < 0 || newX > 3 || newY < 0 || newY > 3) return false;
        return this.board[newX][newY] == -1 || this.board[newX][newY] == this.board[x][y];
    }

    /**
     * Place a nex random tile depending on the last move.
     * @param {*} move 
     */
    placeRandom(move) {
        while (true) {
            let rand = this.random();
            let x, y;
            if (move[0] != 0) {
                y = rand;
                x = move[0] == 1 ? 0 : 3;
            }else {
                x = rand;
                y = move[1] == 1 ? 0 : 3;
            }
            if (this.board[x][y] == -1)
                return this.place(x, y, 0);
            else if (this.board[x][y] == 0)
                return this.board[x][y] ++;
        }
    }

    compareBoards(board1, board2) {
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 4; i++) {
                if (board1[i][j] != board2[i][j])
                    return false;
            }
        }
    
        return true;
    }

    move(move) {
        let newBoard = this.createEmptyBoard();
        // Determine the direction of the loop to move the tiles
        let y = (move[1] == 1) ? 3 : 0;
        while (y != ((move[1] == 1) ? -1 : 4)) {
            let x = (move[0] == 1) ? 3 : 0;
            while (x != ((move[0] == 1) ? -1 : 4)) {
                // console.log('X: ', x, ' Y: ', y);
                let tile = this.board[x][y];
                if (tile == -1) {
                    x += (move[0] == 1) ? -1 : 1;
                    continue;
                }

                // Get the future position
                let newTilePos = this.getNextTile(newBoard, x, y, tile, move);
                let nextX = newTilePos[0];
                let nextY = newTilePos[1];
                // If available
                if (newBoard[nextX][nextY] == -1) {
                    // Move
                    newBoard[nextX][nextY] = tile;
                }else {
                    // Add both tiles
                    newBoard[nextX][nextY] ++;
                }

                x += (move[0] == 1) ? -1 : 1;
            }
            y += (move[1] == 1) ? -1 : 1;
        }
        
        let hasChanged = !this.compareBoards(this.board, newBoard);
        this.board = newBoard;
        return hasChanged;
    }

    getNextTile(newBoard, x, y, tile, move) {
        while (x >= 0 && x < 4 && y >= 0 && y < 4) {
            if (newBoard[x][y] == tile)
                return [x, y];
            else if (newBoard[x][y] != -1)
                return [x - move[0], y - move[1]];
            x += move[0];
            y += move[1];
        }
        if (x < 0) x++;
        if (x > 3) x--;
        if (y < 0) y++;
        if (y > 3) y--;
        return [x, y];
    }

    emojiToMove(emojiName) {
        let emojis = {
            "⬅️": [-1, 0],
            "⬆️": [0, -1],
            "⬇️": [0, 1],
            "➡️": [1, 0],
        }
        if (!Object.keys(emojis).includes(emojiName)) return null;
        return emojis[emojiName];
    }

    createEmptyBoard() {
        let board = [];
        for (let i = 0; i < 4; i++) {
            board.push([-1, -1, -1, -1]);
        }
        return board;
    }

    random(max = 4) {
        return Math.floor(Math.random() * max);
    }

    placeFirstTiles() {
        let k = 0;
        while (k < 3) {
            let x = this.random();
            let y = this.random();
            if (this.place(x, y, 0))
                k++;
        }
    }

    place(x, y, value) {
        if (this.board[x][y] == -1) {
            this.board[x][y] = value;
            return true;
        }
        return false;
    }

    draw() {
        return new Promise(resolve => {
            let msg = '';
            for(let j = 0; j < 4; j++) {
                for(let i = 0; i < 4; i++) {
                    if (this.board[i][j] == -1)
                    msg += ':white_large_square:';
                    else
                    msg += this.ids[this.board[i][j]];
                }
                msg += '\n';
            }
            this.boardMsg.edit(msg).then(() => {
                resolve();
            })
        })
    }

    countPoints() {
        let points = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
        let total = 0;
        for(let j = 0; j < 4; j++) {
            for(let i = 0; i < 4; i++) {
                let tile = this.board[i][j];
                if (tile != -1)
                    total += points[tile];
            }
        }
        return total;
    }

    stop() {
        let points = this.countPoints();
        let msg = '**Fin de la partie !**\nRésultat: **' + points + '** points.'
        this.channel.send(msg);
        this.isPlaying = false;
        Phoenix.activities--;
    }

    getIDs() {
        let manager = Phoenix.bot.emojis;
        this.names.forEach(name => {
            let emoji = manager.find(emoji => emoji.name == name);
            if (emoji == null) {
                this.channel.send('Les emojis 2048 ne sont pas installés ! :c');
                return false;
            }
            let fullId = '<:' + emoji.name + ':' + emoji.id + '>';
            this.ids.push(fullId);
        })
        return true;
    }
}
