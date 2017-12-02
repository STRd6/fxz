FXZ
===

A recreation of sfxr. Wish me luck! All credit for the synth goes to [Dr. Petter](http://www.drpetter.se/project_sfxr.html),
I just ported a port and wrote down a binary format :)

Goals
-----

- [ ] An embeddable synthesizer in < 1kb js (minified and gzipped)
- [x] A binary format for saving and loading effects in 100 bytes
- [ ] Synth implementations in common languages (C, C#, Java, Lua, etc.)

FXZ Binary Format Specification
-------------------------------

FXZ data is 100 bytes long. All multi-byte numeric types are little endian.

| Offset | Size | Type    | Field            | Range  |
|--------|------|---------|------------------|--------|
|  0     | 3    | ascii   | Magic Number     | 'fxz'  |
|  3     | 1    | uint8   | version          | 1      |
|  4     | 1    | uint8   | wave shape       | 0-3    |
|  5     | 3    | -       | unused           | 0      |
|  8     | 4    | float32 | attack time      | [ 0,1] |
| 12     | 4    | float32 | sustain time     | [ 0,1] |
| 16     | 4    | float32 | sustain punch    | [ 0,1] |
| 20     | 4    | float32 | decay time       | [ 0,1] |
| 24     | 4    | float32 | start frequency  | [ 0,1] |
| 28     | 4    | float32 | frequency cutoff | [ 0,1] |
| 32     | 4    | float32 | frequency slide  | [-1,1] |
| 36     | 4    | float32 | delta slide      | [-1,1] |
| 40     | 4    | float32 | vibrato depth    | [ 0,1] |
| 44     | 4    | float32 | vibrato speed    | [ 0,1] |
| 48     | 4    | float32 | arp amount       | [-1,1] |
| 52     | 4    | float32 | arp change speed | [ 0,1] |
| 56     | 4    | float32 | Square duty      | [ 0,1] |
| 60     | 4    | float32 | Duty sweep       | [-1,1] |
| 64     | 4    | float32 | Repeat speed     | [ 0,1] |
| 68     | 4    | float32 | Flanger offset   | [-1,1] |
| 72     | 4    | float32 | Flanger sweep    | [-1,1] |
| 76     | 4    | float32 | LPF cutoff       | [ 0,1] |
| 80     | 4    | float32 | LPF cutoff sweep | [-1,1] |
| 84     | 4    | float32 | LPF resonance    | [ 0,1] |
| 88     | 4    | float32 | HPF cutoff       | [ 0,1] |
| 92     | 4    | float32 | HPF cutoff sweep | [-1,1] |
| 96     | 4    | float32 | Volume           | [ 0,1] |

Recommended MIME type `application/fxz`.

Recommended file extension `.fxz`.

FXP Binary Format Specification
-------------------------------

FXP is an FXZ Pack. It can contain up to uint32max entries. The size of the
pack is `8 + 116 * numberOfEntries` bytes. It adds 16 byte identifiers to each
entry so they can be named. If you want them nameless to save those bytes you
can glob up fxz data, just smash them all together, I don't think it warrants a
formal specification.

All multi-byte numeric types are little endian.

| Offset | Size | Type    | Field            | Range        |
|--------|------|---------|------------------|--------------|
|  0     | 3    | ascii   | Magic Number     | 'fxp'        |
|  3     | 1    | uint8   | version          | 1            |
|  4     | 4    | uint32  | # of entries     | 0-4294967295 |
|  *     | 16   | ascii   | fxz entry name   |              |
|  *+16  | 100  | fxz     | fxz entry data   | valid fxz    |

`* = 8 + n * 116` where `n = [0, 1, ..., numberOfEntries-1]`

Recommended MIME type `application/fxp`.

Recommended file extension `.fxp`.

Status
------

Currently in beta. I want to review the synth and see if I can adjust the params
to reduce the amount that create empty or "bad" sounds. Juice the most
information out of those bits!

I also want to investigate using the full float32 range or expanding the
recommended range and see what impact that will have, but I need to learn more
about how the synth operates to be sure. This could also involve humanizing the
units somewhat but it will require learning a lot more about the internals of
the synthesis.

Glossary
------

- freq: frequency
- LPF: Low pass filter
- vol: Volume
