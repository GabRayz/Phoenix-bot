let Command = require('../src/Command');

module.exports = class Timer extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'timer';
    static alias = [
        "timer",
    ];
    static description = "Example for creating a command";

    static async call(message, Phoenix) {
        if (message.args.length == 2) {
            let nb = parseInt(message.args[0]);
            this.setTimer(this.getUnit(message.args[1]) * nb, message);
        }
    }

    static setTimer(duration, message) {
        console.log(duration);
        setTimeout(() => {
            message.reply('Driiiiing !');
        }, duration);
    }

    static getUnit(unit) {
        switch (unit) {
            case 's':
                return 1000;
                break;
            case 'm':
                return 1000 * 60;
                break;
            case 'h':
                return 1000 * 60 * 60;
                break;
            default:
                return 1000;
        }
    }
}
