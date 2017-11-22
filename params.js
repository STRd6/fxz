// Sound generation parameters are on [0,1] unless noted SIGNED & thus
// on [-1,1]
module.exports = function () {
  // Wave shape
  this.shape = 0;

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
};
