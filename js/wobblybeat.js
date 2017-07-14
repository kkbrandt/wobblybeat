'use strict';
// For viewing console log on phones
// window.console = {
//     log: function(str){
//         var node = document.createElement("div");
//         node.appendChild(document.createTextNode(str));
//         document.getElementById("myLog").appendChild(node);
//     }
// }

// Computation functions I wrote/modified to interact with threejs.
const threeJSHelpers = new ThreeJSHelpers();

// The scene is basically the threejs canvas.
var scene = new THREE.Scene();

// we'll need one of these too.
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// We also need a camera - Vertical FOV, asspect ratio, starting plane, ending plane
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.setFocalLength(40);

// Camera movement controls
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.rotateSpeed = 1.8;
controls.zoomSpeed = 1.2;
controls.noZoom = false;
controls.noPan = true;
controls.staticMoving = false;
controls.dynamicDampingFactor = 0.15;
controls.minDistance = 1;
controls.maxDistance = 300;

class WobblyShape {
    constructor() {
        this.wobbliness = 8;
        // Size of the shape. This roughly translates to radius, but the exact geometric
        // effects are hand-selected for each shape.
        this.size_ = 5;
        this.movement = 'expand';
        this.color_ = '#ffffff';
        this.shape = 'Sphere'; // Calls setter below.
        this.yRotation = 0.01;
        this.xRotation = 0;
        this.initLights_();
    }

    get movementMultiplier() {
        return this.movement === 'expand' ? 1 : -1;
    }

    /* Getters and Setters are for dat.GUI - It can only get/set
        properties directly, using <obj>.<property>.
    */
    get shape() {
        return this.shapeStr_;
    }

    set shape(str) {
        this.shapeStr_ = str;
        const sz = this.size;
        // sidedness - Render both sides of the surface? Set to DoubleSide for 2d shapes.
        // (Rendering the 3d shapes double sided leads to pixely artifacts at the vertices)
        let sidedness = THREE.FrontSide;
        switch (str) {
            case 'Cube':
                this.geometry = new THREE.BoxGeometry(sz * 2, sz * 2, sz * 2);
                break;
            case 'Plane':
                this.geometry = new THREE.PlaneGeometry(sz, sz, 90, 90);
                sidedness = THREE.DoubleSide;
                break;
            case 'Ring':
                this.geometry = new THREE.RingGeometry(sz / 2, sz * 2, 20);
                sidedness = THREE.DoubleSide;
                break;
            case 'Icosahedron':
                this.geometry = new THREE.IcosahedronGeometry(sz * 2);
                break;
            case 'Torus':
                this.geometry = new THREE.TorusGeometry(sz, sz / 2, 16, 50);
                break;
            case 'TorusKnot':
                this.geometry = new THREE.TorusKnotGeometry(sz, sz / 3, 50, 16);
                break;
            case 'Sphere':
                this.geometry = new THREE.SphereGeometry(sz, 32, 32);
                break;
        }
        // Simple material - Should experiment here.
        this.material = new THREE.MeshLambertMaterial({
            color: this.color_,
            side: sidedness,
        });
        this.vertexNormals = threeJSHelpers.computeGeometryVertexNormals(this.geometry);
        this.setOriginalVertices_();
        this.createAndAddShape_();
    }

    set size(size) {
        this.size_ = size;
        // Need to change shape geometry for new size: call setter above.
        this.shape = this.shapeStr_;
    }
    get size() {
        return this.size_;
    }

    setOriginalVertices_() {
        const vertices = new Array(this.geometry.vertices.length);
        let v, vl;
        for (v = 0, vl = this.geometry.vertices.length; v < vl; v++) {
            vertices[v] = this.geometry.vertices[v].clone();
        }
        this.originalVertices = vertices;
    }

    createAndAddShape_() {
        // preserve current rotation - For a smoother experience when
        // the user clicks through different shapes.
        const prevXRotation = this.shape_ ? this.shape_.rotation.x : 0;
        const prevYRotation = this.shape_ ? this.shape_.rotation.y : 0;

        // create shape
        this.shape_ = new THREE.Mesh(this.geometry, this.material);
        this.shape_.rotation.x = prevXRotation;
        this.shape_.rotation.y = prevYRotation;
        this.shape_.name = 'myShape';

        // add to scene
        const oldShape = scene.getObjectByName('myShape');
        if (oldShape) {
            scene.remove(oldShape);
        }
        scene.add(this.shape_);
    }

