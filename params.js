var SQUARE = 0,
  SAWTOOTH = 1,
  SINE = 2,
  NOISE = 3;

function sqr(x) { return x * x }
function cube(x) { return x * x * x }
function sign(x) { return x < 0 ? -1 : 1 }
function log(x, b) { return Math.log(x) / Math.log(b); }
var pow = Math.pow;

// Sound generation parameters are on [0,1] unless noted SIGNED & thus
// on [-1,1]
function Params() {
  // Wave shape
  this.shape = SQUARE;

  // Envelope
  this.attack = 0;    // Attack time
  this.sustain = 0.3; // Sustain time
  this.punch = 0;     // Sustain punch
  this.decay = 0.4;   // Decay time

  // Tone
  this.freq = 0.3;    // Start frequency
  this.freqLimit = 0;   // Min frequency cutoff
  this.freqSlide = 0;    // Slide (SIGNED)
  this.freqSlideDelta = 0;   // Delta slide (SIGNED)
  // Vibrato
  this.vibDepth = 0; // Vibrato depth
  this.vibSpeed = 0;    // Vibrato speed

  // Tonal change
  this.arpMod = 0;      // Change amount (SIGNED)
  this.arpSpeed = 0;    // Change speed

  // Square wave duty (proportion of time signal is high vs. low)
  this.duty = 0;         // Square duty
  this.dutySweep = 0;    // Duty sweep (SIGNED)

  // Repeat
  this.repeatSpeed = 0; // Repeat speed

  // Flanger
  this.flangerOffset = 0;   // Flanger offset (SIGNED)
  this.flangerSweep = 0;     // Flanger sweep (SIGNED)

  // Low-pass filter
  this.lpf = 1;     // Low-pass filter cutoff
  this.lpfSweep = 0;     // Low-pass filter cutoff sweep (SIGNED)
  this.lpfResonance = 0;// Low-pass filter resonance
  // High-pass filter
  this.hpf = 0;     // High-pass filter cutoff
  this.hpfSweep = 0;     // High-pass filter cutoff sweep (SIGNED)

  // Sample parameters
  this.vol = 0.5;
}


function frnd(range) {
  return Math.random() * range;
}

function rndr(from, to) {
  return Math.random() * (to - from) + from;
}

function rnd(max) {
  return Math.floor(Math.random() * (max + 1));
}


// These functions roll up random sounds appropriate to various
// typical game events:


Params.prototype.pickupCoin = function () {
  this.freq = 0.4 + frnd(0.5);
  this.attack = 0;
  this.sustain = frnd(0.1);
  this.decay = 0.1 + frnd(0.4);
  this.punch = 0.3 + frnd(0.3);
  if (rnd(1)) {
    this.arpSpeed = 0.5 + frnd(0.2);
    this.arpMod = 0.2 + frnd(0.4);
  }
  return this;
};


Params.prototype.laserShoot = function () {
  this.shape = rnd(2);
  if(this.shape === SINE && rnd(1))
    this.shape = rnd(1);
  if (rnd(2) === 0) {
    this.freq = 0.3 + frnd(0.6);
    this.freqLimit = frnd(0.1);
    this.freqSlide = -0.35 - frnd(0.3);
  } else {
    this.freq = 0.5 + frnd(0.5);
    this.freqLimit = this.freq - 0.2 - frnd(0.6);
    if (this.freqLimit < 0.2) this.freqLimit = 0.2;
    this.freqSlide = -0.15 - frnd(0.2);
  }
  if (this.shape === SAWTOOTH)
    this.duty = 1;
  if (rnd(1)) {
    this.duty = frnd(0.5);
    this.dutySweep = frnd(0.2);
  } else {
    this.duty = 0.4 + frnd(0.5);
    this.dutySweep = -frnd(0.7);
  }
  this.attack = 0;
  this.sustain = 0.1 + frnd(0.2);
  this.decay = frnd(0.4);
  if (rnd(1))
    this.punch = frnd(0.3);
  if (rnd(2) === 0) {
    this.flangerOffset = frnd(0.2);
    this.flangerSweep = -frnd(0.2);
  }
  //if (rnd(1))
    this.hpf = frnd(0.3);

  return this;
};


