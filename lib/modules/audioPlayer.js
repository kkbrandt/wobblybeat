define('audioPlayer', function(require) {
    const $ = require('jquery');
    const analyzer = require('analyzer');
    const p5 = require('p5');
    require('p5.sound');

    console.log(p5);

    var mic; // P5 Microphone object
    var audioSrc; // AudioSource node - for playing audio.
    var usingMic;

    function useMicrophone() {
        if (audioSrc) {
            audioSrc.stop();
        }
        mic = new p5.AudioIn();
        console.log(mic);
        mic.start();
        analyzer.useMicrophone(mic);
        usingMic = true;
        $('.loadingbar').hide();
    }

    function getMic() {
        return mic;
    }

    function getAudioSrc() {
        return audioSrc;
    }

    function pause() {
        if (audioSrc) {
            audioSrc.pause();
        }
    }


    let ctx, buffer, startedAt, pausedAt;

    function loadSound(videoId) {
        usingMic = false;
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
        var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
        if (!ctx) {
            ctx = new AudioContext();
        }

        ctx.decodeAudioData(rawData, onBufferLoad, onBufferError);
    }

    $('#text-input').focus(function() {
        $(this).removeClass('input-error');
    })
    $('#submit').click(() => {
        const videoId = $('#text-input').val();
        loadSound(videoId);
    });

    function play() {
        if (usingMic) {
            // intentionally using the microphone, don't start playing.
            return;
        }
        if (audioSrc) {
            audioSrc.stop();
        }

        audioSrc = ctx.createBufferSource();
        audioSrc.buffer = buffer;
        analyzer.setAudioContext(ctx, audioSrc);
        paused = false;

        if (pausedAt) {
            startedAt = Date.now() - pausedAt;
            audioSrc.start(0, pausedAt / 1000);
        } else {
            startedAt = Date.now();
            audioSrc.start(0);
        }
    };

    function stop() {
        audioSrc.stop(0);
        pausedAt = Date.now() - startedAt;
        paused = true;
    };

    function onBufferLoad(b) {
        buffer = b;
        play();
    };

    function onBufferError(e) {
        $('#text-input').addClass('input-error');
        console.log($('#text-input').val());
        console.log('onBufferError', e);
    };

    $('#mic').click(() => {
        useMicrophone();
    });

    return {
        loadSound,
        useMicrophone,
        getMic,
        getAudioSrc,
        stop,
        play,
    };
});