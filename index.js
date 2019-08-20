// Import packages
const Discord = require('discord.js');

// Create bot client
const bot = new Discord.Client();

// Import config
var config = {};
config = require('./config.json');

// Log in
bot.login(config.login);
module.exports = bot;

// Import commands
const Off = require('./commands/off.js');

bot.on('ready', () => {
    console.log('Phoenix bot ready to operate');
    Command.Off.log(Command.Off.login);
})