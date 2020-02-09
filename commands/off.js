let Command = require('../src/Command');

module.exports = class Off extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'off';
    static alias = [
        "off",
        "shutdown",
        "disconnect",
        "restart"
    ];
    static description = "Redémarre le bot";

    static async call(message, Phoenix) {
        await Phoenix.bot.destroy();
        console.log('Phoenix disconnected.')
        process.exit(0)
    }
}
