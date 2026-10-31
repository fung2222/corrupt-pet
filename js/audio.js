/** Tiny WebAudio blips — no asset packs */
let ctx = null;
let muted = false;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(m) { muted = !!m; }
export function isMuted() { return muted; }

function beep({ f = 440, d = 0.08, type = 'square', g = 0.04, slide = 0 }) {
  if (muted) return;
  const c = ac();
  const o = c.createOscillator();
  const gain = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), c.currentTime + d);
  gain.gain.setValueAtTime(g, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);
  o.connect(gain); gain.connect(c.destination);
  o.start(); o.stop(c.currentTime + d + 0.02);
}

export const sfx = {
  tap: () => beep({ f: 660, d: 0.05, g: 0.03 }),
  hatch: () => { beep({ f: 220, d: 0.12, slide: 280 }); setTimeout(() => beep({ f: 880, d: 0.1, type: 'sawtooth', g: 0.03 }), 90); },
  feed: () => beep({ f: 320, d: 0.1, type: 'triangle', slide: 120 }),
  inject: () => beep({ f: 180, d: 0.14, type: 'sawtooth', slide: -80, g: 0.035 }),
  punish: () => beep({ f: 90, d: 0.16, type: 'square', g: 0.05 }),
  neglect: () => beep({ f: 140, d: 0.2, type: 'sine', slide: -60, g: 0.025 }),
  jackOk: () => { beep({ f: 520, d: 0.06 }); setTimeout(() => beep({ f: 780, d: 0.08 }), 70); },
  jackFail: () => beep({ f: 110, d: 0.18, type: 'sawtooth', g: 0.045, slide: -40 }),
  fork: () => { beep({ f: 300, d: 0.1 }); setTimeout(() => beep({ f: 600, d: 0.12, type: 'triangle' }), 100); },
  melt: () => beep({ f: 80, d: 0.35, type: 'sawtooth', g: 0.05, slide: -50 }),
};
