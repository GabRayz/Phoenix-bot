let Command = require('../src/Command');
let commands = require('./command');
let Play = require('./play');

module.exports = class Help extends Command {
    constructor(author) {
        this.author = author;
    }

    static name = 'help';
    static alias = [
        "help",
        "h"
    ];
    static description = "Affiche la liste des commandes";

    static call(msg, Phoenix) {
        let text = "Commandes : \n\n"+
        "help: Affiche la liste des commandes\n"+
        "off: turn the bot off\n"+
        "clear: undefined\n"+
        "play [nom/url]: Ajoute une musique à la file d'attente. Démarre la lecture si aucune musique n'est en cours.\n"+
        "skip: Passer à la prochaine musique de la file d'attente\n"+
        "stop: Arrete la musique et deconnecte le bot du salon vocal.\n"+
        "volume [0-200]: Changer le volume\n"+
        "playlist: Gérer les playlist. !playlist help\n"+
        "queue: Affiche la liste d'attente des musiques.\n"+
        "shop: Intéragir avec le marché de Phoenix";
        
        msg.channel.send(text, {
            code: true
        })
        .catch(console.error);
    }
}
