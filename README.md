# Asteroids

A clone of the classic **Asteroids** arcade game built on plain HTML5 canvas, with no dependencies and no bundler.

## Description

A spaceship in an asteroid field with edge wrapping (space is toroidal: whatever leaves through one edge reappears on the opposite one). Destroy asteroids to score: large ones split into two medium, and medium ones into two small. Clearing the screen advances a level and spawns more asteroids.

Destroying an asteroid can drop a power-up that drifts through space. The two types alternate, so you never get the same one twice in a row. They are told apart by color: **cyan** grants a triple shot (three fanned bullets for 5 seconds) and **green** raises a temporary 6-second shield that pulverizes any asteroid it touches instead of destroying the ship. The two are independent: you can have both active at once.

## Technologies

- **HTML5 Canvas** — 2D rendering (fixed 800 × 600 surface)
- **JavaScript (ES6+)** — game logic in a single `game.js` file
- No frameworks, no bundler, no dependencies

## How to run

Open `index.html` directly in the browser (double-click), or use a local server:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

## Controls

| Key     | Action                     |
| ------- | -------------------------- |
| `←` `→` | Rotate ship                |
| `↑`     | Thrust                     |
| `Space` | Shoot                      |
| `Space` | Restart (on the end screen) |

## Scoring

| Asteroid | Points |
| -------- | ------ |
| Large    | 20     |
| Medium   | 50     |
| Small    | 100    |

## Features

- 3 lives with temporary invincibility on respawn (blinking)
- Asteroids split into smaller fragments when destroyed
- Explosion particles when asteroids are destroyed and when a life is lost
- Progressive levels: each level adds more asteroids
- Triple shot power-up: drops when asteroids are destroyed, lasts 5 s and is lost on death
- Temporary shield power-up: lasts 6 s, destroys (and scores) any asteroid it touches and is also lost on death
- HUD with score, level, remaining lives and the remaining time of each active power-up
