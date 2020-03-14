let Config = {}
Config = require('../config.json');

module.exports = {
    Clear: require('./clear'),
    Off: require('./off'),
    Pause: require('./pause'),
    Play: require('./play'),
    Playlist: require('./playlist'),
    Queue: require('./queue'),
    Resume: require('./resume'),
    Shop: require('./shop'),
    Skip: require('./skip'),
    Stop: require('./stop'),
    Volume: require('./volume'),
    Help: require('./help'),
    Link: require('./link'),
    Info: require('./info'),
    Download: require('./download'),
    Update: require('./update'),
}
