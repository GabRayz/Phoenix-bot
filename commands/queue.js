let Command = require('../src/Command');
let Play = require('./play');

module.exports = class Queue extends Command {
    static name = 'queue';
    static alias = [
        "queue"
    ]
    static description = "Affiche la liste d'attente des musiques.";

    static call(msg, Phoenix) {
        let res = "Playlist en cours : " + (Play.currentPlaylistName == "" ? "Aucune": Play.currentPlaylistName);
        res += "\nFile d'attente : ";
        Play.queue.forEach(song => res += song + ", ");
        res += "\nÀ la fin de la file d'attente, des chansons de la playlist seront ajoutées";
        Phoenix.sendClean(res, msg.channel, 20000);
    }
}
