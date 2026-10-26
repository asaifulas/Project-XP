import { getBallKind, createBall as makeBall } from './balls.js'
import {
  BALL_R,
  BUMPER_RESTITUTION,
  FLIPPER,
  FLIPPER_RESTITUTION,
  GRAVITY,
  MAX_BALL_SPEED,
  WALL_RESTITUTION,
  batSegment,
} from './table.js'

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function length(x, y) {
  return Math.hypot(x, y)
}

function normalize(x, y) {
  const len = length(x, y) || 1
  return { x: x / len, y: y / len }
}

function closestOnSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const ab2 = abx * abx + aby * aby || 1
  const t = clamp((apx * abx + apy * aby) / ab2, 0, 1)
  return { x: ax + abx * t, y: ay + aby * t }
}

/**
 * Flipper angle: restAngle (hanging down-ish) → activeAngle (kicked up).
 * Left pivot aims rightward; right pivot aims leftward.
 */
export function flipperSegment(pivot, side, angle) {
  const facing = side === 'left' ? 0 : Math.PI
  const a = facing + angle
  return {
    ax: pivot.x,
    ay: pivot.y,
    bx: pivot.x + Math.cos(a) * FLIPPER.length,
    by: pivot.y + Math.sin(a) * FLIPPER.length,
    kind: 'flipper',
    side,
  }
}

export function createInitialBall(start, kind = 'normal') {
  return makeBall(start, kind, BALL_R)
}

export function updateFlipperAngle(current, pressed, dt) {
  const target = pressed ? FLIPPER.activeAngle : FLIPPER.restAngle
  const delta = target - current
  const step = FLIPPER.speed * dt
  if (Math.abs(delta) <= step) return target
  return current + Math.sign(delta) * step
}

export function plungeLaunchVy(layout, power) {
  const p = clamp(power, 0, 1)
  const min = layout.plunge.launchVyMin ?? -220
  const max = layout.plunge.launchVyMax ?? layout.plunge.launchVy ?? -720
  return min + (max - min) * p
}

export function plungeBall(ball, layout, power = 1) {
  if (!ball.inLane) return ball
  return {
    ...ball,
    vy: plungeLaunchVy(layout, power),
    vx: (Math.random() - 0.5) * (24 + 28 * clamp(power, 0, 1)),
    inLane: true,
    pendingBounce: null,
    bounceDelayLeft: 0,
  }
}

function applyImpulse(ball, hit) {
  const vn = ball.vx * hit.nx + ball.vy * hit.ny
  if (vn < 0) {
    ball.vx -= (1 + hit.restitution) * vn * hit.nx
    ball.vy -= (1 + hit.restitution) * vn * hit.ny
  }
  if (hit.kickX || hit.kickY) {
    ball.vx += hit.kickX ?? 0
    ball.vy += hit.kickY ?? 0
  }
}

function applyExplosion(ball, nx, ny, def) {
  const blast = def.blastSpeed ?? 280
  const jitter = (Math.random() - 0.5) * 1.4
  const tx = -ny
  const ty = nx
  ball.vx += nx * blast + tx * blast * jitter
  ball.vy += ny * blast + ty * blast * jitter
}

/**
 * @returns {{ ball, scored, drained, kicker, fx: Array }}
 */
