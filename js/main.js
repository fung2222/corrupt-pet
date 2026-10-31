/**
 * 腐核寵 CORRUPT.PET — MVP vertical slice
 * Egg → Larva → Fork (Corporate Drone | Street Virus) → Melt → re-hatch
 * Offline simmer via localStorage timestamps.
 */
import { STR, pick } from './strings.js';
import { sfx, setMuted, isMuted } from './audio.js';
import { drawPet, resizeCanvas } from './pet.js';

const SAVE_KEY = 'corrupt-pet-v1';
const VERSION = '0.1.0';

const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
const now = () => Date.now();

function freshState() {
  return {
    v: VERSION,
    form: 'CHIP_EGG', // CHIP_EGG | LARVA | CORPORATE_DRONE | STREET_VIRUS | MELT
    meters: { hunger: 40, stability: 55, heat: 22, loyalty: 48, glitch: 28 },
    actions: 0,
    forked: false,
    lang: localStorage.getItem('corrupt-pet-lang') || 'zh',
    muted: false,
    lastSeen: now(),
    createdAt: now(),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshState();
    const s = JSON.parse(raw);
    if (!s || !s.form) return freshState();
    s.meters = { ...freshState().meters, ...(s.meters || {}) };
    return s;
  } catch {
    return freshState();
  }
}

function save(state) {
  state.lastSeen = now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  localStorage.setItem('corrupt-pet-lang', state.lang);
}

/** Offline simmer: hunger rises, heat drifts, loyalty/glitch tick while away */
function applySimmer(state) {
  const t = now();
  const elapsedMs = Math.max(0, t - (state.lastSeen || t));
  // Cap at 8h so returning after a week isn't instant melt
  const minutes = Math.min(elapsedMs / 60000, 60 * 8);
  if (minutes < 0.4 || state.form === 'CHIP_EGG' || state.form === 'MELT') {
    state.lastSeen = t;
    return null;
  }
  const hungerGain = clamp(Math.round(minutes * 0.35), 0, 45);
  // heat cools slowly offline, but rises a bit if hunger was already high
  let heatDelta = -Math.round(minutes * 0.12);
  if ((state.meters.hunger || 0) > 70) heatDelta += Math.round(minutes * 0.08);
  heatDelta = clamp(heatDelta, -25, 20);
  const loyaltyLoss = clamp(Math.round(minutes * 0.08), 0, 15);
  const glitchGain = clamp(Math.round(minutes * 0.1), 0, 18);

  state.meters.hunger = clamp(state.meters.hunger + hungerGain);
  state.meters.heat = clamp(state.meters.heat + heatDelta);
  state.meters.loyalty = clamp(state.meters.loyalty - loyaltyLoss);
  state.meters.glitch = clamp(state.meters.glitch + glitchGain);
  state.lastSeen = t;
  return { hungerGain, heatDelta };
}

function S(state) {
  return STR[state.lang] || STR.zh;
}

// —— DOM ——
const canvas = document.getElementById('pet');
const formTag = document.getElementById('form-tag');
const statusEl = document.getElementById('status');
const metersEl = document.getElementById('meters');
const actionsEl = document.getElementById('actions');
const hintEl = document.getElementById('hint');
const jackModal = document.getElementById('jackin-modal');
const meltModal = document.getElementById('melt-modal');
const jackNeedle = document.getElementById('jack-needle');
const jackZone = document.getElementById('jack-zone');

let state = load();
let ctx = resizeCanvas(canvas);
let raf = 0;
let busy = false;

const simmerNote = applySimmer(state);
save(state);

function setStatus(text) {
  statusEl.textContent = text;
}

function renderMeters() {
  const str = S(state);
  metersEl.querySelectorAll('.meter').forEach((row) => {
    const key = row.dataset.key;
    const val = clamp(Math.round(state.meters[key] ?? 0));
    const label = row.querySelector('.m-label');
    const fill = row.querySelector('i');
    const num = row.querySelector('.m-val');
    label.textContent = str.meters[key];
    fill.style.width = val + '%';
    num.textContent = String(val);
    // danger: high hunger/heat/glitch OR low stability/loyalty
    const danger =
      (key === 'hunger' && val >= 70) ||
      (key === 'heat' && val >= 70) ||
      (key === 'glitch' && val >= 70) ||
      (key === 'stability' && val <= 25) ||
      (key === 'loyalty' && val <= 20);
    row.classList.toggle('danger', danger);
  });
}

