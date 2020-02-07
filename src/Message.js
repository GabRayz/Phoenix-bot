module.exports = class Message {
    constructor(message) {
        this.message = message.content;
        let msgParts = message.content.split(' ');
        this.command = msgParts[0].slice(1);
        this.args = msgParts.slice(1);
        this.author = message.author;
        this.channel = message.channel;

        setTimeout(() => {
            if(!message.deleted)
                this.delete();
        }, 20000);
    }

    delete() {
        this.message.delete();
    }
}
