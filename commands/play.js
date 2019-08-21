const request = require('request');
const youtube = require('ytdl-core');
const opus = require('opusscript');
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

    play: function(msg, args, Phoenix) {
        this.addToQueue(args);

        this.start(Phoenix, msg);
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
    addToQueue: function(args) {
        console.log(args);
        let name = "";
        args.forEach(str => {
            name += str + " ";
        });
        console.log(name);
        this.queue.push(name);
        this.textChannel.send('Musique ajoutée à la file d\'attente.');
    },
    async nextSong() {
        console.log('Choosing next song...');
        if(!this.queue.length > 0) {
            if(this.currentPlaylist.length > 0) {
                this.checkPlaylist();
            }else {
                return;
            }
        }
        // Get the stream
        console.log('Current queue: ');
        console.log(this.queue);
        let song = this.queue.shift();//[0];
        console.log('Next song: ');
        console.log(song)
        try {
            if (song.startsWith("http")) {
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
            this.textChannel("Oups, j'ai des problèmes :/");
            return;
        }
        

        this.stream.on('error', (err) => {
            console.log("Erreur lors de la lecture :");
            console.error(err);
            this.voiceHandler.end();
        })
        this.stream.on('end', (reason) => {
            console.log('End of soung');
            if(!this.isPlaying) return;

            this.voiceHandler = null;
            if(this.queue.length > 0) {
                this.nextSong()
            }else {
                this.isPlaying = false;
                console.log("No more musics in queue, stop playing.");
                this.Phoenix.sendClean("File d'attente vide, j'me casse.", this.textChannel, 5000);
                this.voiceChannel.leave();
                return;
            }
        })

        this.voiceHandler = this.voiceConnection.playStream(this.stream);
        this.isPlaying = true;
    },
    checkPlaylist() {
        if (this.currentPlaylist.length > 0) {
            console.log('Playing random song in playlist');
            let rand = Math.floor(Math.random() * Math.floor(this.currentPlaylist.length));
            this.queue.push(this.currentPlaylist[rand]);
        }
    },
    skip() {
        console.log('Skip soung');
        this.stream.end();
    },
    getStream(url) {
        console.log('Get stream from url : ' + url);
        this.textChannel.send("Musique en cours : " + url);
        let stream = youtube(url);
        return stream;
    },
    getUrlFromName(name, Phoenix) {
        console.log('Get url from name : ' + name);
        return new Promise(resolve => {
            request('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + name + '&key=' + Phoenix.config.ytapikey, async (err, res, body) => {
                let videos = JSON.parse(body).items;
                let video = videos.find(vid => vid.id.kind == "youtube#video");
                let id = video.id.videoId;
                if(!id) {
                    this.textChannel.send("Je n'ai pas trouvé la vidéo :c");
                    resolve(false);
                }
                resolve('https://www.youtube.com/watch?v=' + id);
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