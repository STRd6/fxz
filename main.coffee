ApplicationTemplate = require "./templates/application"
global.SFXR = require "./sfxr"

{Params, SoundEffect} = SFXR

params = new Params

audio = document.createElement "audio"

createAndPlay = (type) ->
  params = new Params
  params[type]()

  sfx = new SoundEffect(params).generate()

  audio.src = sfx.dataURI
  audio.play()

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
