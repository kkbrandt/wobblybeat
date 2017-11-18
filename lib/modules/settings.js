define('settings', function(require) {
    // TODO: this file is disgusting.

    const $ = require('jquery');
    const THREE = require('threejs');
    const dat = require('datGui');

    let wobblyShape, controls, analyzer;
    let systemSettings, materialSettings;

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

    function init(wobblyShape_, controls_, analyzer_) {
        wobblyShape = wobblyShape_;
        controls = controls_;
        analyzer = analyzer_;

        systemSettings = new SystemSettings();
        materialSettings = new MaterialSettings(wobblyShape);

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
    }

    function getRemapVerticesSetting() {
        return systemSettings.remapVertices;
    }

    return {
        init,
        getRemapVerticesSetting,
    }
});