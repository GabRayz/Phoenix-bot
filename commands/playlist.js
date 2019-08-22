Command = require('./command.js');
const fs = require('fs');
require('./play.js');

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
    read(msg, args, Phoenix) {
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
                if (args.length > 2) this.add(args[2], args[1], msg.author);
                break;
            case "play":
                if (args.length > 1) this.play(args[1], msg);
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
        fs.writeFile('playlists/' + name + '.json', content, (err) => {
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
        fs.readdir('playlists/', (err, files) => {
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
    add(song, playlistName, user) {
        console.log("Adding " + song + " to playlist " + playlistName);
        let playlist = {};
        try {
            playlist = require('../playlists/' + playlistName + '.json');
        }catch (err) {
            this.Phoenix.sendClean('Cette playlist n\'existe pas :/', this.textChannel, 20000)
            console.log("Cannot find playlist " + playlistName);
            console.error(err);
            return;
        }

        if(!this.checkAuthors(playlist, user)) return false;

        playlist.items.push(song)
        let text = JSON.stringify(playlist);
        fs.writeFile("playlists/" + playlistName + ".json", text, (err) => {
            if(err) {
                console.error(err)
            }else {
                this.Phoenix.sendClean("Musique ajoutée à la playlist", this.textChannel, 10000);
                console.log('Music added to playlist');
            }
        })
    },
    play(playlistName, msg) {
        let playlist = [];
        try {
            playlist = require('../playlists/' + playlistName + '.json');
        }catch(err) {
            console.error('Playlist not found: ' + playlistName);
            this.Phoenix.sendClean("Je n'ai pas trouvé cette playlist.", this.textChannel, 5000);
        }
        Command.Play.currentPlaylist = playlist.items;
        console.log('Playing playlist: ' + playlistName);

        Command.Play.start(this.Phoenix, msg);
    },
    delete(playlistName, user) {
        let playlist = {};
        try {
            playlist = require("../playlists/" + playlistName + ".json")
        }catch(err) {
            console.error(err);
            this.Phoenix.sendClean("Je n'ai pas trouvé cette playlist", this.textChannel, 5000);
            return;
        }

        if(!this.checkAuthors(playlist, user)) return false;

        fs.unlink("playlists/" + playlistName + ".json", (err) => {
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
            playlist = require('../playlists/' + playlistName + '.json');
        }catch(err) {
            console.error(err);
            return;
        }
        let msg = playlistName + ": playlist de " + playlist.authors[0] + " | ";
        playlist.forEach(song => msg += song + ", ");
        this.textChannel.send(msg);
    }
}