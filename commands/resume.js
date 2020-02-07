let Command = require('../src/Command');
let Play = require('./play');

module.exports = class Resume extends Command {
    static name = "resume";
    static alias = [
        "resume"
    ]
    static description = "Reprend la musique";

    static call() {
        if(Play.voiceHandler && Play.voiceHandler.paused) {
            Play.voiceHandler.resume();
        }
    }
}
