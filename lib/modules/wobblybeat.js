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

        class WobblyShape {
            constructor() {
                this.wobbliness = 8;
                // Size of the shape. This roughly translates to radius, but the exact geometric
                // effects are hand-selected for each shape.
                this.size_ = 5;
                this.movement = 'expand';
                this.color_ = '#ffffff';
                this.initMaterial_();
                this.shape = 'Sphere'; // Calls setter below.
                this.yRotation = 0.01;
                this.xRotation = 0;
                this.initLights_();
            }

            get movementMultiplier() {
                return this.movement === 'expand' ? 1 : -1;
            }

            initMaterial_() {
                this.material = new THREE.MeshStandardMaterial({
                    color: this.color_,
                });
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
                        this.geometry = new THREE.SphereGeometry(sz, 38, 38);
                        break;
                }
                // Simple material - Should experiment here.
                this.material.side = sidedness;
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
                    [50, 0, 0],
                    [0, 0, 0],
                    [0, 50, 0],
                    [0, 0, 50],
                    [-50, 0, 0],
                    [0, -50, 0],
                    [0, 0, -50],
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
             * Array of vertex offset values, 0 to 255.
             * Array should be the same length as the number of vertices in the geometry.
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
                    offset = values[i] * this.wobbliness / 255 * this.movementMultiplier;

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
        class SystemSettings {
            constructor() {
                this.remapVertices_ = 'Accumulate';
                this.mouseSensitivity = 10;
                this.fpsThreshold = 20;
            }

            set mouseSensitivity(val) {
                this.mouseRotateSensitivity_ = val;
                controls.rotateSpeed = val;
            }
            get mouseSensitivity() {
                return this.mouseRotateSensitivity_;
            }

            set remapVertices(val) {
                analyzer.setTruncation(val);
                this.remapVertices_ = val;
            }
            get remapVertices() {
                return this.remapVertices_;
            }
        }
        const systemSettings = new SystemSettings();

        class MaterialSettings {
            constructor(wobblyShape) {
                this.wobblyShape = wobblyShape;
                this.wireframe = false;
                this.shading = 'flat';
            }

            set wireframe(val) {
                this.wireframe_ = val;
                this.wobblyShape.material.wireframe = val;
                this.wobblyShape.material.needsUpdate = true;
            }
            get wireframe() {
                return this.wireframe_;
            }

            set shading(str) {
                this.shadingStr_ = str;

                switch (str) {
                    case 'flat':
                        this.wobblyShape.material.shading = THREE.FlatShading;
                        break;
                    case 'smooth':
                    default:
                        this.wobblyShape.material.shading = THREE.SmoothShading;
                }
                this.wobblyShape.material.needsUpdate = true;
            }
            get shading() {
                return this.shadingStr_;
            }

            set roughness(val) {
                this.wobblyShape.material.roughness = val;
            }
            get roughness() {
                return this.wobblyShape.material.roughness;
            }
        }
        const materialSettings = new MaterialSettings(wobblyShape);

        var gui = new dat.GUI({
            autoPlace: false
        });
        gui.add(wobblyShape, 'yRotation', 0, 0.05);
        gui.add(wobblyShape, 'xRotation', 0, 0.05);
        gui.add(wobblyShape, 'wobbliness', 1, 20);
        gui.add(wobblyShape, 'movement', ['expand', 'contract']);
        gui.add(wobblyShape, 'size', 0.5, 10);
        gui.add(wobblyShape, 'shape', ['Cube', 'Plane', 'Ring', 'Icosahedron', 'Sphere', 'Torus', 'TorusKnot']);
        const materialFolder = gui.addFolder('Material');
        materialFolder.add(materialSettings, 'wireframe');
        materialFolder.add(materialSettings, 'shading', ['flat', 'smooth']);
        materialFolder.add(materialSettings, 'roughness', 0.0, 1.0);
        materialFolder.open();
        const systemFolder = gui.addFolder('System');
        systemFolder.add(systemSettings, 'remapVertices', ['Never', 'Accumulate', 'EveryFrame']);
        systemFolder.add(systemSettings, 'fpsThreshold', 15, 60);
        systemFolder.add(systemSettings, 'mouseSensitivity', 2, 15);

        var customContainer = $('.moveGUI').append($(gui.domElement));


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

            const values = analyzer.getFrequencyData(numVertices, systemSettings.remapVertices);

            wobblyShape.moveVertices(values);
            renderer.render(scene, camera);
            // meter.tick();
        }



        function loadSound(videoId) {
            $('.loadingbar').show();
            const request = new XMLHttpRequest();
            request.open("GET", `youtubeStream/${videoId}`, true);
            request.responseType = "arraybuffer";

            request.onload = function() {
                const data = request.response;
                analyzer.loadAudioData(data);
                $('.loadingbar').hide();
            };

            request.send();
        }


        loadSound('uLifSFBs_Lk');

        if (Detector.webgl) {
            renderFrame();
            // audio.load();
            // audio.play();
        } else {
            var warning = Detector.getWebGLErrorMessage();
            document.getElementById('container').appendChild(warning);
        }

        return {
            loadSound,
        }
    });