/** Q-version / chibi silhouettes + far cyber cityscape. Hub palette only. */

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

function bodyFill(ctx) {
  const grd = ctx.createLinearGradient(-40, -70, 40, 60);
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

/** Layered far cityscape — soft depth, not a hard plaque */
function drawCityscape(ctx, w, h, t) {
  // sky wash
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0a0420');
  sky.addColorStop(0.45, '#12082c');
  sky.addColorStop(0.72, '#0a0618');
  sky.addColorStop(1, '#05010f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // distant haze band
  const haze = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.55, w * 0.7);
  haze.addColorStop(0, 'rgba(0,229,255,0.10)');
  haze.addColorStop(0.45, 'rgba(255,43,214,0.06)');
  haze.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h);

  // parallax layers of towers (far → near)
  const layers = [
    { y: h * 0.38, scale: 0.45, alpha: 0.28, speed: 0.015, color: '#141028', accent: C.purple },
    { y: h * 0.48, scale: 0.7, alpha: 0.42, speed: 0.035, color: '#1a1530', accent: C.cyan },
    { y: h * 0.58, scale: 1.0, alpha: 0.55, speed: 0.055, color: '#12141e', accent: C.magenta },
  ];

  layers.forEach((L, li) => {
    ctx.save();
    ctx.globalAlpha = L.alpha;
    const drift = ((t * L.speed * 40) % (w * 0.35));
    const baseX = -drift;
    const count = 14;
    const span = w * 1.4;
    for (let i = 0; i < count; i++) {
      const x = baseX + (i / count) * span - w * 0.15;
      const seed = (i * 17 + li * 31) % 97;
      const tw = (10 + (seed % 18)) * L.scale;
      const th = (28 + (seed % 55)) * L.scale * (h / 360);
      const top = L.y - th;
      // tower body
      ctx.fillStyle = L.color;
      ctx.fillRect(x, top, tw, th + h * 0.2);
      // antenna spike
      if (seed % 3 === 0) {
        ctx.fillRect(x + tw * 0.4, top - 8 * L.scale, 2, 10 * L.scale);
      }
      // window glitter
      ctx.fillStyle = L.accent;
      ctx.globalAlpha = L.alpha * (0.35 + 0.35 * Math.sin(t * 2 + i + li));
      const rows = Math.max(2, Math.floor(th / (6 * L.scale)));
      for (let r = 0; r < rows; r++) {
        if ((r + seed) % 3 === 0) continue;
        ctx.fillRect(x + 2, top + 4 + r * (5 * L.scale), tw - 4, 1.4 * L.scale);
      }
      ctx.globalAlpha = L.alpha;
    }
    ctx.restore();
  });

  // soft horizon glow line
  ctx.save();
  ctx.globalAlpha = 0.35;
  const hg = ctx.createLinearGradient(0, h * 0.55, w, h * 0.55);
  hg.addColorStop(0, 'transparent');
  hg.addColorStop(0.5, C.cyan);
  hg.addColorStop(1, 'transparent');
  ctx.strokeStyle = hg;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62 + Math.sin(t) * 1.5);
  ctx.lineTo(w, h * 0.62);
  ctx.stroke();
  ctx.restore();

  // ground fog under pet
  const fog = ctx.createLinearGradient(0, h * 0.68, 0, h);
  fog.addColorStop(0, 'rgba(5,1,15,0)');
  fog.addColorStop(0.35, 'rgba(5,1,15,0.45)');
  fog.addColorStop(1, 'rgba(5,1,15,0.85)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, h * 0.65, w, h * 0.35);

  // soft floor ellipse (pet stand, not a board)
  const eg = ctx.createRadialGradient(w * 0.5, h * 0.78, 4, w * 0.5, h * 0.78, w * 0.32);
  eg.addColorStop(0, 'rgba(0,229,255,0.16)');
  eg.addColorStop(0.55, 'rgba(255,43,214,0.06)');
  eg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = eg;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
}

export function drawPet(ctx, state, t) {
  const canvas = ctx.canvas;
  const w = canvas.clientWidth || canvas.width;
  const h = canvas.clientHeight || canvas.height;
  ctx.clearRect(0, 0, w, h);

  drawCityscape(ctx, w, h, t);

  const form = state.form;
  const meters = state.meters || {};
  const glitch = (meters.glitch || 0) / 100;
  const bounce = Math.sin(t * 3.2) * 2.2;
  const jitter = glitch > 0.55 ? Math.sin(t * 26) * (1.5 + glitch * 3) : 0;

  ctx.save();
  ctx.translate(w * 0.5 + jitter, h * 0.58 + bounce);
  const s = Math.min(w, h) * 0.48;
  ctx.scale(s / 100, s / 100);

  if (form === 'CHIP_EGG') drawEgg(ctx, t);
  else if (form === 'LARVA') drawLarva(ctx, t, meters);
  else if (form === 'CORPORATE_DRONE') drawDrone(ctx, t, meters);
  else if (form === 'STREET_VIRUS') drawVirus(ctx, t, meters);
  else if (form === 'MELT') drawMelt(ctx, t);
  ctx.restore();
}

