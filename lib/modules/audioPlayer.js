define('audioPlayer', function(require) {
    const analyzer = require('analyzer');

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

    return {
        loadSound,
    }
});