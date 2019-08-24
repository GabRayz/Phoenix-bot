Command = require('./command.js');
const request = require('request');
const querystring = require('querystring');
// require('./play');

Command.Spotify = {
    name: "spotify",
    alias: [
        "spotify"
    ],
    groupOption: {
        whitelist: [],
        blacklist: []
    },
    channelOption: {
        whitelist: [],
        blacklist: []
    },
    description: "Importer depuis Spotify",


    match: function(command) {
        return this.alias.includes(command);
    },
    checkPerm: function(channel, role) {
        // check blacklists
        if(this.groupOption.blacklist.length > 0 && this.groupOption.blacklist.includes(role.name)) {
            return false;
        }
        if(this.channelOption.blacklist.length > 0 && this.channelOption.blacklist.includes(channel.id)) {
            return false;
        }
    
        // check whitelists
        if(this.groupOption.whitelist.length > 0 && !this.groupOption.whitelist.includes(role.name)) {
            return false;
        }
        if(this.channelOption.whitelist.length > 0 && !this.channelOption.whitelist.includes(channel.id)) {
            return false;
        }
    
        return true;
    },
    read: async function(url, playlistName, user) {
        let id = url.split('playlist/')[1].split('?')[0];
        this.getToken()
        return;
        let videos = await this.get(id);
        if(videos) this.addToPlaylist(videos, playlistName, user);
    },
    getToken: function() {
        let form = {
            grant_type: 'client_credentials'
        }
        let formData = querystring.stringify(form);

        let req = {
            uri: 'https://accounts.spotify.com/api/token',
            method: 'POST',
            headers: {
                Authorization: 'Basic ffcd680613f64c62862b34abd4ac3a2f:6bc93552bb8342039a50029ec40e3359',
                'Content-Type': 'application/json'
            },
            body: formData
        }

        try {
            request.post(req, (err, res, body) => {
                if(err){
                    console.error(err);
                }
                console.log(body);
            })
        }catch(err) {
            console.error(err);
        }
    },
    get: function(id) {
        return new Promise(resolve => {
            let req = {
                host: 'https://api.spotify.com/v1/playlists/' + id,
                uri: 'https://api.spotify.com/v1/playlists/' + id,
                method: 'GET',
                headers: {
                    Authorization: "Bearer BQDz3FFPSb-JV888RFaiI50Wj0OmQVwmG3GnItElkMjTshiQfXWqTaHgJcLbBZSL5kCq11htWSzru38rZVHh-lCId2_rCDNlz_3KrhwlQ8byUMjghffP5rAdNkHZT84TnJWwHyUQNXyQiJGlIg3ugbXr7Zh88JxrKIA",
                    'Content-Type': 'application/json'
                }
            }
            try {
                request(req, (err, res, body) => {
                    if(err) {
                        console.error(err);
                        resolve(false);
                    }
                    body = JSON.parse(body);
                    resolve(this.parse(body));
                })
            }catch(err) {
                console.error(err);
                resolve(false);
            }
        })
    },
    parse: function(body) {
        let videos = body.tracks.items;
        let names = [];
        videos.forEach(video => names.push(video));
        return names;
    },
    addToPlaylist: function(videos, playlistName, user) {
        videos.forEach(video => Command.Playlist.add(video, playlistName, user, false))
    }
}