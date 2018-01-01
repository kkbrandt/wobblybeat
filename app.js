requirejs.config({
    baseUrl: "lib/modules",
    paths: {
        "jquery": "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
        "text": "../require-text",
        "json": "../require-json",
        "datGui": "../dat.gui.min",
        "detector": "../detector",
        "fpsMeter": "../fpsmeter.min",
        "threejs": "../three",
        "trackballControls": "../threejs-trackballcontrols",
        "threeJsHelpers": "../threejshelpers",
        "p5": "../p5",
        "p5.sound": "../p5.sound",
    }
});

// require(['test']);
require(['wobblybeat']);