export function stepPinball(ball, flipperState, layout, dt, kickerState = null, bumpers = null) {
  const next = { ...ball, pendingBounce: ball.pendingBounce ? { ...ball.pendingBounce } : null }
  let scored = 0
  let drained = false
  const fx = []
  const kindDef = getBallKind(next.kind)
  const kicker = layout.kicker
  let kickerNext = kickerState
    ? { ...kickerState }
    : { hold: 0, cooldown: 0, active: false }

  if (kickerNext.cooldown > 0) {
    kickerNext.cooldown = Math.max(0, kickerNext.cooldown - dt)
  }

  // Resolve delayed kinetic bounce
  if (next.pendingBounce) {
    next.bounceDelayLeft = (next.bounceDelayLeft ?? 0) - dt
    if (next.bounceDelayLeft <= 0) {
      applyImpulse(next, next.pendingBounce)
      if (next.kind === 'explosive') {
        applyExplosion(next, next.pendingBounce.nx, next.pendingBounce.ny, kindDef)
        fx.push({ type: 'explosion', x: next.x, y: next.y, life: 0.28 })
        scored += kindDef.hitBonus
      } else if (next.kind === 'kinetic') {
        fx.push({ type: 'kinetic', x: next.x, y: next.y, life: 0.2 })
        scored += kindDef.hitBonus
      }
      next.pendingBounce = null
      next.bounceDelayLeft = 0
    }
  }

  // Held in left auto-eject saucer
  if (kicker && kickerNext.active) {
    next.x = kicker.x
    next.y = kicker.y
    next.vx = 0
    next.vy = 0
    next.inLane = false
    next.pendingBounce = null
    kickerNext.hold -= dt
    if (kickerNext.hold <= 0) {
      kickerNext.active = false
      kickerNext.hold = 0
      kickerNext.cooldown = kicker.cooldown ?? 0.4
      next.vx = kicker.ejectVx
      next.vy = kicker.ejectVy
      scored += kicker.score ?? 0
    }
    return { ball: next, scored, drained, kicker: kickerNext, fx }
  }

  if (!next.inLane) {
    next.vy += GRAVITY * dt
  }

  // Magnetic field: soft trajectory bend near bodies (not kicker / plunge lane)
  if (next.kind === 'magnetic' && !next.inLane) {
    const mag = applyMagnetic(next, layout, bumpers ?? layout.bumpers, dt)
    if (mag) {
      fx.push({ type: 'magnetic', x: next.x, y: next.y, life: 0.08 })
    }
  }

  next.x += next.vx * dt
  next.y += next.vy * dt

  if (next.inLane) {
    const laneLeft = layout.plunge.x - 11
    const laneRight = layout.plunge.x + 11
    next.x = clamp(next.x, laneLeft + next.r, laneRight - next.r)
    if (next.y > layout.plunge.yMax) {
      next.y = layout.plunge.yMax
      next.vy = Math.min(0, next.vy)
    }
    next.vx *= 0.9
    if (next.y < 82 && next.vy < 0) {
      next.inLane = false
      next.x = layout.plunge.x - 28
      next.vx = -120 + (Math.random() - 0.5) * 40
    }
  }

  const leftSeg = flipperSegment(layout.leftFlipper, 'left', flipperState.left)
  const rightSeg = flipperSegment(layout.rightFlipper, 'right', flipperState.right)

  const segments = [
    ...layout.walls.map((w) => ({ ...w, kind: 'wall' })),
    leftSeg,
    rightSeg,
  ]

  for (const seg of segments) {
    const hit = probeSegment(next, seg, flipperState)
    if (hit) {
      const result = resolveHit(next, hit, kindDef, fx)
      scored += result
    }
  }

  const activeBumpers = bumpers ?? layout.bumpers
  for (const bumper of activeBumpers) {
    const hit = probeCircle(next, bumper)
    if (hit) {
      hit.score = bumper.score ?? 0
      scored += resolveHit(next, hit, kindDef, fx)
    }
  }

  for (const bumper of activeBumpers) {
    const bat = batSegment(bumper)
    if (!bat) continue
    const hit = probeBat(next, bat)
    if (hit) {
      hit.score = bat.score ?? 0
      scored += resolveHit(next, hit, kindDef, fx)
    }
  }

  if (kicker && !next.inLane && kickerNext.cooldown <= 0) {
    const dx = next.x - kicker.x
    const dy = next.y - kicker.y
    if (length(dx, dy) < kicker.r) {
      kickerNext.active = true
      kickerNext.hold = kicker.hold ?? 0.55
      next.x = kicker.x
      next.y = kicker.y
      next.vx = 0
      next.vy = 0
      next.pendingBounce = null
    }
  }

  const speed = length(next.vx, next.vy)
  if (speed > MAX_BALL_SPEED) {
    const s = MAX_BALL_SPEED / speed
    next.vx *= s
    next.vy *= s
  }

  if (!next.inLane && next.y - next.r > layout.drainY) {
    drained = true
  }

  return { ball: next, scored, drained, kicker: kickerNext, fx }
}

function resolveHit(ball, hit, kindDef, fx) {
  let scored = hit.score ?? 0

  // Separate position always
  ball.x += hit.nx * hit.overlap
  ball.y += hit.ny * hit.overlap

  if (ball.kind === 'kinetic') {
    if (!ball.pendingBounce) {
      ball.pendingBounce = {
        nx: hit.nx,
        ny: hit.ny,
        restitution: hit.restitution,
        kickX: hit.kickX ?? 0,
        kickY: hit.kickY ?? 0,
      }
      ball.bounceDelayLeft = kindDef.bounceDelay ?? 0.16
      ball.vx *= 0.25
      ball.vy *= 0.25
      fx.push({ type: 'kinetic', x: ball.x, y: ball.y, life: 0.18 })
    }
    return scored
  }

  applyImpulse(ball, hit)

  if (ball.kind === 'explosive') {
    applyExplosion(ball, hit.nx, hit.ny, kindDef)
    fx.push({ type: 'explosion', x: ball.x, y: ball.y, life: 0.3 })
    scored += kindDef.hitBonus
  }

  return scored
}

