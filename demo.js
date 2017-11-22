
var PARAMS;
var SOUND;
var vol = 0.25;
var SAMPLE_RATE = 44100;
var SAMPLE_SIZE = 8;

Params.prototype.query = function () {
  var result = "";
  var that = this;
  $.each(this, function (key,value) {
    if (that.hasOwnProperty(key))
      result += "&" + key + "=" + value;
  });
  return result.substring(1);
};

function gen(fx) {
  PARAMS = new Params();
  PARAMS.vol = vol;
  PARAMS.sample_rate = SAMPLE_RATE;
  PARAMS.sample_size = SAMPLE_SIZE;
  PARAMS[fx]();
  $("#wav").text(fx + ".wav");
  updateUi();
  play();
}

function mut() {
  PARAMS.mutate();
  updateUi();
  play();
}

function play(noregen) {
  setTimeout(function () {
    var audio = new Audio();
    if (!noregen) {
      SOUND = new SoundEffect(PARAMS).generate();
      $("#file_size").text(Math.round(SOUND.wav.length / 1024) + "kB");
      $("#num_samples").text(SOUND.header.subChunk2Size /
                             (SOUND.header.bitsPerSample >> 3));
      $("#clipping").text(SOUND.clipping);
    }
    audio.src = SOUND.dataURI;
    $("#wav").attr("href", SOUND.dataURI);
    $("#sfx").attr("href", "sfx.wav?" + PARAMS.query());
    audio.play();
  }, 0);
}

function disenable() {
  var duty = PARAMS.shape == SQUARE || PARAMS.shape == SAWTOOTH;
  $("#duty").slider("option", "disabled", !duty);
  $("#dutySweep").slider("option", "disabled", !duty);
}

function updateUi() {
  $.each(PARAMS, function (param, value) {
    if (param == "shape") {
      $("#shape input:radio[value=" + value + "]").
        prop('checked', true).button("refresh");
    } else if (param == "sample_rate") {
      $("#hz input:radio[value=" + value + "]").
        prop('checked', true).button("refresh");
    } else if (param == "sample_size") {
      $("#bits input:radio[value=" + value + "]").
        prop('checked', true).button("refresh");
    } else {
      var id = "#" + param;
      $(id).slider("value", 1000 * value);
      $(id).each(function(){convert(this, PARAMS[this.id]);});
    }
  });
  disenable();
}


