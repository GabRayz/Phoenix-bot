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

    play: async function(msg, args, Phoenix) {
        this.Phoenix = Phoenix;
        console.log("connecting to voice channel");
        this.textChannel = Phoenix.testChannel;
        this.voiceConnection = await this.connectToVoiceChannel(msg.member.voiceChannel);
        if(!this.voiceConnection) return;
        this.queue.push(args);
        this.textChannel.send('Musique ajoutée à la file d\'attente.');

        if (!this.isPlaying) {
            this.nextSong();
        }
    },
    async nextSong() {
        if(!this.queue.length > 0) return;
        // Get the stream
        let song = this.queue.shift()[0];
        if (song.startsWith("http")) {
            this.stream = this.getStream(song);
        }else {
            url = await this.getUrlFromName(song, this.Phoenix)
            this.stream = this.getStream(url);
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
                return;
            }
        })

        this.voiceHandler = this.voiceConnection.playStream(this.stream);
        this.isPlaying = true;
    },
    skip() {
        console.log('Skip soung');
        this.stream.end();
    },
    getStream(url) {
        console.log('Get stream from url : ' + url);
        this.textChannel.send("Musique en cours : " + url);
        return youtube(url);
    },
    getUrlFromName(name, Phoenix) {
        console.log('Get url from name : ' + name);
        return new Promise(resolve => {
            request('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + name + '&key=' + Phoenix.config.ytapikey, async (err, res, body) => {
                let video = JSON.parse(body).items[0];
                let id = video.id.videoId;
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
    stop: function() {
        this.isPlaying = false;
        this.stream.end();
    }
}