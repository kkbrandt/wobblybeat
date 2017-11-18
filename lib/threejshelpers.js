define('threeJsHelpers', function(require) {
    const THREE = require('threejs');
    // const THREE = require('threejs');
    /**
     * Computes vertex normals weighted by triangle areas
     * http://www.iquilezles.org/www/articles/normals/normals.htm
     * @param {THREE.Geometry} geometry 
     */
    function computeGeometryVertexNormals(geometry) {

        var v, vl, f, fl, face, vertices;

        // Start by creating a new vector array.
        vertices = new Array(geometry.vertices.length);

        for (v = 0, vl = geometry.vertices.length; v < vl; v++) {

            vertices[v] = new THREE.Vector3();

        }

        var vA, vB, vC;
        var cb = new THREE.Vector3(),
            ab = new THREE.Vector3();

        for (f = 0, fl = geometry.faces.length; f < fl; f++) {

            face = geometry.faces[f];

            vA = geometry.vertices[face.a];
            vB = geometry.vertices[face.b];
            vC = geometry.vertices[face.c];

            cb.subVectors(vC, vB);
            ab.subVectors(vA, vB);
            cb.cross(ab);

            vertices[face.a].add(cb);
            vertices[face.b].add(cb);
            vertices[face.c].add(cb);

        }

        for (v = 0, vl = geometry.vertices.length; v < vl; v++) {

            vertices[v].normalize();

        }

        return vertices;
    }

    return {
        computeGeometryVertexNormals,
    };
});