function renderChrome() {
  const str = S(state);
  const living = state.form !== 'CHIP_EGG' && state.form !== 'MELT';
  metersEl.classList.toggle('hidden', !living);
  actionsEl.classList.toggle('hidden', !living);
  formTag.textContent = state.form;
  hintEl.textContent = str.hint;
  document.getElementById('btn-mute').setAttribute('aria-pressed', state.muted ? 'true' : 'false');
  document.getElementById('btn-mute').textContent = state.muted ? '✕♪' : '♪';
  setMuted(state.muted);
  document.getElementById('jackin-title').textContent = str.jackTitle;
  document.getElementById('jackin-copy').textContent = str.jackCopy;
  document.getElementById('jack-tap').textContent = str.lock;
  document.getElementById('jack-cancel').textContent = str.cancel;
  document.getElementById('melt-title').textContent = '熔毀 MELT';
  document.getElementById('melt-copy').textContent = str.meltCopy;
  document.getElementById('btn-rehatch').textContent = str.rehatch;
  document.body.classList.toggle('glitching', (state.meters.glitch || 0) >= 75 && living);
  if (living) renderMeters();
}

function droneScore() {
  return (state.meters.loyalty || 0) + (state.meters.stability || 0);
}
function virusScore() {
  return (state.meters.glitch || 0) + (state.meters.hunger || 0);
}

function checkMelt() {
  if (state.form === 'CHIP_EGG' || state.form === 'MELT') return false;
  const { hunger, heat, stability } = state.meters;
  // dual burst OR stability collapsed with high heat
  if ((hunger >= 95 && heat >= 90) || (stability <= 5 && heat >= 85) || (hunger >= 98 && heat >= 80)) {
    triggerMelt();
    return true;
  }
  return false;
}

function triggerMelt() {
  state.form = 'MELT';
  state.forked = true;
  sfx.melt();
  setStatus(S(state).melt);
  meltModal.classList.remove('hidden');
  renderChrome();
  save(state);
}

function checkFork() {
  if (state.forked || state.form !== 'LARVA') return;
  // Fast MVP fork: after 3 care actions with a lean, or hard at 5
  const d = droneScore();
  const v = virusScore();
  const lean = Math.abs(d - v);
  const ready = state.actions >= 3 && lean >= 12;
  const forced = state.actions >= 5;
  if (!ready && !forced) return;

  const pickDrone = d >= v;
  state.forked = true;
  state.form = pickDrone ? 'CORPORATE_DRONE' : 'STREET_VIRUS';
  sfx.fork();
  setStatus(pickDrone ? S(state).forkDrone : S(state).forkVirus);
  renderChrome();
  save(state);
}

function afterAction(flavor) {
  state.actions += 1;
  setStatus(flavor);
  if (checkMelt()) return;
  checkFork();
  // poisonous extras
  if (state.form === 'CORPORATE_DRONE' && Math.random() < 0.35) {
    const n = clamp(Math.round(40 + state.meters.loyalty * 0.5), 40, 92);
    setTimeout(() => setStatus(S(state).corpFirmware(n)), 900);
  } else if (state.form === 'STREET_VIRUS' && Math.random() < 0.35) {
    setTimeout(() => setStatus(S(state).hostLaugh), 900);
  }
  renderChrome();
  save(state);
}

function hatch() {
  if (state.form !== 'CHIP_EGG' || busy) return;
  busy = true;
  sfx.hatch();
  state.form = 'LARVA';
  state.meters = { hunger: 42, stability: 58, heat: 24, loyalty: 50, glitch: 30 };
  state.actions = 0;
  state.forked = false;
  setStatus(S(state).hatched);
  renderChrome();
  save(state);
  busy = false;
}

function actFeed() {
  const m = state.meters;
  const over = m.hunger < 25;
  m.hunger = clamp(m.hunger - (over ? 12 : 25));
  m.stability = clamp(m.stability + (over ? 2 : 6));
  m.heat = clamp(m.heat + (over ? 14 : 7));
  sfx.feed();
  afterAction(pick(S(state).feed));
}

function actNeglect() {
  const m = state.meters;
  m.hunger = clamp(m.hunger + 14);
  m.loyalty = clamp(m.loyalty - 10);
  m.glitch = clamp(m.glitch + 12);
  m.stability = clamp(m.stability - 3);
  sfx.neglect();
  afterAction(pick(S(state).neglect));
}

function actInject() {
  const m = state.meters;
  m.heat = clamp(m.heat + 22);
  m.glitch = clamp(m.glitch + 18);
  m.stability = clamp(m.stability - 16);
  m.hunger = clamp(m.hunger - 4);
  sfx.inject();
  afterAction(pick(S(state).inject));
}

function actPunish() {
  const m = state.meters;
  if (m.loyalty >= 50) m.loyalty = clamp(m.loyalty + 14); // blind obey
  else m.loyalty = clamp(m.loyalty - 16); // hate
  m.stability = clamp(m.stability - 12);
  m.heat = clamp(m.heat + 6);
  sfx.punish();
  afterAction(pick(S(state).punish));
}

// —— Jack-in mini interaction ——
let jackRaf = 0;
let jackPos = 0;
let jackDir = 1;
let jackZoneStart = 0.55;