function probeSegment(ball, seg, flipperState) {
  const closest = closestOnSegment(ball.x, ball.y, seg.ax, seg.ay, seg.bx, seg.by)
  const dx = ball.x - closest.x
  const dy = ball.y - closest.y
  const dist = length(dx, dy)
  if (dist >= ball.r || dist < 1e-6) return null

  const n = normalize(dx, dy)
  let restitution = WALL_RESTITUTION
  let kickX = 0
  let kickY = 0
  if (seg.kind === 'flipper') {
    restitution = FLIPPER_RESTITUTION
    const pressed = seg.side === 'left' ? flipperState.leftPressed : flipperState.rightPressed
    if (pressed) {
      kickX = n.x * 320 * 0.2
      kickY = n.y * 320
    }
  }

  return {
    nx: n.x,
    ny: n.y,
    overlap: ball.r - dist,
    restitution,
    kickX,
    kickY,
    score: 0,
  }
}

function probeBat(ball, bat) {
  const hitR = ball.r + (bat.halfWidth ?? 5)
  const closest = closestOnSegment(ball.x, ball.y, bat.ax, bat.ay, bat.bx, bat.by)
  const dx = ball.x - closest.x
  const dy = ball.y - closest.y
  const dist = length(dx, dy)
  if (dist >= hitR || dist < 1e-6) return null

  const n = normalize(dx, dy)
  const spinSign = bat.spinSpeed >= 0 ? 1 : -1
  const tx = -Math.sin(bat.angle) * spinSign
  const ty = Math.cos(bat.angle) * spinSign
  const kick = bat.kick ?? 400

  return {
    nx: n.x,
    ny: n.y,
    overlap: hitR - dist,
    restitution: FLIPPER_RESTITUTION,
    kickX: n.x * kick * 0.35 + tx * kick * 0.85,
    kickY: n.y * kick * 0.35 + ty * kick * 0.85,
    score: bat.score ?? 0,
  }
}

function probeCircle(ball, circle) {
  const dx = ball.x - circle.x
  const dy = ball.y - circle.y
  const dist = length(dx, dy)
  const minDist = ball.r + circle.r
  if (dist >= minDist || dist < 1e-6) return null

  const n = normalize(dx, dy)
  const vn = ball.vx * n.x + ball.vy * n.y
  return {
    nx: n.x,
    ny: n.y,
    overlap: minDist - dist,
    restitution: BUMPER_RESTITUTION,
    kickX: vn >= 0 ? n.x * 50 : 0,
    kickY: vn >= 0 ? n.y * 50 : 0,
    score: circle.score ?? 0,
  }
}

/** Soft trajectory bend near bumpers / walls / flippers — never the kicker. */
function applyMagnetic(ball, layout, bumpers, dt) {
  const def = getBallKind('magnetic')
  const range = def.range ?? 72
  const strength = def.strength ?? 140
  let best = null
  let bestDist = range

  for (const bumper of bumpers) {
    const d = length(ball.x - bumper.x, ball.y - bumper.y) - bumper.r
    if (d > 0 && d < bestDist) {
      bestDist = d
      best = { x: bumper.x, y: bumper.y }
    }
  }

  for (const wall of layout.walls) {
    const c = closestOnSegment(ball.x, ball.y, wall.ax, wall.ay, wall.bx, wall.by)
    const d = length(ball.x - c.x, ball.y - c.y)
    if (d > ball.r && d < bestDist) {
      bestDist = d
      best = c
    }
  }

  for (const pivot of [layout.leftFlipper, layout.rightFlipper]) {
    const d = length(ball.x - pivot.x, ball.y - pivot.y)
    if (d > 0 && d < bestDist) {
      bestDist = d
      best = { x: pivot.x, y: pivot.y }
    }
  }

  if (!best) return false

  const n = normalize(best.x - ball.x, best.y - ball.y)
  // Lateral deviate (perpendicular) + slight pull
  const falloff = 1 - bestDist / range
  const force = strength * falloff * falloff * dt
  ball.vx += -n.y * force * 0.85 + n.x * force * 0.25
  ball.vy += n.x * force * 0.85 + n.y * force * 0.25
  return true
}

export { BALL_R }
