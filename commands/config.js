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
        // Args: "permissions", command name, roles/channels/members, whitelist/blacklist, add/remove, value
        else if (message.args.length == 6 && (message.args[0] == "permissions" || message.args[0] == "perm"))
        {
            // Check if the permission is correct
            if (this.checkIfCommandExists(message.args[1])) {
                let scopes = ['roles', 'channels', 'members'];
                if (scopes.includes(message.args[2])) {
                    if (message.args[2] == "channels") {
                        message.args[5] = this.getChannelIfFromName(message.args[5], message.guild);
                        if (!message.args[5]) {
                            message.reply('Salon introuvable. Format: "catégorie/salon"')
                            return;
                        }
                    }
                    if (message.args[3] == "whitelist" || message.args[3] == "blacklist") {
                        if (message.args[4] == "add" || message.args[4] == "remove") {
                            // Apply
                            this.changePerm(message.args[1], message.args[2], message.args[3], message.args[4], message.args[5], Phoenix)
                            message.react('✅');
                            return;
                        }else message.reply("Erreur sur le paramètre '" + message.args[4] + "'. Valeurs possibles: add,remove");
                    }else message.reply("Erreur sur le paramètre '" + message.args[3] + "'. Valeurs possibles: whitelist,blacklist");
                }else message.reply("Erreur sur le paramètre '" + message.args[2] + "'. Valeurs possibles: " + scopes);
            }
            message.react('⚠️');
        }else {
            message.react('⚠️');
            message.reply('Commande invalide.')
        }
    }

    static getChannelIfFromName(name, guild) {
        // name: 'category/channel'
        let names = name.split('/');
        let category = guild.channels.find(c => c.name == names[0]);
        if (!category) return false;
        let channel = guild.channels.find(c => c.name == names[1] && c.parentID == category.id);
        return channel ? channel.id : false;
    }

    static changePerm(commandName, scope, type, action, value, Phoenix) {
        if (typeof Phoenix.config.permissions[commandName] == 'undefined')
            this.createCommandPerm(commandName, Phoenix.config.permissions)
        let list = Phoenix.config.permissions[commandName][scope][type];
        if (action == "add")
            list.push(value);
        else if (list.includes(value))
            list.splice(list.findIndex(el => el == value), 1);
        
        this.save(Phoenix.config);
    }

    static createCommandPerm(commandName, perms) {
        perms[commandName] = {
            roles: {
                whitelist: [],
                blacklist: []
            },
            channels: {
                whitelist: [],
                blacklist: []
            },
            members: {
                whitelist: [],
                blacklist: []
            }
        }
    }

    static checkIfCommandExists(name) {
        if (name == "default") return true;
        let commands = {}
        commands = require('./command');
        let com = Object.values(commands).find(c => c.name == name);
        return (typeof com != 'undefined');
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
            
            if (str)
                perms.addField(command, str);
        })
        // Send
        message.channel.send(perms).catch(err => {
            if (err.message == 'Missing Permissions')
                message.channel.send('Erreur, mes permissions sont insuffisantes :(');
            else
                console.error(err);
        })

        let notice = new RichEmbed();
        let description = 'Modifier une configuration: ' + Phoenix.config.prefix + 'config {attribut} {valeur}\n';
            description += 'Modifier une permission: ' + Phoenix.config.prefix;
            description += 'config perm {nom de la commande} {roles|channels|members} {whitelist|blacklist} {add|remove} {nom du role|nom de la catégorie/nom du salon|tag du membre(exemple#0001)}';
        notice.setDescription(description);
        message.channel.send(notice).catch(err => {
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
