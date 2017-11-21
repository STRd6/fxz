ApplicationTemplate = require "./templates/application"

Params = require "./params"
SoundEffect = require "./sfx"

params = new Params

audioContext = new AudioContext

createAndPlay = (type) ->
  params = new Params
  params[type]()

  # Generate audio data
  sfx = new SoundEffect(params)
  audioBuffer = sfx.generate(audioContext)

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
