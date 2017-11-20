'use strict';

const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const youtubeStream = require('youtube-audio-stream')


class WebsiteServer {
    constructor(port) {
        this.port = port;
    }

    start() {
        // app.use('/js', express.static('js'));
        // app.use('/static', express.static('static'));
        app.use('/css', express.static('css'));

        app.use('/lib', express.static('lib'));
        app.use('/', express.static('./'));
        app.get('/', (req, res) => {
            const file = fs.readFileSync('index.html');
            res.end(file);
        });
        app.get('/youtubeStream/:videoId', (req, res) => {
            var requestUrl = 'http://youtube.com/watch?v=' + req.params.videoId
            try {
                youtubeStream(requestUrl).pipe(res)
            } catch (exception) {
                res.status(500).send(exception)
            }
        });

        const httpsOptions = {
            key: fs.readFileSync('./key.pem'),
            cert: fs.readFileSync('./cert.pem')
        }

        this.server = https.createServer(httpsOptions, app).listen(this.port, () => {
            console.log(`Server listening at localhost:${this.port}`);
        });
    }
}

const server = new WebsiteServer(7500);
server.start();