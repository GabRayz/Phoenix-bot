let Command = require('../commands/command.js');
// require('../commands/play.js');
// require('../commands/playlist.js');
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

    static async ImportPlaylist(url, playlistName, user) {
        console.log('Playlist name : ' + playlistName);
        let id = url.split('=')[1];
        let videos = await this.GetPlaylist(id);
        if(videos) {
            videos.forEach(video => {
                let res = Command.Playlist.add(video, playlistName, user, false);
                if(!res){
                    Command.Playlist.textChannel.send("Oh, une erreur :/");
                    return;
                }
            })
            console.log('Playlist imported !');
        }
    }

    static GetPlaylist(id) {
        return new Promise(async (resolve) => {
            try {
                console.log('Requesting playlist...');
                let pageToken = " ";
                let morePages = true;
                let videos = [];
                while(pageToken) {
                    let res = await this.Get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=' + pageToken + '&playlistId=' + id + '&key=' + key);
                    
                    res.videos.forEach(vid => {
                        videos.push(vid);
                    });
                    console.log('Merged pages');
                    pageToken = res.nextPageToken;
                }
                resolve(this.getVideos(videos))
            }catch(err) {
                console.error(err);
                return false;
            }
        })
    }

    static Get(url) {
        console.log('Send request');
        return new Promise(resolve => {
            request(url, (err, res, body) => {
                if(err) {
                    console.error(err);
                    return false;
                }
                body = JSON.parse(body);
                
                let videos = body.items.filter(vid => vid.snippet.title != "Private video");
                let nextPageToken = (body.nextPageToken ? body.nextPageToken: false);
                resolve({"videos": videos, "nextPageToken": nextPageToken});
            })
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