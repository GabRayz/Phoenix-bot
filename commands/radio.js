let Command = require('../src/Command');
const opus = require('opusscript');
const exec = require('child_process').exec;
let Phoenix = require('../index');

module.exports = class Radio extends Command {
    constructor(author) {
        this.author = author;
    }
    static name = 'radio';
    static alias = [
        "radio",
    ];
    static description = "Écouter France Info";
    
    static stream;
    static voiceChannel;

    static async call(message, Phoenix) {
        if (message.args.length == 0)
            this.start(message.member.voiceChannelID, message.guild);
        if (message.args.length == 1 && message.args[0] == 'stop')
            this.stop();
    }

    static start(channelID, guild) {
        let channel = guild.channels.find(c => c.id == channelID);
        if (!channel) return;
        this.voiceChannel = channel;
        exec('./exec/curl');

        setTimeout(() => {
            channel.join().then(async voiceConnection => {
                this.stream = await voiceConnection.playFile(__dirname + '/../audio/franceinfo.mp3');
                this.stream.on('end', e =>   {console.log('Fin de France Info')});

                this.stream.on('error', e =>   {console.error(e)});
                this.stream.on('start', () => {
                    Phoenix.bot.user.setActivity('France Info');
                    console.log('Listening to France Info!');
                });
            }).catch(e => console.error);
        }, 2000)
        return;
        
    }

    static stop() {
        Phoenix.bot.user.setActivity(Phoenix.config.activity);
        this.stream.end();
        this.voiceChannel.leave();
    }
}
