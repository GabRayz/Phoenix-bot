let Command = require('../src/Command');
let Phoenix = require('../index');

module.exports = class Hangman extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'hangman';
    static alias = [
        "hangman",
        "pendu"
    ];
    static description = "Jouons au pendu.";
    static callableFromMP = true;

    static isPlaying = false;
    static mainMsg;
    static lifes = 5;
    static mystery = "";
    static found = [];
    static tested = [];

    static async call(message, Phoenix) {
        if (message.args.length == 1 && message.args[0] == 'stop' && this.isPlaying)
            this.stop()
        else if (message.args.length == 1 && !this.isPlaying) {
            if (this.isWordValid(message.args[0].toUpperCase()))
                this.start(message.args[0].toUpperCase());
            else
                message.reply("Pas d'accent ni espace.");
        }
    }

    static isWordValid(word) {
        for (let i = 0; i < word.length; i++) {
            if (!word[i] >= 'A' && word[i] <= 'Z')
                return false;
        }
        return true;
    }

    static generateBoard(word) {
        this.mystery = word;
        for(let i = 0; i < word.length; i++)
            this.found.push('_ ');
        this.found[0] = word[0];
        this.found[word.length - 1] = word[word.length - 1];
    }

    static async start(word) {
        this.isPlaying = true;
        await Phoenix.botChannel.send('**Le Jeu du Pendu**');
        this.mainMsg = await Phoenix.botChannel.send('La partie va commencer...');
        this.generateBoard(word);
        this.draw();
    }

    static draw() {
        let emojis = ['😃', '😅', '😕', '😫', '🤕', '💀'];
        let msg = emojis[5 - this.lifes] + '\nMot mystère: `' + this.arrayToString(this.found) + '`\nLettres testées: ' + this.arrayToString(this.tested);
        this.mainMsg.edit(msg);
    }

    static arrayToString(array) {
        let res = "";
        array.forEach(element => {
            res += element;
        });
        return res;
    }

    static stop() {
        this.isPlaying = false;
    }
}
