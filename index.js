// Import packages
const Discord = require('discord.js');

// Create bot client
const bot = new Discord.Client();

// Import config
var Config = {};
Config = require('./config.json');

// Log in
console.log('Connection...');
bot.login(Config.login);
module.exports = bot;

// Import commands
const Off = require('./commands/off.js');
const Help = require('./commands/help.js');
const Clear = require('./commands/clear.js');

var Phoenix = {}
Phoenix.bot = bot;
Phoenix.config = Config;

bot.on('ready', () => {
    console.log('Phoenix bot ready to operate');
    bot.user.setActivity('être codé par GabRay').catch((e) => console.error(e))
    bot.user.setUsername(Config.name)

    // Find the default guild and test Channel
    Phoenix.guild = bot.guilds.find(guild => guild.id == Config.defaultGuild);
    Phoenix.testChannel = Phoenix.guild.channels.find(chan => chan.id == Config.testChannel);

    Phoenix.testChannel.send("Phoenix connecté");
});

bot.on('message', (msg) => {
    if (msg.content.startsWith(Config.prefix)) {
        console.log(msg.author.username + ' : ' + msg.content);
        let msgParts = msg.content.split(' ');
        ReadCommand(msgParts[0].slice(1), msgParts.slice(1), msg);
    }
});

function ReadCommand(command, args, msg) {
    if(Config.everyoneBlackListed && GetGuildMember(msg.author).roles.length == 0) {
        return;
    }
    if (Command.Off.match(command)) {
        if(!Command.Off.checkPerm(command, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        msg.delete()
        .then(Command.Off.shutdown(Phoenix));
    }
    
    if(Command.Help.match(command)) {
        if(!Command.Help.checkPerm(command, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Help.show(msg.channel);
    }

    if(Command.Clear.match(command)) {
        if(!Command.Clear.checkPerm(command, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Clear.clear(msg.channel, Phoenix);
    }
}

function PermissionDenied(msg) {
    console.log('Permission denied');
    msg.reply("Patouche");
}

function GetGuildMember(user) {
    return Phoenix.guild.members.find(member => member.id == user.id);
}