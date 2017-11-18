define('analyzer', function(require) {
    'use strict';

    // Load audio and analyser using the Web Audio API.
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
    var audio, ctx, audioSrc, analyser;
    var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    ctx = new AudioContext();
    analyser = ctx.createAnalyser();

    // frequency with which to truncate away the high frequencies with zero data.
    let truncation = 'Never';
    // hightest frequency band at which nonzero data has appeared
    let highestFrequencyBand = 0;

    function loadAudioData(data) {
        ctx.decodeAudioData(data, function(buffer) {
            if (audioSrc) {
                audioSrc.stop();
            }
            audioSrc = ctx.createBufferSource();
            audioSrc.buffer = buffer;
            audioSrc.connect(analyser);
            analyser.connect(ctx.destination);
            audioSrc.start(ctx.currentTime);
            highestFrequencyBand = 0;
        });
    }

    /**
     * Set the frequency with which to truncate away the
     * high frequencies with zero data.
     * 
     * @param {string} truncation One of ['Never', 'Accumulate', EveryFrame']
     */
    function setTruncation(truncation_) {
        if (truncation !== 'Never' && truncation !== 'Accumulate' && truncation !== 'EveryFrame') {
            throw new Error('Unknown truncation setting ' + truncation);
        }
        truncation = truncation_;
        highestFrequencyBand = 0;
    }

    /**
     * Get frequency data at this moment.
     * 
     * @param {number} numBands number of bands to return
     * 
     * @return {array} Array of length numBands, populated with
     *                 frequency band values - 0 to 255.
     */
    function getFrequencyData(numBands, truncation) {
        let values = [];

        // get frequency data at this moment.
        var frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);

        const numBandsRaw = frequencyData.length;

        // Perform zero-data frequency truncation
        if (truncation === 'Never') {
            highestFrequencyBand = numBandsRaw;
        } else {
            for (var i = numBandsRaw; i > 0; i--) {
                if (frequencyData[i] > 0) {
                    if (truncation === 'EveryFrame' ||
                        truncation === 'Accumulate' && i > highestFrequencyBand) {
                        highestFrequencyBand = i;
                    }
                    break;
                }
            }
        }

        // Sample limited data from the total array.
        const step = highestFrequencyBand / numBands;
        for (var i = 0; i < numBands; i++) {
            values.push(frequencyData[Math.round(i * step)]);
        }

        return values;
    }

    return {
        loadAudioData,
        setTruncation,
        getFrequencyData,
    };
});