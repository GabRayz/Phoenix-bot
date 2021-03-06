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

/**
 * Phoenix is exported to share the Client object and the configuration
 */
let Phoenix = {
    bot: bot,
    /**
     * The number of currently active commands, like playing a music or a game of connect four.
     * If it is 0, then the bot is idle and can be updated without bothering users.
     */
    activities: 0,
    botChannel: null
}

// Import config
Phoenix.config = require('./commands/config').load().then(config => {
    Phoenix.config = config;
    // Log in
    console.log('Connection...');
    bot.login(config.login);
})

module.exports = Phoenix;

// Import commands
const Command = require('./commands/command');

bot.on('ready', () => {
    console.log('Phoenix bot ready to operate');
    bot.user.setActivity(Phoenix.config.activity).catch((e) => console.error(e))
    bot.user.setUsername(Phoenix.config.name)

    // Find the default guild and test Channel
    Phoenix.guild = bot.guilds.find(guild => guild.id == Phoenix.config.defaultGuild);
    Phoenix.botChannel = Phoenix.guild.channels.find(chan => chan.id == Phoenix.config.testChannel);

    if (Phoenix.config.connectionAlert == 'true') {
        Phoenix.botChannel.send("Phoenix connecté");
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
    if (checkPrefix(msg.content)) {
        console.log(msg.author.username + ' : ' + msg.content);
        let msgParts = msg.content.split(' ');
        let command = msgParts[0].slice(Phoenix.config.prefix.length);
        msg.args = msgParts.slice(1);
        msg.command = command;
        ReadCommand(msg, command);
    }
});

RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function checkPrefix(message) {
    let regex = RegExp.escape(Phoenix.config.prefix);
    return message.match('^' + regex) != null;
}

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
            if (!message.guild && (typeof Command[element].callableFromMP == 'undefined' || !Command[element].callableFromMP))
                return
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
    if(perm.members.blacklist.includes(message.author.tag)) {
        return false;
    }

    // check whitelists
    if(perm.roles.whitelist.length > 0 && !perm.roles.whitelist.includes(role.name)) {
        return false;
    }
    if(perm.channels.whitelist.length > 0 && !perm.channels.whitelist.includes(message.channel.id)) {
        return false;
    }
    if(perm.members.whitelist.length > 0 && !perm.members.whitelist.includes(message.author.tag)) {
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
                    if (Phoenix.config.updateAlert == "true") {
                        let embed = new Discord.RichEmbed();
                        embed.setTitle('Phoenix a été mis à jour.')
                        .setDescription('v' + version)
                        .setColor('ORANGE')
                        .setThumbnail(Phoenix.bot.user.avatarURL)
                        .setFooter('Codé par GabRay');
                        
                        Phoenix.botChannel.send(embed).catch(err => {
                            if (err.message == 'Missing Permissions') {
                                Phoenix.botChannel.send('Erreur, mes permissions sont insuffisantes :(');
                            }else if (err)
                                console.error(err);
                        })
                    }
                }).catch(err, console.error(err));
            });
        }
    })
}

Command.Update.autoUpdate(Phoenix);
setInterval(() => {
    if (Phoenix.activities == 0) {
        Command.Update.autoUpdate(Phoenix);
    }
}, 30 * 1000)
