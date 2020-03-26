let Phoenix = require('../index');
let Game = require('../src/Game');

module.exports = class TwoK48 extends Game {
    static name = '2048';
    static alias = [
        "2048",
    ];
    static description = "Jouons à 2048";
    
    /**
     * The discord text message displaying the game board
     */
    boardMsg = null;
    /**
     * Names of the tiles emojis.
     */
    names = ['2048_2', '2048_4', '2048_8', '2048_16', '2048_32', '2048_64', '2048_128', '2048_512', '2048_1024', '2048_2048', '2048_4096'];
    /**
     * Id of each tile emoji.
     */
    ids = []
    /**
     * The game board. Each cell contains the index of the tile in this.names, -1 if there is no tile in this cell.
     */
    board = [];

    constructor(message) {
        super(message);
        this.getIDs();
        this.isLoading = false;

        this.alias = TwoK48.alias;
        this.start();
    }

    /**
     * Start the game
     */
    async start() {
        this.isPlaying = true;
        Phoenix.activities++;
        this.player = this.players[0];
        // Preparing the board message
        this.boardMsg = await this.channel.send('Chargement de la partie...');
        await this.boardMsg.react('⬅️');
        await this.boardMsg.react('⬆️');
        await this.boardMsg.react('⬇️');
        await this.boardMsg.react('➡️');
        // Preparing the game board
        this.board = this.createEmptyBoard();
        this.placeFirstTiles();

        await this.draw();

        Phoenix.bot.on('messageReactionAdd', (messageReaction, user) => {
            // If the game is playing, let the player add reactions to move.
            if (user.tag == this.player.tag && !this.isLoading && this.isPlaying)
                this.onPlay(this.emojiToMove(messageReaction.emoji.name));
        })
        Phoenix.bot.on('messageReactionRemove', (messageReaction, user) => {
            if (user.tag == this.player.tag && !this.isLoading && this.isPlaying)
                this.onPlay(this.emojiToMove(messageReaction.emoji.name));
        })
    }

    /**
     * Do a move.
     * @param {*} move 
     */
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
        // Create the next board
        let newBoard = this.createEmptyBoard();
        // Determine the direction of the loop to move the tiles
        let y = (move[1] == 1) ? 3 : 0;
        while (y != ((move[1] == 1) ? -1 : 4)) {
            let x = (move[0] == 1) ? 3 : 0;
            while (x != ((move[0] == 1) ? -1 : 4)) {
                let tile = this.board[x][y];
                if (tile == -1) {
                    // If the cell is empty, continue
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
        // Compare the new situation with the previous one to see if there is a change.
        let hasChanged = !this.compareBoards(this.board, newBoard);
        this.board = newBoard;
        return hasChanged;
    }

    /**
     * Get the next position of the tile
     * @param {*} newBoard 
     * @param {*} x 
     * @param {*} y 
     * @param {*} tile Id of the tile (index in this.names)
     * @param {*} move Move of the player
     */
    getNextTile(newBoard, x, y, tile, move) {
        // Look each of the next cells in straight line
        while (x >= 0 && x < 4 && y >= 0 && y < 4) {
            // If there is an identic tile, returns its coordinates to merge them
            if (newBoard[x][y] == tile)
                return [x, y];
            // If there is an obstacle, returns the previous position
            else if (newBoard[x][y] != -1)
                return [x - move[0], y - move[1]];
            x += move[0];
            y += move[1];
        }
        // If we get outside the board, returns the previous position
        if (x < 0) x++;
        if (x > 3) x--;
        if (y < 0) y++;
        if (y > 3) y--;
        return [x, y];
    }

    /**
     * Converts a reaction emoji into a playable move.
     * @param {*} emojiName 
     */
    emojiToMove(emojiName) {
        let emojis = {
            "⬅️": [-1, 0], // Direction of the move.
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

    /**
     * Place three '2' tiles in random positions
     */
    placeFirstTiles() {
        let k = 0;
        while (k < 3) {
            let x = this.random();
            let y = this.random();
            if (this.place(x, y, 0))
                k++;
        }
    }

    /**
     * Place a tile
     * @param {*} x 
     * @param {*} y 
     * @param {*} value index of the tile in this.names
     */
    place(x, y, value) {
        if (this.board[x][y] == -1) {
            this.board[x][y] = value;
            return true;
        }
        return false;
    }

    /**
     * Draw the board by editing this.boardMsg.
     */
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

    /**
     * Get the id of each emoji.
     */
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
