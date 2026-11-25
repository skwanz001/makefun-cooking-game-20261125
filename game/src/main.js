// Dapur Kilat — the game loop: input in, world forward, canvas out.
// `?shot=cover|rush|end&seed=N` stages one frozen frame for screenshots.
import { VIEW } from './config.js';
import { createAudio } from './audio.js';
import { consumeClick, consumeInteract, consumeMute, consumeRestart, createInput, moveVector } from './input.js';
import { drawWorld } from './render.js';
import { stageShot } from './shots.js';
import { createWorld, interact, resetWorld, updateWorld } from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') ?? '1') || 1;

const world = createWorld(seed);
const input = createInput(canvas);
const audio = createAudio();
window.__world = world;

if (shotName) {
  stageShot(shotName, world);
  drawWorld(ctx, world);
  window.__shotReady = true;
} else {
  let last = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (consumeMute(input)) {
      const muted = audio.toggleMute();
      world.message = muted ? 'Suara mati (M untuk nyalakan)' : 'Suara nyala';
      world.messageUntil = world.elapsed + 1.5;
    }

    if (world.screen === 'title') {
      if (consumeInteract(input) || consumeClick(input) || input.keys.has('Enter')) {
        audio.unlock();
        resetWorld(world, seed);
      }
    } else if (world.screen === 'over') {
      if (consumeRestart(input) || consumeClick(input) || input.keys.has('Enter')) {
        audio.unlock();
        resetWorld(world, seed);
      }
    } else if (world.screen === 'play') {
      if (consumeRestart(input)) resetWorld(world, seed);
      const move = moveVector(input, world.chef.x, world.chef.y);
      updateWorld(world, dt, move.x, move.y);
      if (consumeInteract(input)) {
        const sound = interact(world);
        if (sound) audio.play(sound);
      }
      if (world.screen === 'over') audio.play('over');
    }

    drawWorld(ctx, world);
    requestAnimationFrame(frame);
  }

  // Any first gesture unlocks audio; the title screen waits for Enter/click.
  window.addEventListener('pointerdown', () => audio.unlock(), { once: true });
  window.addEventListener('keydown', () => audio.unlock(), { once: true });
  requestAnimationFrame(frame);
}
