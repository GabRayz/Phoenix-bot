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
const Off = require('./commands/off.js');
const Help = require('./commands/help.js');
const Clear = require('./commands/clear.js');
const Play = require('./commands/play.js');
require('./commands/skip.js');
require('./commands/stop.js');
require('./commands/playlist.js');
require('./commands/queue.js');
require('./commands/shop.js');
require('./commands/pause.js');
require('./commands/resume.js');
require('./commands/spotify.js');
require('./commands/volume.js');

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

    // GET https://www.googleapis.com/youtube/v3/search?part=snippet&q=Frozen&key={YOUR_API_KEY}

    
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
        let msgParts = msg.content.split(' ');
        setTimeout(() => {
            if(!msg.deleted)
                msg.delete();
        }, 20000);
        ReadCommand(msgParts[0].slice(1), msgParts.slice(1), msg);
    }
});

function ReadCommand(command, args, msg) {
    if(Config.everyoneBlackListed && GetGuildMember(msg.author).roles.length == 0) {
        return;
    }
    if (Command.Off.match(command)) {
        if(!Command.Off.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        msg.delete()
        .then(Command.Off.shutdown(Phoenix));
    }
    
    if(Command.Help.match(command)) {
        if(!Command.Help.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Help.show(msg.channel);
    }

    if(Command.Clear.match(command)) {
        if(!Command.Clear.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Clear.clear(msg.channel, Phoenix);
    }

    if(Command.Play.match(command)) {
        if(!Command.Play.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Play.play(msg, args, Phoenix);
    }
    if(Command.Playlist.match(command)) {
        if(!Command.Playlist.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Playlist.read(msg, args, Phoenix);
    }

    if(Command.Skip.match(command)) {
        if(!Command.Skip.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Skip.skip(msg, args, Phoenix);
    }
    if(Command.Stop.match(command)) {
        if(!Command.Stop.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Stop.stop(msg, args, Phoenix);
    }

    if(Command.Queue.match(command)) {
        if(!Command.Queue.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Queue.queue(msg, Phoenix);
    }

    if(Command.Shop.match(command)) {
        if(!Command.Shop.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Shop.read(msg, args, Phoenix);
    }

    if(Command.Pause.match(command)) {
        if(!Command.Pause.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Pause.pause();
    }

    if(Command.Resume.match(command)) {
        if(!Command.Resume.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Resume.resume();
    }

    if(Command.Volume.match(command)) {
        if(!Command.Volume.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
            return;
        }
        Command.Volume.set(msg, Phoenix, args);
    }

    if(Command.Spotify.match(command)) {
        if(!Command.Spotify.checkPerm(msg.channel, GetGuildMember(msg.author).highestRole)) {
            PermissionDenied(msg);
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