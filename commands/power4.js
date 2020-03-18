let Command = require('../src/Command');

module.exports = class Power4 extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'power4';
    static alias = [
        "puissance4",
        "power4",
        'p4'
    ];
    static description = "Jouons au puissance 4 :D";

    static j1;
    static j2;
    static currentPlayer;
    static currentPlayerTag;
    static currentPlayerMsg;
    static isPlaying = false;
    static board = [];
    static boardMsg;

    static call(message, Phoenix) {
        if (message.args.length == 0 || message.args[0] == 'start') {
            if (!this.isPlaying)
                this.addPlayer(message);
            else
                message.channel.send('Une partie est déjà en cours');
        }else if (message.args.length > 0 && message.args[0] == 'stop') {
            if (this.isPlaying)
                this.callDraw();
            else
                this.stop();
        }
    }

    static addPlayer(message) {
        this.channel = message.channel;
        let name = this.getName(message);
        if (!this.j1) {
            this.j1 = {
                tag: message.author.tag,
                nickname: name
            }
            console.log('Player 1 set to ', name);
            message.channel.send('Joueur 🔴: ' + name + ', en attente d\'un deuxième joueur.');
        }else if(!this.j2 && this.j1.tag != message.author.tag) {
            this.j2 = {
                tag: message.author.tag,
                nickname: name
            }
            console.log('Player 2 set to ', name);
            message.channel.send('Joueur 🔵: ' + name);
            this.start();
        }else {
            message.channel.send('Nope. Trouves toi un ami.');
        }
    }
    
    static getName(message) {
        return message.member.nickname == null ? message.author.username : message.member.nickname;
    }

    static start() {
        this.channel.send('La partie commence...').then(boardMsg => {
            this.boardMsg = boardMsg;
            this.isPlaying = true;
            for (let i = 0; i < 7; i++)
                this.board[i] = [0, 0, 0, 0, 0, 0];
            
            this.currentPlayer = 1;
            this.currentPlayerTag = this.j1;
            this.draw();
            this.channel.send('Chargement du tableau...').then(msg => {
                this.currentPlayerMsg = msg;
                this.addReactions();
            })

            let phoenix = require('../index');
            phoenix.bot.on('messageReactionAdd', (messageReaction, user) => {
                if (this.isPlaying && messageReaction.message.id == this.boardMsg.id && user.tag == this.currentPlayerTag.tag) {
                    this.onPlay(this.emojiToInt(messageReaction.emoji.name));
                }
            })
        })
    }
    
    static emojiToInt(emojiName) {
        let emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣'];
        return emojis.findIndex(e => e == emojiName);
    }

    static onPlay(move) {
        if (move == -1) return;
        if (this.isColumnFilled(move)) return;
        this.place(move, this.currentPlayer);
        this.lookForWinner(winner => {
            if (winner == 0) {
                if (this.isBoardFull())
                    this.callDraw()
                else
                    this.switch();
            }
            else
                this.callTheWinner(winner);
        })
    }

    static switch() {
        this.draw();
        if (this.currentPlayer == 1) {
            this.currentPlayer = 2;
            this.currentPlayerTag = this.j2;
        }else {
            this.currentPlayer = 1;
            this.currentPlayerTag = this.j1;
        }
        this.callCurrentPlayer();
    }
    
    static isColumnFilled(index) {
        return this.board[index][5] != 0;
    }

    static place(index, color) {
        this.board[index][this.getLowestTile(index)] = color;
    }

    static getLowestTile(index) {
        // The lowest empty tile is the first one that contains a 0.
        return this.board[index].findIndex(e => e == 0);
    }

    static callCurrentPlayer() {
        let color = this.currentPlayer == 1 ? '🔴' : '🔵';
        this.currentPlayerMsg.edit('Au tour de ' + this.currentPlayerTag.nickname + ' ' + color);
    }

    static draw() {
        console.log(this.board);
        let msg = '';
        for(let j = 5; j >= 0; j--) {
            msg += '|';
            for(let i = 0; i < 7; i++) {
                if (this.board[i][j] == 0)
                    msg += '      ';
                else if (this.board[i][j] == 1)
                    msg += '🔴';
                else
                    msg += '🔵';
                msg += '|'
            }
            msg += '\n';
        }
        msg += '—————————————';
        this.boardMsg.edit(msg).then(() => console.log('Board drawn')).catch(e => console.error(e));
    }

    static async addReactions() {
        await this.boardMsg.react('1️⃣');
        await this.boardMsg.react('2️⃣');
        await this.boardMsg.react('3️⃣');
        await this.boardMsg.react('4️⃣');
        await this.boardMsg.react('5️⃣');
        await this.boardMsg.react('6️⃣');
        await this.boardMsg.react('7️⃣');
        this.callCurrentPlayer();
    }

    static lookForWinner(callback) {
        for(let j = 0; j < 6; j++) {
            for (let i = 0; i < 7; i++) {
                let res = this.lookHorizontal(i, j);
                if (res > 0) return callback(res);
                res = this.lookVertical(i, j);
                if (res > 0) return callback(res);
                res = this.lookHorizontal(i, j);
                if (res > 0) return callback(res);
            }
        }
        callback(0);
    }

    static lookHorizontal(x, y) {
        if (x > 3) return 0;
        let scope = [];
        for (let i = 0; i < 4; i++)
            scope[i] = this.board[x + i][y];
        if (scope.every(tile => tile == 1)) return 1;
        if (scope.every(tile => tile == 2)) return 2;
        return 0;
    }

    static lookVertical(x, y) {
        if (y > 2) return 0;
        let scope = [];
        for (let i = 0; i < 4; i++)
            scope[i] = this.board[x][y + i];
        if (scope.every(tile => tile == 1)) return 1;
        if (scope.every(tile => tile == 2)) return 2;
        return 0;
    }

    static lookDiagonal(x, y) {
        if (x > 3 || y > 2) return 0;
        let scope = [];
        for (let i = 0; i < 4; i++)
            scope[i] = this.board[x + i][y + i];
        if (scope.every(tile => tile == 1)) return 1;
        if (scope.every(tile => tile == 2)) return 2;
        return 0;
    }

    static isBoardFull() {
        return this.board.every(line => line.every(tile => tile != 1));
    }

    static callTheWinner(winner) {
        let color = winner == 1 ? '🔴' : '🔵';
        this.currentPlayerMsg.edit(color + ' Victoire de ' + this.currentPlayerTag.nickname + ' ' + color);
        this.stop();
    }

    static callDraw() {
        this.currentPlayerMsg.edit('⚪️⚪️⚪️ Égalité ! ⚪️⚪️⚪️');
        this.stop();
    }

    static stop() {
        this.isPlaying = false;
        this.board = [];
        this.j1 = null;
        this.j2 = null;
        this.channel = null;
        this.boardMsg = null;
    }
}
