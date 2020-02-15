let Command = require('../src/Command');
const {RichEmbed} = require('discord.js');
let Play = require('./play');

module.exports = class Info extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'info';
    static alias = [
        "info",
        "infos",
        "playingnow",
        "i",
        "pn",
    ];
    static description = "Donne des infos sur la musique en cours";

    static async call(message, Phoenix) {
        if (Play.videoInfos) {
            if (Play.videoInfos.player_response) {
                Play.videoInfos.formats = null;
                let infos = Play.videoInfos.player_response;
                let embed = new RichEmbed();
                embed.setTitle(infos.videoDetails.title)
                    .setDescription(infos.videoDetails.shortDescription.slice(0, 200))
                    .addField('Durée', this.timeFormat(infos.videoDetails.lengthSeconds))
                    .setAuthor(infos.videoDetails.author)
                    .setURL(Play.videoUrl)
                    .set
                await message.channel.send(embed);
            }
            message.channel.send(Play.videoUrl);
        }else {
            let embed = new RichEmbed();
            embed.setDescription('Aucune musique n\'est jouée pour l\'instant')
                .setColor('RED');
            
            message.channel.send(embed).catch(err => {
                if (err.message == 'Missing Permissions') {
                    message.channel.send('Aucune musique n\'est jouée pour l\'instant');
                }else {
                    console.error(err);
                }
            })
        }
    }

    static timeFormat(raw) {
        let s = raw % 60;
        let m = Math.floor(raw / 60);
        let h = Math.floor(m / 60);
        m = m % 60;
        return (h > 0 ? h + ':': "") + (m > 0 ? m + ':': "") + s;
    }
}
