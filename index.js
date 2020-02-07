// Import packages
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const request = require('request');

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
const Command = require('./commands/command');

var Phoenix = {}
Phoenix.bot = bot;
Phoenix.config = Config;

bot.on('ready', () => {
    console.log('Phoenix bot ready to operate');
    bot.user.setActivity(Config.activity).catch((e) => console.error(e))
    bot.user.setUsername(Config.name)

    // Find the default guild and test Channel
    Phoenix.guild = bot.guilds.find(guild => guild.id == Config.defaultGuild);
    Phoenix.testChannel = Phoenix.guild.channels.find(chan => chan.id == Config.testChannel);

    if (Config.connectionAlert == true) {
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
    if (msg.content.startsWith(Config.prefix)) {
        console.log(msg.author.username + ' : ' + msg.content);
        // let message = new Message(msg);
        let msgParts = msg.content.split(' ');
        let command = msgParts[0].slice(1);
        msg.args = msgParts.slice(1);
        ReadCommand(msg, command);
    }
});

function ReadCommand(message, command) {
    if(Config.everyoneBlackListed && GetGuildMember(message.author).roles.length == 0) {
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

    return;
    if (Command.Off.match(command)) {
        if(!Command.Off.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        message.delete()
        .then(Command.Off.shutdown(Phoenix));
    }
    
    if(Command.Help.match(command)) {
        if(!Command.Help.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Help.show(message.channel);
    }

    if(Command.Clear.match(command)) {
        if(!Command.Clear.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Clear.clear(message.channel, Phoenix);
    }

    if(Command.Play.match(command)) {
        if(!Command.Play.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Play.play(message, args, Phoenix);
    }
    if(Command.Playlist.match(command)) {
        if(!Command.Playlist.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Playlist.read(message, args, Phoenix);
    }

    if(Command.Skip.match(command)) {
        if(!Command.Skip.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Skip.skip(message, args, Phoenix);
    }
    if(Command.Stop.match(command)) {
        if(!Command.Stop.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Stop.stop(message, args, Phoenix);
    }

    if(Command.Queue.match(command)) {
        if(!Command.Queue.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Queue.queue(message, Phoenix);
    }

    if(Command.Shop.match(command)) {
        if(!Command.Shop.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Shop.read(message, args, Phoenix);
    }

    if(Command.Pause.match(command)) {
        if(!Command.Pause.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Pause.pause();
    }

    if(Command.Resume.match(command)) {
        if(!Command.Resume.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Resume.resume();
    }

    if(Command.Volume.match(command)) {
        if(!Command.Volume.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Volume.set(message, Phoenix, args);
    }

    if(Command.Spotify.match(command)) {
        if(!Command.Spotify.checkPerm(message.channel, GetGuildMember(message.author).highestRole)) {
            PermissionDenied(message);
            return;
        }
        Command.Spotify.read(args[0]);
    }
}

function PermissionDenied(msg) {
    console.log('Permission denied');
    msg.reply("Patouche");
    // msg.react('');
}

function GetGuildMember(user) {
    return Phoenix.guild.members.find(member => member.id == user.id);
}
