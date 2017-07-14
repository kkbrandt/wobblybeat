# WobblyBeat

## What is WobblyBeat?

WobblyBeat is a project that came about because I wanted to try 3d rendering with javascript.
The tutorial to THREE.js has you make a rotating cube.
I took this cube and made it cooler.

WobblyBeat takes in an audio file, and using the Web Audio API, maps its fft
frequency band values directly onto the vertices of a shape.

First, it calls on THREE.js to draw a geometric shape. The resulting Geometry
object has an array of vertices, each one storing its own location in 3d space.

Next, it calls on an AnalyzerNode to get real-time frequency data. This returns
a byte array of values between 0 and 255.
It scales each value down to a number between 0 and 'wobbliness'.

Finally, these values are used to move each vertex of the geometry. Each vertex
is moved in the direction of the vertex normal on the original shape. This means
that the vertex always moves in the direction "going out of" the surface that
it's on. This makes it work consistently for geometries of any type.

I think it looks super cool.

![Screenshot](screenshot.png?raw=true "Screenshot")

## Running WobblyBeat

- Install node.js
- clone this project
- > npm install
- > npm start

## Organization

js/wobblybeat.js is the core code. All the other js files are 
open-source/supporting code.

## Why are the dependencies managed by the order of the script tags in the html?
## Why is most of the code in one file?

Because I'm new to web programming. I tried using require + browserify, but
the extra step of re-bundling after every change drove me insane. Any cleanup
is gladly welcomed, if you know how to do it better.


