const request = require('request');
const youtube = require('ytdl-core');
const opus = require('opusscript');
const YTplaylist = require('../src/ytplaylist');
Command = require('./command.js');

Command.Play = {
    name: "play",
    alias: [
        "play"
    ],
    groupOption: {
        whitelist: [],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "Ajoute une musique à la file d'attente. Démarre la lecture si aucune musique n'est en cours.",


    match: function(command) {
        return this.alias.includes(command);
    },
    checkPerm: function(channel, role) {
        // check blacklists
        if(this.groupOption.blacklist.length > 0 && this.groupOption.blacklist.includes(role.name)) {
            return false;
        }
        if(this.channelOption.blacklist.length > 0 && this.channelOption.blacklist.includes(channel.id)) {
            return false;
        }
    
        // check whitelists
        if(this.groupOption.whitelist.length > 0 && !this.groupOption.whitelist.includes(role.name)) {
            return false;
        }
        if(this.channelOption.whitelist.length > 0 && !this.channelOption.whitelist.includes(channel.id)) {
            return false;
        }
    
        return true;
    },
    queue: [],
    isPlaying: false,
    currentPlaylist: [],
    currentPlaylistName: "",
    volume: 1,

    play: function(msg, args, Phoenix) {
        this.textChannel = msg.channel;
        this.Phoenix = Phoenix;

        if(args.length > 0 && args[0] == 'debug') {
            console.log(this.voiceHandler);
            return;
        }
        if(args.length > 0 && args[0].startsWith('http') && args[0].includes('playlist?list=')) {
            console.log('Importing playlist...');
            YTplaylist.Enqueue(args[0], function() {
                Command.Play.start(Phoenix, msg);
            });
        }else {
            this.addToQueue(args, msg);
            this.start(Phoenix, msg);
        }
    },
    start: async function(Phoenix, msg) {
        this.Phoenix = Phoenix;

        if(!this.isPlaying) {
            console.log("connecting to voice channel");
            this.textChannel = msg.channel;
            this.voiceConnection = await this.connectToVoiceChannel(msg.member.voiceChannel);
            if(!this.voiceConnection) return;
            this.voiceChannel = msg.member.voiceChannel;

            this.nextSong();
        }
    },
    addToQueue: function(args, msg) {
        let name = "";
        args.forEach(str => {
            name += str + " ";
        });
        console.log("Queueing: " + name);
        this.queue.push(name);
        // this.textChannel.send('Musique ajoutée à la file d\'attente.');
        msg.react('✅');
    },
    addToQueueString: function(name) {
        console.log("Queueing: " + name);
        this.queue.push(name);
    },
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    async nextSong() {
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

        this.voiceHandler = this.voiceConnection.playStream(this.stream);
        this.voiceHandler.setVolume(this.volume);
        console.log('Playing...');
        this.isPlaying = true;
        this.Phoenix.bot.user.setActivity("Loading...");

        this.voiceHandler.on("start", async () => {
            if(song.name) {
                this.Phoenix.bot.user.setActivity(song.name);
            }else {
                let title = await this.GetNameFromUrl(url);
                if(title) {
                    this.Phoenix.bot.user.setActivity(title);
                }
            }
        })

        this.voiceHandler.once('end', (reason) => {
            this.Phoenix.bot.user.setActivity(this.Phoenix.config.activity);
            console.log('End of soung: ' + reason);
            if(!this.isPlaying) return;

            this.voiceHandler = null;
            if(this.queue.length > 0 || Command.Play.currentPlaylist.length > 0) {
                this.nextSong()
            }else {
                this.isPlaying = false;
                console.log("No more musics in queue, stop playing.");
                this.Phoenix.sendClean("File d'attente vide, j'me casse.", this.textChannel, 5000);
                this.voiceChannel.leave();
                return;
            }
        })
    },
    GetNameFromUrl(url) {
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
    },
    checkPlaylist() {
        if (this.currentPlaylist.length > 0) {
            console.log('Playing random song in playlist');
            let rand = Math.floor(Math.random() * Math.floor(this.currentPlaylist.length));
            this.queue.push(this.currentPlaylist[rand]);
        }
    },
    skip() {
        if(this.isPlaying) {
            console.log('Skip soung');
            this.voiceHandler.end();
        }
    },
    getStream(url) {
        console.log('Get stream from url : ' + url);
        // this.Phoenix.sendClean("Musique en cours : " + url, this.textChannel, 60000);
        let stream = youtube(url);
        return stream;
    },
    getUrlFromName(name, Phoenix) {
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
        
    },
    connectToVoiceChannel(channel) {
        return new Promise(resolve => {
            if(!channel) {
                this.textChannel.send("Tu n'es pas connecté à un channel vocal ='(");
                console.log('user not connected to a voice channel');
                resolve(false);
            }
            channel.join()
            .then(connection => {
                console.log('connected to voice channel');
                resolve(connection);
            })
            .catch(console.error);
        })
    },
    stop() {
        if(!this.isPlaying) return;
        console.log("Stopping music");
        this.isPlaying = false;
        this.stream.end();
        this.voiceChannel.leave();
    }
}
