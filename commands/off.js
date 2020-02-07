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

    static call(message, Phoenix) {
        console.log('Phoenix disconnected.')
        Phoenix.bot.destroy();
        process.exit(0)
    }
}
