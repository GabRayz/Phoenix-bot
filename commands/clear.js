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

    static call(message, Phoenix) {
        let messages = message.channel.messages.filter(msg => msg.author.id == Phoenix.bot.user.id || msg.content.startsWith(Phoenix.config.prefix));
        messages.forEach(message => {
            message.delete();
        });
        console.log('Deleted old messages');
    }
}