    initLights_() {
        // we need to add lights so we can see our shape.
        this.lights = [];
        const lightPositions = [
            [25, 0, 0],
            [0, 25, 0],
            [0, 0, 25],
            [-25, 0, 0],
            [0, -25, 0],
            [0, 0, -25],
        ]

        lightPositions.map(lightPos => {
            const r = Math.random();
            const g = Math.random();
            const b = Math.random();
            const light = new THREE.PointLight();
            light.color.setRGB(r, g, b);
            light.position.set(lightPos[0], lightPos[1], lightPos[2]);
            this.lights.push(light);
            scene.add(light);
        });
    }

    /**
     * @param {array} values :
     * Array of vertex offset values.
     * Array be the same length as the number of vertices in the geometry.
     * Each element is the euclidean distance to place the vertex
     * from the geometry's original location for that vertex.
     */
    moveVertices(values) {
        const originalVertices = this.originalVertices;
        const geometry = this.geometry;
        // Get the vertex normals so we know which direction to move the vertices.
        const vertexNormals = this.vertexNormals;

        let originalPos, currentPos, vertexNormal, offset, vertexOffset, newVertex;
        // update shape vertices
        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            originalPos = this.originalVertices[i];
            currentPos = this.geometry.vertices[i];
            vertexNormal = vertexNormals[i];

            // Value between 0 and wobbliness (or -wobbliness)
            offset = values[i] * this.movementMultiplier;

            vertexOffset = {
                x: vertexNormal.x * offset,
                y: vertexNormal.y * offset,
                z: vertexNormal.z * offset,
            };

            newVertex = {
                x: originalPos.x + vertexOffset.x,
                y: originalPos.y + vertexOffset.y,
                z: originalPos.z + vertexOffset.z,
            };

            geometry.vertices[i].set(newVertex.x, newVertex.y, newVertex.z);

        }
        geometry.verticesNeedUpdate = true;

        // Also rotate the shape a bit, so we can see it's 3d.
        this.shape_.rotation.x += this.xRotation;
        this.shape_.rotation.y += this.yRotation;
    }
}

const wobblyShape = new WobblyShape();

// Load audio and analyser using the Web Audio API.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
var audio, ctx, audioSrc, analyser;
var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
ctx = new AudioContext();
audio = document.getElementById('song');
audioSrc = ctx.createMediaElementSource(audio);
analyser = ctx.createAnalyser();
audioSrc.connect(analyser);
analyser.connect(ctx.destination);
// we could configure the analyser: e.g. analyser.fftSize (for further infos read the AudioNode spec)

// Add an FPSMeter so users can monitor how shitty my code is ;)
var meter = new FPSMeter(null, {
    top: '2em',
    left: '1em',
    theme: 'dark',
    graph: 1,
    heat: 1,
    history: 20
});

// Standard web animation render loop.
function renderFrame() {
    requestAnimationFrame(renderFrame);

    controls.update(); // Perform user's mouse rotation or zoom.

    // get frequency data for this frame.
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    const numVertices = wobblyShape.geometry.vertices.length;
    // Cut off the top 15%, because it's always zeros.
    const numBands = frequencyData.length * 0.85;

    const values = [];
    const wobbliness = wobblyShape.wobbliness;
    // sample limited data from the total array.
    var step = numBands / numVertices;
    for (var i = 0; i < numVertices; i++) {
        var value = frequencyData[Math.round(i * step)];
        // send values between 0 and wobliness.
        values.push(value * wobbliness / 255);
    }

    wobblyShape.moveVertices(values);
    renderer.render(scene, camera);
    meter.tick();
}

// Gracefully handle screen resizing
function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
resize();
window.addEventListener("resize", resize);


class MouseSettings {
    constructor() {
        this.mouseSensitivity = 10;
    }
    set mouseSensitivity(val) {
        this.mouseRotateSensitivity_ = val;
        controls.rotateSpeed = val;
    }
    get mouseSensitivity() {
        return this.mouseRotateSensitivity_;
    }
}
const mouseSettings = new MouseSettings();

var gui = new dat.GUI({
    autoPlace: false
});
gui.add(wobblyShape, 'yRotation', 0, 0.05);
gui.add(wobblyShape, 'xRotation', 0, 0.05);
gui.add(wobblyShape, 'wobbliness', 1, 20);
gui.add(wobblyShape, 'movement', ['expand', 'contract']);
gui.add(wobblyShape, 'size', 0.5, 10);
gui.add(wobblyShape, 'shape', ['Cube', 'Plane', 'Ring', 'Icosahedron', 'Sphere', 'Torus', 'TorusKnot']);
gui.add(mouseSettings, 'mouseSensitivity', 2, 15);
var customContainer = $('.moveGUI').append($(gui.domElement));

if (Detector.webgl) {
    renderFrame();
    audio.load();
    audio.play();
} else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}