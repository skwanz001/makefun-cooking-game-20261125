// Dapur Kilat — every sound is synthesized with WebAudio. No audio files,
// no network: a few oscillators and filtered noise make the chop, the
// sizzle, the serve ding and a small bass loop.
export function createAudio() {
  let context = null;
  let muted = false;
  let musicTimer = null;
  let beat = 0;

  function ensure() {
    if (!context) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(freq, duration, type = 'sine', volume = 0.16, when = 0) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function noise(duration, filterFreq, volume = 0.2) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  }

  const sounds = {
    pickup() { tone(520, 0.08, 'triangle', 0.14); },
    chop() { noise(0.07, 1800, 0.3); tone(180, 0.06, 'square', 0.1); },
    sizzle() { noise(0.4, 5200, 0.12); },
    plate() { tone(660, 0.09, 'triangle', 0.14); tone(880, 0.12, 'triangle', 0.12, 0.07); },
    serve() {
      tone(784, 0.12, 'sine', 0.18);
      tone(1047, 0.16, 'sine', 0.18, 0.09);
      tone(1319, 0.22, 'sine', 0.16, 0.18);
    },
    deny() { tone(160, 0.14, 'square', 0.1); },
    trash() { noise(0.15, 500, 0.2); },
    over() { tone(392, 0.2, 'sine', 0.16); tone(311, 0.3, 'sine', 0.16, 0.18); tone(233, 0.5, 'sine', 0.16, 0.36); },
  };

  // A lazy two-bar bass loop: root notes that walk up as the shift goes on.
  const BASS = [110, 110, 131, 98, 110, 110, 147, 165];
  function startMusic() {
    if (musicTimer || !ensure()) return;
    musicTimer = window.setInterval(() => {
      if (muted) return;
      tone(BASS[beat % BASS.length], 0.42, 'triangle', 0.07);
      if (beat % 4 === 2) tone(BASS[beat % BASS.length] * 2, 0.1, 'sine', 0.03);
      beat += 1;
    }, 300);
  }

  function stopMusic() {
    if (musicTimer) {
      window.clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  return {
    unlock() { ensure(); startMusic(); },
    play(name) { if (sounds[name]) sounds[name](); },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() { return muted; },
    stopMusic,
  };
}
