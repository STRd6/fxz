ApplicationTemplate = require "./templates/application"
global.SFXR = require "./sfxr"

{Params, SoundEffect} = SFXR

params = new Params

audio = document.createElement "audio"

document.body.appendChild ApplicationTemplate
  generate: ->
    params.pickupCoin()
    sfx = new SoundEffect(params).generate()

    audio.src = sfx.dataURI

    audio.play()
