global.SFXZ = require "../sfxz"

console.log SFXZ

equalEnough = (a, b, precision=5) ->
  console.log "equalEnough", a, b
  assert.equal a.toFixed(precision), b.toFixed(precision)

rand = Math.random

describe "SFXZ", ->
  it "should expose Params", ->
    assert SFXZ.Params

  it "should expose Serializer", ->
    assert SFXZ.Serializer

  describe "Serialization", ->
    it "should serialize and deserialize", ->
      {Params, Serializer} = SFXZ
      {serialize, deserialize} = Serializer

      p1 = new Params
      # Randomize values
      Object.keys(p1).forEach (key, i) ->
        if i > 0
          p1[key] = rand()

      buffer = serialize p1

      assert.equal buffer.byteLength, 100

      p2 = deserialize(buffer, new Params)

      Object.keys(p1).forEach (key, i) ->
        if i > 0
          equalEnough p1[key], p2[key]
