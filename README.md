# WobblyBeat

[https://kaleo.codes](https://kaleo.codes)

## What is WobblyBeat?

WobblyBeat is a project that came about because I wanted to try 3d rendering with javascript.
The tutorial to THREE.js has you make a rotating cube.
I took this cube and made it cooler.

WobblyBeat takes in an audio file, or the client's microphone input, and using the Web Audio API, maps its fft frequency band values directly onto the vertices of a shape.

First, it calls on THREE.js to draw a geometric shape. The resulting Geometry
object has an array of vertices, each one storing its own location in 3d space.

Next, it calls on an AnalyzerNode to get real-time frequency data. This returns
a byte array of values between 0 and 255.

Finally, these values are used to move each vertex of the geometry. Each vertex
is moved in the direction of the vertex normal on the original shape. This means
that the vertex always moves in the direction "going out of" the surface that
it's on. This makes it work consistently for geometries of any type.

## Running WobblyBeat

- Install docker and docker-compose
- Clone this project
- We need to use HTTPS to use microphone as input. Generate SSL key and cert by running:
```openssl req  -nodes -new -x509  -keyout server.key -out server.cert```
- Run docker-compose up --build (This will take a looong time, but only the first time you run it)
- Open the page at https://localhost

## Organization

This project uses Requirejs.
[Read this short tutorial if you haven't used requirejs before](https://javascriptplayground.com/blog/2012/07/requirejs-amd-tutorial-introduction/)


