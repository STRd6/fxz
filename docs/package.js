(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "README.md": {
      "path": "README.md",
      "content": "SFXZ\n====\n\nA recreation of sfxr. Wish me luck!\n\n\nGoals\n-----\n\n- [ ] An embeddable synthesizer in < 1kb js (minified and gzipped)\n- [x] A binary format for saving and loading effects in 100 bytes\n\nSFXZ Binary Format Specification\n------\n\n| Offset | Size | Type    | Field            | Range  |\n|--------|------|---------|------------------|--------|\n|  0     | 3    | ascii   | Magic Number     | 'fxz'  |\n|  3     | 1    | uint8   | version          | 1      |\n|  4     | 1    | uint8   | wave shape       | 0-3    |\n|  5     | 3    | -       | unused           | 0      |\n|  8     | 4    | float32 | attack time      | [ 0,1] |\n| 12     | 4    | float32 | sustain time     | [ 0,1] |\n| 16     | 4    | float32 | sustain punch    | [ 0,1] |\n| 20     | 4    | float32 | decay time       | [ 0,1] |\n| 24     | 4    | float32 | start frequency  | [ 0,1] |\n| 28     | 4    | float32 | frequency cutoff | [ 0,1] |\n| 32     | 4    | float32 | frequency slide  | [-1,1] |\n| 36     | 4    | float32 | delta slide      | [-1,1] |\n| 40     | 4    | float32 | vibrato depth    | [ 0,1] |\n| 44     | 4    | float32 | vibrato speed    | [ 0,1] |\n| 48     | 4    | float32 | arp amount       | [-1,1] |\n| 52     | 4    | float32 | arp change speed | [ 0,1] |\n| 56     | 4    | float32 | Square duty      | [ 0,1] |\n| 60     | 4    | float32 | Duty sweep       | [-1,1] |\n| 64     | 4    | float32 | Repeat speed     | [ 0,1] |\n| 68     | 4    | float32 | Flanger offset   | [-1,1] |\n| 72     | 4    | float32 | Flanger sweep    | [-1,1] |\n| 76     | 4    | float32 | LPF cutoff       | [ 0,1] |\n| 80     | 4    | float32 | LPF cutoff sweep | [-1,1] |\n| 84     | 4    | float32 | LPF resonance    | [ 0,1] |\n| 88     | 4    | float32 | HPF cutoff       | [ 0,1] |\n| 92     | 4    | float32 | HPF cutoff sweep | [-1,1] |\n| 96     | 4    | float32 | Volume           | [ 0,1] |\n\nRecommended MIME type `application/sfxz`.\n\nRecommended file extension `.sfxz`.\n\nStatus\n------\n\nCurrently in beta. I want to review the synth and see if I can adjust the params\nto reduce the amount that create empty or \"bad\" sounds. Juice the most \ninformation out of those bits!\n\nI also want to investigate using the full float32 range or expanding the \nrecommended range and see what impact that will have, but I need to learn more \nabout how the synth operates to be sure.\n\nGlossary\n------\n\n- freq: frequency\n- LPF: Low pass filter\n- vol: Volume\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "name: \"SFXZ\"\nversion: \"0.3.0\"\nentryPoint: \"sfxz\"\npublish:\n  s3:\n    basePath: \"public/danielx.net\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "serializer.coffee": {
      "path": "serializer.coffee",
      "content": "VERSION = 1\n\nmodule.exports =\n  serialize: (params) ->\n    buffer = new ArrayBuffer(100)\n\n    dataView = new DataView(buffer)\n\n    Object.keys(params).forEach (key, i) ->\n      param = params[key]\n      if i is 0\n        # 4 byte sfxz header\n        \"fxz\".split(\"\").forEach (s, n) ->\n          dataView.setUint8(n, s.charCodeAt(0))\n        # version\n        dataView.setUint8(3, VERSION)\n        # byte 4 shape\n        dataView.setUint8(4, param)\n        # bytes 5, 6, 7 unused for now\n      else\n        # Little endian float32s for the other 23 fields\n        dataView.setFloat32((i + 1) * 4, param, true)\n\n    return buffer\n\n  deserialize: (buffer, params) ->\n    dataView = new DataView(buffer)\n\n    Object.keys(params).forEach (key, i) ->\n      if i is 0\n        # 4 byte sfxz header\n        \"fxz\".split(\"\").forEach (s, n) ->\n          charCode = s.charCodeAt(0)\n          if charCode != dataView.getUint8(n)\n            throw new Error \"Unknown file format: expected '#{s}' (#{charCode}) at byte #{n}\"\n        # version\n        version = dataView.getUint8(3)\n        if version != VERSION\n          throw new Error \"Unknown version '#{version}': expected 1\"\n        # byte 4 shape\n        params[key] = dataView.getUint8(4)\n        # bytes 5, 6, 7 unused for now\n      else\n        # Little endian float32s for the other 23 fields\n        params[key] = dataView.getFloat32((i + 1) * 4, true)\n\n    return params\n",
      "mode": "100644",
      "type": "blob"
    },
    "sfxz.js": {
      "path": "sfxz.js",
      "content": "// Synthesize an AudioBuffer from the param data\nmodule.exports = (function() {\n  // Sound generation parameters are on [0,1] unless noted SIGNED & thus on [-1,1]\n  function Params() {\n    // Wave shape\n    this.shape = 0;\n\n    // Envelope\n    this.attack = 0;    // Attack time\n    this.sustain = 0.3; // Sustain time\n    this.punch = 0;     // Sustain punch\n    this.decay = 0.4;   // Decay time\n\n    // Tone\n    this.freq = 0.3;    // Start frequency\n    this.freqLimit = 0;   // Min frequency cutoff\n    this.freqSlide = 0;    // Slide (SIGNED)\n    this.freqSlideDelta = 0;   // Delta slide (SIGNED)\n    // Vibrato\n    this.vibDepth = 0; // Vibrato depth\n    this.vibSpeed = 0;    // Vibrato speed\n\n    // Tonal change\n    this.arpMod = 0;      // Change amount (SIGNED)\n    this.arpSpeed = 0;    // Change speed\n\n    // Square wave duty (proportion of time signal is high vs. low)\n    this.duty = 0;         // Square duty\n    this.dutySweep = 0;    // Duty sweep (SIGNED)\n\n    // Repeat\n    this.repeatSpeed = 0; // Repeat speed\n\n    // Flanger\n    this.flangerOffset = 0;   // Flanger offset (SIGNED)\n    this.flangerSweep = 0;     // Flanger sweep (SIGNED)\n\n    // Low-pass filter\n    this.lpf = 1;     // Low-pass filter cutoff\n    this.lpfSweep = 0;     // Low-pass filter cutoff sweep (SIGNED)\n    this.lpfResonance = 0;// Low-pass filter resonance\n    // High-pass filter\n    this.hpf = 0;     // High-pass filter cutoff\n    this.hpfSweep = 0;     // High-pass filter cutoff sweep (SIGNED)\n\n    // Sample parameters\n    this.vol = 0.5;\n  }\n\n  function SFXZ(ps, audioContext) {\n    // Handle binary format\n    if (ps instanceof ArrayBuffer) {\n      ps = Serializer.deserialize(ps, new Params());\n    }\n\n    var m = Math;\n    var floor = m.floor,\n      pow = m.pow,\n      abs = m.abs,\n      random = m.random;\n\n    var SQUARE = 0,\n      SAWTOOTH = 1,\n      SINE = 2,\n      NOISE = 3,\n      OVERSAMPLING = 8,\n      sampleRate = 44100;\n\n    var i,\n      elapsedSinceRepeat,\n      period,\n      periodMax,\n      enableFrequencyCutoff,\n      periodMult,\n      periodMultSlide,\n      dutyCycle,\n      dutyCycleSlide,\n      arpeggioMultiplier,\n      arpeggioTime;\n\n    function initForRepeat() {\n      elapsedSinceRepeat = 0;\n\n      period = 100 / (ps.freq * ps.freq + 0.001);\n      periodMax = 100 / (ps.freqLimit * ps.freqLimit + 0.001);\n      enableFrequencyCutoff = (ps.freqLimit > 0);\n      periodMult = 1 - pow(ps.freqSlide, 3) * 0.01;\n      periodMultSlide = -pow(ps.freqSlideDelta, 3) * 0.000001;\n\n      dutyCycle = 0.5 - ps.duty * 0.5;\n      dutyCycleSlide = -ps.dutySweep * 0.00005;\n\n      if (ps.arpMod >= 0)\n        arpeggioMultiplier = 1 - pow(ps.arpMod, 2) * 0.9;\n      else\n        arpeggioMultiplier = 1 + pow(ps.arpMod, 2) * 10;\n      arpeggioTime = floor(pow(1 - ps.arpSpeed, 2) * 20000 + 32);\n      if (ps.arpSpeed === 1)\n        arpeggioTime = 0;\n    }\n\n    initForRepeat();\n\n    // Waveform shape\n    var waveShape = parseInt(ps.shape);\n\n    // Filter\n    var fltw = pow(ps.lpf, 3) * 0.1;\n    var enableLowPassFilter = (ps.lpf != 1);\n    var fltw_d = 1 + ps.lpfSweep * 0.0001;\n    var fltdmp = 5 / (1 + pow(ps.lpfResonance, 2) * 20) * (0.01 + fltw);\n    if (fltdmp > 0.8)\n      fltdmp=0.8;\n    var flthp = pow(ps.hpf, 2) * 0.1;\n    var flthp_d = 1 + ps.hpfSweep * 0.0003;\n\n    // Vibrato\n    var vibratoSpeed = pow(ps.vibSpeed, 2) * 0.01;\n    var vibratoAmplitude = ps.vibDepth * 0.5;\n\n    // Envelope\n    var envelopeLength = [\n      floor(ps.attack * ps.attack * 100000),\n      floor(ps.sustain * ps.sustain * 100000),\n      floor(ps.decay * ps.decay * 100000)\n    ];\n    var envelopePunch = ps.punch;\n\n    // Flanger\n    var flangerOffset = pow(ps.flangerOffset, 2) * 1020;\n    if (ps.flangerOffset < 0)\n      flangerOffset = -flangerOffset;\n    var flangerOffsetSlide = pow(ps.flangerSweep, 2) * 1;\n    if (ps.flangerSweep < 0)\n      flangerOffsetSlide = -flangerOffsetSlide;\n\n    // Repeat\n    var repeatTime = floor(pow(1 - ps.repeatSpeed, 2) * 20000 + 32);\n    if (ps.repeatSpeed === 0)\n      repeatTime = 0;\n\n    var gain = pow(2, ps.vol) - 1;\n\n    var fltp = 0;\n    var fltdp = 0;\n    var fltphp = 0;\n\n    // TODO: Deterministic output! Don't randomize noise buffer here\n    var noise_buffer = [];\n    for (i = 0; i < 32; ++i)\n      noise_buffer[i] = random() * 2 - 1;\n\n    var envelopeStage = 0;\n    var envelopeElapsed = 0;\n\n    var vibratoPhase = 0;\n\n    var phase = 0;\n    var ipp = 0;\n    var flanger_buffer = [];\n    for (i = 0; i < 1024; ++i)\n      flanger_buffer[i] = 0;\n\n    var num_clipped = 0;\n\n    var buffer = [];\n\n    for(var t = 0; ; ++t) {\n\n      // Repeats\n      if (repeatTime !== 0 && ++elapsedSinceRepeat >= repeatTime)\n        initForRepeat();\n\n      // Arpeggio (single)\n      if(arpeggioTime !== 0 && t >= arpeggioTime) {\n        arpeggioTime = 0;\n        period *= arpeggioMultiplier;\n      }\n\n      // Frequency slide, and frequency slide slide!\n      periodMult += periodMultSlide;\n      period *= periodMult;\n      if(period > periodMax) {\n        period = periodMax;\n        if (enableFrequencyCutoff)\n          break;\n      }\n\n      // Vibrato\n      var rfperiod = period;\n      if (vibratoAmplitude > 0) {\n        vibratoPhase += vibratoSpeed;\n        rfperiod = period * (1 + m.sin(vibratoPhase) * vibratoAmplitude);\n      }\n      var iperiod = floor(rfperiod);\n      if (iperiod < OVERSAMPLING)\n        iperiod = OVERSAMPLING;\n\n      // Square wave duty cycle\n      dutyCycle += dutyCycleSlide;\n      if (dutyCycle < 0)\n        dutyCycle = 0;\n      if (dutyCycle > 0.5)\n        dutyCycle = 0.5;\n\n      // Volume envelope\n      if (++envelopeElapsed > envelopeLength[envelopeStage]) {\n        envelopeElapsed = 0;\n        if (++envelopeStage > 2)\n          break;\n      }\n      var env_vol;\n      var envf = envelopeElapsed / envelopeLength[envelopeStage];\n      if (envelopeStage === 0) {         // Attack\n        env_vol = envf;\n      } else if (envelopeStage === 1) {  // Sustain\n        env_vol = 1 + (1 - envf) * 2 * envelopePunch;\n      } else {                           // Decay\n        env_vol = 1 - envf;\n      }\n\n      // Flanger step\n      flangerOffset += flangerOffsetSlide;\n      var iphase = abs(floor(flangerOffset));\n      if (iphase > 1023)\n        iphase = 1023;\n\n      if (flthp_d !== 0) {\n        flthp *= flthp_d;\n        if (flthp < 0.00001)\n          flthp = 0.00001;\n        if (flthp > 0.1)\n          flthp = 0.1;\n      }\n\n      // 8x oversampling\n      var sample = 0;\n      for (var si = 0; si < OVERSAMPLING; ++si) {\n        var sub_sample = 0;\n        phase++;\n        if (phase >= iperiod) {\n          phase %= iperiod;\n          if (waveShape === NOISE)\n            for(var i = 0; i < 32; ++i)\n              noise_buffer[i] = random() * 2 - 1;\n        }\n\n        // Base waveform\n        var fp = phase / iperiod;\n        if (waveShape === SQUARE) {\n          if (fp < dutyCycle)\n            sub_sample=0.5;\n          else\n            sub_sample=-0.5;\n        } else if (waveShape === SAWTOOTH) {\n          if (fp < dutyCycle)\n            sub_sample = -1 + 2 * fp/dutyCycle;\n          else\n            sub_sample = 1 - 2 * (fp-dutyCycle)/(1-dutyCycle);\n        } else if (waveShape === SINE) {\n          sub_sample = m.sin(fp * 2 * m.PI);\n        } else if (waveShape === NOISE) {\n          sub_sample = noise_buffer[floor(phase * 32 / iperiod)];\n        } else {\n          throw \"ERROR: Bad wave type: \" + waveShape;\n        }\n\n        // Low-pass filter\n        var pp = fltp;\n        fltw *= fltw_d;\n        if (fltw < 0)\n          fltw = 0;\n        if (fltw > 0.1)\n          fltw = 0.1;\n        if (enableLowPassFilter) {\n          fltdp += (sub_sample - fltp) * fltw;\n          fltdp -= fltdp * fltdmp;\n        } else {\n          fltp = sub_sample;\n          fltdp = 0;\n        }\n        fltp += fltdp;\n\n        // High-pass filter\n        fltphp += fltp - pp;\n        fltphp -= fltphp * flthp;\n        sub_sample = fltphp;\n\n        // Flanger\n        flanger_buffer[ipp & 1023] = sub_sample;\n        sub_sample += flanger_buffer[(ipp - iphase + 1024) & 1023];\n        ipp = (ipp + 1) & 1023;\n\n        // final accumulation and envelope application\n        sample += sub_sample * env_vol;\n      }\n\n      sample = sample / OVERSAMPLING;\n      sample *= gain;\n\n      buffer.push(sample);\n    }\n\n    // Create buffer\n    var audioBuffer = audioContext.createBuffer(1, buffer.length || 1, sampleRate);\n    audioBuffer.getChannelData(0).set(new Float32Array(buffer));\n\n    return audioBuffer;\n  };\n\n  var Serializer = SFXZ.Serializer = require(\"./serializer\");\n  SFXZ.Params = Params;\n\n  return SFXZ;\n})();\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/params.coffee": {
      "path": "test/params.coffee",
      "content": "global.SFXZ = require \"../sfxz\"\n\nconsole.log SFXZ\n\nequalEnough = (a, b, precision=5) ->\n  console.log \"equalEnough\", a, b\n  assert.equal a.toFixed(precision), b.toFixed(precision)\n\nrand = Math.random\n\ndescribe \"SFXZ\", ->\n  it \"should expose Params\", ->\n    assert SFXZ.Params\n\n  it \"should expose Serializer\", ->\n    assert SFXZ.Serializer\n\n  describe \"Serialization\", ->\n    it \"should serialize and deserialize\", ->\n      {Params, Serializer} = SFXZ\n      {serialize, deserialize} = Serializer\n\n      p1 = new Params\n      # Randomize values\n      Object.keys(p1).forEach (key, i) ->\n        if i > 0\n          p1[key] = rand()\n\n      buffer = serialize p1\n\n      assert.equal buffer.byteLength, 100\n\n      p2 = deserialize(buffer, new Params)\n\n      Object.keys(p1).forEach (key, i) ->\n        if i > 0\n          equalEnough p1[key], p2[key]\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"name\":\"SFXZ\",\"version\":\"0.3.0\",\"entryPoint\":\"sfxz\",\"publish\":{\"s3\":{\"basePath\":\"public/danielx.net\"}}};",
      "type": "blob"
    },
    "serializer": {
      "path": "serializer",
      "content": "(function() {\n  var VERSION;\n\n  VERSION = 1;\n\n  module.exports = {\n    serialize: function(params) {\n      var buffer, dataView;\n      buffer = new ArrayBuffer(100);\n      dataView = new DataView(buffer);\n      Object.keys(params).forEach(function(key, i) {\n        var param;\n        param = params[key];\n        if (i === 0) {\n          \"fxz\".split(\"\").forEach(function(s, n) {\n            return dataView.setUint8(n, s.charCodeAt(0));\n          });\n          dataView.setUint8(3, VERSION);\n          return dataView.setUint8(4, param);\n        } else {\n          return dataView.setFloat32((i + 1) * 4, param, true);\n        }\n      });\n      return buffer;\n    },\n    deserialize: function(buffer, params) {\n      var dataView;\n      dataView = new DataView(buffer);\n      Object.keys(params).forEach(function(key, i) {\n        var version;\n        if (i === 0) {\n          \"fxz\".split(\"\").forEach(function(s, n) {\n            var charCode;\n            charCode = s.charCodeAt(0);\n            if (charCode !== dataView.getUint8(n)) {\n              throw new Error(\"Unknown file format: expected '\" + s + \"' (\" + charCode + \") at byte \" + n);\n            }\n          });\n          version = dataView.getUint8(3);\n          if (version !== VERSION) {\n            throw new Error(\"Unknown version '\" + version + \"': expected 1\");\n          }\n          return params[key] = dataView.getUint8(4);\n        } else {\n          return params[key] = dataView.getFloat32((i + 1) * 4, true);\n        }\n      });\n      return params;\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "sfxz": {
      "path": "sfxz",
      "content": "// Synthesize an AudioBuffer from the param data\nmodule.exports = (function() {\n  // Sound generation parameters are on [0,1] unless noted SIGNED & thus on [-1,1]\n  function Params() {\n    // Wave shape\n    this.shape = 0;\n\n    // Envelope\n    this.attack = 0;    // Attack time\n    this.sustain = 0.3; // Sustain time\n    this.punch = 0;     // Sustain punch\n    this.decay = 0.4;   // Decay time\n\n    // Tone\n    this.freq = 0.3;    // Start frequency\n    this.freqLimit = 0;   // Min frequency cutoff\n    this.freqSlide = 0;    // Slide (SIGNED)\n    this.freqSlideDelta = 0;   // Delta slide (SIGNED)\n    // Vibrato\n    this.vibDepth = 0; // Vibrato depth\n    this.vibSpeed = 0;    // Vibrato speed\n\n    // Tonal change\n    this.arpMod = 0;      // Change amount (SIGNED)\n    this.arpSpeed = 0;    // Change speed\n\n    // Square wave duty (proportion of time signal is high vs. low)\n    this.duty = 0;         // Square duty\n    this.dutySweep = 0;    // Duty sweep (SIGNED)\n\n    // Repeat\n    this.repeatSpeed = 0; // Repeat speed\n\n    // Flanger\n    this.flangerOffset = 0;   // Flanger offset (SIGNED)\n    this.flangerSweep = 0;     // Flanger sweep (SIGNED)\n\n    // Low-pass filter\n    this.lpf = 1;     // Low-pass filter cutoff\n    this.lpfSweep = 0;     // Low-pass filter cutoff sweep (SIGNED)\n    this.lpfResonance = 0;// Low-pass filter resonance\n    // High-pass filter\n    this.hpf = 0;     // High-pass filter cutoff\n    this.hpfSweep = 0;     // High-pass filter cutoff sweep (SIGNED)\n\n    // Sample parameters\n    this.vol = 0.5;\n  }\n\n  function SFXZ(ps, audioContext) {\n    // Handle binary format\n    if (ps instanceof ArrayBuffer) {\n      ps = Serializer.deserialize(ps, new Params());\n    }\n\n    var m = Math;\n    var floor = m.floor,\n      pow = m.pow,\n      abs = m.abs,\n      random = m.random;\n\n    var SQUARE = 0,\n      SAWTOOTH = 1,\n      SINE = 2,\n      NOISE = 3,\n      OVERSAMPLING = 8,\n      sampleRate = 44100;\n\n    var i,\n      elapsedSinceRepeat,\n      period,\n      periodMax,\n      enableFrequencyCutoff,\n      periodMult,\n      periodMultSlide,\n      dutyCycle,\n      dutyCycleSlide,\n      arpeggioMultiplier,\n      arpeggioTime;\n\n    function initForRepeat() {\n      elapsedSinceRepeat = 0;\n\n      period = 100 / (ps.freq * ps.freq + 0.001);\n      periodMax = 100 / (ps.freqLimit * ps.freqLimit + 0.001);\n      enableFrequencyCutoff = (ps.freqLimit > 0);\n      periodMult = 1 - pow(ps.freqSlide, 3) * 0.01;\n      periodMultSlide = -pow(ps.freqSlideDelta, 3) * 0.000001;\n\n      dutyCycle = 0.5 - ps.duty * 0.5;\n      dutyCycleSlide = -ps.dutySweep * 0.00005;\n\n      if (ps.arpMod >= 0)\n        arpeggioMultiplier = 1 - pow(ps.arpMod, 2) * 0.9;\n      else\n        arpeggioMultiplier = 1 + pow(ps.arpMod, 2) * 10;\n      arpeggioTime = floor(pow(1 - ps.arpSpeed, 2) * 20000 + 32);\n      if (ps.arpSpeed === 1)\n        arpeggioTime = 0;\n    }\n\n    initForRepeat();\n\n    // Waveform shape\n    var waveShape = parseInt(ps.shape);\n\n    // Filter\n    var fltw = pow(ps.lpf, 3) * 0.1;\n    var enableLowPassFilter = (ps.lpf != 1);\n    var fltw_d = 1 + ps.lpfSweep * 0.0001;\n    var fltdmp = 5 / (1 + pow(ps.lpfResonance, 2) * 20) * (0.01 + fltw);\n    if (fltdmp > 0.8)\n      fltdmp=0.8;\n    var flthp = pow(ps.hpf, 2) * 0.1;\n    var flthp_d = 1 + ps.hpfSweep * 0.0003;\n\n    // Vibrato\n    var vibratoSpeed = pow(ps.vibSpeed, 2) * 0.01;\n    var vibratoAmplitude = ps.vibDepth * 0.5;\n\n    // Envelope\n    var envelopeLength = [\n      floor(ps.attack * ps.attack * 100000),\n      floor(ps.sustain * ps.sustain * 100000),\n      floor(ps.decay * ps.decay * 100000)\n    ];\n    var envelopePunch = ps.punch;\n\n    // Flanger\n    var flangerOffset = pow(ps.flangerOffset, 2) * 1020;\n    if (ps.flangerOffset < 0)\n      flangerOffset = -flangerOffset;\n    var flangerOffsetSlide = pow(ps.flangerSweep, 2) * 1;\n    if (ps.flangerSweep < 0)\n      flangerOffsetSlide = -flangerOffsetSlide;\n\n    // Repeat\n    var repeatTime = floor(pow(1 - ps.repeatSpeed, 2) * 20000 + 32);\n    if (ps.repeatSpeed === 0)\n      repeatTime = 0;\n\n    var gain = pow(2, ps.vol) - 1;\n\n    var fltp = 0;\n    var fltdp = 0;\n    var fltphp = 0;\n\n    // TODO: Deterministic output! Don't randomize noise buffer here\n    var noise_buffer = [];\n    for (i = 0; i < 32; ++i)\n      noise_buffer[i] = random() * 2 - 1;\n\n    var envelopeStage = 0;\n    var envelopeElapsed = 0;\n\n    var vibratoPhase = 0;\n\n    var phase = 0;\n    var ipp = 0;\n    var flanger_buffer = [];\n    for (i = 0; i < 1024; ++i)\n      flanger_buffer[i] = 0;\n\n    var num_clipped = 0;\n\n    var buffer = [];\n\n    for(var t = 0; ; ++t) {\n\n      // Repeats\n      if (repeatTime !== 0 && ++elapsedSinceRepeat >= repeatTime)\n        initForRepeat();\n\n      // Arpeggio (single)\n      if(arpeggioTime !== 0 && t >= arpeggioTime) {\n        arpeggioTime = 0;\n        period *= arpeggioMultiplier;\n      }\n\n      // Frequency slide, and frequency slide slide!\n      periodMult += periodMultSlide;\n      period *= periodMult;\n      if(period > periodMax) {\n        period = periodMax;\n        if (enableFrequencyCutoff)\n          break;\n      }\n\n      // Vibrato\n      var rfperiod = period;\n      if (vibratoAmplitude > 0) {\n        vibratoPhase += vibratoSpeed;\n        rfperiod = period * (1 + m.sin(vibratoPhase) * vibratoAmplitude);\n      }\n      var iperiod = floor(rfperiod);\n      if (iperiod < OVERSAMPLING)\n        iperiod = OVERSAMPLING;\n\n      // Square wave duty cycle\n      dutyCycle += dutyCycleSlide;\n      if (dutyCycle < 0)\n        dutyCycle = 0;\n      if (dutyCycle > 0.5)\n        dutyCycle = 0.5;\n\n      // Volume envelope\n      if (++envelopeElapsed > envelopeLength[envelopeStage]) {\n        envelopeElapsed = 0;\n        if (++envelopeStage > 2)\n          break;\n      }\n      var env_vol;\n      var envf = envelopeElapsed / envelopeLength[envelopeStage];\n      if (envelopeStage === 0) {         // Attack\n        env_vol = envf;\n      } else if (envelopeStage === 1) {  // Sustain\n        env_vol = 1 + (1 - envf) * 2 * envelopePunch;\n      } else {                           // Decay\n        env_vol = 1 - envf;\n      }\n\n      // Flanger step\n      flangerOffset += flangerOffsetSlide;\n      var iphase = abs(floor(flangerOffset));\n      if (iphase > 1023)\n        iphase = 1023;\n\n      if (flthp_d !== 0) {\n        flthp *= flthp_d;\n        if (flthp < 0.00001)\n          flthp = 0.00001;\n        if (flthp > 0.1)\n          flthp = 0.1;\n      }\n\n      // 8x oversampling\n      var sample = 0;\n      for (var si = 0; si < OVERSAMPLING; ++si) {\n        var sub_sample = 0;\n        phase++;\n        if (phase >= iperiod) {\n          phase %= iperiod;\n          if (waveShape === NOISE)\n            for(var i = 0; i < 32; ++i)\n              noise_buffer[i] = random() * 2 - 1;\n        }\n\n        // Base waveform\n        var fp = phase / iperiod;\n        if (waveShape === SQUARE) {\n          if (fp < dutyCycle)\n            sub_sample=0.5;\n          else\n            sub_sample=-0.5;\n        } else if (waveShape === SAWTOOTH) {\n          if (fp < dutyCycle)\n            sub_sample = -1 + 2 * fp/dutyCycle;\n          else\n            sub_sample = 1 - 2 * (fp-dutyCycle)/(1-dutyCycle);\n        } else if (waveShape === SINE) {\n          sub_sample = m.sin(fp * 2 * m.PI);\n        } else if (waveShape === NOISE) {\n          sub_sample = noise_buffer[floor(phase * 32 / iperiod)];\n        } else {\n          throw \"ERROR: Bad wave type: \" + waveShape;\n        }\n\n        // Low-pass filter\n        var pp = fltp;\n        fltw *= fltw_d;\n        if (fltw < 0)\n          fltw = 0;\n        if (fltw > 0.1)\n          fltw = 0.1;\n        if (enableLowPassFilter) {\n          fltdp += (sub_sample - fltp) * fltw;\n          fltdp -= fltdp * fltdmp;\n        } else {\n          fltp = sub_sample;\n          fltdp = 0;\n        }\n        fltp += fltdp;\n\n        // High-pass filter\n        fltphp += fltp - pp;\n        fltphp -= fltphp * flthp;\n        sub_sample = fltphp;\n\n        // Flanger\n        flanger_buffer[ipp & 1023] = sub_sample;\n        sub_sample += flanger_buffer[(ipp - iphase + 1024) & 1023];\n        ipp = (ipp + 1) & 1023;\n\n        // final accumulation and envelope application\n        sample += sub_sample * env_vol;\n      }\n\n      sample = sample / OVERSAMPLING;\n      sample *= gain;\n\n      buffer.push(sample);\n    }\n\n    // Create buffer\n    var audioBuffer = audioContext.createBuffer(1, buffer.length || 1, sampleRate);\n    audioBuffer.getChannelData(0).set(new Float32Array(buffer));\n\n    return audioBuffer;\n  };\n\n  var Serializer = SFXZ.Serializer = require(\"./serializer\");\n  SFXZ.Params = Params;\n\n  return SFXZ;\n})();\n",
      "type": "blob"
    },
    "test/params": {
      "path": "test/params",
      "content": "(function() {\n  var equalEnough, rand;\n\n  global.SFXZ = require(\"../sfxz\");\n\n  console.log(SFXZ);\n\n  equalEnough = function(a, b, precision) {\n    if (precision == null) {\n      precision = 5;\n    }\n    console.log(\"equalEnough\", a, b);\n    return assert.equal(a.toFixed(precision), b.toFixed(precision));\n  };\n\n  rand = Math.random;\n\n  describe(\"SFXZ\", function() {\n    it(\"should expose Params\", function() {\n      return assert(SFXZ.Params);\n    });\n    it(\"should expose Serializer\", function() {\n      return assert(SFXZ.Serializer);\n    });\n    return describe(\"Serialization\", function() {\n      return it(\"should serialize and deserialize\", function() {\n        var Params, Serializer, buffer, deserialize, p1, p2, serialize;\n        Params = SFXZ.Params, Serializer = SFXZ.Serializer;\n        serialize = Serializer.serialize, deserialize = Serializer.deserialize;\n        p1 = new Params;\n        Object.keys(p1).forEach(function(key, i) {\n          if (i > 0) {\n            return p1[key] = rand();\n          }\n        });\n        buffer = serialize(p1);\n        assert.equal(buffer.byteLength, 100);\n        p2 = deserialize(buffer, new Params);\n        return Object.keys(p1).forEach(function(key, i) {\n          if (i > 0) {\n            return equalEnough(p1[key], p2[key]);\n          }\n        });\n      });\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "config": {
    "name": "SFXZ",
    "version": "0.3.0",
    "entryPoint": "sfxz",
    "publish": {
      "s3": {
        "basePath": "public/danielx.net"
      }
    }
  },
  "version": "0.3.0",
  "entryPoint": "sfxz",
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/sfxz",
    "homepage": "http://grumdrig.github.com/jsfxr/",
    "description": "Simple and efficient sound effects generator. A port of sfxr to HTML5.",
    "html_url": "https://github.com/STRd6/sfxz",
    "url": "https://api.github.com/repos/STRd6/sfxz",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});