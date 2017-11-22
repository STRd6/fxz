var SQUARE = 0,
  SAWTOOTH = 1,
  SINE = 2,
  NOISE = 3;

function sqr(x) { return x * x }
function cube(x) { return x * x * x }
function sign(x) { return x < 0 ? -1 : 1 }
function log(x, b) { return Math.log(x) / Math.log(b); }
var pow = Math.pow;

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

module.exports = {
  pickupCoin: function (p) {
    p.freq = 0.4 + frnd(0.5);
    p.attack = 0;
    p.sustain = frnd(0.1);
    p.decay = 0.1 + frnd(0.4);
    p.punch = 0.3 + frnd(0.3);
    if (rnd(1)) {
      p.arpSpeed = 0.5 + frnd(0.2);
      p.arpMod = 0.2 + frnd(0.4);
    }
    return p;
  },
  laserShoot: function (p) {
    p.shape = rnd(2);
    if(p.shape === SINE && rnd(1))
      p.shape = rnd(1);
    if (rnd(2) === 0) {
      p.freq = 0.3 + frnd(0.6);
      p.freqLimit = frnd(0.1);
      p.freqSlide = -0.35 - frnd(0.3);
    } else {
      p.freq = 0.5 + frnd(0.5);
      p.freqLimit = p.freq - 0.2 - frnd(0.6);
      if (p.freqLimit < 0.2) p.freqLimit = 0.2;
      p.freqSlide = -0.15 - frnd(0.2);
    }
    if (p.shape === SAWTOOTH)
      p.duty = 1;
    if (rnd(1)) {
      p.duty = frnd(0.5);
      p.dutySweep = frnd(0.2);
    } else {
      p.duty = 0.4 + frnd(0.5);
      p.dutySweep = -frnd(0.7);
    }
    p.attack = 0;
    p.sustain = 0.1 + frnd(0.2);
    p.decay = frnd(0.4);
    if (rnd(1))
      p.punch = frnd(0.3);
    if (rnd(2) === 0) {
      p.flangerOffset = frnd(0.2);
      p.flangerSweep = -frnd(0.2);
    }
    //if (rnd(1))
      p.hpf = frnd(0.3);

    return p;
  },
  explosion: function (p) {
    p.shape = NOISE;
    if (rnd(1)) {
      p.freq = sqr(0.1 + frnd(0.4));
      p.freqSlide = -0.1 + frnd(0.4);
    } else {
      p.freq = sqr(0.2 + frnd(0.7));
      p.freqSlide = -0.2 - frnd(0.2);
    }
    if (rnd(4) === 0)
      p.freqSlide = 0;
    if (rnd(2) === 0)
      p.repeatSpeed = 0.3 + frnd(0.5);
    p.attack = 0;
    p.sustain = 0.1 + frnd(0.3);
    p.decay = frnd(0.5);
    if (rnd(1)) {
      p.flangerOffset = -0.3 + frnd(0.9);
      p.flangerSweep = -frnd(0.3);
    }
    p.punch = 0.2 + frnd(0.6);
    if (rnd(1)) {
      p.vibDepth = frnd(0.7);
      p.vibSpeed = frnd(0.6);
    }
    if (rnd(2) === 0) {
      p.arpSpeed = 0.6 + frnd(0.3);
      p.arpMod = 0.8 - frnd(1.6);
    }
  
    return p;
  },
  powerUp: function (p) {
    if (rnd(1)) {
      p.shape = SAWTOOTH;
      p.duty = 1;
    } else {
      p.duty = frnd(0.6);
    }
    p.freq = 0.2 + frnd(0.3);
    if (rnd(1)) {
      p.freqSlide = 0.1 + frnd(0.4);
      p.repeatSpeed = 0.4 + frnd(0.4);
    } else {
      p.freqSlide = 0.05 + frnd(0.2);
      if (rnd(1)) {
        p.vibDepth = frnd(0.7);
        p.vibSpeed = frnd(0.6);
      }
    }
    p.attack = 0;
    p.sustain = frnd(0.4);
    p.decay = 0.1 + frnd(0.4);
  
    return p;
  },
  hitHurt: function (p) {
    p.shape = rnd(2);
    if (p.shape === SINE)
      p.shape = NOISE;
    if (p.shape === SQUARE)
      p.duty = frnd(0.6);
    if (p.shape === SAWTOOTH)
      p.duty = 1;
    p.freq = 0.2 + frnd(0.6);
    p.freqSlide = -0.3 - frnd(0.4);
    p.attack = 0;
    p.sustain = frnd(0.1);
    p.decay = 0.1 + frnd(0.2);
    if (rnd(1))
      p.hpf = frnd(0.3);
    return p;
  },
  jump: function (p) {
    p.shape = SQUARE;
    p.duty = frnd(0.6);
    p.freq = 0.3 + frnd(0.3);
    p.freqSlide = 0.1 + frnd(0.2);
    p.attack = 0;
    p.sustain = 0.1 + frnd(0.3);
    p.decay = 0.1 + frnd(0.2);
    if (rnd(1))
      p.hpf = frnd(0.3);
    if (rnd(1))
      p.lpf = 1 - frnd(0.6);
    return p;
  },
  blipSelect: function (p) {
    p.shape = rnd(1);
    if (p.shape === SQUARE)
      p.duty = frnd(0.6);
    else
      p.duty = 1;
    p.freq = 0.2 + frnd(0.4);
    p.attack = 0;
    p.sustain = 0.1 + frnd(0.1);
    p.decay = frnd(0.2);
    p.hpf = 0.1;
    return p;
  },
  tone: function (p) {
    p.shape = SINE;
    p.freq = 0.35173364; // 440 Hz
    p.attack = 0;
    p.sustain = 0.6641; // 1 sec
    p.decay = 0;
    p.punch = 0;
    return p;
  },
  mutate: function (p) {
    if (rnd(1)) p.freq += frnd(0.1) - 0.05;
    if (rnd(1)) p.freqSlide += frnd(0.1) - 0.05;
    if (rnd(1)) p.freqSlideDelta += frnd(0.1) - 0.05;
    if (rnd(1)) p.duty += frnd(0.1) - 0.05;
    if (rnd(1)) p.dutySweep += frnd(0.1) - 0.05;
    if (rnd(1)) p.vibDepth += frnd(0.1) - 0.05;
    if (rnd(1)) p.vibSpeed += frnd(0.1) - 0.05;
    if (rnd(1)) p.p_vib_delay += frnd(0.1) - 0.05;
    if (rnd(1)) p.attack += frnd(0.1) - 0.05;
    if (rnd(1)) p.sustain += frnd(0.1) - 0.05;
    if (rnd(1)) p.decay += frnd(0.1) - 0.05;
    if (rnd(1)) p.punch += frnd(0.1) - 0.05;
    if (rnd(1)) p.lpfResonance += frnd(0.1) - 0.05;
    if (rnd(1)) p.lpf += frnd(0.1) - 0.05;
    if (rnd(1)) p.lpfSweep += frnd(0.1) - 0.05;
    if (rnd(1)) p.hpf += frnd(0.1) - 0.05;
    if (rnd(1)) p.hpfSweep += frnd(0.1) - 0.05;
    if (rnd(1)) p.flangerOffset += frnd(0.1) - 0.05;
    if (rnd(1)) p.flangerSweep += frnd(0.1) - 0.05;
    if (rnd(1)) p.repeatSpeed += frnd(0.1) - 0.05;
    if (rnd(1)) p.arpSpeed += frnd(0.1) - 0.05;
    if (rnd(1)) p.arpMod += frnd(0.1) - 0.05;
    return p
  },
  randomize: function (p) {
    if (rnd(1))
      p.freq = cube(frnd(2) - 1) + 0.5;
    else
      p.freq = sqr(frnd(1));
    p.freqLimit = 0;
    p.freqSlide = Math.pow(frnd(2) - 1, 5);
    if (p.freq > 0.7 && p.freqSlide > 0.2)
      p.freqSlide = -p.freqSlide;
    if (p.freq < 0.2 && p.freqSlide < -0.05)
      p.freqSlide = -p.freqSlide;
    p.freqSlideDelta = Math.pow(frnd(2) - 1, 3);
    p.duty = frnd(2) - 1;
    p.dutySweep = Math.pow(frnd(2) - 1, 3);
    p.vibDepth = Math.pow(frnd(2) - 1, 3);
    p.vibSpeed = rndr(-1, 1);
    p.attack = cube(rndr(-1, 1));
    p.sustain = sqr(rndr(-1, 1));
    p.decay = rndr(-1, 1);
    p.punch = Math.pow(frnd(0.8), 2);
    if (p.attack + p.sustain + p.decay < 0.2) {
      p.sustain += 0.2 + frnd(0.3);
      p.decay += 0.2 + frnd(0.3);
    }
    p.lpfResonance = rndr(-1, 1);
    p.lpf = 1 - Math.pow(frnd(1), 3);
    p.lpfSweep = Math.pow(frnd(2) - 1, 3);
    if (p.lpf < 0.1 && p.lpfSweep < -0.05)
      p.lpfSweep = -p.lpfSweep;
    p.hpf = Math.pow(frnd(1), 5);
    p.hpfSweep = Math.pow(frnd(2) - 1, 5);
    p.flangerOffset = Math.pow(frnd(2) - 1, 3);
    p.flangerSweep = Math.pow(frnd(2) - 1, 3);
    p.repeatSpeed = frnd(2) - 1;
    p.arpSpeed = frnd(2) - 1;
    p.arpMod = frnd(2) - 1;
    return p;
  }
};
