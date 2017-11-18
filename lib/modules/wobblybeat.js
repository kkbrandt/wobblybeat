define('wobblybeat',
    function(require) {
        'use strict';

        // Vendor packages
        require('jquery');
        const THREE = require('threejs');
        const threeJSHelpers = require('threeJsHelpers');
        const TrackballControls = require('trackballControls');
        const FPSMeter = require('fpsMeter');
        const dat = require('datGui');
        const Detector = require('detector');

        // My packages
        const analyzer = require('analyzer');
        const WobblyShape = require('wobblyShape');
        const lighting = require('lighting');
        const settings = require('settings');
        const audioPlayer = require('audioPlayer');

        // For viewing console log on phones
        // window.console = {
        //     log: function(str){
        //         var node = document.createElement("div");
        //         node.appendChild(document.createTextNode(str));
        //         document.getElementById("myLog").appendChild(node);
        //     }
        // }

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

        const material = new THREE.MeshStandardMaterial({
            color: '#ffffff',
        });

        const wobblyShape = new WobblyShape(scene, material, analyzer);

        lighting.addLightsToScene(scene);
        // we could configure the analyser: e.g. analyser.fftSize (for further infos read the AudioNode spec)

        // Add an FPSMeter so users can monitor how shitty my code is ;)
        // var meter = new FPSMeter(null, {
        //     top: '2em',
        //     left: '1em',
        //     theme: 'dark',
        //     graph: 1,
        //     heat: 1,
        //     history: 20
        // });

        /////////////////////////////////////// SETTINGS ///////////////////////////////////////////
        settings.init(wobblyShape, controls, analyzer);

        // Gracefully handle screen resizing
        function resize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        resize();
        window.addEventListener("resize", resize);


        // Standard web animation render loop.
        function renderFrame() {
            requestAnimationFrame(renderFrame);

            controls.update(); // Perform user's mouse rotation or zoom.

            const numVertices = wobblyShape.geometry.vertices.length;

            const values = analyzer.getFrequencyData(numVertices, settings.getRemapVerticesSetting());

            wobblyShape.moveVertices(values);
            renderer.render(scene, camera);
            // meter.tick();
        }


        audioPlayer.loadSound('1Z8BTVx03TA');

        if (Detector.webgl) {
            renderFrame();
        } else {
            var warning = Detector.getWebGLErrorMessage();
            document.getElementById('container').appendChild(warning);
        }

    });