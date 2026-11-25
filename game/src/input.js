// Dapur Kilat — keyboard and mouse. WASD / arrows move, E or Space
// interacts, R restarts, M mutes. A mouse click sets a walk target; a click
// on a station walks there and interacts on arrival.
import { STATIONS } from './config.js';

const MOVE_KEYS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    clickTarget: null, // { x, y, stationId }
    clicked: false, // any pointer press, consumed by title/over screens
    interactQueued: false,
    restartQueued: false,
    muteQueued: false,
  };

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === 'KeyE' || event.code === 'Space') state.interactQueued = true;
    if (event.code === 'KeyR') state.restartQueued = true;
    if (event.code === 'KeyM') state.muteQueued = true;
    keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (event) => {
    state.clicked = true;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const station = STATIONS.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
    state.clickTarget = station ? { x: station.x + station.w / 2, y: station.y + station.h + 30, stationId: station.id } : { x, y, stationId: null };
  });

  return state;
}

/** Movement vector from held keys, or toward the click target. */
export function moveVector(input, chefX, chefY) {
  let x = 0;
  let y = 0;
  for (const code of input.keys) {
    const vector = MOVE_KEYS[code];
    if (vector) {
      x += vector[0];
      y += vector[1];
    }
  }
  if (x !== 0 || y !== 0) {
    input.clickTarget = null;
    return { x, y };
  }
  const target = input.clickTarget;
  if (!target) return { x: 0, y: 0 };
  const dx = target.x - chefX;
  const dy = target.y - chefY;
  const distance = Math.hypot(dx, dy);
  if (distance < 10) {
    input.clickTarget = null;
    if (target.stationId) input.interactQueued = true;
    return { x: 0, y: 0 };
  }
  return { x: dx / distance, y: dy / distance };
}

export function consumeClick(input) {
  const clicked = input.clicked;
  input.clicked = false;
  return clicked;
}

export function consumeInteract(input) {
  const queued = input.interactQueued;
  input.interactQueued = false;
  return queued;
}

export function consumeRestart(input) {
  const queued = input.restartQueued;
  input.restartQueued = false;
  return queued;
}

export function consumeMute(input) {
  const queued = input.muteQueued;
  input.muteQueued = false;
  return queued;
}