/* —— Q / chibi forms: big head, short body, fun silhouette —— */

function drawEgg(ctx, t) {
  const pulse = 1 + Math.sin(t * 3) * 0.04;
  ctx.scale(pulse, pulse);
  // chibi chip-egg: rounder, chunky
  ctx.beginPath();
  ctx.ellipse(0, 4, 38, 46, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyFill(ctx);
  ctx.fill();
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // facet cut on top (still a chip, not a cute animal egg)
  ctx.beginPath();
  ctx.moveTo(-16, -28);
  ctx.lineTo(0, -42);
  ctx.lineTo(16, -28);
  ctx.closePath();
  ctx.fillStyle = C.gun2;
  ctx.fill();
  ctx.strokeStyle = C.magenta;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // big single sensor slit (Q face, NOT moe eyes)
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.roundRect(-14, -6, 28, 8, 3);
  ctx.fill();
  ctx.shadowBlur = 0;
  // tiny mischievous glint
  ctx.fillStyle = C.magenta;
  ctx.fillRect(6, -4, 4, 4);

  vein(ctx, c => { c.moveTo(-20, 10); c.quadraticCurveTo(0, 22, 22, 8); }, C.magenta, 2, 0.8);

  // hop feet stubs
  ctx.fillStyle = C.gun;
  ctx.fillRect(-16, 42, 12, 10);
  ctx.fillRect(4, 42, 12, 10);
  ctx.strokeStyle = C.cyanSoft;
  ctx.strokeRect(-16, 42, 12, 10);
  ctx.strokeRect(4, 42, 12, 10);
}

function drawLarva(ctx, t, m) {
  const heat = (m.heat || 0) / 100;
  // BIG head blob
  ctx.beginPath();
  ctx.ellipse(0, -22, 36, 32, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyFill(ctx);
  ctx.fill();
  ctx.strokeStyle = heat > 0.7 ? C.alert : C.cyanSoft;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // short stubby body
  ctx.beginPath();
  ctx.ellipse(0, 28, 26, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // shoulder plate (evil tech bit)
  ctx.fillStyle = C.gun2;
  ctx.beginPath();
  ctx.roundRect(-28, -8, 22, 14, 3);
  ctx.fill();
  ctx.strokeStyle = C.purple;
  ctx.stroke();

  // Q sensor face: one wide slit + cheek LED
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(-16, -30, 32, 10, 4);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.alert;
  ctx.beginPath();
  ctx.arc(18, -18, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // mouth tube (comic, short)
  ctx.strokeStyle = C.magenta;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.quadraticCurveTo(28, 0, 30, 12);
  ctx.stroke();
  ctx.fillStyle = C.alert;
  ctx.beginPath();
  ctx.arc(31, 14, 4, 0, Math.PI * 2);
  ctx.fill();

  const vp = 0.55 + Math.sin(t * 5) * 0.3;
  vein(ctx, c => { c.moveTo(-18, -10); c.bezierCurveTo(-5, 8, 12, 0, 16, 22); }, C.magenta, 2.2, vp);

  // stubby limbs
  ctx.fillStyle = C.gun;
  ctx.fillRect(-22, 40, 14, 16);
  ctx.fillRect(8, 40, 14, 16);
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-22, 40, 14, 16);
  ctx.strokeRect(8, 40, 14, 16);
}

function drawDrone(ctx, t, m) {
  const loy = (m.loyalty || 0) / 100;
  // BIG barcode head
  ctx.fillStyle = bodyFill(ctx);
  ctx.beginPath();
  ctx.roundRect(-28, -52, 56, 42, 8);
  ctx.fill();
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // barcode slits (playful wide)
  ctx.fillStyle = C.cyan;
  for (let i = 0; i < 8; i++) {
    const bw = (i % 3 === 0) ? 3.2 : 1.6;
    ctx.fillRect(-20 + i * 5.2, -44, bw, 26);
  }
  // compliance LED (cheek)
  ctx.fillStyle = C.alert;
  ctx.shadowColor = C.alert;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(22, -38, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // tiny box shoulders
  ctx.fillStyle = C.gun2;
  ctx.fillRect(-42, -12, 24, 16);
  ctx.fillRect(18, -12, 24, 16);
  ctx.strokeStyle = C.cyanSoft;
  ctx.strokeRect(-42, -12, 24, 16);
  ctx.strokeRect(18, -12, 24, 16);

  // short torso
  ctx.fillStyle = bodyFill(ctx);
  ctx.beginPath();
  ctx.roundRect(-18, 2, 36, 28, 4);
  ctx.fill();
  ctx.strokeStyle = C.cyan;
  ctx.stroke();

  // data-tie (comic oversized)
  ctx.fillStyle = C.magenta;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(7, 22);
  ctx.lineTo(0, 34);
  ctx.lineTo(-7, 22);
  ctx.closePath();
  ctx.fill();

  // stubby arms + legs
  ctx.fillStyle = C.gun;
  ctx.fillRect(-36, 4, 12, 26);
  ctx.fillRect(24, 4, 12, 26);
  ctx.fillRect(-14, 30, 12, 20);
  ctx.fillRect(2, 30, 12, 20);
  ctx.strokeStyle = loy > 0.6 ? C.cyan : C.purple;
  ctx.strokeRect(-36, 4, 12, 26);
  ctx.strokeRect(24, 4, 12, 26);
  ctx.strokeRect(-14, 30, 12, 20);
  ctx.strokeRect(2, 30, 12, 20);

  // scan line across face
  ctx.globalAlpha = 0.3 + Math.sin(t * 5) * 0.15;
  ctx.fillStyle = C.cyan;
  ctx.fillRect(-28, -52 + ((t * 28) % 40), 56, 2);
  ctx.globalAlpha = 1;
}

function drawVirus(ctx, t, m) {
  const g = (m.glitch || 0) / 100;
  ctx.save();
  ctx.rotate(Math.sin(t * 3.5) * 0.05);
  ctx.translate(Math.sin(t * 18) * (1 + g * 2), 0);

  // BIG messy head polygon (still chibi mass)
  ctx.beginPath();
  const pts = [
    [-32, -40], [-10, -58], [16, -52], [34, -28],
    [30, -4], [8, 6], [-18, 2], [-36, -16],
  ];
  pts.forEach(([x, y], i) => {
    const ox = Math.sin(t * 8 + i) * (1.5 + g * 3);
    const oy = Math.cos(t * 6 + i) * (1 + g * 2);
    if (i === 0) ctx.moveTo(x + ox, y + oy);
    else ctx.lineTo(x + ox, y + oy);
  });
  ctx.closePath();
  ctx.fillStyle = bodyFill(ctx);
  ctx.fill();
  ctx.strokeStyle = C.magenta;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // short body
  ctx.beginPath();
  ctx.ellipse(0, 28, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  vein(ctx, c => { c.moveTo(-16, -30); c.bezierCurveTo(0, -10, 18, -20, 20, 10); }, C.magenta, 2.4, 0.7 + Math.sin(t * 7) * 0.25);
  vein(ctx, c => { c.moveTo(8, -48); c.lineTo(-4, -12); }, C.cyan, 1.6, 0.7);

  // multi-mouth but Q-cute: three round mouths with spray
  [[-8, -22, 6], [14, -18, 5], [0, -6, 7]].forEach(([x, y, r], i) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = i === 2 ? C.alert : C.magenta;
    ctx.fill();
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // jagged stub arms
  ctx.strokeStyle = C.cyanSoft;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-22, 18); ctx.lineTo(-40, 32); ctx.lineTo(-34, 38);
  ctx.moveTo(20, 18); ctx.lineTo(42, 28); ctx.lineTo(36, 36);
  ctx.stroke();

  // stub feet
  ctx.fillStyle = C.gun;
  ctx.fillRect(-16, 40, 12, 12);
  ctx.fillRect(4, 40, 12, 12);
  ctx.strokeStyle = C.magenta;
  ctx.strokeRect(-16, 40, 12, 12);
  ctx.strokeRect(4, 40, 12, 12);

  ctx.restore();
}

function drawMelt(ctx, t) {
  // Q slag puddle with sad/comic LED
  ctx.beginPath();
  ctx.ellipse(0, 28, 48, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0e0c12';
  ctx.fill();
  ctx.strokeStyle = C.alert;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // melted chibi head remnant
  ctx.beginPath();
  ctx.ellipse(0, 2, 26, 18, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = C.gun;
  ctx.fill();
  ctx.strokeStyle = C.magenta;
  ctx.stroke();

  // dying wide slit
  ctx.fillStyle = Math.sin(t * 7) > 0 ? C.alert : '#401018';
  ctx.beginPath();
  ctx.roundRect(-12, -4, 24, 6, 2);
  ctx.fill();

  // smoke
  ctx.strokeStyle = C.cyan;
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const x = -12 + i * 12;
    ctx.moveTo(x, -10);
    ctx.bezierCurveTo(x - 6, -28 - i * 6, x + 8, -40 - i * 5, x + Math.sin(t + i) * 5, -52 - i * 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function resizeCanvas(canvas) {
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const css = Math.min(360, Math.floor(window.innerWidth * 0.78));
  canvas.style.width = css + 'px';
  canvas.style.height = css + 'px';
  canvas.width = Math.floor(css * dpr);
  canvas.height = Math.floor(css * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // polyfill roundRect if needed for older WebViews
  if (!ctx.roundRect) {
    ctx.roundRect = function (x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      this.moveTo(x + rr, y);
      this.arcTo(x + w, y, x + w, y + h, rr);
      this.arcTo(x + w, y + h, x, y + h, rr);
      this.arcTo(x, y + h, x, y, rr);
      this.arcTo(x, y, x + w, y, rr);
      this.closePath();
    };
  }
  return ctx;
}
