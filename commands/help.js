let Command = require('../src/Command');
let commands = require('./command');
let Play = require('./play');
const {RichEmbed} = require('discord.js');

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
        let embed = new RichEmbed();
        embed.setTitle("Listes des commandes: ")
            .setColor('ORANGE')
            .setThumbnail(Phoenix.bot.user.avatarURL)
            .setFooter('Codé par GabRay', msg.author.avatarURL)
            .addField(Phoenix.config.prefix + 'help', 'Affiche la liste des commandes.')
            .addField(Phoenix.config.prefix + 'off', 'Redémarre le bot.')
            .addField(Phoenix.config.prefix + 'clear', 'Efface les messages de commande bot.')
            .addField(Phoenix.config.prefix + 'play [nom/url]', "Ajoute une musique à la file d'attente. Démarre la lecture si aucune musique n'est en cours.")
            .addField(Phoenix.config.prefix + 'skip', "Passer à la prochaine musique de la fille d'attente.")
            .addField(Phoenix.config.prefix + 'stop', "Arrete la musique.")
            .addField(Phoenix.config.prefix + 'pause', "Met la musique en pause.")
            .addField(Phoenix.config.prefix + 'resume', "Reprend la lecture de la musique.")
            .addField(Phoenix.config.prefix + 'info', 'Informations sur la musique actuelle')
            .addField(Phoenix.config.prefix + 'volume [0-200]', "Règler le volume.")
            .addField(Phoenix.config.prefix + 'queue', "Affiche la liste d'attente.")
            .addField(Phoenix.config.prefix + 'playlist', "Gérer les playlists. `"+Phoenix.config.prefix+"playlist help`.")
            .addField(Phoenix.config.prefix + 'shop', "Intéragir avec le marché de Phoenix.")
            .addBlankField()
        msg.channel.send(embed).catch(err => {
            if (err.message == 'Missing Permissions') {
                msg.channel.send('Erreur, mes permissions sont insuffisantes :(');
            }else
                console.error(err);
        })
    }
}
