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
- **Shared helpers** live with `wrap`/`dist`/`rand`: `blinking(t)` is the on/off phase used by every fading-out visual (spawn invincibility, the shield ring, and expiring power-ups) — reuse it rather than re-deriving the `Math.floor(t * 8) % 2` formula.

### Entities (each a class with `update(dt)` + `draw()` and a `dead` flag)

- **`Ship`** — thrust/drag physics, rotation, `invincible` timer (spawn blink), `shootCooldown`. `tryShoot()` returns new `Bullet`s from the nose. `reset()` re-centers on respawn/new level.
- **`Asteroid`** — size 1–3 indexing the parallel arrays `RADII` / `SPEEDS` / `POINTS` (index 0 unused). `split()` returns two asteroids one size smaller (empty at size 1). Shape is a randomized irregular polygon generated in the constructor.
- **`Bullet`** — TTL-limited projectile.
- **`Particle`** — short-lived explosion streak, spawned via `explode(x, y, count)`.
- **`Powerup`** — drifting pickup with a `type` field (`'triple' | 'shield'`, colored via `POWERUP_COLORS`). Spawns with probability `POWERUP_DROP` where an asteroid died, expires after `POWERUP_TTL` (blinking near the end). The type is **not** random per drop: `nextPowerupType()` strictly alternates it via the module-level `lastPowerupType`, which `initGame()` seeds randomly so the first drop of a game varies. Independent 50/50 draws produced long runs of the same pickup, which played as a bias. On ship contact it sets one of two independent `Ship` timers, which both show in the HUD and are both lost on respawn and level change (`Ship.reset()`):
  - `'triple'` → `ship.tripleShot = TRIPLE_TIME`, making `tryShoot()` emit three bullets spread by `TRIPLE_SPREAD`.
  - `'shield'` → `ship.shield = SHIELD_TIME`, drawing a ring of `SHIELD_RADIUS` around the ship. While it runs, ship-vs-asteroid contact destroys the asteroid (scores, explodes, splits) instead of calling `killShip()`, and the timer keeps running — several asteroids can be absorbed in one frame. Both collision blocks feed the same `newAsteroids` array, reconciled into `asteroids` once after both, so shield-spawned fragments aren't re-evaluated in the frame that created them.

### Game state (module-level globals)

`state` is a string state machine: `'playing' | 'dead' | 'gameover'`. `update()` branches on it first. `initGame()` starts a fresh game; `nextLevel()` advances difficulty (more asteroids); `killShip()` handles life loss and the death/gameover transition. Collision detection is brute-force O(bullets × asteroids) and ship-vs-asteroid, using the `dist()` helper against summed radii. Both paths that can destroy an asteroid (a bullet hit, or a shielded ship ramming it) go through `destroyAsteroid(asteroid, fragments)`, which marks it dead, scores it, explodes it and accumulates its split — only the bullet path additionally rolls for a power-up drop.

### Input

Global `keys` (held) and `justPressed`/`pressed(code)` (edge-triggered, e.g. shooting and restart) maps populated by `keydown`/`keyup` listeners. Arrow keys and Space have their default scroll behavior prevented.

## Conventions

- **The whole project is in English** — identifiers, code comments, in-game HUD/overlay text, documentation and commit messages. Keep new code and UI strings consistent with that; do not reintroduce Spanish.
- Tunable gameplay values are `const` uppercase locals inside the relevant method (e.g. `THRUST`, `DRAG`, `ROT` in `Ship.update`) or top-level constants (`RADII`/`SPEEDS`/`POINTS`, and the `POWERUP_*`/`TRIPLE_*`/`SHIELD_*` group) — adjust these rather than scattering magic numbers.