function openJackin() {
  const str = S(state);
  document.getElementById('jackin-copy').textContent = str.jackCopy;
  jackZoneStart = 0.35 + Math.random() * 0.4;
  jackZone.style.left = (jackZoneStart * 100) + '%';
  jackPos = 0;
  jackDir = 1;
  jackModal.classList.remove('hidden');
  const tick = () => {
    jackPos += jackDir * 0.018;
    if (jackPos >= 1) { jackPos = 1; jackDir = -1; }
    if (jackPos <= 0) { jackPos = 0; jackDir = 1; }
    jackNeedle.style.left = `calc(${jackPos * 100}% - 2px)`;
    jackRaf = requestAnimationFrame(tick);
  };
  cancelAnimationFrame(jackRaf);
  jackRaf = requestAnimationFrame(tick);
}

function closeJackin() {
  cancelAnimationFrame(jackRaf);
  jackModal.classList.add('hidden');
}

function resolveJackin() {
  const z0 = jackZoneStart;
  const z1 = jackZoneStart + 0.18;
  const ok = jackPos >= z0 && jackPos <= z1;
  closeJackin();
  const m = state.meters;
  if (ok) {
    m.loyalty = clamp(m.loyalty + 15);
    m.stability = clamp(m.stability + 8);
    m.glitch = clamp(m.glitch - 4);
    sfx.jackOk();
    afterAction(pick(S(state).jackOk));
  } else {
    m.glitch = clamp(m.glitch + 14);
    m.loyalty = clamp(m.loyalty - 6);
    m.heat = clamp(m.heat + 5);
    sfx.jackFail();
    afterAction(pick(S(state).jackFail));
  }
}

function rehatch() {
  meltModal.classList.add('hidden');
  state = freshState();
  state.lang = localStorage.getItem('corrupt-pet-lang') || 'zh';
  setStatus(S(state).eggPrompt);
  renderChrome();
  save(state);
  sfx.tap();
}

// —— Events ——
canvas.addEventListener('pointerup', (e) => {
  e.preventDefault();
  if (state.form === 'CHIP_EGG') hatch();
  else sfx.tap();
});

actionsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn || busy || state.form === 'CHIP_EGG' || state.form === 'MELT') return;
  const act = btn.dataset.act;
  if (act === 'feed') actFeed();
  else if (act === 'neglect') actNeglect();
  else if (act === 'inject') actInject();
  else if (act === 'punish') actPunish();
  else if (act === 'jackin') openJackin();
});

document.getElementById('jack-tap').addEventListener('click', resolveJackin);
document.getElementById('jack-cancel').addEventListener('click', closeJackin);
document.getElementById('btn-rehatch').addEventListener('click', rehatch);
document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm(state.lang === 'en' ? 'Wipe pet and return to egg?' : '清除寄體並回到罪晶蛋？')) {
    rehatch();
  }
});
document.getElementById('btn-lang').addEventListener('click', () => {
  state.lang = state.lang === 'zh' ? 'en' : 'zh';
  if (state.form === 'CHIP_EGG') setStatus(S(state).eggPrompt);
  renderChrome();
  save(state);
});
document.getElementById('btn-mute').addEventListener('click', () => {
  state.muted = !state.muted;
  renderChrome();
  save(state);
});

window.addEventListener('resize', () => { ctx = resizeCanvas(canvas); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') save(state);
  if (document.visibilityState === 'visible') {
    const note = applySimmer(state);
    if (note && (note.hungerGain > 0 || note.heatDelta !== 0)) {
      setStatus(S(state).simmer(note.hungerGain, note.heatDelta));
      checkMelt();
      renderChrome();
    }
    save(state);
  }
});

// boot UI
setMuted(state.muted);
if (state.form === 'CHIP_EGG') setStatus(S(state).eggPrompt);
else if (state.form === 'MELT') {
  setStatus(S(state).melt);
  meltModal.classList.remove('hidden');
} else if (simmerNote && (simmerNote.hungerGain > 0 || simmerNote.heatDelta !== 0)) {
  setStatus(S(state).simmer(simmerNote.hungerGain, simmerNote.heatDelta));
} else {
  setStatus(S(state).forms[state.form] || state.form);
}
renderChrome();

function loop(ts) {
  drawPet(ctx, state, ts / 1000);
  raf = requestAnimationFrame(loop);
}
cancelAnimationFrame(raf);
raf = requestAnimationFrame(loop);

// Expose debug helpers for smoke tests
window.__corruptPet = {
  getState: () => structuredClone(state),
  forceFork: (side) => {
    state.form = 'LARVA';
    state.forked = false;
    state.actions = 5;
    if (side === 'virus') {
      state.meters = { hunger: 80, stability: 30, heat: 40, loyalty: 20, glitch: 85 };
    } else {
      state.meters = { hunger: 30, stability: 80, heat: 35, loyalty: 85, glitch: 20 };
    }
    checkFork();
    renderChrome();
    save(state);
  },
  forceMelt: () => {
    state.meters.hunger = 99;
    state.meters.heat = 95;
    checkMelt();
  },
  simmerMinutes: (mins) => {
    state.lastSeen = now() - mins * 60000;
    const note = applySimmer(state);
    renderChrome();
    save(state);
    return note;
  },
};