Params.prototype.explosion = function () {
  this.shape = NOISE;
  if (rnd(1)) {
    this.freq = sqr(0.1 + frnd(0.4));
    this.freqSlide = -0.1 + frnd(0.4);
  } else {
    this.freq = sqr(0.2 + frnd(0.7));
    this.freqSlide = -0.2 - frnd(0.2);
  }
  if (rnd(4) === 0)
    this.freqSlide = 0;
  if (rnd(2) === 0)
    this.repeatSpeed = 0.3 + frnd(0.5);
  this.attack = 0;
  this.sustain = 0.1 + frnd(0.3);
  this.decay = frnd(0.5);
  if (rnd(1)) {
    this.flangerOffset = -0.3 + frnd(0.9);
    this.flangerSweep = -frnd(0.3);
  }
  this.punch = 0.2 + frnd(0.6);
  if (rnd(1)) {
    this.vibDepth = frnd(0.7);
    this.vibSpeed = frnd(0.6);
  }
  if (rnd(2) === 0) {
    this.arpSpeed = 0.6 + frnd(0.3);
    this.arpMod = 0.8 - frnd(1.6);
  }

  return this;
};


Params.prototype.powerUp = function () {
  if (rnd(1)) {
    this.shape = SAWTOOTH;
    this.duty = 1;
  } else {
    this.duty = frnd(0.6);
  }
  this.freq = 0.2 + frnd(0.3);
  if (rnd(1)) {
    this.freqSlide = 0.1 + frnd(0.4);
    this.repeatSpeed = 0.4 + frnd(0.4);
  } else {
    this.freqSlide = 0.05 + frnd(0.2);
    if (rnd(1)) {
      this.vibDepth = frnd(0.7);
      this.vibSpeed = frnd(0.6);
    }
  }
  this.attack = 0;
  this.sustain = frnd(0.4);
  this.decay = 0.1 + frnd(0.4);

  return this;
};


Params.prototype.hitHurt = function () {
  this.shape = rnd(2);
  if (this.shape === SINE)
    this.shape = NOISE;
  if (this.shape === SQUARE)
    this.duty = frnd(0.6);
  if (this.shape === SAWTOOTH)
    this.duty = 1;
  this.freq = 0.2 + frnd(0.6);
  this.freqSlide = -0.3 - frnd(0.4);
  this.attack = 0;
  this.sustain = frnd(0.1);
  this.decay = 0.1 + frnd(0.2);
  if (rnd(1))
    this.hpf = frnd(0.3);
  return this;
};


Params.prototype.jump = function () {
  this.shape = SQUARE;
  this.duty = frnd(0.6);
  this.freq = 0.3 + frnd(0.3);
  this.freqSlide = 0.1 + frnd(0.2);
  this.attack = 0;
  this.sustain = 0.1 + frnd(0.3);
  this.decay = 0.1 + frnd(0.2);
  if (rnd(1))
    this.hpf = frnd(0.3);
  if (rnd(1))
    this.lpf = 1 - frnd(0.6);
  return this;
};


Params.prototype.blipSelect = function () {
  this.shape = rnd(1);
  if (this.shape === SQUARE)
    this.duty = frnd(0.6);
  else
    this.duty = 1;
  this.freq = 0.2 + frnd(0.4);
  this.attack = 0;
  this.sustain = 0.1 + frnd(0.1);
  this.decay = frnd(0.2);
  this.hpf = 0.1;
  return this;
};


Params.prototype.tone = function () {
  this.shape = SINE;
  this.freq = 0.35173364; // 440 Hz
  this.attack = 0;
  this.sustain = 0.6641; // 1 sec
  this.decay = 0;
  this.punch = 0;
  return this;
};


