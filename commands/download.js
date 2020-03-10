let Command = require('../src/Command');
let Play = require('./play');
let ytdl = require('ytdl-core');
let ffmpeg = require('fluent-ffmpeg');
const { Client, MessageAttachment } = require('discord.js');

module.exports = class Download extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'download';
    static alias = [
        "download",
        "dl"
    ];
    static description = "Télécharge une vidéo";
    // Usage: {prefix}download [{audio|video} [url]]

    static async call(message, Phoenix) {
        // Get the url from which to download
        console.log(message);
        let url = message.args.length == 2 ? message.args[1] : this.getCurrentVideo();
        console.log(url);
        let audioonly = message.args.length >= 1 && message.args[0] == 'audio';

        let stream;
        if (audioonly)
            stream = ytdl(url, {filter: 'audio'});
        else
            stream = ytdl(url, {filter: 'audioandvideo'});
        
        let msg = await message.channel.send('Le téléchargement va commencer.');
        console.log('Initiating video download...');
        let path = audioonly ? 'public/download.mp3' : 'public/download.mp4';

        let kb = 0;
        let interval = setInterval(() => {
            msg.edit(kb / 1000 + ' Mb downloaded');
        }, 2000);

        let cmd = ffmpeg(stream)
            .audioBitrate(123)
            .on('start', () => {
                console.log('Video download has started.');
                message.channel.send('Téléchargement en cours...');
            })
            .on('progress', (p) => {
                kb = p.targetSize;
            })
            .on('error', (err) => {
                console.error(err);
                message.channel.send('Erreur :/');
            })
            .on('end', () => {
                cmd.kill();
                clearInterval(interval);
                console.log('Download done !');
                if (audioonly)
                    message.channel.send('Le fichier est disponible : '+Phoenix.config.downloadAdress+':'+Phoenix.config.downloadPort+'/mp3');
                else
                message.channel.send('Le fichier est disponible : '+Phoenix.config.downloadAdress+':'+Phoenix.config.downloadPort+'/mp4');
            })
            .save(path)
    };

    static getCurrentVideo() {
        return Play.videoUrl;
    }
}
