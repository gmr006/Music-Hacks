var CrossfadeSample = function() {

  loadSounds(this, {
    song1: 'Loyalty.mp3',
    song2: 'Instrumental.mp3'
  });
  this.isPlaying = false;
}

CrossfadeSample.prototype.play = function() {
  // Create two sources.
  this.ctl1 = createSource(this.song1);
  this.ctl2 = createSource(this.song2);

  // Mute the second source.
  this.ctl1.gainNode.gain.value = 0;
  // Start playback in a loop
  var onName = this.ctl1.source.start ? 'start' : 'noteOn';
  this.ctl1.source[onName](0);
  this.ctl2.source[onName](0);
  // Set the initial crossfade to be just source 1.
  this.crossfade(0);

  function createSource(buffer) {
    var source = context.createBufferSource();
    var gainNode = context.createGain();

    // Create the filter.
    var filter = context.createBiquadFilter();
    filter.type = filter.LOWPASS;
    filter.frequency.value = 5000;

    source.buffer = buffer;
    // Turn on looping
    source.loop = true;
    // Connect source to gain.
    source.connect(gainNode);
    // Connect gain to destination.
    gainNode.connect(filter);
    // Connect filter to destination.
    filter.connect(context.destination);

    return {
      source: source,
      gainNode: gainNode,
      filter : filter
    };
  }
};

CrossfadeSample.prototype.stop = function() {
  var offName = this.ctl1.source.stop ? 'stop' : 'noteOff';
  this.ctl1.source[offName](0);
  this.ctl2.source[offName](0);
};

CrossfadeSample.prototype.changeSpeed = function(val, song) {
  if (song == 1) {
    this.ctl1.source.playbackRate.value = val;
  } else if (song == 2) {
    this.ctl2.source.playbackRate.value = val;
  }
};

// Fades between 0 (all source 1) and 1 (all source 2)
CrossfadeSample.prototype.crossfade = function(element) {
  var x = parseInt(element.value) / parseInt(element.max);
  // Use an equal-power crossfading curve:
  var gain1 = Math.cos(x * 0.5*Math.PI);
  var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
  this.ctl1.gainNode.gain.value = gain1;
  this.ctl2.gainNode.gain.value = gain2;
};

CrossfadeSample.prototype.toggle = function() {
  this.isPlaying ? this.stop() : this.play();
  this.isPlaying = !this.isPlaying;
};

CrossfadeSample.prototype.changeFrequency = function(value, song) {
  // Clamp the frequency between the minimum value (40 Hz) and half of the
  // sampling rate.
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
  // Get back to the frequency value between min and max.
  if (song == 1 ){
    this.ctl1.filter.frequency.value = maxValue * multiplier;
  } else if (song == 2) {
    this.ctl2.filter.frequency.value = maxValue * multiplier;
  }
};

// CrossfadeSample.prototype.changeQuality = function(element) {
//   this.filter.Q.value = element.value * QUAL_MUL;
// };

CrossfadeSample.prototype.toggleFilter = function(checked, song) {
  var current = this.ctl1;
  if (song == 2) {
    current = this.ctl2;
  }

  current.source.disconnect(0);
  current.filter.disconnect(0);
  // Check if we want to enable the filter.
  if (checked) {
    // Connect through the filter.
    current.source.connect(current.gainNode);
    current.gainNode.connect(current.filter);
    current.filter.connect(context.destination);
  } else {
    // Otherwise, connect directly.
    current.source.connect(current.gainNode);
    current.gainNode.connect(context.destination);
  }
};


