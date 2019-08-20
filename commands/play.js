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
        whitelist: ["Roi"],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "Joue une musique",


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
    play: async function(msg, args, Phoenix) {
        this.Phoenix = Phoenix;
        console.log("connecting to voice channel");
        this.textChannel = Phoenix.testChannel;
        this.voiceConnection = await this.connectToVoiceChannel(msg.member.voiceChannel);
        if(!this.voiceConnection) return;
        this.queue.push(args);

        this.nextSong();

        // Get the stream
        // let stream;
        // if(args[0].startsWith("http")) {
        //     stream = this.getStream(args[0])
        // }else {
        //     url = await this.getUrlFromName(args[0], Phoenix)
        //     stream = this.getStream(url);
        // }
    },
    async nextSong() {
        // Get the stream
        let song = this.queue.shift()[0];
        if (song.startsWith("http")) {
            this.stream = this.getStream(song);
        }else {
            url = await this.getUrlFromName(song, this.Phoenix)
            this.stream = this.getStream(url);
        }

        this.voiceHandler = this.voiceConnection.playStream(this.stream);
    },
    getStream(url) {
        console.log('Get stream from url : ' + url);
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
    }
}