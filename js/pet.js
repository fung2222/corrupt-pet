/** Q-version / chibi silhouettes + far cyber cityscape. Hub palette only.
 *  v0.1.2 — soft body fills, neon rim glow, deeper multi-layer BG.
 */

const C = {
  bg: '#05010f',
  gun: '#1a1e28',
  gun2: '#2a303a',
  gunSoft: '#3a4250',
  cyan: '#00e5ff',
  cyanSoft: '#7ad7ff',
  magenta: '#ff2bd6',
  alert: '#ff3b5c',
  toxic: '#7cff3a',
  purple: '#9a93bf',
  white: '#e8ffff',
};

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

/** Soft gunmetal body fill with slight neon tint (still flat 2D, not mesh).
 *  Midtones kept readable vs dark cityscape so shapes read as solid, not hollow. */
function bodyFill(ctx, tint = 'cyan') {
  const grd = ctx.createLinearGradient(-36, -72, 36, 58);
  if (tint === 'magenta') {
    grd.addColorStop(0, '#5a3a68');
    grd.addColorStop(0.35, '#3a2a48');
    grd.addColorStop(0.7, '#2a2238');
    grd.addColorStop(1, '#16141e');
  } else if (tint === 'alert') {
    grd.addColorStop(0, '#5a3040');
    grd.addColorStop(0.4, '#3a2430');
    grd.addColorStop(1, '#18141a');
  } else {
    grd.addColorStop(0, '#4a5a6c');
    grd.addColorStop(0.3, '#343e4c');
    grd.addColorStop(0.65, '#222830');
    grd.addColorStop(1, '#141820');
  }
  return grd;
}

