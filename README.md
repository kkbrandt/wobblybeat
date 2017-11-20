# WobblyBeat

[http://kaleo.codes/wobblybeat](http://kaleo.codes/wobblybeat)

## What is WobblyBeat?

WobblyBeat is a project that came about because I wanted to try 3d rendering with javascript.
The tutorial to THREE.js has you make a rotating cube.
I took this cube and made it cooler.

WobblyBeat takes in an audio file, or the client's microphone input, and using the Web Audio API, maps its fft frequency band values directly onto the vertices of a shape.

First, it calls on THREE.js to draw a geometric shape. The resulting Geometry
object has an array of vertices, each one storing its own location in 3d space.

Next, it calls on an AnalyzerNode to get real-time frequency data. This returns
a byte array of values between 0 and 255.=

Finally, these values are used to move each vertex of the geometry. Each vertex
is moved in the direction of the vertex normal on the original shape. This means
that the vertex always moves in the direction "going out of" the surface that
it's on. This makes it work consistently for geometries of any type.

I think it looks super cool.

## Running WobblyBeat

- Install node.js
- Clone this project
- Install ffmpeg. This is an audio processing program required by the youtube-audio-stream npm package I use.
  I have only gotten this to work on Ubuntu. I will evntually make a Docker container for this.
```bash
    sudo apt install ffmpeg
```
- Create some self-signed SSL keys. HTTPS is required to use the client's microphone. From this directory, run:
```bash
    openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
    openssl rsa -in keytmp.pem -out key.pem
```
- Finally, run these commands to start the server:
```bash
    npm install
    npm start
```
- Open the page at https://localhost:7500

## Organization

This project uses Requirejs.
[Read this short tutorial if you haven't used requirejs before](https://javascriptplayground.com/blog/2012/07/requirejs-amd-tutorial-introduction/)


