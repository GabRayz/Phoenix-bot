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

    static call(message, Phoenix) {
        this.checkForUpdate((res) => {
            if(!res) {
                message.channel.send('Phoenix est déjà à jour.');
            }else {
                message.channel.send('Mise à jour de Phoenix...');
                this.update((error) => {
                    message.channel.send('Echec de la mise à jour.');
                })
            }
        })
    }

    static autoUpdate() {
        this.checkForUpdate((res) => {
            if (res) {
                this.update();
            }
        })
    }

    static checkForUpdate(callback) {
        this.readVersion().then(version => {
            exec('git pull', (error) => {
                if (error) {
                    console.error(error);
                    return false;
                }
                this.readVersion().then(newVersion => {
                    callback(version != newVersion);
                }).catch(err => console.error(err));
            })
        }).catch(err => console.error(err));
    }

    static update(callback) {
        console.log('Updating...')
        fs.writeFile('./temoin', '', () => {
            console.log('Temoin créé');
            exec('./update', (error) => {
                if (error) {
                    console.error('Failed to update: ', error)
                }
                callback(error);
            })
        });
    }

    static readVersion() {
        return new Promise((resolve, reject) => {
            fs.readFile('./package.json', 'utf-8', (err, jsonString) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(JSON.parse(jsonString).version);
            })
        })
    }
}