Params.prototype.mutate = function () {
  if (rnd(1)) this.freq += frnd(0.1) - 0.05;
  if (rnd(1)) this.freqSlide += frnd(0.1) - 0.05;
  if (rnd(1)) this.freqSlideDelta += frnd(0.1) - 0.05;
  if (rnd(1)) this.duty += frnd(0.1) - 0.05;
  if (rnd(1)) this.dutySweep += frnd(0.1) - 0.05;
  if (rnd(1)) this.vibDepth += frnd(0.1) - 0.05;
  if (rnd(1)) this.vibSpeed += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_vib_delay += frnd(0.1) - 0.05;
  if (rnd(1)) this.attack += frnd(0.1) - 0.05;
  if (rnd(1)) this.sustain += frnd(0.1) - 0.05;
  if (rnd(1)) this.decay += frnd(0.1) - 0.05;
  if (rnd(1)) this.punch += frnd(0.1) - 0.05;
  if (rnd(1)) this.lpfResonance += frnd(0.1) - 0.05;
  if (rnd(1)) this.lpf += frnd(0.1) - 0.05;
  if (rnd(1)) this.lpfSweep += frnd(0.1) - 0.05;
  if (rnd(1)) this.hpf += frnd(0.1) - 0.05;
  if (rnd(1)) this.hpfSweep += frnd(0.1) - 0.05;
  if (rnd(1)) this.flangerOffset += frnd(0.1) - 0.05;
  if (rnd(1)) this.flangerSweep += frnd(0.1) - 0.05;
  if (rnd(1)) this.repeatSpeed += frnd(0.1) - 0.05;
  if (rnd(1)) this.arpSpeed += frnd(0.1) - 0.05;
  if (rnd(1)) this.arpMod += frnd(0.1) - 0.05;
};


Params.prototype.random = function () {
  if (rnd(1))
    this.freq = cube(frnd(2) - 1) + 0.5;
  else
    this.freq = sqr(frnd(1));
  this.freqLimit = 0;
  this.freqSlide = Math.pow(frnd(2) - 1, 5);
  if (this.freq > 0.7 && this.freqSlide > 0.2)
    this.freqSlide = -this.freqSlide;
  if (this.freq < 0.2 && this.freqSlide < -0.05)
    this.freqSlide = -this.freqSlide;
  this.freqSlideDelta = Math.pow(frnd(2) - 1, 3);
  this.duty = frnd(2) - 1;
  this.dutySweep = Math.pow(frnd(2) - 1, 3);
  this.vibDepth = Math.pow(frnd(2) - 1, 3);
  this.vibSpeed = rndr(-1, 1);
  this.attack = cube(rndr(-1, 1));
  this.sustain = sqr(rndr(-1, 1));
  this.decay = rndr(-1, 1);
  this.punch = Math.pow(frnd(0.8), 2);
  if (this.attack + this.sustain + this.decay < 0.2) {
    this.sustain += 0.2 + frnd(0.3);
    this.decay += 0.2 + frnd(0.3);
  }
  this.lpfResonance = rndr(-1, 1);
  this.lpf = 1 - Math.pow(frnd(1), 3);
  this.lpfSweep = Math.pow(frnd(2) - 1, 3);
  if (this.lpf < 0.1 && this.lpfSweep < -0.05)
    this.lpfSweep = -this.lpfSweep;
  this.hpf = Math.pow(frnd(1), 5);
  this.hpfSweep = Math.pow(frnd(2) - 1, 5);
  this.flangerOffset = Math.pow(frnd(2) - 1, 3);
  this.flangerSweep = Math.pow(frnd(2) - 1, 3);
  this.repeatSpeed = frnd(2) - 1;
  this.arpSpeed = frnd(2) - 1;
  this.arpMod = frnd(2) - 1;
  return this;
};

module.exports = Params;
