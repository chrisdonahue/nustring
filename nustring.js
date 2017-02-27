window.nustring = window.nustring || {};

(function ($, nustring) {   
    nustring.config = {};
    (function (config) {
        config.debug = true;
        config.maxDelaySamps = 960;
    })(nustring.config);

    nustring.classes = {};
    (function (config, classes) {
        var DelayLine = classes.DelayLine = function (maxDelaySamps) {
            this.buffer = new Float32Array(maxDelaySamps);
            this.bufferLen = maxDelaySamps;
            this.writeIdx = 0;
        };
        DelayLine.prototype.readOne = function (delaySamps) {
            var readIdx = this.writeIdx - delaySamps;
            while (readIdx < 0) {
                readIdx += this.bufferLen;
            }
            return this.buffer[readIdx];
        };
        DelayLine.prototype.writeOne = function (value) {
            this.buffer[this.writeIdx] = value;
            ++this.writeIdx;
            while (this.writeIdx >= this.bufferLen) {
                this.writeIdx -= this.bufferLen;
            }
        };

        var KarplusStrongString = classes.KarplusStrongString = function (audioCtx, maxDelaySamps) {
            this.audioCtx = audioCtx;

            this.ksLength = 256;
            this.pluckRemaining = 0;
            this.pluckIntensity = 0;

            var scriptProcessor = audioCtx.createScriptProcessor(1024, 1, 1);
            var delayLine = new DelayLine(maxDelaySamps);
            var filterPrev = 0.0;

            var that = this;

            scriptProcessor.onaudioprocess = function (event) {
                var input = event.inputBuffer;
                var output = event.outputBuffer;

                for (var channel = 0; channel < output.numberOfChannels; ++channel) {
                    var inputChannel = input.getChannelData(channel);
                    var outputChannel = output.getChannelData(channel);

                    for (var i = 0; i < input.length; ++i) {
                        var noise = 0.0;
                        if (that.pluckRemaining > 0) {
                            noise = (Math.random() * 2.0) - 1.0;
                            noise *= that.pluckIntensity;
                            --that.pluckRemaining;
                        }

                        var feedback = delayLine.readOne(that.ksLength);
                        var filteredFeedback = (filterPrev + feedback) * 0.5;
                        filterPrev = feedback;

                        var output = noise + filteredFeedback;

                        outputChannel[i] = output;
                        delayLine.writeOne(output);
                    }
                }
            };

            this.scriptProcessor = scriptProcessor;
        };
        KarplusStrongString.prototype.pluck = function(pluckIntensity) {
            this.pluckRemaining = this.ksLength;
            this.pluckIntensity = pluckIntensity;
            if (config.debug) {
                console.log(this.pluckRemaining);
            }
        };
        KarplusStrongString.prototype.setLength = function(lengthSamples) {
            this.ksLength = lengthSamples;
        };
    })(nustring.config, nustring.classes);

    nustring.client = {};
    (function ($, config, classes, client) {
        var canvasBuffer = document.createElement('canvas');
        var canvasBufferCtx = canvasBuffer.getContext('2d');
        var canvas = null;
        var canvasCtx = null;
        var string = null;

        var onWindowResize = function (event) {
            canvasWidth = $(window).width();
            canvasHeight = $(window).height();
            //canvasBuffer.width = canvasWidth;
            //canvasBuffer.height = canvasHeight;
            //canvas.width = canvasWidth;
            //canvas.height = canvasHeight;
            string.setLength(Math.min(Math.round(canvasWidth / 2), config.maxDelaySamps));
            //repaintFull();
        };

        var onDomKeyDown = function (event) {
            var keyNum = event.which;
            if (keyNum == config.actionToKeyNum.UP) {
                updatePlayerCoord(makeCoord(0, -1));
            }
            else if (keyNum == config.actionToKeyNum.DOWN) {
                updatePlayerCoord(makeCoord(0, 1));
            }
            else if (keyNum == config.actionToKeyNum.LEFT) {
                updatePlayerCoord(makeCoord(-1, 0));
            }
            else if (keyNum == config.actionToKeyNum.RIGHT) {
                updatePlayerCoord(makeCoord(1, 0));
            }
            else if (keyNum == config.actionToKeyNum.SHOOT) {
                console.log('shoot');
            }
            else {
                //console.log('unknown key');
            }
            repaintObjects();
        };

        var repaintBuffer = function () {
            var ctx = canvasBufferCtx;

            // clear buffer
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        };

        var repaintObjects = function () {
            var ctx = canvasCtx;

            // draw mouse
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(canvasBuffer, 0, 0);
        };

        var repaintFull = function () {
            repaintBuffer();
            repaintObjects();
        };

        // exports
        client.onDomReady = function (event) {
            /*
            canvas = document.getElementById('#nustring')
            canvas = $canvas.get(0);
            canvasCtx = canvas.getContext('2d');

            $canvas.on('mousedown', onCanvasMouseDown);
            $canvas.on('mousemove', onCanvasMouseMove)
            */

            var audioCtx = new window.AudioContext();

            string = new classes.KarplusStrongString(audioCtx, config.maxDelaySamps);
            string.scriptProcessor.connect(audioCtx.destination);

            $(window).resize(onWindowResize);
            onWindowResize();

            var button = $('#pluck');
            //button.on('click', function () {console.log('hay')});
            button.on('click', function () {string.pluck.call(string, Math.random());});
        };
    })($, nustring.config, nustring.classes, nustring.client);

    $(document).ready(nustring.client.onDomReady);
})(window.$, window.nustring);