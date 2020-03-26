module.exports = class Game {
    static name;
    static alias = [];

    constructor(message) {
        this.channel = message.channel;
        this.players = [];
        this.players.push({
            tag: message.author.tag,
            username: message.member.nickname == null ? message.author.username : message.member.nickname
        })
        this.isPlaying = false;
    }
}
