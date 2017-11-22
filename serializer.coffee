module.exports =
  serialize: (params) ->
    buffer = new ArrayBuffer(100)

    dataView = new DataView(buffer)

    Object.keys(params).forEach (key, i) ->
      param = params[key]
      if i is 0
        # 4 byte sfxz header
        "fxz".split("").forEach (s, n) ->
          dataView.setUint8(n, s.charCodeAt(0))
        # version
        dataView.setUint8(3, 1)
        # byte 4 shape
        dataView.setUint8(4, param)
        # bytes 5, 6, 7 unused for now
      else
        # Little endian float32s for the other 23 fields
        dataView.setFloat32((i + 1) * 4, param, true)

    return buffer

  deserialize: (buffer, params) ->
    dataView = new DataView(buffer)

    Object.keys(params).forEach (key, i) ->
      if i is 0
        # 4 byte sfxz header
        "fxz".split("").forEach (s, n) ->
          charCode = s.charCodeAt(0)
          if charCode != dataView.getUint8(n)
            throw new Error "Unknown file format: expected '#{s}' (#{charCode}) at byte #{n}"
        # version
        version = dataView.getUint8(3)
        if version != 1
          throw new Error "Unknown version '#{version}': expected 1"
        # byte 4 shape
        params[key] = dataView.getUint8(4)
        # bytes 5, 6, 7 unused for now
      else
        # Little endian float32s for the other 23 fields
        params[key] = dataView.getFloat32((i + 1) * 4, true)

    return params
