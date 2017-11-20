define('audioPlayer', function(require) {
    const $ = require('jquery');
    const analyzer = require('analyzer');
    const p5 = require('p5');
    require('p5.sound');

    console.log(p5);

    var mic; // P5 Microphone object
    var audioSrc; // AudioSource node - for playing audio.

    function useAudioIn() {
        if (audioSrc) {
            audioSrc.stop();
        }
        mic = new p5.AudioIn();
        console.log(mic);
        mic.start();
        analyzer.useMicrophone(mic);
        $('.loadingbar').hide();
    }

    function getMic() {
        return mic;
    }

    function loadSound(videoId) {
        $('.loadingbar').show();
        const request = new XMLHttpRequest();
        request.open("GET", `youtubeStream/${videoId}`, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            const data = request.response;
            startSound_(data);
            $('.loadingbar').hide();
        };

        request.send();
    }

    function startSound_(rawData) {
        // Load audio and analyser using the Web Audio API.
        // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
        var audio, ctx;
        var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
        if (!ctx) {
            ctx = new AudioContext();
        }

        ctx.decodeAudioData(rawData, function(buffer) {
            if (audioSrc) {
                audioSrc.stop();
            }
            audioSrc = ctx.createBufferSource();
            audioSrc.buffer = buffer;
            analyzer.setAudioContext(ctx, audioSrc);
            audioSrc.start(ctx.currentTime);
        });
    }

    return {
        loadSound,
        useAudioIn,
        getMic,
    };
});