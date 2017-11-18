define('wobblyShape', function(require) {
    'use strict';

    const THREE = require('threejs');
    const threeJSHelpers = require('threeJsHelpers');

    class WobblyShape {
        /**
         * Construct a new WobblyShape.
         * 
         * @param {THREE.Scene} scene the ThreeJS Scene to place the shape in
         * @param {THREE.Material} material the ThreeJS Material to use for this shape
         */
        constructor(scene, material) {
            this.scene = scene;
            this.material = material;

            this.wobbliness = 8;
            // Size of the shape. This roughly translates to radius, but the exact geometric
            // effects are hand-selected for each shape.
            this.size_ = 5;
            this.movement = 'expand';
            this.shape = 'Sphere'; // Calls setter below.
            this.yRotation = 0.01;
            this.xRotation = 0;
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
                    this.geometry = new THREE.TorusKnotGeometry(sz, sz / 5, 50, 16);
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
            const oldShape = this.scene.getObjectByName('myShape');
            if (oldShape) {
                this.scene.remove(oldShape);
            }
            this.scene.add(this.shape_);
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

    return WobblyShape;
});