var SQUARE = 0,
  SAWTOOTH = 1,
  SINE = 2,
  NOISE = 3,
  OVERSAMPLING = 8;

function SoundEffect(ps) {
  //
  // Convert user-facing parameter values to units usable by the sound
  // generator
  //

  this.initForRepeat = function() {
    this.elapsedSinceRepeat = 0;

    this.period = 100 / (ps.p_base_freq * ps.p_base_freq + 0.001);
    this.periodMax = 100 / (ps.p_freq_limit * ps.p_freq_limit + 0.001);
    this.enableFrequencyCutoff = (ps.p_freq_limit > 0);
    this.periodMult = 1 - Math.pow(ps.p_freq_ramp, 3) * 0.01;
    this.periodMultSlide = -Math.pow(ps.p_freq_dramp, 3) * 0.000001;

    this.dutyCycle = 0.5 - ps.p_duty * 0.5;
    this.dutyCycleSlide = -ps.p_duty_ramp * 0.00005;

    if (ps.p_arp_mod >= 0)
      this.arpeggioMultiplier = 1 - Math.pow(ps.p_arp_mod, 2) * 0.9;
    else
      this.arpeggioMultiplier = 1 + Math.pow(ps.p_arp_mod, 2) * 10;
    this.arpeggioTime = Math.floor(Math.pow(1 - ps.p_arp_speed, 2) * 20000 + 32);
    if (ps.p_arp_speed === 1)
      this.arpeggioTime = 0;
  };

  this.initForRepeat();  // First time through, this is a bit of a misnomer

  // Waveform shape
  this.waveShape = parseInt(ps.wave_type);

  // Filter
  this.fltw = Math.pow(ps.p_lpf_freq, 3) * 0.1;
  this.enableLowPassFilter = (ps.p_lpf_freq != 1);
  this.fltw_d = 1 + ps.p_lpf_ramp * 0.0001;
  this.fltdmp = 5 / (1 + Math.pow(ps.p_lpf_resonance, 2) * 20) *
    (0.01 + this.fltw);
  if (this.fltdmp > 0.8) this.fltdmp=0.8;
  this.flthp = Math.pow(ps.p_hpf_freq, 2) * 0.1;
  this.flthp_d = 1 + ps.p_hpf_ramp * 0.0003;

  // Vibrato
  this.vibratoSpeed = Math.pow(ps.p_vib_speed, 2) * 0.01;
  this.vibratoAmplitude = ps.p_vib_strength * 0.5;

  // Envelope
  this.envelopeLength = [
    Math.floor(ps.p_env_attack * ps.p_env_attack * 100000),
    Math.floor(ps.p_env_sustain * ps.p_env_sustain * 100000),
    Math.floor(ps.p_env_decay * ps.p_env_decay * 100000)
  ];
  this.envelopePunch = ps.p_env_punch;

  // Flanger
  this.flangerOffset = Math.pow(ps.p_pha_offset, 2) * 1020;
  if (ps.p_pha_offset < 0) this.flangerOffset = -this.flangerOffset;
  this.flangerOffsetSlide = Math.pow(ps.p_pha_ramp, 2) * 1;
  if (ps.p_pha_ramp < 0) this.flangerOffsetSlide = -this.flangerOffsetSlide;

  // Repeat
  this.repeatTime = Math.floor(Math.pow(1 - ps.p_repeat_speed, 2) * 20000
                               + 32);
  if (ps.p_repeat_speed === 0)
    this.repeatTime = 0;

  this.gain = Math.exp(ps.sound_vol) - 1;

  this.sampleRate = ps.sample_rate;
  this.bitsPerChannel = ps.sample_size;

  console.log(ps, this);
}

