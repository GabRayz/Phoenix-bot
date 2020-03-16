# Phoenix-Bot

## Installation
This program requires [NodeJS](https://nodejs.org/en/) to function.
> git clone https://github.com:GabRayz/Phoenix-Bot

Once the project is cloned, install the dependencies.
> npm i

Install pm2
> npm i -g pm2

Then, create a `config.json` file from `config-exemple.json`, fill it, and start the bot.
> pm2 start index.js --name PhoenixBot

> pm2 log PhoenixBot

# Usage
* help
* play {url|name}: Add a music or a youtube playlist to the queue, and start playing.
* pause/resume
* stop: Stop the music and leave the channel
* skip
* queue: View the music queue
* info: Show the current music
* volume [0-200]: Show or set the volume
* download [url]: Download the current music, or the specified one
* playlist list: List of existing playlists
* playlist create {name}: Create a new playlist
* playlist add {playlist name} {music url|name}: Add a music or a youtube playlist to the playlist
* playlist play {playlist name}: Play a playlist
* playlist see {playlist name}: List the content of the playlist
* playlist delete {playlist name}
* clear: Delete the bot old messages
* off: Turn the bot off
* update: Update the bot. Requires that the bot was installed using git
