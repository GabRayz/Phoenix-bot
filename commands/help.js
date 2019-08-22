Command = require('./command.js');

Command.Help = {
    name: "help",
    alias: [
        "help",
        "h"
    ],
    groupOption: {
        whitelist: [],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "Affiche la liste des commandes",


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

    show: function(channel) {
        let text = "Commandes : \n"+
            "\nhelp: " + Command.Help.description +
            "\noff: " +  Command.Off.description +
            "\nclear: " + Command.Clear.description +
            "\nplay [nom/url]: " + Command.Play.description +
            "\nskip: " + Command.Skip.description +
            "\nstop: " + Command.Stop.description +
            "\nplaylist: " + Command.Playlist.description +
            "\nqueue: " + Command.Queue.description +
            "\nshop: " + Command.Shop.description +
            "";
        
        channel.send(text, {
            code: true
        })
        .catch(console.error);
    }
}