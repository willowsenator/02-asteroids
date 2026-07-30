'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────

const keys = {};
const justPressed ={};

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

const HANDLED = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];

addEventListener('keydown' , e => {
  if (HANDLED.includes(e.code)) e.preventDefault();
  if(e.repeat) return;
  keys[e.code] = true;
  justPressed[e.code] = true;
});

addEventListener('keyup', e =>  {
  if (HANDLED.includes(e.code)) e.preventDefault();
  keys[e.code] = false;
});

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
// Blink phase shared by spawn invincibility, the shield and expiring power-ups
const blinking = t => Math.floor(t * 8) % 2 === 0;

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // by size 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // base speed by size
const POINTS = [0, 100, 50, 20];  // points by size

// ── Power-up ──────────────────────────────────────────────────────────────────
const POWERUP_DROP  = 0.15;  // drop chance when an asteroid is destroyed
const POWERUP_TTL   = 8;     // seconds the pickup stays on screen
const TRIPLE_TIME   = 5;     // triple shot duration
const TRIPLE_SPREAD = 0.22;  // angular spread between bullets (rad)
const SHIELD_TIME   = 6;     // shield duration
const SHIELD_RADIUS = 20;    // radius of the protective ring around the ship

const POWERUP_COLORS = { triple: '#4df', shield: '#6f6' };

// The type alternates on every drop: random draws produced long runs of the same power-up.
// `initGame()` reseeds the starting point so the first drop of a game varies.
let lastPowerupType;

function nextPowerupType() {
  lastPowerupType = lastPowerupType === 'shield' ? 'triple' : 'shield';
  return lastPowerupType;
}

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Irregular polygon
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Power-up (triple shot or shield) ──────────────────────────────────────────
class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;   // 'triple' | 'shield'
    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 50);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rot = 0;
    this.radius = 11;
    this.ttl = POWERUP_TTL;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.rot += 2 * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Blink during the last seconds before disappearing
    if (this.ttl < 2 && blinking(this.ttl)) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = POWERUP_COLORS[this.type];
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (this.type === 'shield') {
      // Inner ring: the silhouette of the shield it grants
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Three fanned strokes: the silhouette of the shot it grants
      for (const offset of [-TRIPLE_SPREAD * 2, 0, TRIPLE_SPREAD * 2]) {
        ctx.beginPath();
        ctx.moveTo(Math.cos(offset) * 2, Math.sin(offset) * 2);
        ctx.lineTo(Math.cos(offset) * 7, Math.sin(offset) * 7);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.tripleShot    = 0;
    this.shield        = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.tripleShot    > 0) this.tripleShot    -= dt;
    if (this.shield        > 0) this.shield        -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    const angles = this.tripleShot > 0
      ? [-TRIPLE_SPREAD, 0, TRIPLE_SPREAD]
      : [0];
    return angles.map(offset => new Bullet(ox, oy, this.angle + offset));
  }

  draw() {
    if (this.dead) return;
    // Blink during respawn invincibility
    if (this.invincible > 0 && blinking(this.invincible)) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Classic silhouette: triangle with a rear notch
    ctx.beginPath();
    ctx.moveTo( 20,  0);   // nose
    ctx.lineTo(-12, -9);   // left wing
    ctx.lineTo( -7,  0);   // rear notch
    ctx.lineTo(-12,  9);   // right wing
    ctx.closePath();
    ctx.stroke();

    // Thruster flame
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    // Shield ring, blinking during the last second
    const shieldFadingOut = this.shield < 1 && blinking(this.shield);
    if (this.shield > 0 && !shieldFadingOut) {
      ctx.beginPath();
      ctx.arc(0, 0, SHIELD_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = POWERUP_COLORS.shield;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Particles (explosion) ─────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Game state ────────────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  lastPowerupType = Math.random() < 0.5 ? 'triple' : 'shield';
  state  = 'playing';
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

// Destroys an asteroid (scores it, explodes it and accumulates its fragments).
// Shared by the bullet and the shield, which only differ in whether they drop a power-up.
function destroyAsteroid(asteroid, fragments) {
  asteroid.dead = true;
  score += POINTS[asteroid.size];
  explode(asteroid.x, asteroid.y, asteroid.size * 5);
  fragments.push(...asteroid.split());
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Shoot
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(p => !p.dead);

  // Bullet vs asteroid
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        destroyAsteroid(a, newAsteroids);
        if (Math.random() < POWERUP_DROP)
          powerups.push(new Powerup(a.x, a.y, nextPowerupType()));
      }
    }
  }
  bullets = bullets.filter(b => !b.dead);

  // Ship vs asteroid: the shield destroys it, otherwise it is lethal
  if (ship.shield > 0) {
    for (const a of asteroids) {
      if (!a.dead && dist(ship, a) < SHIELD_RADIUS + a.radius * 0.82)
        destroyAsteroid(a, newAsteroids);
    }
  } else if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (!a.dead && dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);

  // Ship vs power-up (picked up even during invincibility)
  if (!ship.dead) {
    for (const p of powerups) {
      if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
        p.dead = true;
        // Picking up another of the same type resets its timer
        if (p.type === 'shield') ship.shield     = SHIELD_TIME;
        else                     ship.tripleShot = TRIPLE_TIME;
      }
    }
    powerups = powerups.filter(p => !p.dead);
  }

  // Level cleared
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  // Remaining time of each active power-up
  ctx.textAlign = 'left';
  if (ship.tripleShot > 0) {
    ctx.fillStyle = POWERUP_COLORS.triple;
    ctx.fillText(`TRIPLE ${ship.tripleShot.toFixed(1)}`, 14, 46);
  }
  if (ship.shield > 0) {
    ctx.fillStyle = POWERUP_COLORS.shield;
    ctx.fillText(`SHIELD ${ship.shield.toFixed(1)}`, 14, 66);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  bullets.forEach(b => b.draw());
  powerups.forEach(p => p.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `SCORE: ${score}   —   SPACE TO RESTART`);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
