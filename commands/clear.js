let Command = require('../src/Command');

module.exports = class Clear extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'clear';
    static alias = [
        "clear",
        "clean"
    ];
    static description = "Nettoie le chat des commandes bot";

    static async call(message, Phoenix) {
        let messages = message.channel.messages.filter(msg => msg.author.id == Phoenix.bot.user.id || msg.content.startsWith(Phoenix.config.prefix));
        for(let msg of messages) {
            await this.sleep(1000);
            msg[1].delete().catch(err => {
                console.error(err);
            })
        }
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
