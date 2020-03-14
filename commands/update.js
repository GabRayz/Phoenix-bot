let Command = require('../src/Command');
const fs = require('fs');
const exec = require('child_process').exec;

module.exports = class Update extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'update';
    static alias = [
        "update",
        "u"
    ];
    static description = "Mettre à jour le bot";

    static async call(message, Phoenix) {
        message.channel.send('Mise à jour de Phoenix...');
        console.log('Updating...')
        fs.writeFile('./temoin', '', () => {
            console.log('Temoin créé');
            exec('./update', (error) => {
                message.channel.send('Echec de la mise à jour.');
                console.error('Failed to update: ', error)
            })
        });
    }
}
