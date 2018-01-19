define('analyzer', function(require) {
    'use strict';
    let p5 = require('p5');
    require('p5.sound');

    // Load audio and analyser using the Web Audio API.
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
    var analyser, fft;

    // frequency with which to truncate away the high frequencies with zero data.
    let truncation = 'Never';
    // hightest frequency band at which nonzero data has appeared
    let highestFrequencyBand = 0;

    /**
     * Set the Audio context to attach the analyzer to
     * @param {AudioContext} ctx 
     * @param {AudioContext.SourceBuffer} [audioSrc] optional audio source.
     *                                    Should be specified if playing audio. 
     */
    function setAudioContext(ctx, audioSrc) {
        fft = null;
        analyser = ctx.createAnalyser();
        // we could configure the analyser: e.g. analyser.fftSize (for further infos read the AudioNode spec)
        analyser.fftSize = 16384;
        audioSrc.connect(analyser);
        analyser.connect(ctx.destination);
        highestFrequencyBand = 0;
    }

    /**
     * 
     * @param {p5.AudioIn} mic 
     */
    function useMicrophone(mic) {
        analyser = null;
        fft = new p5.FFT();
        fft.setInput(mic);
        highestFrequencyBand = 0;
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

    function getRawFrequencyData_() {
        if (analyser) {
            var frequencyData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(frequencyData);
            return frequencyData;
        } else if (fft) {
            return fft.analyze();
        } else {
            return [0]; // The audio is loaded asynchronously...
        }
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
        var frequencyData = getRawFrequencyData_();

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
        setAudioContext,
        useMicrophone,
        setTruncation,
        getFrequencyData,
    };
});