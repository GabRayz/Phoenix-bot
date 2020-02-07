let Command = require('../src/Command');
let Play = require('./play');

module.exports = class Resume extends Command {
    static name = "resume";
    static alias = [
        "resume"
    ]
    static description = "Reprend la musique";

    static call() {
        if(Command.Play.voiceHandler && Command.Play.voiceHandler.paused) {
            Command.Play.voiceHandler.resume();
        }
    }
}
