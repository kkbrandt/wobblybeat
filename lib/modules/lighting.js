define('lighting', function(require) {
    const THREE = require('threejs');

    // TODO: make this module more flexible somehow

    function addLightsToScene(scene) {
        // we need to add lights so we can see our shape.
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

            scene.add(light);
        });
    }

    return {
        addLightsToScene,
    }
});