// Dapur Kilat — the three screenshot scenes behind ?shot=cover|rush|end.
// Each one builds its frame through the game's own state (spawnOrder, the
// plate helpers, the real rules) with a fixed seed, so the picture is what
// a real shift looks like at that moment — never a mock-up.

/**
 * Set `world` to the named scene and return it. Unknown names stage the
 * cover, so a bad query still shows the game at its best.
 */
export function stageShot(name, world) {
  world.screen = 'play';
  if (name === 'rush') return stageRush(world);
  if (name === 'end') return stageEnd(world);
  return stageCover(world);
}

/** Cover: a busy mid-shift — three orders, a dish half-built on the plate. */
function stageCover(world) {
  world.timeLeft = 118;
  world.coins = 240;
  world.combo = 2;
  world.bestCombo = 2;
  world.served = 3;
  world.orders = [
    { id: 1, recipe: 'burger', patience: 38, maxPatience: 45 },
    { id: 2, recipe: 'salad', patience: 26, maxPatience: 45 },
    { id: 3, recipe: 'sandwich', patience: 14, maxPatience: 45 },
  ];
  world.plate = ['bun', 'patty'];
  world.platedDish = null;
  world.board = { id: 'tomato', hits: 2 };
  world.grill = { id: 'patty', progress: 2.5 };
  world.chef.x = 640;
  world.chef.y = 520;
  world.chef.carrying = { id: 'cheese', prepared: true };
  world.message = 'Keju siap — susun di piring!';
  world.messageUntil = 999;
  return world;
}

/** Rush: the last half-minute, a finished Burger Kilat on its way out. */
function stageRush(world) {
  world.timeLeft = 24;
  world.coins = 480;
  world.combo = 3;
  world.bestCombo = 3;
  world.served = 6;
  world.orders = [
    { id: 4, recipe: 'burger', patience: 12, maxPatience: 45 },
    { id: 5, recipe: 'salad', patience: 8, maxPatience: 45 },
    { id: 6, recipe: 'sandwich', patience: 30, maxPatience: 45 },
  ];
  world.plate = [];
  world.platedDish = null;
  world.board = { id: 'lettuce', hits: 1 };
  world.grill = null;
  world.chef.x = 1080;
  world.chef.y = 300;
  world.chef.carrying = { dish: 'burger' };
  world.message = 'Burger Kilat siap diantar!';
  world.messageUntil = 999;
  return world;
}

/** End: the shift-over screen with a shift worth bragging about. */
function stageEnd(world) {
  world.screen = 'over';
  world.timeLeft = 0;
  world.coins = 640;
  world.served = 8;
  world.bestCombo = 4;
  world.hearts = 2;
  world.orders = [];
  return world;
}