$(function() {
  $("#shape").buttonset();
  $("#hz").buttonset();
  $("#bits").buttonset();
  $("#shape input:radio").change(function (event) {
    PARAMS.shape = parseInt(event.target.value);
    disenable();
    play();
  });
  $("#hz input:radio").change(function (event) {
    SAMPLE_RATE = PARAMS.sample_rate = parseInt(event.target.value);
    play();
  });
  $("#bits input:radio").change(function (event) {
    SAMPLE_SIZE = PARAMS.sample_size = parseInt(event.target.value);
    play();
  });
  $("button").button();
  $(".slider").slider({
    value: 1000,
    min: 0,
    max: 1000,
    slide: function (event, ui) {
      convert(event.target, ui.value / 1000.0);
    },
    change: function(event, ui) {
      if (event.originalEvent) {
        PARAMS[event.target.id] = ui.value / 1000.0;
        convert(event.target, PARAMS[event.target.id]);
        play();
      }
    }
  });
  $(".slider").filter(".signed").
    slider("option", "min", -1000).
    slider("value", 0);
  $('.slider').each(function () {
      var is = this.id;
      if (!$('label[for="' + is + '"]').length)
        $(this).parent().parent().find('th').append($('<label>',
                                                      {for: is}));
    });

  var UNITS = {
    attack:  function (v) { return (v / 44100).toPrecision(4) + ' sec' },
    sustain: function (v) { return (v / 44100).toPrecision(4) + ' sec' },
    punch:   function (v) { return '+' + (v * 100).toPrecision(4) + '%'},
    decay:   function (v) { return (v / 44100).toPrecision(4) + ' sec' },

    freq:  'Hz',
    freqLimit: 'Hz',
    freqSlide:  function (v) {
      return (44100*Math.log(v)/Math.log(0.5)).toPrecision(4) + ' 8va/sec'; },
    freqSlideDelta: function (v) {
      return (v*44100 / Math.pow(2, -44101/44100)).toPrecision(4) +
        ' 8va/sec^2?'; },

    vibSpeed:    function (v) { return v === 0 ? 'OFF' :
                                   (441000/64 * v).toPrecision(4) + ' Hz'},
    vibDepth: function (v) { return v === 0 ? 'OFF' :
                                   '&plusmn; ' + (v*100).toPrecision(4) + '%' },

    arpMod:   function (v) { return ((v === 1) ? 'OFF' :
                                        'x ' + (1/v).toPrecision(4)) },
    arpSpeed: function (v) { return (v === 0 ? 'OFF' :
                                        (v / 44100).toPrecision(4) +' sec') },

    duty:      function (v) { return (100 * v).toPrecision(4) + '%'; },
    dutySweep: function (v) { return (8 * 44100 * v).toPrecision(4) +'%/sec'},

    repeatSpeed: function (v) { return v === 0 ? 'OFF' :
                                   (44100/v).toPrecision(4) + ' Hz' },

    flangerOffset: function (v) { return v === 0 ? 'OFF' :
                                 (1000*v/44100).toPrecision(4) + ' msec' },
    // Not so sure about this:
    flangerSweep:   function (v) { return v === 0 ? 'OFF' :
                 (1000*v).toPrecision(4) + ' msec/sec' },

    lpf:   function (v) {
      return (v === 0.1) ? 'OFF' : Math.round(8 * 44100 * v / (1-v)) + ' Hz'; },
    lpfSweep:  function (v) {  if (v === 1) return 'OFF';
      return Math.pow(v, 44100).toPrecision(4) + ' ^sec'; },
    lpfResonance: function (v) { return (100*(1-v*0.11)).toPrecision(4)+'%';},

    hpf:   function (v) {
      return (v === 0) ? 'OFF' : Math.round(8 * 44100 * v / (1-v)) + ' Hz'; },
    hpfSweep: function (v) {  if (v === 1) return 'OFF';
      return Math.pow(v, 44100).toPrecision(4) + ' ^sec'; },

    vol: function (v) {
      v = 10 * Math.log(v*v) / Math.log(10);
      var sign = v >= 0 ? '+' : '';
      return sign + v.toPrecision(4) + ' dB';
    }
  };

  var CONVERSIONS = {
    attack:  function (v) { return v * v * 100000.0 },
    sustain: function (v) { return v * v * 100000.0 },
    punch:   function (v) { return v },
    decay:   function (v) { return v * v * 100000.0 },

    freq:  function (v) { return 8 * 44100 * (v * v + 0.001) / 100 },
    freqLimit: function (v) { return 8 * 44100 * (v * v + 0.001) / 100 },
    freqSlide:  function (v) { return 1.0 - Math.pow(v, 3.0) * 0.01 },
    freqSlideDelta: function (v) { return -Math.pow(v, 3.0) * 0.000001 },

    vibSpeed:    function (v) { return Math.pow(v, 2.0) * 0.01 },
    vibDepth: function (v) { return v * 0.5 },

    arpMod:   function (v) {
      return v >= 0 ? 1.0 - Math.pow(v, 2) * 0.9 : 1.0 + Math.pow(v, 2) * 10; },
    arpSpeed: function (v) { return (v === 1.0) ? 0 :
                                Math.floor(Math.pow(1.0 - v, 2.0) * 20000 +32)},

    duty:      function (v) { return 0.5 - v * 0.5; },
    dutySweep: function (v) { return -v * 0.00005 },

    repeatSpeed: function (v) { return (v === 0) ? 0 :
                                   Math.floor(Math.pow(1-v, 2) * 20000) + 32 },

    flangerOffset: function (v) { return (v < 0 ? -1 : 1) * Math.pow(v,2)*1020 },
    flangerSweep:   function (v) { return (v < 0 ? -1 : 1) * Math.pow(v,2) },

    lpf:   function (v) { return Math.pow(v, 3) * 0.1 },
    lpfSweep:   function (v) { return 1.0 + v * 0.0001 },
    lpfResonance: function (v) { return 5.0 / (1.0 + Math.pow(v, 2) * 20) }, // * (0.01 + fltw);

    hpf: function (v) { return Math.pow(v, 2) * 0.1 },
    hpfSweep: function (v) { return 1.0 + v * 0.0003 },

    vol: function (v) { return Math.exp(v) - 1; }
  };
  for (var p in CONVERSIONS) {
    var control = $('#' + p)[0];
    control.convert = CONVERSIONS[p];
    control.units = UNITS[p];
  }

  gen("pickupCoin");
});

function convert(control, v) {
  if (control.convert) {
    v = control.convert(v);
    control.convertedValue = v;
    if (typeof control.units === 'function')
      v = control.units(v);
    else
      v = v.toPrecision(4) + ' ' + control.units;
    $('label[for="' + control.id + '"]').html(v);
  }
}
