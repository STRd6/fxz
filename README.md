SFXZ
====

A recreation of sfxr. Wish me luck!


Goals
-----

- An embeddable synthesizer in < 1kb js (minified and gzipped)
- A binary format for saving and loading effects in ~100 bytes

SFXZ Binary Format Specification

| Offset | Size | Type    | Field            | Range  |
|--------|------|---------|------------------|--------|
|  0     | 3    | ascii   | Magic Number     | 'fxz'  |
|  3     | 1    | uint8   | version          | 1      |
|  4     | 1    | uint8   | wave shape       | 0-3    |
|  5     | 3    | -       | unused           | 0      |
|  8     | 4    | float32 | attack time      | [0,1]  |
| 12     | 4    | float32 | sustain time     | [0,1]  |
| 16     | 4    | float32 | sustain punch    | [0,1]  |
| 20     | 4    | float32 | decay time       | [0,1]  |
| 24     | 4    | float32 | start frequency  | [0,1]  |
| 28     | 4    | float32 | frequency cutoff | [0,1]  |
| 32     | 4    | float32 | frequency slide  | [-1,1] |
| 36     | 4    | float32 | delta slide      | [-1,1] |
| 40     | 4    | float32 | vibrato depth    | [0,1]  |
| 44     | 4    | float32 | vibrato speed    | [0,1]  |
| 48     | 4    | float32 | arp amount       | [-1,1] |
| 52     | 4    | float32 | arp change speed | [0,1]  |
| 56     | 4    | float32 | Square duty      | [0,1]  |
| 60     | 4    | float32 | Duty sweep       | [-1,1] |
| 64     | 4    | float32 | Repeat speed     | [0,1]  |

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


Status
------