SoundEffect.prototype.generate = function (audioContext) {
  var fltp = 0;
  var fltdp = 0;
  var fltphp = 0;

  // TODO: Deterministic output! Don't randomize noise buffer here
  var noise_buffer = Array(32);
  for (var i = 0; i < 32; ++i)
    noise_buffer[i] = Math.random() * 2 - 1;

  var envelopeStage = 0;
  var envelopeElapsed = 0;

  var vibratoPhase = 0;

  var phase = 0;
  var ipp = 0;
  var flanger_buffer = Array(1024);
  for (var i = 0; i < 1024; ++i)
    flanger_buffer[i] = 0;

  var num_clipped = 0;

  var buffer = [];

  var sample_sum = 0;
  var num_summed = 0;
  var summands = Math.floor(44100 / this.sampleRate);

  for(var t = 0; ; ++t) {

    // Repeats
    if (this.repeatTime != 0 && ++this.elapsedSinceRepeat >= this.repeatTime)
      this.initForRepeat();

    // Arpeggio (single)
    if(this.arpeggioTime != 0 && t >= this.arpeggioTime) {
      this.arpeggioTime = 0;
      this.period *= this.arpeggioMultiplier;
    }

    // Frequency slide, and frequency slide slide!
    this.periodMult += this.periodMultSlide;
    this.period *= this.periodMult;
    if(this.period > this.periodMax) {
      this.period = this.periodMax;
      if (this.enableFrequencyCutoff)
        break;
    }

    // Vibrato
    var rfperiod = this.period;
    if (this.vibratoAmplitude > 0) {
      vibratoPhase += this.vibratoSpeed;
      rfperiod = this.period * (1 + Math.sin(vibratoPhase) * this.vibratoAmplitude);
    }
    var iperiod = Math.floor(rfperiod);
    if (iperiod < OVERSAMPLING) iperiod = OVERSAMPLING;

    // Square wave duty cycle
    this.dutyCycle += this.dutyCycleSlide;
    if (this.dutyCycle < 0) this.dutyCycle = 0;
    if (this.dutyCycle > 0.5) this.dutyCycle = 0.5;

    // Volume envelope
    if (++envelopeElapsed > this.envelopeLength[envelopeStage]) {
      envelopeElapsed = 0;
      if (++envelopeStage > 2)
        break;
    }
    var env_vol;
    var envf = envelopeElapsed / this.envelopeLength[envelopeStage];
    if (envelopeStage === 0) {         // Attack
      env_vol = envf;
    } else if (envelopeStage === 1) {  // Sustain
      env_vol = 1 + (1 - envf) * 2 * this.envelopePunch;
    } else {                           // Decay
      env_vol = 1 - envf;
    }

    // Flanger step
    this.flangerOffset += this.flangerOffsetSlide;
    var iphase = Math.abs(Math.floor(this.flangerOffset));
    if (iphase > 1023) iphase = 1023;

    if (this.flthp_d != 0) {
      this.flthp *= this.flthp_d;
      if (this.flthp < 0.00001)
        this.flthp = 0.00001;
      if (this.flthp > 0.1)
        this.flthp = 0.1;
    }

    // 8x oversampling
    var sample = 0;
    for (var si = 0; si < OVERSAMPLING; ++si) {
      var sub_sample = 0;
      phase++;
      if (phase >= iperiod) {
        phase %= iperiod;
        if (this.waveShape === NOISE)
          for(var i = 0; i < 32; ++i)
            noise_buffer[i] = Math.random() * 2 - 1;
      }

      // Base waveform
      var fp = phase / iperiod;
      if (this.waveShape === SQUARE) {
        if (fp < this.dutyCycle)
          sub_sample=0.5;
        else
          sub_sample=-0.5;
      } else if (this.waveShape === SAWTOOTH) {
        if (fp < this.dutyCycle)
          sub_sample = -1 + 2 * fp/this.dutyCycle;
        else
          sub_sample = 1 - 2 * (fp-this.dutyCycle)/(1-this.dutyCycle);
      } else if (this.waveShape === SINE) {
        sub_sample = Math.sin(fp * 2 * Math.PI);
      } else if (this.waveShape === NOISE) {
        sub_sample = noise_buffer[Math.floor(phase * 32 / iperiod)];
      } else {
        throw "ERROR: Bad wave type: " + this.waveShape;
      }

      // Low-pass filter
      var pp = fltp;
      this.fltw *= this.fltw_d;
      if (this.fltw < 0) this.fltw = 0;
      if (this.fltw > 0.1) this.fltw = 0.1;
      if (this.enableLowPassFilter) {
        fltdp += (sub_sample - fltp) * this.fltw;
        fltdp -= fltdp * this.fltdmp;
      } else {
        fltp = sub_sample;
        fltdp = 0;
      }
      fltp += fltdp;

      // High-pass filter
      fltphp += fltp - pp;
      fltphp -= fltphp * this.flthp;
      sub_sample = fltphp;

      // Flanger
      flanger_buffer[ipp & 1023] = sub_sample;
      sub_sample += flanger_buffer[(ipp - iphase + 1024) & 1023];
      ipp = (ipp + 1) & 1023;

      // final accumulation and envelope application
      sample += sub_sample * env_vol;
    }

    // Accumulate samples appropriately for sample rate
    sample_sum += sample;
    if (++num_summed >= summands) {
      num_summed = 0;
      sample = sample_sum / summands;
      sample_sum = 0;
    } else {
      continue;
    }

    sample = sample / OVERSAMPLING;
    sample *= this.gain;

    buffer.push(sample);
  }

  var float32Array = new Float32Array(buffer);

  // Create buffer
  var audioBuffer = audioContext.createBuffer(1, float32Array.length, this.sampleRate);
  var channelData = audioBuffer.getChannelData(0);
  channelData.set(float32Array);

  return audioBuffer;
};

module.exports = SoundEffect;
