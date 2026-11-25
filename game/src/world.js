// Dapur Kilat — the kitchen state and its rules. No drawing here: this file
// owns orders, the chef's hands, the chopping board, the grill, the plate
// and the score, and answers one question per function.
import {
  CHEF, CHOP_HITS, FLOOR, GRILL_SECONDS, INGREDIENTS, MAX_HEARTS,
  MAX_ORDERS, ORDER_PATIENCE, ORDER_SPAWN_RUSH_SECONDS, ORDER_SPAWN_SECONDS,
  RECIPES, RUSH_AT_SECONDS_LEFT, SHIFT_SECONDS, STATIONS, TIP_MAX,
} from './config.js';
import { makeRng, pick } from './random.js';

let orderCounter = 0;

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

/** True when the plate's prepared ingredients are exactly one recipe. */
export function recipeForPlate(items) {
  const sorted = [...items].sort().join(',');
  return RECIPES.find((recipe) => [...recipe.needs].sort().join(',') === sorted) ?? null;
}

export function createWorld(seed = 1) {
  return {
    rng: makeRng(seed),
    screen: 'title',
    chef: { x: CHEF.startX, y: CHEF.startY, dir: 1, carrying: null, moving: false },
    orders: [],
    board: null, // { id, hits }
    grill: null, // { id, progress }
    plate: [], // prepared ingredient ids on the plate
    platedDish: null, // recipe id once the plate is a complete dish
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    timeLeft: SHIFT_SECONDS,
    spawnIn: 4,
    message: '',
    messageUntil: 0,
    shakeUntil: 0,
    elapsed: 0,
    particles: [],
  };
}

export function resetWorld(world, seed = 1) {
  const fresh = createWorld(seed);
  Object.assign(world, fresh, { screen: 'play' });
}

export function stationById(id) {
  return STATIONS.find((station) => station.id === id);
}

function say(world, text) {
  world.message = text;
  world.messageUntil = world.elapsed + 2.2;
}

function burst(world, x, y, color, count = 10) {
  for (let i = 0; i < count; i += 1) {
    world.particles.push({
      x, y,
      vx: (world.rng() - 0.5) * 220,
      vy: -40 - world.rng() * 160,
      life: 0.6 + world.rng() * 0.4,
      age: 0,
      color,
    });
  }
}

/** Open a new order for a random recipe. */
export function spawnOrder(world) {
  if (world.orders.length >= MAX_ORDERS) return;
  const recipe = pick(world.rng, RECIPES);
  orderCounter += 1;
  world.orders.push({
    id: orderCounter,
    recipe: recipe.id,
    patience: ORDER_PATIENCE,
    maxPatience: ORDER_PATIENCE,
  });
}

function nearestStation(world) {
  const chef = world.chef;
  let best = null;
  let bestDistance = 78;
  for (const station of STATIONS) {
    const cx = station.x + station.w / 2;
    const cy = station.y + station.h / 2;
    const dx = cx - chef.x;
    const dy = cy - chef.y;
    const distance = Math.hypot(dx, dy);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = station;
    }
  }
  return best;
}

/** The chef's hands: one thing at a time, raw, prepared, or a plated dish. */
export function handsLabel(world) {
  const carrying = world.chef.carrying;
  if (!carrying) return '';
  if (carrying.dish) return recipeById(carrying.dish).name;
  const ingredient = INGREDIENTS[carrying.id];
  return ingredient.name + (carrying.prepared ? '' : ' (mentah)');
}

/**
 * One interaction with the nearest station (E, Space, or a click on it).
 * Returns a sound key for audio.js: 'pickup' | 'chop' | 'sizzle' | 'plate'
 * | 'serve' | 'deny' | 'trash' | null.
 */
