let Command = require('../src/Command');
let Play = require('./play');

module.exports = class Stop extends Command {
    static name = "stop";
    alias = [
        "stop",
        "tg"
    ];
    description = "Arrete la musique et deconnecte le bot du salon vocal.";

    static call() {
        Play.stop();
    }
}
