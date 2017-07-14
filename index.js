'use strict';

const express = require('express');
const app = express();
const fs = require('fs');

class WebsiteServer {
    constructor(port) {
        this.port = port;
    }

    start() {
        app.use('/js', express.static('js'));
        app.use('/static', express.static('static'));
        app.use('/css', express.static('css'));

        app.get('/', (req, res) => {
            res.redirect('/wobblybeat');
        })
        app.get('/wobblybeat', (req, res) => {
            const file = fs.readFileSync('wobblybeat.html');
            res.end(file);
        })
        this.server = app.listen(this.port);
    }
}

const server = new WebsiteServer(80);
server.start();