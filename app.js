console.log('u wot m8');

requirejs.config({
    baseUrl: "lib/modules",
    paths: {
        "jquery": "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
        "datGui": "../dat.gui.min",
        "detector": "../Detector",
        "fpsMeter": "../fpsmeter.min",
        "threejs": "../three",
        "trackballControls": "../threejs-trackballcontrols",
        "threeJsHelpers": "../threejshelpers",

        // "wobblybeat": "lib/modules/wobblybeat",
        // "test": "lib/modules/test",
    }
});
console.log('u wot m9');

// require(['test']);
require(['wobblybeat']);