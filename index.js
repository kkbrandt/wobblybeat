'use strict';

const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const youtubeStream = require('youtube-audio-stream')


class WebsiteServer {
    constructor(port, https) {
        this.port = port;
        this.https = https;
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

        if (this.https) {
            const httpsOptions = {
                key: fs.readFileSync('./server.key'),
                cert: fs.readFileSync('./server.cert')
            }

            this.server = https.createServer(httpsOptions, app).listen(this.port, () => {
                console.log(`HTTPS Server listening at localhost:${this.port}`);
            });
        } else {
            this.server = app.listen(this.port, () => {
                console.log(`HTTP Server listening at localhost:${this.port}`);
            });
        }
    }
}

const useHttps = process.env.USE_HTTPS === 'true';
const port = useHttps ? 7501 : 7500;
const server = new WebsiteServer(port, useHttps);
server.start();

process.once('SIGTERM', () => {
    server.close();
});