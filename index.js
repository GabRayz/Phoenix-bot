// Import packages
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const request = require('request');

// Import config
var config = {};
config = require('./config.json');

// Create bot client
const bot = new Discord.Client();
// Log in
console.log('Connection...');
bot.login(config.login);

let Phoenix = {
    bot: bot,
    config: config
}

module.exports = Phoenix;

// Import commands
const Command = require('./commands/command');

bot.on('ready', () => {
    console.log('Phoenix bot ready to operate');
    bot.user.setActivity(config.activity).catch((e) => console.error(e))
    bot.user.setUsername(config.name)

    // Find the default guild and test Channel
    Phoenix.guild = bot.guilds.find(guild => guild.id == config.defaultGuild);
    Phoenix.testChannel = Phoenix.guild.channels.find(chan => chan.id == config.testChannel);

    if (config.connectionAlert == true) {
        Phoenix.testChannel.send("Phoenix connecté");
    }
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
    if (msg.content.startsWith(config.prefix)) {
        console.log(msg.author.username + ' : ' + msg.content);
        // let message = new Message(msg);
        let msgParts = msg.content.split(' ');
        let command = msgParts[0].slice(1);
        msg.args = msgParts.slice(1);
        ReadCommand(msg, command);
    }
});

function ReadCommand(message, command) {
    if(config.everyoneBlackListed && GetGuildMember(message.author).roles.length == 0) {
        return;
    }

    Object.keys(Command).forEach(element => {
        if (Command[element].match(command)) {
            if(!Command[element].checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
                PermissionDenied(message);
                return;
            }
            Command[element].call(message, Phoenix);
            return;
        }
    });
}

function PermissionDenied(msg) {
    console.log('Permission denied');
    msg.reply("Patouche");
    // msg.react('');
}

function GetGuildMember(user) {
    return Phoenix.guild.members.find(member => member.id == user.id);
}
