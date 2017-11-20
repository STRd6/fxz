/*
 * RIFFWAVE.js v0.02 - Audio encoder for HTML5 <audio> elements.
 * Copyright (C) 2011 Pedro Ladaria <pedro.ladaria at Gmail dot com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 *
 * Changelog:
 *
 * 0.01 - First release
 * 0.02 - New faster base64 encoding
 * 0.03 - Blob URLs
 * 
 */

var RIFFWAVE = function(data) {

  this.data = [];        // Byte array containing audio samples
  this.wav = [];         // Array containing the generated wave file
  this.dataURI = '';     // http://en.wikipedia.org/wiki/Data_URI_scheme

  this.header = {                         // OFFS SIZE NOTES
    chunkId      : [0x52,0x49,0x46,0x46], // 0    4    "RIFF" = 0x52494646
    chunkSize    : 0,                     // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
    format       : [0x57,0x41,0x56,0x45], // 8    4    "WAVE" = 0x57415645
    subChunk1Id  : [0x66,0x6d,0x74,0x20], // 12   4    "fmt " = 0x666d7420
    subChunk1Size: 16,                    // 16   4    16 for PCM
    audioFormat  : 1,                     // 20   2    PCM = 1
    numChannels  : 1,                     // 22   2    Mono = 1, Stereo = 2, etc.
    sampleRate   : 8000,                  // 24   4    8000, 44100, etc
    byteRate     : 0,                     // 28   4    SampleRate*NumChannels*BitsPerSample/8
    blockAlign   : 0,                     // 32   2    NumChannels*BitsPerSample/8
    bitsPerSample: 8,                     // 34   2    8 bits = 8, 16 bits = 16, etc...
    subChunk2Id  : [0x64,0x61,0x74,0x61], // 36   4    "data" = 0x64617461
    subChunk2Size: 0                      // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
  };

  function u32ToArray(i) { return [i&0xFF, (i>>8)&0xFF, (i>>16)&0xFF, (i>>24)&0xFF]; }

  function u16ToArray(i) { return [i&0xFF, (i>>8)&0xFF]; }

  this.Make = function(data) {
    if (data instanceof Array) this.data = data;
    this.header.byteRate = (this.header.sampleRate * this.header.numChannels * this.header.bitsPerSample) >> 3;
    this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3;
    this.header.subChunk2Size = this.data.length;
    this.header.chunkSize = 36 + this.header.subChunk2Size;

    this.wav = this.header.chunkId.concat(
      u32ToArray(this.header.chunkSize),
      this.header.format,
      this.header.subChunk1Id,
      u32ToArray(this.header.subChunk1Size),
      u16ToArray(this.header.audioFormat),
      u16ToArray(this.header.numChannels),
      u32ToArray(this.header.sampleRate),
      u32ToArray(this.header.byteRate),
      u16ToArray(this.header.blockAlign),
      u16ToArray(this.header.bitsPerSample),
      this.header.subChunk2Id,
      u32ToArray(this.header.subChunk2Size),
      this.data
    );

    var dat = Uint8Array.from(this.wav);
    var blob = new Blob([dat], {type: "audio/wav"});
    var url = URL.createObjectURL(blob);
    this.dataURI = url;
  };

  if (data instanceof Array) this.Make(data);

}; // end RIFFWAVE


if (typeof exports != 'undefined')  // For node.js
  exports.RIFFWAVE = RIFFWAVE;
