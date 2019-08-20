Command = require('./command.js');

Command.Off = {
    name: "off",
    alias: [
        "off",
        "shutdown",
        "disconnect"
    ],
    groupOption: {
        whitelist: ["Roi"],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "turn the bot off",


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

    shutdown: function(Phoenix) {
        console.log('Phoenix disconnected.')
        Phoenix.bot.destroy();
    }
}