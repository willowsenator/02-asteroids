# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Asteroids** clone on HTML5 canvas: game loop with a `dt`-scaled timestep, 800 × 600 toroidal space, ship with thrust and inertia, asteroids in three sizes that split when destroyed, bullets with a time to live, explosion particles, progressive levels, 3 lives with invincibility on respawn and a score/level/lives HUD.
- **Triple shot** power-up: drops when an asteroid is destroyed, lasts 5 s and makes the ship fire three fanned bullets.
- **Temporary shield** power-up: lasts 6 s and, while it runs, pulverizes the asteroids it touches (scoring, exploding and splitting them) instead of destroying the ship. It is independent of the triple shot, so both can be active at once, and each shows its remaining time in the HUD. Both are lost on death and on level change.

### Changed

- Power-ups now **alternate type** on every drop instead of being drawn at random. The 50/50 draw was statistically correct but produced long runs of the same power-up, which in practice was perceived as a bias toward one of the two.
- README rewritten to describe the game as actually implemented.
- Project language unified to English: code comments, in-game HUD and overlay text, and documentation.

[Unreleased]: https://github.com/willowsenator/02-asteroids/commits/main
