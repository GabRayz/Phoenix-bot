const fs = require('fs');
const YTplaylist = require('../src/ytplaylist');
Command = require('./command.js');
// require('./play.js');

Command.Playlist = {
    name: "playlist",
    alias: [
        "playlist",
        "pl"
    ],
    groupOption: {
        whitelist: [],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "Gérer les playlist. !playlist help",
    path: '../../playlists/',


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
    read: function(msg, args, Phoenix) {
        this.textChannel = msg.channel;
        this.Phoenix = Phoenix;
        switch(args[0]) {
            case "create":
                if (args.length > 1) this.create(args[1], msg.author);
                break;
            case "list":
                this.list();
                break;
            case "add":
                if (args.length > 2) {
                    if(args[2].includes('playlist?list=')) {
                        YTplaylist.ImportPlaylist(args[2], args[1], msg.author);
                    }else if(args[2].includes('spotify.com')) {
                        Command.Spotify.read(args[2], args[1], msg.author);
                    }else {
                        this.add(this.getSoungName(args), args[1], msg.author);
                    }
                }
                break;
            case "play":
                if (args.length > 1) this.play(args[1], msg);
                break;
            case "stop":
                this.stop();
                break;
            case "delete":
                if (args.length > 1) this.delete(args[1], msg.author);
                break;
            case "help":
                this.showHelp();
                break
            case "see":
                    if (args.length > 1) this.see(args[1]);
                    break;
            default:
                return;
        }
    },
    create(name, user) {
        name = name.split('.')[0];
        let content = '{"authors": ["' + user.username + '"], "items": []}';
        fs.writeFile('../playlists/' + name + '.json', content, (err) => {
            if (err === null) {
                console.log('Playlist created');
                this.textChannel.send('La playlist ' + name + ' a été créée. Ajoutez des musiques avec ' + this.Phoenix.config.prefix + 'playlist add [playlist] [url]');
            }else {
                console.log(err);
                this.textChannel.send('Erreur lors de la création de la playlist');
            }
        })
    },
    list() {
        fs.readdir('../playlists/', (err, files) => {
            if(err) {
                console.error(err);
                return;
            }
            let msg = "";
            if (files.length == 0) {
                msg = "Il n'y a aucune playlist";
            }else {
                msg = "Playlists: ";
                files.forEach(file => {
                    msg += "\n - " + file.split('.')[0];
                });
            }
            this.textChannel.send(msg);
        })
    },
    getSoungName: function(args) {
        let res = "";
        for (let i = 2; i < args.length; i++) {
            const word = args[i];
            res += word + " ";
        }
        return res;
    },
    add(songName, playlistName, user, log = true, songId = "") {
        console.log("Adding " + songName + " to playlist " + playlistName);
        let playlist = {};
        try {
            playlist = require('../../playlists/' + playlistName + '.json');
        }catch (err) {
            if(log)
                this.Phoenix.sendClean('Cette playlist n\'existe pas :/', this.textChannel, 20000)
            console.log("Cannot find playlist " + playlistName);
            console.error(err);
            return false;
        }

        if(!this.checkAuthors(playlist, user)) return false;

        let music = {
            name: songName,
            id: songId
        }
        playlist.items.push(music)
        let text = JSON.stringify(playlist);
        fs.writeFile("../playlists/" + playlistName + ".json", text, (err) => {
            if(err) {
                console.error(err)
            }else {
                if(log)
                    this.Phoenix.sendClean("Musique ajoutée à la playlist", this.textChannel, 10000);
                console.log('Music added to playlist');
            }
        });
        return true;
    },
    play(playlistName, msg) {
        let playlist = [];
        try {
            playlist = require('../../playlists/' + playlistName + '.json');
        }catch(err) {
            console.error('Playlist not found: ' + playlistName);
            console.error(err);
            this.Phoenix.sendClean("Je n'ai pas trouvé cette playlist.", this.textChannel, 5000);
            return;
        }
        Command.Play.currentPlaylist = playlist.items;
        Command.Play.currentPlaylistName = playlistName;
        console.log('Playing playlist: ' + playlistName);

        Command.Play.start(this.Phoenix, msg);
    },
    stop: function() {
        Command.Play.currentPlaylist = [];
        Command.Play.currentPlaylistName = "";
    },
    delete(playlistName, user) {
        let playlist = {};
        try {
            playlist = require("../../playlists/" + playlistName + ".json")
        }catch(err) {
            console.error(err);
            this.Phoenix.sendClean("Je n'ai pas trouvé cette playlist", this.textChannel, 5000);
            return;
        }

        if(!this.checkAuthors(playlist, user)) return false;

        fs.unlink("../playlists/" + playlistName + ".json", (err) => {
            if (err) {
                console.error(err);
                this.Phoenix.sendClean("Je n'ai pas trouvé cette playlist", this.textChannel, 5000);
            }else {
                console.log('Deleted playlist: ' + playlistName);
                this.Phoenix.sendClean("Playlist supprimée.", this.textChannel, 15000);
            }
        })
    },
    showHelp() {
        let msg = "Gestion de playlist : " +
            "\n" + this.Phoenix.config.prefix + "playlist list: Liste toutes les playlist" + 
            "\n" + this.Phoenix.config.prefix + "playlist create {nom}: Créer une nouvelle playlist" + 
            "\n" + this.Phoenix.config.prefix + "playlist add {playlist} {nom}: Ajouter une musique à une playlist" + 
            "\n" + this.Phoenix.config.prefix + "playlist play {playlist}: Joue une playlist" + 
            "\n" + this.Phoenix.config.prefix + "playlist delete {playlist}: Supprime une playlist" + 
            "\n" + this.Phoenix.config.prefix + "playlist see {playlist}: Liste le contenu d'une playlist" + 
            "";
        this.textChannel.send(msg, {code: true});
    },
    checkAuthors(playlist, user) {
        if(playlist.authors.includes(user.username)) return true;
        this.Phoenix.sendClean("Tu n'es pas l'auteur de cette playlist", this.textChannel, 15000);
        return false;
    },
    see(playlistName) {
        let playlist = {};
        try {
            playlist = require('../../playlists/' + playlistName + '.json');
        }catch(err) {
            console.error(err);
            return;
        }
        let msgs = [];
        let msg = playlistName + ": playlist de " + playlist.authors[0] + " | ";
        playlist.items.forEach(song => {
            if (song.name)
                msg += song.name + ", ";
            else
                msg += song + ", ";
            if(msg.length > 1700) {
                msgs.push(msg);
                msg = "";
            }
        });
        msgs.forEach(m => this.textChannel.send(m));
    }
}