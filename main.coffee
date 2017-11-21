ApplicationTemplate = require "./templates/application"
global.SFXR = require "./sfxr"

{Params, SoundEffect} = SFXR

params = new Params

audioContext = new AudioContext

createAndPlay = (type) ->
  params = new Params
  params[type]()

  # Generate audio data
  sfx = new SoundEffect(params)
  float32Array = sfx.generate()

  # Create buffer
  audioBuffer = audioContext.createBuffer(1, float32Array.length, sfx.sampleRate)
  channelData = audioBuffer.getChannelData(0)
  channelData.set float32Array

  # Play buffer
  node = new AudioBufferSourceNode audioContext,
    buffer: audioBuffer
  node.connect audioContext.destination
  node.start()

document.body.appendChild ApplicationTemplate
  coin: ->
    createAndPlay("pickupCoin")

  laser: ->
    createAndPlay("laserShoot")

  explosion: ->
    createAndPlay("explosion")

  powerUp: ->
    createAndPlay("powerUp")

  hit: ->
    createAndPlay("hitHurt")

  jump: ->
    createAndPlay("jump")

  blip: ->
    createAndPlay("blipSelect")

  tone: ->
    createAndPlay("tone")
