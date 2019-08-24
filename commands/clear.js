Command = require('./command.js');

Command.Clear = {
    name: "clear",
    alias: [
        "clear",
        "clean"
    ],
    groupOption: {
        whitelist: [],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "Nettoie le chat des commandes bot",


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

    clear: function(channel, Phoenix) {
        let messages = channel.messages.filter(msg => msg.author.id == Phoenix.bot.user.id || msg.content.startsWith(Phoenix.config.prefix));
        messages.forEach(message => {
            message.delete();
        });
        console.log('Deleted old messages');
    }
}