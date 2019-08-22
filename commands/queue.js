Command = require('./command.js');
require('./play.js');

Command.Queue = {
    name: "queue",
    alias: [
        "queue"
    ],
    groupOption: {
        whitelist: [],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "Affiche la liste d'attente des musiques.",


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
    queue: function(msg, Phoenix) {
        let res = "Playlist en cours : " + (Command.Play.currentPlaylistName == "" ? "Aucune": Command.Play.currentPlaylistName);
        res += "\nFile d'attente : ";
        Command.Play.queue.forEach(song => res += song + ", ");
        res += "\nÀ la fin de la file d'attente, des chansons de la playlist seront ajoutées";
        Phoenix.sendClean(res, msg.channel, 20000);
    }
}