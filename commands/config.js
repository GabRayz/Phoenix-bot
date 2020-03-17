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
        else if (message.args.length == 2)
        {
            if (this.changeConfig(message.args[0], message.args[1], Phoenix))
                message.react('✅');
            else
                message.react('⚠️');
        }
    }

    static changeConfig(attribute, value, Phoenix) {
        if (typeof Phoenix.config[attribute] == 'undefined') return false

        Phoenix.config[attribute] = value;
        if (attribute == "prefix") {
            Phoenix.config.activity = value + 'help';
            Phoenix.bot.user.setActivity(Phoenix.config.activity).catch((e) => console.error(e))
        }
        this.save(Phoenix.config);
        return true
    }

    static display(message, Phoenix) {
        // Embed message to display the configuration file
        let embed = new RichEmbed();
        embed.setTitle('Configuration')
            .setColor('ORANGE')
            .setThumbnail(Phoenix.bot.user.avatarURL)
            .addField('Préfix - prefix', Phoenix.config.prefix)
            .addField('Notification de connexion - connectionAlert', Phoenix.config.connectionAlert)
            .addField('Salon Bot (id) - testchannel', Phoenix.config.testChannel)
            .addField('Les membres sans rôles ne peuvent pas controler le bot - everyoneBlackListed', Phoenix.config.everyoneBlackListed)
            .addField('Adresse de téléchargement des vidéos - downloadAdress', Phoenix.config.downloadAdress)
            .addField('Port de téléchargement des vidéos - downloadPort', Phoenix.config.downloadPort)

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
            if (permissions.channels.whitelist.length > 0)
                str += 'channels - whitelist : ' + this.getChannelsNameFromId(permissions.channels.whitelist, message.guild) + '\n';
            if (permissions.channels.blacklist.length > 0)
                str += 'channels - blaklist : ' + this.getChannelsNameFromId(permissions.channels.blacklist, message.guild) + '\n';
            if (permissions.roles.whitelist.length > 0)
                str += 'roles - whitelist : ' + permissions.roles.whitelist + '\n';
            if (permissions.roles.blacklist.length > 0)
                str += 'roles - blacklist : ' + permissions.roles.blacklist + '\n';
            if (permissions.members.whitelist.length > 0)
                str += 'members - whitelist : ' + permissions.members.whitelist + '\n';
            if (permissions.members.blacklist.length > 0)
                str += 'members - blacklist : ' + permissions.members.blacklist + '\n';
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
        fs.writeFile('./config.json', JSON.stringify(data, null, 4), (err) => {
            if (err) console.error('Error while saving the config: ', err);
        })
    }
}
