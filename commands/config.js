let Command = require('../src/Command');
const fs = require('fs');
let { RichEmbed } = require('discord.js');

module.exports = class Config extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'config';
    static alias = [
        "config",
    ];
    static description = "Configure the bot";

    static async call(message, Phoenix) {
        if (message.args.length == 0)
            this.display(message, Phoenix);
    }

    static display(message, Phoenix) {
        // Embed message to display the configuration file
        let embed = new RichEmbed();
        embed.setTitle('Configuration')
            .setColor('ORANGE')
            .setThumbnail(Phoenix.bot.user.avatarURL)
            .addField('Prefix', Phoenix.config.prefix)
            .addField('Notification de connexion', Phoenix.config.connectionAlert)
            .addField('Salon Bot (id)', Phoenix.config.testChannel)
            .addField('Les membres sans rôles ne peuvent pas controler le bot', Phoenix.config.everyoneBlackListed)
            .addField('Adresse de téléchargement des vidéos', Phoenix.config.downloadAdress)
            .addField('Port de téléchargement des vidéos', Phoenix.config.downloadPort)

        message.channel.send(embed).catch(err => {
            if (err.message == 'Missing Permissions')
                message.channel.send('Erreur, mes permissions sont insuffisantes :(');
            else
                console.error(err);
        })
        // Display the permissions
        let perms = new RichEmbed();
        perms.setTitle('Permissions')
            .setColor('ORANGE')
            .setThumbnail(Phoenix.bot.user.avatarURL);
        
        // For each command, add a field with the associated permissions
        Object.keys(Phoenix.config.permissions).forEach(command => {
            let permissions = Phoenix.config.permissions[command];
            let str = '';
            if (permissions.channelOptions.whitelist.length > 0)
                str += 'Whitelist (salons) : ' + this.getChannelsNameFromId(permissions.channelOptions.whitelist, message.guild) + '\n';
            if (permissions.channelOptions.blacklist.length > 0)
                str += 'Blacklist (salons) : ' + this.getChannelsNameFromId(permissions.channelOptions.blacklist, message.guild) + '\n';
            if (permissions.groupOptions.whitelist.length > 0)
                str += 'Whitelist (Rôles) : ' + permissions.groupOptions.whitelist + '\n';
            if (permissions.groupOptions.blacklist.length > 0)
                str += 'Blacklist (Rôles) : ' + permissions.groupOptions.blacklist + '\n';
            if (permissions.memberOptions.whitelist.length > 0)
                str += 'Whitelist (Membres) : ' + permissions.memberOptions.whitelist + '\n';
            if (permissions.memberOptions.blacklist.length > 0)
                str += 'Blacklist (Membres) : ' + permissions.memberOptions.blacklist + '\n';
            perms.addField(command, str);
        })
        // Send
        message.channel.send(perms).catch(err => {
            if (err.message == 'Missing Permissions')
                message.channel.send('Erreur, mes permissions sont insuffisantes :(');
            else
                console.error(err);
        })

    }

    static getChannelsNameFromId(channelsId, guild) {
        let res = [];
        channelsId.forEach(id => {
            let channel = guild.channels.find(c => c.id == id);
            let category = guild.channels.find(c => c.id == channel.parentID);
            res.push(category.name + '/' + channel.name);
        })
        return res;
    }

    static load() {
        return new Promise((resolve, reject) => {
            fs.readFile('./config.json', 'utf-8', (err, data) => {
                if (err) {
                    console.error('Error while loading the config file: ', err);
                    return reject();
                }
                resolve(JSON.parse(data));
            })
        })
    }

    static save(data) {
        fs.writeFile('./config.json', JSON.stringify(data), (err) => {
            if (err) console.error('Error while saving the config: ', err);
        })
    }
}