/** Soft inner shade oval — fake volume without leaving Canvas 2D. */
function softShade(ctx, x, y, rx, ry, alpha = 0.28) {
  ctx.save();
  const g = ctx.createRadialGradient(x - rx * 0.25, y - ry * 0.35, 1, x, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(232,255,255,${alpha * 0.55})`);
  g.addColorStop(0.4, `rgba(0,229,255,${alpha * 0.16})`);
  g.addColorStop(0.7, `rgba(26,30,40,${alpha * 0.15})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Neon emissive rim along current path (glow + crisp edge). */
function neonRim(ctx, color, width = 2.2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width * 1.85;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 6;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = C.white;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(0.8, width * 0.35);
  ctx.stroke();
  ctx.restore();
}

function fillThenRim(ctx, color, width, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.fill();
  neonRim(ctx, color, width);
}

function vein(ctx, pathFn, color, width, alpha = 0.9) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  pathFn(ctx);
  ctx.stroke();
  ctx.restore();
}

/** Soft ground blob under the pet for fake contact/volume. */
function drawPetContactShadow(ctx) {
  ctx.save();
  const g = ctx.createRadialGradient(0, 52, 2, 0, 54, 48);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.45, 'rgba(255,43,214,0.10)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 54, 46, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Layered far cityscape — multi-band depth + light dust + parallax. */
function drawCityscape(ctx, w, h, t) {
  // deep sky wash
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#070218');
  sky.addColorStop(0.28, '#0e0530');
  sky.addColorStop(0.55, '#12082c');
  sky.addColorStop(0.78, '#0a0618');
  sky.addColorStop(1, '#05010f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // upper aurora / neon wash
  const aurora = ctx.createRadialGradient(w * 0.35, h * 0.18, 4, w * 0.45, h * 0.28, w * 0.55);
  aurora.addColorStop(0, 'rgba(0,229,255,0.14)');
  aurora.addColorStop(0.4, 'rgba(255,43,214,0.07)');
  aurora.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aurora;
  ctx.fillRect(0, 0, w, h);

  // far atmospheric haze band (behind farthest towers)
  const farHaze = ctx.createLinearGradient(0, h * 0.28, 0, h * 0.55);
  farHaze.addColorStop(0, 'rgba(10,4,32,0)');
  farHaze.addColorStop(0.5, 'rgba(80,40,120,0.18)');
  farHaze.addColorStop(1, 'rgba(5,1,15,0)');
  ctx.fillStyle = farHaze;
  ctx.fillRect(0, h * 0.25, w, h * 0.35);

  // parallax depth bands: far mountains → far towers → mid → near
  const layers = [
    { y: h * 0.32, scale: 0.34, alpha: 0.30, speed: 0.008, color: '#100e1c', accent: C.purple, jagged: true },
    { y: h * 0.40, scale: 0.55, alpha: 0.42, speed: 0.018, color: '#181230', accent: C.purple, jagged: false },
    { y: h * 0.50, scale: 0.82, alpha: 0.55, speed: 0.034, color: '#1c1838', accent: C.cyan, jagged: false },
    { y: h * 0.60, scale: 1.12, alpha: 0.72, speed: 0.058, color: '#141820', accent: C.magenta, jagged: false },
  ];

  layers.forEach((L, li) => {
    ctx.save();
    ctx.globalAlpha = L.alpha;
    const drift = ((t * L.speed * 40) % (w * 0.4));
    const baseX = -drift;
    const count = L.jagged ? 10 : 16;
    const span = w * 1.5;
    for (let i = 0; i < count; i++) {
      const x = baseX + (i / count) * span - w * 0.2;
      const seed = (i * 17 + li * 31) % 97;
      const tw = (9 + (seed % 20)) * L.scale;
      const th = (22 + (seed % 62)) * L.scale * (h / 360);
      const top = L.y - th;

      if (L.jagged) {
        // soft far ridge / mountain silhouette
        ctx.beginPath();
        ctx.moveTo(x - 4, L.y + h * 0.15);
        ctx.lineTo(x + tw * 0.2, top + th * 0.35);
        ctx.lineTo(x + tw * 0.55, top);
        ctx.lineTo(x + tw * 1.1, top + th * 0.4);
        ctx.lineTo(x + tw * 1.4, L.y + h * 0.15);
        ctx.closePath();
        ctx.fillStyle = L.color;
        ctx.fill();
      } else {
        ctx.fillStyle = L.color;
        ctx.fillRect(x, top, tw, th + h * 0.22);
        // antenna / spire
        if (seed % 3 === 0) {
          ctx.fillRect(x + tw * 0.4, top - 9 * L.scale, 2, 11 * L.scale);
          // tip blink
          ctx.fillStyle = L.accent;
          ctx.globalAlpha = L.alpha * (0.4 + 0.4 * Math.sin(t * 3 + i));
          ctx.fillRect(x + tw * 0.35, top - 11 * L.scale, 3.2, 2.2);
          ctx.globalAlpha = L.alpha;
          ctx.fillStyle = L.color;
        }
        // window glitter rows
        ctx.fillStyle = L.accent;
        ctx.globalAlpha = L.alpha * (0.3 + 0.4 * Math.sin(t * 2.2 + i + li));
        const rows = Math.max(2, Math.floor(th / (5.5 * L.scale)));
        for (let r = 0; r < rows; r++) {
          if ((r + seed) % 3 === 0) continue;
          ctx.fillRect(x + 2, top + 4 + r * (5 * L.scale), tw - 4, 1.35 * L.scale);
        }
        ctx.globalAlpha = L.alpha;
      }
    }
    ctx.restore();

    // soft mid-band fog between layers (depth cue)
    if (li === 1 || li === 2) {
      ctx.save();
      const fogY = L.y - h * 0.02;
      const band = ctx.createLinearGradient(0, fogY - 18, 0, fogY + 28);
      band.addColorStop(0, 'rgba(5,1,15,0)');
      band.addColorStop(0.45, li === 1 ? 'rgba(20,10,40,0.28)' : 'rgba(8,20,36,0.22)');
      band.addColorStop(1, 'rgba(5,1,15,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, fogY - 20, w, 55);
      ctx.restore();
    }
  });

  // neon particle dust (light, far air)
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const seed = i * 47;
    const px = ((seed * 13 + t * (4 + (i % 5))) % (w + 40)) - 20;
    const py = h * 0.22 + ((seed * 7) % (h * 0.45));
    const pr = 0.6 + (seed % 3) * 0.35;
    const col = i % 3 === 0 ? C.magenta : (i % 3 === 1 ? C.cyan : C.purple);
    ctx.globalAlpha = 0.12 + 0.1 * Math.sin(t * 1.5 + i);
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // soft horizon glow line
  ctx.save();
  ctx.globalAlpha = 0.4;
  const hg = ctx.createLinearGradient(0, h * 0.58, w, h * 0.58);
  hg.addColorStop(0, 'transparent');
  hg.addColorStop(0.5, C.cyan);
  hg.addColorStop(1, 'transparent');
  ctx.strokeStyle = hg;
  ctx.lineWidth = 1.4;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.64 + Math.sin(t * 0.7) * 1.8);
  ctx.lineTo(w, h * 0.64 + Math.cos(t * 0.5) * 1.2);
  ctx.stroke();
  ctx.restore();

  // ground fog under pet (near atmosphere)
  const fog = ctx.createLinearGradient(0, h * 0.66, 0, h);
  fog.addColorStop(0, 'rgba(5,1,15,0)');
  fog.addColorStop(0.3, 'rgba(5,1,15,0.4)');
  fog.addColorStop(1, 'rgba(5,1,15,0.88)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  // soft floor ellipse (pet stand, not a board)
  const eg = ctx.createRadialGradient(w * 0.5, h * 0.78, 4, w * 0.5, h * 0.78, w * 0.34);
  eg.addColorStop(0, 'rgba(0,229,255,0.18)');
  eg.addColorStop(0.45, 'rgba(255,43,214,0.08)');
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

  drawPetContactShadow(ctx);

  if (form === 'CHIP_EGG') drawEgg(ctx, t);
  else if (form === 'LARVA') drawLarva(ctx, t, meters);
  else if (form === 'CORPORATE_DRONE') drawDrone(ctx, t, meters);
  else if (form === 'STREET_VIRUS') drawVirus(ctx, t, meters);
  else if (form === 'MELT') drawMelt(ctx, t);
  ctx.restore();
}

/* —— Q / chibi forms: big head, short body, soft fill + neon rim —— */

function drawEgg(ctx, t) {
  const pulse = 1 + Math.sin(t * 3) * 0.04;
  ctx.scale(pulse, pulse);

  ctx.beginPath();
  ctx.ellipse(0, 4, 38, 46, 0, 0, Math.PI * 2);
  fillThenRim(ctx, C.cyan, 2.4, bodyFill(ctx, 'cyan'));
  softShade(ctx, -6, -8, 26, 30, 0.32);

  // facet cut on top
  ctx.beginPath();
  ctx.moveTo(-16, -28);
  ctx.lineTo(0, -42);
  ctx.lineTo(16, -28);
  ctx.closePath();
  fillThenRim(ctx, C.magenta, 1.6, C.gunSoft);

  // big single sensor slit
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(-14, -6, 28, 8, 3);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.magenta;
  ctx.fillRect(6, -4, 4, 4);

  vein(ctx, c => { c.moveTo(-20, 10); c.quadraticCurveTo(0, 22, 22, 8); }, C.magenta, 2, 0.85);

  // hop feet stubs
  ctx.beginPath();
  ctx.rect(-16, 42, 12, 10);
  fillThenRim(ctx, C.cyanSoft, 1.4, C.gun);
  ctx.beginPath();
  ctx.rect(4, 42, 12, 10);
  fillThenRim(ctx, C.cyanSoft, 1.4, C.gun);
}

function drawLarva(ctx, t, m) {
  const heat = (m.heat || 0) / 100;
  const rim = heat > 0.7 ? C.alert : C.cyanSoft;

  // BIG head blob
  ctx.beginPath();
  ctx.ellipse(0, -22, 36, 32, 0, 0, Math.PI * 2);
  fillThenRim(ctx, rim, 2.2, bodyFill(ctx, heat > 0.7 ? 'alert' : 'cyan'));
  softShade(ctx, -8, -30, 22, 18, 0.3);

  // short stubby body
  ctx.beginPath();
  ctx.ellipse(0, 28, 26, 20, 0, 0, Math.PI * 2);
  fillThenRim(ctx, rim, 2.2, bodyFill(ctx, 'cyan'));
  softShade(ctx, -4, 22, 16, 12, 0.22);

  // shoulder plate
  ctx.beginPath();
  ctx.roundRect(-28, -8, 22, 14, 3);
  fillThenRim(ctx, C.purple, 1.5, C.gunSoft);

  // Q sensor face
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.roundRect(-16, -30, 32, 10, 4);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.alert;
  ctx.shadowColor = C.alert;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(18, -18, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // mouth tube
  ctx.strokeStyle = C.magenta;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = C.magenta;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.quadraticCurveTo(28, 0, 30, 12);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.alert;
  ctx.beginPath();
  ctx.arc(31, 14, 4, 0, Math.PI * 2);
  ctx.fill();

  const vp = 0.55 + Math.sin(t * 5) * 0.3;
  vein(ctx, c => { c.moveTo(-18, -10); c.bezierCurveTo(-5, 8, 12, 0, 16, 22); }, C.magenta, 2.2, vp);

  // stubby limbs
  ctx.beginPath();
  ctx.rect(-22, 40, 14, 16);
  fillThenRim(ctx, C.cyan, 1.5, C.gun);
  ctx.beginPath();
  ctx.rect(8, 40, 14, 16);
  fillThenRim(ctx, C.cyan, 1.5, C.gun);
}

function drawDrone(ctx, t, m) {
  const loy = (m.loyalty || 0) / 100;

  // BIG barcode head
  ctx.beginPath();
  ctx.roundRect(-28, -52, 56, 42, 8);
  fillThenRim(ctx, C.cyan, 2.2, bodyFill(ctx, 'cyan'));
  softShade(ctx, -8, -44, 24, 18, 0.28);

  // barcode eyes
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 6;
  for (let i = 0; i < 8; i++) {
    const bw = (i % 3 === 0) ? 3.2 : 1.6;
    ctx.fillRect(-20 + i * 5.2, -44, bw, 26);
  }
  ctx.shadowBlur = 0;

  // compliance LED
  ctx.fillStyle = C.alert;
  ctx.shadowColor = C.alert;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(22, -38, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // tiny box shoulders
  ctx.beginPath();
  ctx.rect(-42, -12, 24, 16);
  fillThenRim(ctx, C.cyanSoft, 1.4, C.gunSoft);
  ctx.beginPath();
  ctx.rect(18, -12, 24, 16);
  fillThenRim(ctx, C.cyanSoft, 1.4, C.gunSoft);

  // short torso
  ctx.beginPath();
  ctx.roundRect(-18, 2, 36, 28, 4);
  fillThenRim(ctx, C.cyan, 2, bodyFill(ctx, 'cyan'));
  softShade(ctx, -4, 8, 14, 12, 0.2);

  // data-tie
  ctx.fillStyle = C.magenta;
  ctx.shadowColor = C.magenta;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(7, 22);
  ctx.lineTo(0, 34);
  ctx.lineTo(-7, 22);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // stubby arms + legs
  const limbRim = loy > 0.6 ? C.cyan : C.purple;
  [[-36, 4, 12, 26], [24, 4, 12, 26], [-14, 30, 12, 20], [2, 30, 12, 20]].forEach(([x, y, ww, hh]) => {
    ctx.beginPath();
    ctx.rect(x, y, ww, hh);
    fillThenRim(ctx, limbRim, 1.4, C.gun);
  });

  // scan line
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

  // BIG messy head polygon
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
  fillThenRim(ctx, C.magenta, 2.4, bodyFill(ctx, 'magenta'));
  softShade(ctx, -6, -28, 20, 18, 0.26);

  // short body
  ctx.beginPath();
  ctx.ellipse(0, 28, 22, 18, 0, 0, Math.PI * 2);
  fillThenRim(ctx, C.magenta, 2.2, bodyFill(ctx, 'magenta'));
  softShade(ctx, -3, 22, 14, 10, 0.2);

  vein(ctx, c => { c.moveTo(-16, -30); c.bezierCurveTo(0, -10, 18, -20, 20, 10); }, C.magenta, 2.4, 0.7 + Math.sin(t * 7) * 0.25);
  vein(ctx, c => { c.moveTo(8, -48); c.lineTo(-4, -12); }, C.cyan, 1.6, 0.7);

  // multi-mouth
  [[-8, -22, 6], [14, -18, 5], [0, -6, 7]].forEach(([x, y, r], i) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = i === 2 ? C.alert : C.magenta;
    ctx.shadowColor = i === 2 ? C.alert : C.magenta;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // jagged stub arms (glow strokes)
  ctx.strokeStyle = C.cyanSoft;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.shadowColor = C.cyanSoft;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(-22, 18); ctx.lineTo(-40, 32); ctx.lineTo(-34, 38);
  ctx.moveTo(20, 18); ctx.lineTo(42, 28); ctx.lineTo(36, 36);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // stub feet
  ctx.beginPath();
  ctx.rect(-16, 40, 12, 12);
  fillThenRim(ctx, C.magenta, 1.4, C.gun);
  ctx.beginPath();
  ctx.rect(4, 40, 12, 12);
  fillThenRim(ctx, C.magenta, 1.4, C.gun);

  ctx.restore();
}

function drawMelt(ctx, t) {
  // Q slag puddle
  ctx.beginPath();
  ctx.ellipse(0, 28, 48, 16, 0, 0, Math.PI * 2);
  fillThenRim(ctx, C.alert, 1.6, '#0e0c12');

  // melted chibi head remnant
  ctx.beginPath();
  ctx.ellipse(0, 2, 26, 18, 0.1, 0, Math.PI * 2);
  fillThenRim(ctx, C.magenta, 1.8, bodyFill(ctx, 'alert'));
  softShade(ctx, -4, -2, 14, 10, 0.18);

  // dying wide slit
  ctx.fillStyle = Math.sin(t * 7) > 0 ? C.alert : '#401018';
  ctx.shadowColor = C.alert;
  ctx.shadowBlur = Math.sin(t * 7) > 0 ? 10 : 0;
  ctx.beginPath();
  ctx.roundRect(-12, -4, 24, 6, 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // smoke
  ctx.strokeStyle = C.cyan;
  ctx.globalAlpha = 0.3;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 6;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const x = -12 + i * 12;
    ctx.moveTo(x, -10);
    ctx.bezierCurveTo(x - 6, -28 - i * 6, x + 8, -40 - i * 5, x + Math.sin(t + i) * 5, -52 - i * 8);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
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
