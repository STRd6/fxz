    var dat = Uint8Array.from(this.wav);
    var blob = new Blob(dat, {type: "audio/wav"});
    var url = URL.createObjectURL(blob);
    