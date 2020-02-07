const request = require('request');
const youtube = require('ytdl-core');
const opus = require('opusscript');
const YTplaylist = require('../src/ytplaylist');

let Command = require('../src/Command');

module.exports = class Play extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'play';
    static alias = [
            "play"
        ];
    static description = "Ajoute une musique à la file d'attente. Démarre la lecture si aucune musique n'est en cours.";
    /**
     * List of songs to be played, represented by a name or a url
     */
    static queue = [];
    /**
     * Defines if the bot is currently playing music.
     */
    static isPlaying = false;
    /**
     * List of songs of the current playlist.
     */
    static currentPlaylist = [];
    /**
     * Name of the current playlist
     */
    static currentPlaylistName = "";
    static volume = 1;
    /**
     * Voice hanlder defined when the bot is speaking.
     */
    static voiceHandler = null;

    /**
     * Entry point of the command. Adds to song to the queue and start playing.
     * @param {*} message 
     * @param {*} Phoenix 
     */
    static call(message, Phoenix) {
        this.textChannel = message.channel;
        this.Phoenix = Phoenix;

        if(message.args.length > 0 && message.args[0].startsWith('http') && message.args[0].includes('playlist?list=')) {
            console.log('Importing playlist...');
            YTplaylist.Enqueue(message.args[0], function() {
                this.start(Phoenix, message);
            });
        }else {
            this.addToQueue(message);
            this.start(Phoenix, message);
        }
    }

    /**
     * Joins a voice channel and calls this.nextSong() to start playing.
     * @param {*} Phoenix 
     * @param {*} message 
     */
    static async start(Phoenix, message) {
        // Do nothing if the voice is already started
        if(!this.isPlaying) {
            console.log("connecting to voice channel");
            this.textChannel = message.channel;
            this.connectToVoiceChannel(message.member.voiceChannel).then(voiceConnection => {
                this.voiceConnection = voiceConnection;
                this.voiceChannel = message.member.voiceChannel;
                this.nextSong();
            }).catch(() => {
                return;
            })
        }
    }

    static addToQueue(message) {
        let name = "";
        message.args.forEach(str => {
            name += str + " ";
        });
        console.log("Queueing: " + name);
        this.queue.push(name);
        message.react('✅');
    }

    static addToQueueString(name) {
        console.log("Queueing: " + name);
        this.queue.push(name);
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async nextSong() {
        await this.sleep(200);
        console.log('Choosing next song...');
        if(!this.queue.length > 0) {
            if(this.currentPlaylist.length > 0) {
                this.checkPlaylist();
            }else {
                return;
            }
        }
        // Get the stream
        console.log('Current queue: ' + this.queue);
        let song = this.queue.shift();
        console.log('Next song: ' + song);
        let url;
        try {
            if(typeof song.id !== 'undefined') {
                url = "https://youtube.com/watch?v=" + song.id;
                this.stream = this.getStream(url);
            }else if (song.startsWith("http")) {
                url = song;
                this.stream = this.getStream(song);
            }else {
                url = await this.getUrlFromName(song, this.Phoenix)
                if(!url) {
                    return;
                }
                this.stream = this.getStream(url);
            }
        } catch (error) {
            console.error(error);
            this.textChannel.send("Oups, j'ai des problèmes :/");
            this.nextSong();
            return;
        }
        

        this.stream.on('error', (err) => {
            console.log("Erreur lors de la lecture :");
            console.error(err);
            this.voiceHandler.end();
        })

        await this.Phoenix.bot.user.setActivity("Loading...");
        this.voiceHandler = this.voiceConnection.playStream(this.stream);
        this.voiceHandler.setVolume(this.volume);
        console.log('Playing...');
        this.isPlaying = true;

        this.voiceHandler.on("start", async () => {
            if(song.name) {
                await this.Phoenix.bot.user.setActivity(song.name);
            }else {
                let title = await this.GetNameFromUrl(url);
                if(title) {
                    this.Phoenix.bot.user.setActivity(title);
                }
            }
        })

        this.voiceHandler.once('end', async (reason) => {
            await this.Phoenix.bot.user.setActivity(this.Phoenix.config.activity);
            console.log('End of soung: ' + reason);
            if(!this.isPlaying) return;

            this.voiceHandler = null;
            if(this.queue.length > 0 || Play.currentPlaylist.length > 0) {
                this.nextSong()
            }else {
                this.isPlaying = false;
                console.log("No more musics in queue, stop playing.");
                this.Phoenix.sendClean("File d'attente vide, j'me casse.", this.textChannel, 5000);
                this.voiceChannel.leave();
                return;
            }
        })
    }

    static GetNameFromUrl(url) {
        return new Promise(resolve => {
            if(!url.includes('watch?v=')) return false;
            let id = url.split('=')[1];
            try {
                request('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + id + '&maxResults=1&key=' + this.Phoenix.config.ytapikey, (err, res, body) => {
                    if(err) {
                        console.error(err);
                        resolve(err);
                    }
                    body = JSON.parse(body);
                    let videoTitle = body.items[0].snippet.title;
                    resolve(videoTitle);
                })
            }catch(err) {
                console.error(err);
                resolve(false);
            }
        })
    }

    /**
     * Push a random song of the playlist to the queue
     */
    static checkPlaylist() {
        if (this.currentPlaylist.length > 0) {
            console.log('Playing random song in playlist');
            let rand = Math.floor(Math.random() * Math.floor(this.currentPlaylist.length));
            this.queue.push(this.currentPlaylist[rand]);
        }
    }

    static skip() {
        if(this.isPlaying) {
            console.log('Skip soung');
            this.voiceHandler.end();
        }
    }

    static getStream(url) {
        console.log('Get stream from url : ' + url);
        // this.Phoenix.sendClean("Musique en cours : " + url, this.textChannel, 60000);
        let stream = youtube(url);
        return stream;
    }

    static getUrlFromName(name, Phoenix) {
        console.log('Get url from name : ' + name);
        return new Promise(resolve => {
            request('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + name + '&key=' + Phoenix.config.ytapikey, async (err, res, body) => {
                try {
                    let videos = JSON.parse(body).items;
                    let video = videos.find(vid => vid.id.kind == "youtube#video");
                    let id = video.id.videoId;
                    if(!id) {
                        this.textChannel.send("Je n'ai pas trouvé la vidéo :c");
                        resolve(false);
                    }
                    resolve('https://www.youtube.com/watch?v=' + id);
                }catch(err) {
                    console.error(err);
                    this.textChannel.send("Je n'ai pas trouvé la vidéo :c");
                    resolve(false);
                }
            })
        })
    }

    static connectToVoiceChannel(channel) {
        return new Promise((resolve, reject) => {
            if(!channel) {
                this.textChannel.send("Tu n'es pas connecté à un channel vocal ='(");
                console.log('User not connected to a voice channel');
                reject();
            }
            channel.join()
            .then(connection => {
                console.log('connected to voice channel');
                resolve(connection);
            })
            .catch((error) => {
                console.error(error);
                reject();
            });
        })
    }

    static stop() {
        if(!this.isPlaying) return;
        console.log("Stopping music");
        this.isPlaying = false;
        this.stream.end();
        this.voiceChannel.leave();
    }
}
