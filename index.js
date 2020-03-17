// Import packages
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const request = require('request');
require('./src/http');
const fs = require('fs');

// Create bot client
const bot = new Discord.Client();

let Phoenix = {
    bot: bot
}

// Import commands
const Command = require('./commands/command');

// Import config

Phoenix.config = Command.Config.load().then(config => {
    Phoenix.config = config;
    // Log in
    console.log('Connection...');
    bot.login(config.login);
})

module.exports = Phoenix;

bot.on('ready', () => {
    console.log('Phoenix bot ready to operate');
    bot.user.setActivity(Phoenix.config.activity).catch((e) => console.error(e))
    bot.user.setUsername(Phoenix.config.name)

    // Find the default guild and test Channel
    Phoenix.guild = bot.guilds.find(guild => guild.id == Phoenix.config.defaultGuild);
    Phoenix.testChannel = Phoenix.guild.channels.find(chan => chan.id == Phoenix.config.testChannel);

    if (Phoenix.config.connectionAlert == true) {
        Phoenix.testChannel.send("Phoenix connecté");
    }

    checkIfUpdated();
});

Phoenix.sendClean = function(msg, channel, time = 20000) {
    channel.send(msg)
    .then((message) => {
        setTimeout(() => {
            if(!message.deleted)
                message.delete();
        }, time);
    })
}

bot.on('message', (msg) => {
    if (msg.content.startsWith(Phoenix.config.prefix)) {
        console.log(msg.author.username + ' : ' + msg.content);
        // let message = new Message(msg);
        let msgParts = msg.content.split(' ');
        let command = msgParts[0].slice(1);
        msg.args = msgParts.slice(1);
        ReadCommand(msg, command);
    }
});

function ReadCommand(message, command) {
    if(Phoenix.config.everyoneBlackListed && GetGuildMember(message.author).roles.length == 0) {
        return;
    }

    Object.keys(Command).forEach(element => {
        if (Command[element].match(command)) {
            if (!searchPermissions(Command[element], message)) {
                PermissionDenied(message);
                return;
            }
            Command[element].call(message, Phoenix);
            return;
        }
    });
}

function searchPermissions(command, message) {
    for (let name of Object.keys(Phoenix.config.permissions)) {
        if (name == command.name) {
            let perm = Phoenix.config.permissions[name];
            console.log(perm);
            return checkPermissions(perm, message);
        }
    };
    let perm = Phoenix.config.permissions.default;
    return checkPermissions(perm, message);
}

function checkPermissions(perm, message) {
    let role = GetGuildMember(message.author).highestRole;
    // check blacklists
    if(perm.roles.blacklist.length > 0 && perm.roles.blacklist.includes(role.name)) {
        return false;
    }
    if(perm.channels.blacklist.length > 0 && perm.channels.blacklist.includes(message.channel.id)) {
        return false;
    }

    // check whitelists
    if(perm.roles.whitelist.length > 0 && !perm.roles.whitelist.includes(role.name)) {
        return false;
    }
    if(perm.channels.whitelist.length > 0 && !perm.channels.whitelist.includes(message.channel.id)) {
        return false;
    }

    return true;
}

function PermissionDenied(msg) {
    console.log('Permission denied');
    msg.reply("Patouche");
    // msg.react('');
}

function GetGuildMember(user) {
    return Phoenix.guild.members.find(member => member.id == user.id);
}

function checkIfUpdated()
{
    fs.access('temoin', fs.constants.F_OK, (err) => {
        if (!err) {
            fs.unlink('temoin', () => {
                Command.Update.readVersion().then(version => {
                    let embed = new Discord.RichEmbed();
                    embed.setTitle('Phoenix a été mis à jour.')
                    .setDescription('v' + version)
                    .setColor('ORANGE')
                    .setThumbnail(Phoenix.bot.user.avatarURL)
                    .setFooter('Codé par GabRay');
                    
                    Phoenix.testChannel.send(embed).catch(err => {
                        if (err.message == 'Missing Permissions') {
                            Phoenix.testChannel.send('Erreur, mes permissions sont insuffisantes :(');
                        }else
                        console.error(err);
                    })
                }).catch(err, console.error(err));
            });
        }
    })
}

Command.Update.autoUpdate(Phoenix);
setInterval(() => {
    Command.Update.autoUpdate(Phoenix);
}, 3600 * 24);
