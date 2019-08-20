// Import packages
const Discord = require('discord.js');

// Create bot client
const bot = new Discord.Client();

// Import config
var Config = {};
Config = require('./config.json');

// Log in
bot.login(Config.login);
module.exports = bot;

// Import commands
const Off = require('./commands/off.js');

var Phoenix = {}
Phoenix.bot = bot;
Phoenix.config = Config;

bot.on('ready', () => {
    console.log('Phoenix bot ready to operate');
    // Find the default guild and test Channel
    Phoenix.guild = bot.guilds.find(guild => guild.id == Config.defaultGuild);
    Phoenix.testChannel = Phoenix.guild.channels.find(chan => chan.id == Config.testChannel);

    Phoenix.testChannel.send("Phoenix connecté");

    // Command.Off.log(Command.Off.login);
})