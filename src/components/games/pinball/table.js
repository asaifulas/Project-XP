/** Logical table size (portrait Space Cadet–inspired layout). */
export const TABLE_W = 360
export const TABLE_H = 560

export const BALL_R = 7
export const GRAVITY = 980
export const WALL_RESTITUTION = 0.72
export const BUMPER_RESTITUTION = 1.35
export const FLIPPER_RESTITUTION = 1.15
export const MAX_BALL_SPEED = 920

export const FLIPPER = {
  length: 52,
  restAngle: 0.42,
  activeAngle: -0.55,
  speed: 14,
}

/**
 * Static geometry for one table.
 * Segments are { ax, ay, bx, by }. Circles { x, y, r, score?, cap? }.
 * Decor fields are render-only (lights, platforms, wormholes).
 */
export function createTableLayout() {
  const W = TABLE_W
  const H = TABLE_H
  const inset = 18

  const walls = [
    // Outer frame
    { ax: inset, ay: inset, bx: W - inset, by: inset },
    { ax: inset, ay: inset, bx: inset, by: H - 40 },
    { ax: W - inset, ay: inset, bx: W - inset, by: H - 90 },
    // Plunge lane divider
    { ax: W - 48, ay: 80, bx: W - 48, by: H - 70 },
    // Left / right lower rails into flippers
    { ax: inset, ay: H - 140, bx: 110, by: H - 78 },
    { ax: W - 48, ay: H - 140, bx: W - 118, by: H - 78 },
    // Top arch (polyline)
    { ax: inset, ay: 90, bx: 70, by: inset + 8 },
    { ax: W - inset, ay: 90, bx: W - 70, by: inset + 8 },
    // Slingshot diamonds
    { ax: 70, ay: H - 200, bx: 105, by: H - 160 },
    { ax: 105, ay: H - 160, bx: 70, by: H - 130 },
    { ax: W - 118, ay: H - 200, bx: W - 153, by: H - 160 },
    { ax: W - 153, ay: H - 160, bx: W - 118, by: H - 130 },
    // Launch platform shelf (left mid)
    { ax: inset, ay: 310, bx: 118, by: 310, kind: 'shelf' },
    { ax: 118, ay: 310, bx: 118, by: 370, kind: 'shelf' },
    { ax: 118, ay: 370, bx: inset, by: 400, kind: 'shelf' },
  ]

  // Attack cluster (orbits slowly) + center mover + static engine / sat
  const bumpers = [
    {
      x: 108,
      y: 142,
      r: 15,
      score: 100,
      cap: 'red',
      kind: 'attack',
      motion: { cx: 108, cy: 142, radius: 16, speed: 0.55, phase: 0 },
    },
    {
      x: 168,
      y: 122,
      r: 15,
      score: 100,
      cap: 'blue',
      kind: 'attack',
      motion: { cx: 168, cy: 122, radius: 14, speed: 0.48, phase: 2.1 },
    },
    {
      x: 142,
      y: 182,
      r: 16,
      score: 150,
      cap: 'red',
      kind: 'attack',
      motion: { cx: 142, cy: 182, radius: 15, speed: -0.42, phase: 4.0 },
    },
    {
      x: 175,
      y: 268,
      r: 15,
      score: 200,
      cap: 'yellow',
      kind: 'center',
      motion: { cx: 175, cy: 268, radius: 18, speed: 0.28, phase: 1.2 },
      // Spinning "baseball bat" arm — hits ball or bumper does
      bat: {
        length: 46,
        halfWidth: 5,
        spinSpeed: 2.6,
        phase: 0.4,
        score: 175,
        kick: 420,
      },
    },
    { x: 58, y: 338, r: 12, score: 50, cap: 'yellow', kind: 'engine' },
    { x: 88, y: 364, r: 12, score: 50, cap: 'green', kind: 'engine' },
    { x: 48, y: 374, r: 11, score: 50, cap: 'blue', kind: 'engine' },
    { x: 248, y: 252, r: 13, score: 75, cap: 'yellow', kind: 'sat' },
  ]

  // Left-side auto-eject saucer (hold → kick toward playfield)
  const kicker = {
    x: 54,
    y: 255,
    r: 13,
    hold: 0.55,
    cooldown: 0.45,
    ejectVx: 320,
    ejectVy: -380,
    score: 250,
  }

  const leftFlipper = { x: 118, y: H - 72, side: 'left' }
  const rightFlipper = { x: W - 126, y: H - 72, side: 'right' }

  const drainY = H - 28
  const plunge = {
    x: W - 33,
    yMin: H - 100,
    yMax: H - 48,
    /** Weak tap (hold ~0). */
    launchVyMin: -220,
    /** Full pull (hold ≥ chargeTime). */
    launchVyMax: -720,
    /** Seconds of hold to reach max strength. */
    chargeTime: 1.05,
  }

  const decor = {
    mission: { x: 168, y: 408, r: 40 },
    wormholes: [
      { x: 218, y: 198, r: 13, hue: '#5c4878' },
      { x: 252, y: 348, r: 12, hue: '#543868' },
    ],
    laneLights: [
      { x: 52, y: 72, on: true },
      { x: 82, y: 56, on: true },
      { x: 112, y: 46, on: false },
      { x: 208, y: 46, on: true },
      { x: 238, y: 56, on: false },
      { x: 262, y: 72, on: true },
    ],
    arrows: [
      { x: 124, y: 98, rot: 0.25 },
      { x: 208, y: 96, rot: -0.35 },
      { x: 66, y: 286, rot: 1.15 },
      { x: 258, y: 292, rot: -1.05 },
    ],
    ramp: {
      // Slightly tighter purple ramp than a 1:1 XP trace
      points: [
        [30, 426],
        [42, 308],
        [58, 228],
        [86, 168],
        [128, 128],
        [158, 112],
        [152, 100],
        [116, 116],
        [74, 156],
        [48, 216],
        [34, 296],
        [24, 416],
      ],
    },
  }

  return {
    walls,
    bumpers,
    kicker,
    leftFlipper,
    rightFlipper,
    drainY,
    plunge,
    ballStart: { x: W - 33, y: H - 55 },
    decor,
  }
}

