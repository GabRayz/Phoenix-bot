Command = require('./command.js');
require('./play');

Command.Volume = {
    name: "volume",
    alias: [
        "volume"
    ],
    groupOption: {
        whitelist: [],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "Changer le volume",


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
    set: function(msg, Phoenix, args) {
        if(!args.length > 0) {
            Phoenix.sendClean('Volume actuel: ' + Command.Play.volume, msg.channel, 5000);
            return;
        }
        let volume = args[0];
        if(Command.Play.voiceHandler && !Command.Play.voiceHandler.paused) {
            if (volume >= 0 && volume <= 200) {
                Command.Play.voiceHandler.setVolume(volume/100);
                Command.Play.volume = volume / 100;
                console.log('Volume set');
            }else {
                Phoenix.sendClean('Le volume doit etre compris entre 0 et 200.', msg.channel, 5000);
            }
        }else {
            Phoenix.sendClean('Le bot ne joue pas, ou alors est en pause.', msg.channel, 5000);
        }
    }
}