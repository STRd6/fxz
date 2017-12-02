global.FXZ = require "../fxz"

console.log FXZ

equalEnough = (a, b, precision=5) ->
  console.log "equalEnough", a, b
  assert.equal a.toFixed(precision), b.toFixed(precision)

rand = Math.random

describe "FXZ", ->
  it "should expose Params", ->
    assert FXZ.Params

  it "should expose Serializer", ->
    assert FXZ.Serializer

  describe "Serialization", ->
    it "should serialize and deserialize", ->
      {Params, Serializer} = FXZ
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
