// Dapur Kilat — layout, recipes and tuning. One job: the numbers and names
// every other module reads, so a balance change touches this file only.
export const VIEW = { width: 1280, height: 720 };
export const FLOOR = { top: 176, bottom: 700, left: 24, right: 1256 };

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 45;
export const RUSH_AT_SECONDS_LEFT = 30;

// Ingredient ids. A dish is a set of prepared ingredients; the plate checks
// the set, so the same ingredient can never be added twice.
export const INGREDIENTS = {
  bun:     { name: 'Roti',     color: '#e8b96a', dark: '#b9832f', emoji: '🍞', needs: null },
  patty:   { name: 'Patty',    color: '#8a5a33', dark: '#5f3a1e', emoji: '🥩', needs: 'grill' },
  cheese:  { name: 'Keju',     color: '#f2c94c', dark: '#c79a1d', emoji: '🧀', needs: null },
  tomato:  { name: 'Tomat',    color: '#e4572e', dark: '#a83216', emoji: '🍅', needs: 'chop' },
  lettuce: { name: 'Selada',   color: '#7bc96f', dark: '#4a8f3f', emoji: '🥬', needs: 'chop' },
};

export const RECIPES = [
  {
    id: 'burger',
    name: 'Burger Kilat',
    needs: ['bun', 'patty', 'cheese'],
    base: 100,
    color: '#e8b96a',
  },
  {
    id: 'salad',
    name: 'Salad Segar',
    needs: ['tomato', 'lettuce'],
    base: 80,
    color: '#7bc96f',
  },
  {
    id: 'sandwich',
    name: 'Sandwich Keju',
    needs: ['bun', 'cheese', 'tomato'],
    base: 90,
    color: '#f2c94c',
  },
];

// Stations. `kind` decides the interaction; `gives` names the ingredient a
// bin hands out. Coordinates are in canvas pixels.
export const STATIONS = [
  { id: 'bin-bun',     kind: 'bin',   gives: 'bun',     x: 48,  y: 176, w: 118, h: 64, label: 'ROTI' },
  { id: 'bin-patty',   kind: 'bin',   gives: 'patty',   x: 178, y: 176, w: 118, h: 64, label: 'PATTY' },
  { id: 'bin-cheese',  kind: 'bin',   gives: 'cheese',  x: 308, y: 176, w: 118, h: 64, label: 'KEJU' },
  { id: 'bin-tomato',  kind: 'bin',   gives: 'tomato',  x: 438, y: 176, w: 118, h: 64, label: 'TOMAT' },
  { id: 'bin-lettuce', kind: 'bin',   gives: 'lettuce', x: 568, y: 176, w: 118, h: 64, label: 'SELADA' },
  { id: 'grill',       kind: 'grill',                 x: 716, y: 176, w: 150, h: 64, label: 'PANGGANG' },
  { id: 'board',       kind: 'board',                 x: 898, y: 176, w: 150, h: 64, label: 'TALENAN' },
  { id: 'window',      kind: 'window',                x: 1080, y: 176, w: 176, h: 64, label: '▲ ANTAR ▲' },
  { id: 'plate',       kind: 'plate',                 x: 560, y: 596, w: 160, h: 72, label: 'PIRING SAJI' },
  { id: 'trash',       kind: 'trash',                 x: 1120, y: 596, w: 120, h: 72, label: 'SAMPAH' },
];

export const CHEF = { radius: 22, speed: 250, startX: 640, startY: 440 };

export const CHOP_HITS = 3;
export const GRILL_SECONDS = 4;
export const ORDER_SPAWN_SECONDS = 14;
export const ORDER_SPAWN_RUSH_SECONDS = 9;
export const TIP_MAX = 50;
