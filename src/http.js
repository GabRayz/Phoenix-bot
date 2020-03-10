const express = require('express');
let router = express.Router();
let app = express();
var path = require('path');
let config = {}
config = require('../config.json');

router.get('/mp3', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/download.mp3'));
})

router.get('/mp4', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/download.mp4'));
})

console.log('starting http');

app.use('/', router);

app.listen(config.downloadPort);
