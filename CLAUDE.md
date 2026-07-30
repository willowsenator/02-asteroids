# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-file HTML5 Canvas clone of the arcade game **Asteroids**. No build step, no bundler, no dependencies, no tests. All game logic lives in `game.js`; `index.html` provides the `<canvas>` and loads the script.

## Running

Open `index.html` directly in a browser, or serve locally:

```bash
npx serve .
```

There is no lint, build, or test tooling configured.

## Architecture

`game.js` (strict mode, ES6+ classes, all in the global scope) is structured around a fixed-timestep-ish `requestAnimationFrame` loop:

- **`loop(ts)`** — computes `dt` (clamped to 0.05s to survive tab-switch stalls), then calls `update(dt)` and `draw()`. Physics is time-scaled by `dt`, so all speeds/accelerations are per-second.
- **Coordinate space** is toroidal: everything uses `wrap(v, max)` so objects crossing an edge reappear on the opposite side. Canvas is a fixed `W=800 × H=600`.

### Entities (each a class with `update(dt)` + `draw()` and a `dead` flag)

- **`Ship`** — thrust/drag physics, rotation, `invincible` timer (spawn blink), `shootCooldown`. `tryShoot()` returns new `Bullet`s from the nose. `reset()` re-centers on respawn/new level.
- **`Asteroid`** — size 1–3 indexing the parallel arrays `RADII` / `SPEEDS` / `POINTS` (index 0 unused). `split()` returns two asteroids one size smaller (empty at size 1). Shape is a randomized irregular polygon generated in the constructor.
- **`Bullet`** — TTL-limited projectile.
- **`Particle`** — short-lived explosion streak, spawned via `explode(x, y, count)`.

### Game state (module-level globals)

`state` is a string state machine: `'playing' | 'dead' | 'gameover'`. `update()` branches on it first. `initGame()` starts a fresh game; `nextLevel()` advances difficulty (more asteroids); `killShip()` handles life loss and the death/gameover transition. Collision detection is brute-force O(bullets × asteroids) and ship-vs-asteroid, using the `dist()` helper against summed radii.

### Input

Global `keys` (held) and `justPressed`/`pressed(code)` (edge-triggered, e.g. shooting and restart) maps populated by `keydown`/`keyup` listeners. Arrow keys and Space have their default scroll behavior prevented.

## Conventions

- Code comments and in-game HUD/overlay text are in **Spanish**; keep new comments and UI strings consistent with that.
- Tunable gameplay values are `const` uppercase locals inside the relevant method (e.g. `THRUST`, `DRAG`, `ROT` in `Ship.update`) or the top-level `RADII`/`SPEEDS`/`POINTS` arrays — adjust these rather than scattering magic numbers.
- Note: the README describes power-ups and a "shooting star" asteroid type that are **not** implemented in the current `game.js`.
