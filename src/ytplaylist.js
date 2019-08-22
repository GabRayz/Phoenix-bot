let Command = require('../commands/command.js');
require('../commands/play.js');
require('../commands/playlist.js');
const request = require('request');
let Config = {}
Config = require('../config.json')
let key = Config.ytapikey;

module.exports = class YTplaylist {
    static async Enqueue(url, callback) {
        let id = url.split('=')[1];
        let videos = await this.GetPlaylist(id);
        if(videos) {
            videos.forEach(video => {
                Command.Play.addToQueueString(video);
            })
        }
        console.log('Playlist enqueued !');
        callback();
    }

    static GetPlaylist(id) {
        return new Promise(resolve => {
            try {
                console.log('Requesting playlist...')
                request('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' + id + '&key=' + key, (err, res, body) => {
                    if(err) {
                        console.error(err);
                        return false;
                    }
                    console.log('Playlist get');
                    body = JSON.parse(body);
                    let videos = body.items;
                    resolve(this.getVideos(videos));
                })
            }catch(err) {
                console.error(err);
                return false;
            }
        })
    }

    static getVideos(items) {
        let videosID = []
        items.forEach(item => {
            videosID.push(item.snippet.title)
        });
        console.log('Videos ids extracted.');
        return videosID;
    }
}