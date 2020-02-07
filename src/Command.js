class Command {
    /**
     * Name of the command. No real purpose
     */
    static name;
    /**
     * List of strings to match to call the command.
     */
    static alias = [];
    static groupOption = {
        whitelist: [],
        blacklist: []
    }
    static channelOption = {
        whitelist: [],
        blacklist: []
    }
    static description = "Nettoie le chat des commandes bot";

    /**
     * Check if @command is an alias of the Command.
     * @param {*} command : The command typed by the user.
     */
    static match(command) {
        return this.alias.includes(command);
    }
    /**
     * Check if the call to that command is authorized, depending on the user's role and the channel.
     * @param {*} channel 
     * @param {*} role 
     */
    static checkPerm(channel, role) {
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
    }
    /**
     * Execute the command
     */
    call() {
        throw new Error('Function not implemented');
    }
}

module.exports = Command;
