let Command = require('../src/Command');
let Play = require('./play');

module.exports = class Pause extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'pause';
    static alias = [
            "pause"
        ];
    static description = "Met la musique en pause";

    static call(message, Phoenix) {
        if(Play.voiceHandler && !Play.voiceHandler.paused) {
            Play.voiceHandler.pause();
        }
    }
}
