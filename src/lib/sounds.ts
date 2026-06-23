// Real mechanical keyboard ASMR — Web Audio API
// 3 switch profiles: tactile (MX Brown), clicky (MX Blue), linear (MX Red)
// Each press = click noise + bottom-out thump + spring ping + case reverb

export type SoundType = 'key' | 'backspace' | 'enter' | 'correct' | 'wrong' | 'win' | 'lose' | 'click';

type SwitchProfile = 'linear' | 'tactile' | 'clicky';

class SoundManager {
  private ctx: AudioContext | null = null;
  private _enabled = true;
  private _volume = 0.35;

  get enabled() { return this._enabled; }
  set enabled(v: boolean) { this._enabled = v; }

  get volume() { return this._volume; }
  set volume(v: number) { this._volume = Math.max(0, Math.min(1, v)); }

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  play(type: SoundType) {
    if (!this._enabled) return;
    try {
      switch (type) {
        case 'key': this.switchPress('tactile'); break;
        case 'backspace': this.switchPress('linear'); break;
        case 'enter': this.switchPress('clicky'); break;
        case 'correct': this.correctSound(); break;
        case 'wrong': this.wrongSound(); break;
        case 'win': this.winJingle(); break;
        case 'lose': this.loseSound(); break;
        case 'click': this.switchPress('linear'); break;
      }
    } catch {
      // Silently fail if audio context unavailable
    }
  }

  // --- Core: one mechanical switch press ---
  private switchPress(profile: SwitchProfile) {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const vol = this._volume;
    const sr = ctx.sampleRate;

    // Per-profile parameters
    const p = {
      linear:  { clickFreq: 0,    clickQ: 1,   clickVol: 0,   thumpFreq: 150, thumpVol: 0.25, pingFreq: 2800, pingVol: 0.04, pingDecay: 0.004 },
      tactile: { clickFreq: 2600, clickQ: 2.2, clickVol: 0.4, thumpFreq: 220, thumpVol: 0.35, pingFreq: 3200, pingVol: 0.08, pingDecay: 0.005 },
      clicky:  { clickFreq: 3600, clickQ: 3.0, clickVol: 0.6, thumpFreq: 280, thumpVol: 0.30, pingFreq: 4500, pingVol: 0.18, pingDecay: 0.006 },
    }[profile];

    // --- 1. Click — bandpassed noise, ultra-short (10ms, 1ms attack) ---
    if (p.clickVol > 0.01) {
      const len = Math.floor(sr * 0.010);
      const buf = ctx.createBuffer(1, len, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.0012));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = p.clickFreq;
      bp.Q.value = p.clickQ;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol * p.clickVol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.010);
      src.connect(bp).connect(g).connect(ctx.destination);
      src.start(t); src.stop(t + 0.012);
    }

    // --- 2. Bottom-out thump — lowpassed noise, 25ms ---
    {
      const len = Math.floor(sr * 0.025);
      const buf = ctx.createBuffer(1, len, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.004));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = p.thumpFreq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol * p.thumpVol, t + 0.0015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      src.connect(lp).connect(g).connect(ctx.destination);
      src.start(t + 0.0015); src.stop(t + 0.028);
    }

    // --- 3. Spring ping — short sine (metallic resonance) ---
    if (p.pingVol > 0.01) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = p.pingFreq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol * p.pingVol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + p.pingDecay);
      osc.connect(g).connect(ctx.destination);
      osc.start(t); osc.stop(t + p.pingDecay + 0.002);
    }

    // --- 4. Case echo — three very short taps ---
    if (profile === 'clicky') {
      const echoGain = ctx.createGain();
      echoGain.gain.value = vol * 0.04;
      echoGain.connect(ctx.destination);
      for (let i = 0; i < 3; i++) {
        const len = Math.floor(sr * 0.003);
        const buf = ctx.createBuffer(1, len, sr);
        const d = buf.getChannelData(0);
        for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const delay = 0.018 + i * 0.008;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 3000 - i * 400;
        bp.Q.value = 1.5;
        src.connect(bp).connect(echoGain);
        src.start(t + delay); src.stop(t + delay + 0.004);
      }
    }
  }

  // --- Correct — ascending two-tone chime ---
  private correctSound() {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const vol = this._volume;
    [523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const start = t + i * 0.07;
      g.gain.setValueAtTime(vol * 0.35, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(g).connect(ctx.destination);
      osc.start(start); osc.stop(start + 0.2);
    });
  }

  // --- Wrong — low muted thud ---
  private wrongSound() {
    this.switchPress('linear');
  }

  // --- Win — ascending arpeggio C5-E5-G5-C6 ---
  private winJingle() {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const vol = this._volume;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const start = t + i * 0.12;
      g.gain.setValueAtTime(vol * 0.55 - i * 0.05, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(g).connect(ctx.destination);
      osc.start(start); osc.stop(start + 0.35);
    });
  }

  // --- Lose — descending two-note fade ---
  private loseSound() {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const vol = this._volume;
    [330, 262].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const start = t + i * 0.15;
      g.gain.setValueAtTime(vol * 0.25, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(g).connect(ctx.destination);
      osc.start(start); osc.stop(start + 0.35);
    });
  }
}

export const sounds = new SoundManager();
export default sounds;
