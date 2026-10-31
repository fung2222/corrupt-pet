/** Procedural evil silhouettes — Hub palette only. Silhouette > detail. */

const C = {
  bg: '#05010f',
  gun: '#1a1e28',
  gun2: '#2a303a',
  cyan: '#00e5ff',
  cyanSoft: '#7ad7ff',
  magenta: '#ff2bd6',
  alert: '#ff3b5c',
  toxic: '#7cff3a',
  purple: '#9a93bf',
  white: '#e8ffff',
};

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

export function drawPet(ctx, state, t) {
  const canvas = ctx.canvas;
  // CSS pixels (setTransform already applied DPR in resizeCanvas)
  const w = canvas.clientWidth || canvas.width;
  const h = canvas.clientHeight || canvas.height;
  ctx.clearRect(0, 0, w, h);
  // soft floor glow
  const g = ctx.createRadialGradient(w * 0.5, h * 0.78, 10, w * 0.5, h * 0.78, w * 0.38);
  g.addColorStop(0, 'rgba(0,229,255,0.12)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const form = state.form;
  const meters = state.meters || {};
  const glitch = (meters.glitch || 0) / 100;
  const jitter = glitch > 0.55 ? Math.sin(t * 28) * (2 + glitch * 4) : Math.sin(t * 2) * 0.6;

  ctx.save();
  ctx.translate(w * 0.5 + jitter, h * 0.55);
  const s = Math.min(w, h) * 0.42;
  ctx.scale(s / 100, s / 100);

  if (form === 'CHIP_EGG') drawEgg(ctx, t);
  else if (form === 'LARVA') drawLarva(ctx, t, meters);
  else if (form === 'CORPORATE_DRONE') drawDrone(ctx, t, meters);
  else if (form === 'STREET_VIRUS') drawVirus(ctx, t, meters);
  else if (form === 'MELT') drawMelt(ctx, t);
  ctx.restore();
}

function bodyFill(ctx) {
  const grd = ctx.createLinearGradient(-40, -60, 40, 70);
  grd.addColorStop(0, C.gun2);
  grd.addColorStop(1, C.gun);
  return grd;
}

function vein(ctx, pathFn, color, width, alpha = 0.9) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  pathFn(ctx);
  ctx.stroke();
  ctx.restore();
}