export function interact(world) {
  if (world.screen !== 'play') return null;
  const station = nearestStation(world);
  if (!station) {
    say(world, 'Dekati meja dulu!');
    return 'deny';
  }
  const chef = world.chef;
  const cx = station.x + station.w / 2;
  const cy = station.y + station.h / 2;

  if (station.kind === 'bin') {
    if (chef.carrying) {
      say(world, 'Tangan sudah penuh!');
      return 'deny';
    }
    const ingredient = INGREDIENTS[station.gives];
    chef.carrying = { id: station.gives, prepared: ingredient.needs === null };
    burst(world, cx, cy, ingredient.color, 6);
    return 'pickup';
  }

  if (station.kind === 'board') {
    if (world.board) {
      if (chef.carrying) return 'deny';
      world.board.hits += 1;
      burst(world, cx, cy, '#e8b96a', 8);
      if (world.board.hits >= CHOP_HITS) {
        chef.carrying = { id: world.board.id, prepared: true };
        world.board = null;
        say(world, `${INGREDIENTS[chef.carrying.id].name} selesai dicincang!`);
        return 'chop';
      }
      return 'chop';
    }
    if (chef.carrying && INGREDIENTS[chef.carrying.id].needs === 'chop' && !chef.carrying.prepared) {
      world.board = { id: chef.carrying.id, hits: 0 };
      chef.carrying = null;
      return 'pickup';
    }
    say(world, 'Talenan: taruh tomat / selada mentah');
    return 'deny';
  }

  if (station.kind === 'grill') {
    if (world.grill) {
      if (world.grill.progress >= GRILL_SECONDS) {
        if (chef.carrying) return 'deny';
        chef.carrying = { id: world.grill.id, prepared: true };
        world.grill = null;
        say(world, 'Patty matang sempurna!');
        return 'pickup';
      }
      say(world, 'Patty masih dipanggang…');
      return 'deny';
    }
    if (chef.carrying && INGREDIENTS[chef.carrying.id].needs === 'grill' && !chef.carrying.prepared) {
      world.grill = { id: chef.carrying.id, progress: 0 };
      chef.carrying = null;
      return 'sizzle';
    }
    say(world, 'Panggangan: taruh patty mentah');
    return 'deny';
  }

  if (station.kind === 'plate') {
    if (world.platedDish) {
      if (chef.carrying) return 'deny';
      chef.carrying = { dish: world.platedDish };
      world.platedDish = null;
      world.plate = [];
      return 'pickup';
    }
    if (!chef.carrying || chef.carrying.dish || !chef.carrying.prepared) {
      say(world, 'Piring: taruh bahan yang sudah siap');
      return 'deny';
    }
    if (world.plate.includes(chef.carrying.id)) {
      say(world, 'Bahan itu sudah di piring!');
      return 'deny';
    }
    world.plate.push(chef.carrying.id);
    burst(world, cx, cy, INGREDIENTS[chef.carrying.id].color, 8);
    chef.carrying = null;
    const done = recipeForPlate(world.plate);
    if (done) {
      world.platedDish = done.id;
      say(world, `${done.name} siap diantar!`);
      return 'serve';
    }
    return 'plate';
  }

  if (station.kind === 'window') {
    if (!chef.carrying || !chef.carrying.dish) {
      say(world, 'Antar piring yang sudah lengkap!');
      return 'deny';
    }
    const orderIndex = world.orders.findIndex((order) => order.recipe === chef.carrying.dish);
    if (orderIndex === -1) {
      say(world, 'Tidak ada yang pesan itu!');
      world.shakeUntil = world.elapsed + 0.3;
      return 'deny';
    }
    const order = world.orders[orderIndex];
    const recipe = recipeById(order.recipe);
    const tip = Math.round((order.patience / order.maxPatience) * TIP_MAX);
    const multiplier = 1 + Math.min(world.combo, 4) * 0.25;
    const earned = Math.round((recipe.base + tip) * multiplier);
    world.coins += earned;
    world.served += 1;
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    world.orders.splice(orderIndex, 1);
    chef.carrying = null;
    burst(world, cx, cy, '#f2c94c', 18);
    say(world, `Disajikan! +${earned} koin${world.combo > 1 ? ` (kombo x${world.combo})` : ''}`);
    return 'serve';
  }

  if (station.kind === 'trash') {
    if (chef.carrying) {
      chef.carrying = null;
      return 'trash';
    }
    if (world.plate.length > 0) {
      world.plate = [];
      world.platedDish = null;
      return 'trash';
    }
    say(world, 'Tidak ada yang dibuang');
    return 'deny';
  }
  return null;
}

function pushOutOfStations(world) {
  const chef = world.chef;
  for (const station of STATIONS) {
    const nearestX = Math.max(station.x, Math.min(chef.x, station.x + station.w));
    const nearestY = Math.max(station.y, Math.min(chef.y, station.y + station.h));
    const dx = chef.x - nearestX;
    const dy = chef.y - nearestY;
    const distance = Math.hypot(dx, dy);
    if (distance < CHEF.radius && distance > 0) {
      chef.x = nearestX + (dx / distance) * CHEF.radius;
      chef.y = nearestY + (dy / distance) * CHEF.radius;
    } else if (distance === 0) {
      chef.y = station.y + station.h + CHEF.radius;
    }
  }
}

/** Advance the shift by `dt` seconds: movement, grill, orders, timer. */
export function updateWorld(world, dt, moveX, moveY) {
  if (world.screen !== 'play') return;
  world.elapsed += dt;
  world.timeLeft -= dt;

  const chef = world.chef;
  const length = Math.hypot(moveX, moveY);
  chef.moving = length > 0;
  if (length > 0) {
    chef.x += (moveX / length) * CHEF.speed * dt;
    chef.y += (moveY / length) * CHEF.speed * dt;
    if (moveX !== 0) chef.dir = moveX > 0 ? 1 : -1;
  }
  chef.x = Math.max(FLOOR.left + CHEF.radius, Math.min(FLOOR.right - CHEF.radius, chef.x));
  chef.y = Math.max(FLOOR.top + CHEF.radius, Math.min(FLOOR.bottom - CHEF.radius, chef.y));
  pushOutOfStations(world);

  if (world.grill && world.grill.progress < GRILL_SECONDS) {
    world.grill.progress = Math.min(GRILL_SECONDS, world.grill.progress + dt);
  }

  const rush = world.timeLeft <= RUSH_AT_SECONDS_LEFT;
  world.spawnIn -= dt;
  if (world.spawnIn <= 0) {
    spawnOrder(world);
    world.spawnIn = rush ? ORDER_SPAWN_RUSH_SECONDS : ORDER_SPAWN_SECONDS;
  }
  for (let i = world.orders.length - 1; i >= 0; i -= 1) {
    const order = world.orders[i];
    order.patience -= dt * (rush ? 1.4 : 1);
    if (order.patience <= 0) {
      world.orders.splice(i, 1);
      world.hearts -= 1;
      world.combo = 0;
      world.shakeUntil = world.elapsed + 0.4;
      say(world, `Pesanan ${recipeById(order.recipe).name} hangus! -1 ❤`);
    }
  }

  for (let i = world.particles.length - 1; i >= 0; i -= 1) {
    const particle = world.particles[i];
    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 320 * dt;
    if (particle.age >= particle.life) world.particles.splice(i, 1);
  }

  if (world.timeLeft <= 0 || world.hearts <= 0) {
    world.timeLeft = Math.max(0, world.timeLeft);
    world.screen = 'over';
  }
}

/** One-line summary the end screen shows. */
export function shiftSummary(world) {
  return {
    coins: world.coins,
    served: world.served,
    bestCombo: world.bestCombo,
    heartsLeft: world.hearts,
  };
}