/**
 * Resolve bumper positions at time t (seconds). Orbiting bumpers drift around home.
 * @param {Array} bumpers
 * @param {number} time
 */
export function liveBumpers(bumpers, time) {
  return bumpers.map((b) => {
    let next = b
    if (b.motion) {
      const { cx, cy, radius, speed, phase } = b.motion
      const a = phase + time * speed
      next = {
        ...b,
        x: cx + Math.cos(a) * radius,
        y: cy + Math.sin(a) * radius * 0.85,
      }
    }
    if (next.bat) {
      const batAngle = (next.bat.phase ?? 0) + time * next.bat.spinSpeed
      next = { ...next, batAngle }
    }
    return next
  })
}

/**
 * Bat segment for a bumper that has a spinning arm (hub just outside bumper rim → tip).
 * @param {object} bumper live bumper (prefers batAngle from liveBumpers)
 * @param {number} [time=0]
 */
export function batSegment(bumper, time = 0) {
  if (!bumper?.bat) return null
  const angle =
    bumper.batAngle ?? (bumper.bat.phase ?? 0) + time * bumper.bat.spinSpeed
  const hub = bumper.r + 3
  const tip = hub + bumper.bat.length
  return {
    ax: bumper.x + Math.cos(angle) * hub,
    ay: bumper.y + Math.sin(angle) * hub,
    bx: bumper.x + Math.cos(angle) * tip,
    by: bumper.y + Math.sin(angle) * tip,
    kind: 'bat',
    angle,
    spinSpeed: bumper.bat.spinSpeed,
    score: bumper.bat.score ?? 100,
    kick: bumper.bat.kick ?? 400,
    halfWidth: bumper.bat.halfWidth ?? 5,
  }
}