function drawEgg(ctx, t) {
  const pulse = 1 + Math.sin(t * 3) * 0.03;
  ctx.scale(pulse, pulse);
  // chip faceted egg
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.lineTo(34, -28);
  ctx.lineTo(38, 18);
  ctx.lineTo(12, 52);
  ctx.lineTo(-12, 52);
  ctx.lineTo(-38, 18);
  ctx.lineTo(-34, -28);
  ctx.closePath();
  ctx.fillStyle = bodyFill(ctx);
  ctx.fill();
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // circuit etch
  vein(ctx, c => { c.moveTo(-18, -20); c.lineTo(0, -8); c.lineTo(18, -22); c.lineTo(8, 10); }, C.magenta, 1.6, 0.85);
  vein(ctx, c => { c.moveTo(-10, 8); c.lineTo(0, 28); c.lineTo(12, 6); }, C.cyan, 1.4, 0.7);

  // single sensor slit (NOT moe eyes)
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 8;
  ctx.fillRect(-10, -6, 20, 3);
  ctx.shadowBlur = 0;

  // hatch hint spark
  ctx.fillStyle = C.magenta;
  ctx.globalAlpha = 0.5 + Math.sin(t * 6) * 0.4;
  ctx.beginPath();
  ctx.arc(22, -18, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawLarva(ctx, t, m) {
  const heat = (m.heat || 0) / 100;
  const glitch = (m.glitch || 0) / 100;

  // hunkered irregular body
  ctx.beginPath();
  ctx.moveTo(-42, 10);
  ctx.quadraticCurveTo(-48, -20, -20, -42);
  ctx.lineTo(8, -50);
  ctx.quadraticCurveTo(40, -36, 46, 0);
  ctx.lineTo(36, 38);
  ctx.quadraticCurveTo(0, 55, -34, 40);
  ctx.closePath();
  ctx.fillStyle = bodyFill(ctx);
  ctx.fill();
  ctx.strokeStyle = heat > 0.7 ? C.alert : C.cyanSoft;
  ctx.lineWidth = 2;
  ctx.stroke();

  // hard shoulder plate
  ctx.fillStyle = C.gun2;
  ctx.fillRect(-36, -18, 28, 14);
  ctx.strokeStyle = C.purple;
  ctx.strokeRect(-36, -18, 28, 14);

  // sensor slit cluster
  ctx.fillStyle = C.cyan;
  ctx.fillRect(-8, -28, 18, 2.5);
  ctx.fillStyle = C.magenta;
  ctx.fillRect(-4, -22, 8, 2);

  // corruption veins
  const vPulse = 0.55 + Math.sin(t * (4 + glitch * 10)) * 0.35;
  vein(ctx, c => { c.moveTo(-20, -8); c.bezierCurveTo(-5, 5, 10, -5, 28, 12); }, C.magenta, 2.2, vPulse);
  vein(ctx, c => { c.moveTo(6, -40); c.lineTo(2, -10); c.lineTo(16, 20); }, C.cyan, 1.5, 0.7);

  // mouth tube (evil, small)
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(18, 8);
  ctx.lineTo(34, 18);
  ctx.stroke();
  ctx.fillStyle = C.alert;
  ctx.beginPath();
  ctx.arc(36, 19, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // stub limbs
  ctx.fillStyle = C.gun;
  ctx.fillRect(-30, 36, 10, 18);
  ctx.fillRect(8, 38, 10, 16);
  ctx.strokeStyle = C.magenta;
  ctx.strokeRect(-30, 36, 10, 18);
  ctx.strokeRect(8, 38, 10, 16);
}

function drawDrone(ctx, t, m) {
  const loy = (m.loyalty || 0) / 100;
  // box shoulders
  ctx.fillStyle = bodyFill(ctx);
  ctx.fillRect(-48, -28, 96, 22);
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2;
  ctx.strokeRect(-48, -28, 96, 22);

  // torso plate
  ctx.beginPath();
  ctx.moveTo(-28, -8);
  ctx.lineTo(28, -8);
  ctx.lineTo(34, 42);
  ctx.lineTo(-34, 42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // barcode face (vertical slits)
  ctx.fillStyle = C.gun2;
  ctx.fillRect(-18, -48, 36, 28);
  ctx.strokeStyle = C.cyanSoft;
  ctx.strokeRect(-18, -48, 36, 28);
  ctx.fillStyle = C.cyan;
  for (let i = 0; i < 7; i++) {
    const bw = (i % 3 === 0) ? 2.8 : 1.4;
    ctx.fillRect(-14 + i * 4.5, -44, bw, 20);
  }
  // single red compliance LED
  ctx.fillStyle = C.alert;
  ctx.shadowColor = C.alert;
  ctx.shadowBlur = 6;
  ctx.fillRect(-2, -52, 4, 4);
  ctx.shadowBlur = 0;

  // data-tie
  ctx.fillStyle = C.magenta;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(6, 30);
  ctx.lineTo(0, 48);
  ctx.lineTo(-6, 30);
  ctx.closePath();
  ctx.fill();
  vein(ctx, c => { c.moveTo(0, -4); c.lineTo(0, 46); }, C.cyan, 1.2, 0.9);

  // obedient arms (straight down)
  ctx.fillStyle = C.gun;
  ctx.fillRect(-44, -6, 12, 46);
  ctx.fillRect(32, -6, 12, 46);
  ctx.strokeStyle = loy > 0.6 ? C.cyan : C.purple;
  ctx.strokeRect(-44, -6, 12, 46);
  ctx.strokeRect(32, -6, 12, 46);

  // legs
  ctx.fillRect(-18, 42, 12, 28);
  ctx.fillRect(6, 42, 12, 28);
  ctx.strokeRect(-18, 42, 12, 28);
  ctx.strokeRect(6, 42, 12, 28);

  // subtle cyan scan
  ctx.globalAlpha = 0.25 + Math.sin(t * 5) * 0.15;
  ctx.fillStyle = C.cyan;
  ctx.fillRect(-48, -28 + ((t * 30) % 50), 96, 2);
  ctx.globalAlpha = 1;
}

function drawVirus(ctx, t, m) {
  const g = (m.glitch || 0) / 100;
  const j = Math.sin(t * 22) * (1 + g * 3);

  ctx.save();
  ctx.rotate(Math.sin(t * 3) * 0.04);
  ctx.translate(j, -j * 0.5);

  // broken polygon body
  ctx.beginPath();
  const pts = [
    [-30, -40], [-8, -55], [18, -48], [40, -20],
    [48, 10], [28, 36], [5, 50], [-22, 42], [-45, 18], [-42, -10],
  ];
  pts.forEach(([x, y], i) => {
    const ox = Math.sin(t * 9 + i) * (2 + g * 4);
    const oy = Math.cos(t * 7 + i) * (1 + g * 3);
    if (i === 0) ctx.moveTo(x + ox, y + oy);
    else ctx.lineTo(x + ox, y + oy);
  });
  ctx.closePath();
  ctx.fillStyle = bodyFill(ctx);
  ctx.fill();
  ctx.strokeStyle = C.magenta;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // flowing magenta veins
  const vp = 0.5 + Math.sin(t * 8) * 0.4;
  vein(ctx, c => { c.moveTo(-20, -20); c.bezierCurveTo(0, 0, 20, -30, 30, 15); c.lineTo(10, 35); }, C.magenta, 2.6, vp);
  vein(ctx, c => { c.moveTo(10, -40); c.lineTo(-5, -5); c.lineTo(-25, 20); }, C.cyan, 1.8, 0.75);

  // multi-mouth spray
  const mouths = [
    [12, 5, 7], [-16, 12, 5], [22, 22, 4.5], [-4, 28, 6],
  ];
  mouths.forEach(([x, y, r], i) => {
    ctx.beginPath();
    ctx.arc(x + Math.sin(t * 10 + i) * 2, y, r, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? C.alert : C.magenta;
    ctx.fill();
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // code spray ticks
    ctx.strokeStyle = C.toxic;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + r + 10 + i * 2, y - 4 + Math.sin(t * 12 + i) * 3);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // jagged limb shards
  ctx.strokeStyle = C.cyanSoft;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-40, 5); ctx.lineTo(-62, 28); ctx.lineTo(-50, 34);
  ctx.moveTo(38, 8); ctx.lineTo(66, 18); ctx.lineTo(58, 30);
  ctx.stroke();

  ctx.restore();
}

function drawMelt(ctx, t) {
  ctx.globalAlpha = 0.9;
  // slag pile
  ctx.beginPath();
  ctx.moveTo(-50, 30);
  ctx.quadraticCurveTo(-20, 50, 10, 35);
  ctx.quadraticCurveTo(35, 55, 48, 28);
  ctx.lineTo(20, 10);
  ctx.quadraticCurveTo(0, 25, -30, 8);
  ctx.closePath();
  ctx.fillStyle = '#0e0c12';
  ctx.fill();
  ctx.strokeStyle = C.alert;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // cracked chip remnant
  ctx.beginPath();
  ctx.moveTo(-12, -10);
  ctx.lineTo(8, -22);
  ctx.lineTo(18, 0);
  ctx.lineTo(-4, 12);
  ctx.closePath();
  ctx.fillStyle = C.gun;
  ctx.fill();
  ctx.strokeStyle = C.magenta;
  ctx.stroke();

  // dying LED
  ctx.fillStyle = Math.sin(t * 8) > 0 ? C.alert : '#401018';
  ctx.beginPath();
  ctx.arc(2, -4, 3, 0, Math.PI * 2);
  ctx.fill();

  // smoke wisps
  ctx.strokeStyle = C.cyan;
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const x = -10 + i * 12;
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x - 5, -20 - i * 8, x + 8, -35 - i * 6, x + Math.sin(t + i) * 6, -50 - i * 10);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function resizeCanvas(canvas) {
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const css = Math.min(360, Math.floor(window.innerWidth * 0.72));
  canvas.style.width = css + 'px';
  canvas.style.height = css + 'px';
  canvas.width = Math.floor(css * dpr);
  canvas.height = Math.floor(css * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
