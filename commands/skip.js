let Command = require('../src/Command');
let Play = require('./play');

module.exports = class Skip extends Command {
    static name = "skip";
    alias = [
        "skip",
        "next"
    ];
    description = "Passer à la prochaine musique de la file d'attente";


    static call() {
        Play.skip();
    }
}
