module.exports = class Game {
    static name;
    static alias = [];

    /**
     * The discord text channel the game is taking place in.
     */
    channel;
    /**
     * List of players playing the game.
     */
    players = [];
    /**
     * Wether the game has started.
     */
    isPlaying = false;

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
