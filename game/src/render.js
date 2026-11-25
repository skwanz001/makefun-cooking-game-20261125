// Dapur Kilat — everything the player sees, drawn on one canvas. No images,
// no emoji (the grading machine has no colour-emoji font): every dish,
// counter and the chef are drawn from shapes, in one warm palette — cream
// walls, terracotta tile, wood counters, a single amber accent.
import {
  CHEF, CHOP_HITS, GRILL_SECONDS, INGREDIENTS, MAX_HEARTS,
  STATIONS, VIEW,
} from './config.js';
import { handsLabel, recipeById } from './world.js';

const CREAM = '#f7ead1';
const WALL = '#e9d3ac';
const TILE_A = '#f3e2c2';
const TILE_B = '#e7cf9f';
const WOOD = '#a9713f';
const WOOD_DARK = '#7d4f27';
const COUNTER = '#c98d54';
const INK = '#33241a';
const AMBER = '#e8a13a';
const RED = '#d64533';
const GREEN = '#4a8f3f';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Noto Sans", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

/** The food, drawn from shapes: each ingredient reads at a glance. */
export function drawIngredient(ctx, id, x, y, size) {
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = '#e8b96a';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.08, s * 0.5, s * 0.34, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#d99a3f';
    ctx.fillRect(-s * 0.5, -s * 0.08, s, s * 0.16);
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-0.22, -0.3], [0, -0.38], [0.22, -0.3]]) {
      ctx.beginPath();
      ctx.ellipse(dx * s, dy * s, s * 0.05, s * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = '#8a5a33';
    roundRect(ctx, -s * 0.5, -s * 0.2, s, s * 0.4, s * 0.18);
    ctx.fill();
    ctx.strokeStyle = '#5f3a1e';
    ctx.lineWidth = s * 0.05;
    for (const dx of [-0.25, 0, 0.25]) {
      ctx.beginPath();
      ctx.moveTo(dx * s, -s * 0.14);
      ctx.lineTo(dx * s, s * 0.14);
      ctx.stroke();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.moveTo(-s * 0.48, s * 0.3);
    ctx.lineTo(s * 0.48, s * 0.3);
    ctx.lineTo(0, -s * 0.36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c79a1d';
    for (const [dx, dy] of [[-0.18, 0.12], [0.14, 0.05], [0, 0.2]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(0, s * 0.04, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7bc96f';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.38);
    ctx.lineTo(-s * 0.16, -s * 0.18);
    ctx.lineTo(0, -s * 0.26);
    ctx.lineTo(s * 0.16, -s * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.16, -s * 0.12, s * 0.1, s * 0.06, -0.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#7bc96f';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse((i - 1) * s * 0.26, (i % 2) * s * 0.08, s * 0.26, s * 0.3, (i - 1) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#4a8f3f';
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(0, s * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? RED : 'rgba(51,36,26,0.25)';
  ctx.fill();
  ctx.restore();
}

function drawChef(ctx, chef, carryingLabel) {
  const bob = chef.moving ? Math.sin(Date.now() / 90) * 2 : 0;
  const x = chef.x;
  const y = chef.y + bob;
  // Shadow.
  ctx.fillStyle = 'rgba(51,36,26,0.2)';
  ctx.beginPath();
  ctx.ellipse(x, chef.y + CHEF.radius * 0.85, CHEF.radius * 0.9, CHEF.radius * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: white apron over a terracotta shirt.
  ctx.fillStyle = '#d64533';
  ctx.beginPath();
  ctx.arc(x, y, CHEF.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  roundRect(ctx, x - CHEF.radius * 0.62, y - CHEF.radius * 0.2, CHEF.radius * 1.24, CHEF.radius * 1.05, 6);
  ctx.fill();
  // Head and toque.
  ctx.fillStyle = '#f2c79b';
  ctx.beginPath();
  ctx.arc(x, y - CHEF.radius * 0.95, CHEF.radius * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - CHEF.radius * 0.42, y - CHEF.radius * 1.5, CHEF.radius * 0.34, 0, Math.PI * 2);
  ctx.arc(x, y - CHEF.radius * 1.62, CHEF.radius * 0.38, 0, Math.PI * 2);
  ctx.arc(x + CHEF.radius * 0.42, y - CHEF.radius * 1.5, CHEF.radius * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - CHEF.radius * 0.55, y - CHEF.radius * 1.55, CHEF.radius * 1.1, CHEF.radius * 0.3);
  // Eyes look where the chef walks.
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x + chef.dir * 5 - 5, y - CHEF.radius * 0.98, 2.4, 0, Math.PI * 2);
  ctx.arc(x + chef.dir * 5 + 5, y - CHEF.radius * 0.98, 2.4, 0, Math.PI * 2);
  ctx.fill();
  // Carried item floats above the toque in a bubble.
  if (carryingLabel) {
    const label = carryingLabel;
    ctx.font = '700 15px "Noto Sans", sans-serif';
    const width = ctx.measureText(label).width + 18;
    const bx = x - width / 2;
    const by = y - CHEF.radius * 2.6;
    ctx.fillStyle = '#fffdf5';
    roundRect(ctx, bx, by, width, 26, 13);
    ctx.fill();
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, label, x, by + 14, 15, INK);
  }
}

function drawStation(ctx, station, world) {
  const { x, y, w, h } = station;
  ctx.fillStyle = WOOD_DARK;
  roundRect(ctx, x - 3, y - 3, w + 6, h + 10, 10);
  ctx.fill();
  ctx.fillStyle = station.kind === 'window' ? '#3f6d8e' : COUNTER;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 6, y + 5, w - 12, 8);

  if (station.kind === 'bin') {
    drawIngredient(ctx, station.gives, x + w / 2, y + h / 2 - 6, 40);
    text(ctx, station.label, x + w / 2, y + h - 11, 12, '#fffdf5');
  } else if (station.kind === 'grill') {
    ctx.fillStyle = '#3a3230';
    roundRect(ctx, x + 10, y + 8, w - 20, h - 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#6b5d52';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 10 + ((w - 20) / 4) * i, y + 10);
      ctx.lineTo(x + 10 + ((w - 20) / 4) * i, y + h - 18);
      ctx.stroke();
    }
    if (world.grill) {
      const done = world.grill.progress >= GRILL_SECONDS;
      drawIngredient(ctx, 'patty', x + w / 2, y + h / 2 - 4, 36);
      const ratio = world.grill.progress / GRILL_SECONDS;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(x + 12, y + h - 26, w - 24, 6);
      ctx.fillStyle = done ? GREEN : AMBER;
      ctx.fillRect(x + 12, y + h - 26, (w - 24) * ratio, 6);
      if (done) text(ctx, 'MATANG!', x + w / 2, y - 12, 13, GREEN);
    }
    text(ctx, station.label, x + w / 2, y + h - 11, 12, '#fffdf5');
  } else if (station.kind === 'board') {
    ctx.fillStyle = '#e8c98f';
    roundRect(ctx, x + 12, y + 10, w - 24, h - 28, 6);
    ctx.fill();
    if (world.board) {
      drawIngredient(ctx, world.board.id, x + w / 2, y + h / 2 - 8, 34);
      for (let i = 0; i < CHOP_HITS; i += 1) {
        ctx.fillStyle = i < world.board.hits ? AMBER : 'rgba(51,36,26,0.3)';
        ctx.beginPath();
        ctx.arc(x + w / 2 - 24 + i * 24, y + h - 26, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    text(ctx, station.label, x + w / 2, y + h - 11, 12, '#fffdf5');
  } else if (station.kind === 'window') {
    ctx.fillStyle = '#fdf6e3';
    roundRect(ctx, x + 10, y + 8, w - 20, h - 30, 6);
    ctx.fill();
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 26, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.fillRect(x + w / 2 - 2, y + 12, 4, 8);
    text(ctx, station.label, x + w / 2, y + h - 11, 13, '#fffdf5');
  } else if (station.kind === 'plate') {
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + 2, w / 2 - 8, h / 2 - 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = world.platedDish ? AMBER : '#d8c9a8';
    ctx.lineWidth = world.platedDish ? 4 : 2;
    ctx.stroke();
    world.plate.forEach((id, i) => {
      const angle = (i / Math.max(world.plate.length, 1)) * Math.PI * 2 - Math.PI / 2;
      drawIngredient(ctx, id, x + w / 2 + Math.cos(angle) * 26, y + h / 2 + 2 + Math.sin(angle) * 11, 26);
    });
    if (world.platedDish) {
      text(ctx, 'SIAP DIANTAR!', x + w / 2, y - 12, 14, AMBER);
    } else if (world.plate.length === 0) {
      text(ctx, station.label, x + w / 2, y + h - 11, 12, '#fffdf5');
    }
  } else if (station.kind === 'trash') {
    ctx.fillStyle = '#5b5348';
    roundRect(ctx, x + w / 2 - 22, y + 10, 44, h - 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#8a7f70';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + w / 2 - 22, y + 10, 44, h - 26);
    text(ctx, station.label, x + w / 2, y + h - 11, 12, '#fffdf5');
  }
}

function drawOrderCard(ctx, order, x, y, w, h) {
  const recipe = recipeById(order.recipe);
  const ratio = Math.max(0, order.patience / order.maxPatience);
  const urgent = ratio < 0.35;
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? RED : '#d8c9a8';
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, recipe.name, x + 12, y + 16, 16, INK, '800', 'left');
  recipe.needs.forEach((id, i) => {
    drawIngredient(ctx, id, x + 26 + i * 34, y + 44, 26);
  });
  // Patience bar.
  ctx.fillStyle = 'rgba(51,36,26,0.15)';
  roundRect(ctx, x + 12, y + h - 14, w - 24, 7, 3);
  ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? GREEN : ratio > 0.25 ? AMBER : RED;
  roundRect(ctx, x + 12, y + h - 14, (w - 24) * ratio, 7, 3);
  ctx.fill();
  text(ctx, `${Math.ceil(order.patience)} dtk`, x + w - 12, y + 16, 13, urgent ? RED : '#7a6a55', '700', 'right');
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function drawHud(ctx, world) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, VIEW.width, 64);
  text(ctx, 'DAPUR KILAT', 24, 33, 26, '#fdf6e3', '800', 'left');
  text(ctx, 'shift masak 150 detik', 24, 52, 11, '#b8a88f', '400', 'left');
  const rush = world.timeLeft <= 30 && world.screen === 'play';
  const timerColor = rush ? RED : '#fdf6e3';
  text(ctx, formatTime(world.timeLeft), VIEW.width / 2, 30, 34, timerColor, '800');
  text(ctx, rush ? 'RUSH! Pesanan makin cepat!' : 'WAKTU SHIFT', VIEW.width / 2, 53, 11, rush ? RED : '#b8a88f', '700');
  text(ctx, `${world.coins} koin`, VIEW.width - 24, 26, 20, AMBER, '800', 'right');
  for (let i = 0; i < MAX_HEARTS; i += 1) {
    drawHeart(ctx, VIEW.width - 150 + i * 28, 48, 18, i < world.hearts);
  }
  if (world.combo > 1) {
    text(ctx, `KOMBO x${world.combo}`, VIEW.width - 200, 26, 16, '#7bc96f', '800', 'right');
  }
}

function drawKitchen(ctx, world) {
  // Wall and floor.
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 64, VIEW.width, 112);
  ctx.fillStyle = TILE_A;
  ctx.fillRect(0, 176, VIEW.width, VIEW.height - 176);
  ctx.fillStyle = TILE_B;
  const tile = 56;
  for (let ty = 176; ty < VIEW.height; ty += tile) {
    for (let tx = ((ty / tile) % 2) * tile; tx < VIEW.width; tx += tile * 2) {
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
  // Wall tiles + hanging pans for a kitchen that looks lived in.
  ctx.fillStyle = 'rgba(51,36,26,0.08)';
  for (let x = 0; x < VIEW.width; x += 64) ctx.fillRect(x, 64, 2, 112);
  ctx.fillStyle = '#8a5a33';
  for (const [px, py, pr] of [[90, 120, 16], [1230, 120, 16], [640, 108, 13]]) {
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3230';
    ctx.beginPath();
    ctx.arc(px, py, pr - 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a5a33';
  }
  // Order board header.
  text(ctx, 'PAPAN PESANAN', 24, 84, 13, '#7a5c33', '800', 'left');
  // Stations.
  for (const station of STATIONS) drawStation(ctx, station, world);
  // Floor guide: a dotted path from plate to window, the rush route.
  ctx.strokeStyle = 'rgba(232,161,58,0.55)';
  ctx.lineWidth = 3;
  ctx.setLineDash([2, 12]);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(640, 596);
  ctx.quadraticCurveTo(900, 420, 1168, 260);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(30,20,12,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, VIEW.width / 2 - 360, 150, 720, 380, 18);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, title, VIEW.width / 2, 210, 44, INK, '800');
  lines.forEach((line, i) => {
    text(ctx, line.text, VIEW.width / 2, 268 + i * 36, line.size ?? 18, line.color ?? INK, line.weight ?? '400');
  });
}

export function drawWorld(ctx, world) {
  ctx.save();
  if (world.shakeUntil > world.elapsed) {
    ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
  }
  drawKitchen(ctx, world);

  // Order cards on the board.
  world.orders.forEach((order, i) => {
    drawOrderCard(ctx, order, 24 + i * 300, 96, 284, 72);
  });
  if (world.orders.length === 0 && world.screen === 'play') {
    text(ctx, 'Belum ada pesanan — siapkan bahan dulu!', 24, 132, 16, '#7a5c33', '600', 'left');
  }

  // Particles.
  for (const particle of world.particles) {
    ctx.globalAlpha = 1 - particle.age / particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawChef(ctx, world.chef, handsLabel(world));
  drawHud(ctx, world);

  // Toast message: just below the counter row, clear of the plate.
  if (world.message && world.elapsed < world.messageUntil) {
    ctx.font = '700 17px "Noto Sans", sans-serif';
    const width = ctx.measureText(world.message).width + 36;
    ctx.fillStyle = 'rgba(30,20,12,0.85)';
    roundRect(ctx, VIEW.width / 2 - width / 2, 252, width, 34, 17);
    ctx.fill();
    text(ctx, world.message, VIEW.width / 2, 270, 17, '#fdf6e3');
  }

  // Hint bar.
  if (world.screen === 'play') {
    text(ctx, 'WASD / panah: jalan   •   E / Spasi / klik: pakai meja   •   M: bisu   •   R: ulang', VIEW.width / 2, 706, 12, 'rgba(51,36,26,0.55)', '600');
  }

  if (world.screen === 'title') {
    drawOverlay(ctx, 'DAPUR KILAT', [
      { text: 'Koki tercepat di dapur! Rakit pesanan sebelum pelanggan kabur.', size: 18 },
      { text: 'Ambil bahan → cincang / panggang → susun di piring → antar!', size: 17, color: '#7a5c33' },
      { text: 'Burger Kilat: roti + patty panggang + keju', size: 16 },
      { text: 'Salad Segar: tomat cincang + selada cincang', size: 16 },
      { text: 'Sandwich Keju: roti + keju + tomat cincang', size: 16 },
      { text: 'Tekan ENTER atau klik untuk mulai masak', size: 19, color: AMBER, weight: '800' },
    ], AMBER);
  }

  if (world.screen === 'over') {
    const summary = world.coins;
    const best = world.served >= 8 ? 'Koki Bintang Lima!' : world.served >= 4 ? 'Koki Andal!' : 'Koki Magang — coba lagi!';
    drawOverlay(ctx, 'SHIFT SELESAI', [
      { text: best, size: 22, color: AMBER, weight: '800' },
      { text: `Koin: ${summary}   •   Pesanan disajikan: ${world.served}`, size: 19 },
      { text: `Kombo terbaik: x${world.bestCombo}   •   Hati tersisa: ${world.hearts}`, size: 17, color: '#7a5c33' },
      { text: 'Tekan R untuk masak satu shift lagi', size: 18, color: AMBER, weight: '800' },
    ], AMBER);
  }
  ctx.restore();
}
