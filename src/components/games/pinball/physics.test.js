import { describe, expect, it } from 'vitest'
import {
  BALL_MORPH,
  getBallKind,
  morphBall,
  pickBallKind,
  pickDifferentBallKind,
  scheduleNextMorph,
} from './balls.js'
import {
  createInitialBall,
  plungeBall,
  plungeLaunchVy,
  stepPinball,
  updateFlipperAngle,
} from './physics.js'
import { FLIPPER, batSegment, createTableLayout, liveBumpers } from './table.js'

describe('pinball physics', () => {
  const layout = createTableLayout()
  const idleFlip = {
    left: FLIPPER.restAngle,
    right: FLIPPER.restAngle,
    leftPressed: false,
    rightPressed: false,
  }
  const idleKicker = { hold: 0, cooldown: 0, active: false }

  it('keeps a new ball in the plunge lane', () => {
    const ball = createInitialBall(layout.ballStart)
    expect(ball.inLane).toBe(true)
    const { ball: next } = stepPinball(ball, idleFlip, layout, 1 / 60)
    expect(next.inLane).toBe(true)
    expect(next.x).toBeCloseTo(layout.ballStart.x, 0)
  })

  it('launches stronger with higher plunge power', () => {
    const weak = plungeBall(createInitialBall(layout.ballStart), layout, 0)
    const strong = plungeBall(createInitialBall(layout.ballStart), layout, 1)
    expect(weak.vy).toBeLessThan(0)
    expect(strong.vy).toBeLessThan(weak.vy)
    expect(plungeLaunchVy(layout, 0)).toBe(layout.plunge.launchVyMin)
    expect(plungeLaunchVy(layout, 1)).toBe(layout.plunge.launchVyMax)
  })

  it('moves flippers toward the active angle when pressed', () => {
    const next = updateFlipperAngle(FLIPPER.restAngle, true, 1)
    expect(next).toBeLessThan(FLIPPER.restAngle)
    expect(next).toBeGreaterThanOrEqual(FLIPPER.activeAngle)
  })

  it('orbits moving bumpers over time', () => {
    const moving = layout.bumpers.filter((b) => b.motion)
    expect(moving.length).toBeGreaterThanOrEqual(4)
    const a = liveBumpers(layout.bumpers, 0)
    const b = liveBumpers(layout.bumpers, 2)
    const first = moving[0]
    const ia = layout.bumpers.indexOf(first)
    expect(a[ia].x).not.toBeCloseTo(b[ia].x, 1)
  })

  it('delays bounce for kinetic balls', () => {
    const ball = {
      ...createInitialBall(layout.ballStart, 'kinetic'),
      inLane: false,
      x: layout.bumpers[0].x,
      y: layout.bumpers[0].y - layout.bumpers[0].r - 6,
      vx: 0,
      vy: 200,
    }
    const hit = stepPinball(ball, idleFlip, layout, 1 / 120, idleKicker, layout.bumpers)
    expect(hit.ball.pendingBounce).toBeTruthy()
    expect(hit.ball.bounceDelayLeft).toBeGreaterThan(0)

    let next = hit.ball
    let fired = false
    for (let i = 0; i < 40; i += 1) {
      const step = stepPinball(next, idleFlip, layout, 1 / 60, idleKicker, layout.bumpers)
      next = step.ball
      if (!next.pendingBounce && step.fx.some((f) => f.type === 'kinetic')) {
        fired = true
        break
      }
    }
    expect(fired).toBe(true)
  })

  it('explodes on contact for explosive balls', () => {
    const bumper = layout.bumpers[0]
    const ball = {
      ...createInitialBall(layout.ballStart, 'explosive'),
      inLane: false,
      x: bumper.x,
      y: bumper.y - bumper.r - 6,
      vx: 0,
      vy: 180,
    }
    const { ball: next, fx, scored } = stepPinball(ball, idleFlip, layout, 1 / 120, idleKicker, [
      bumper,
    ])
    expect(fx.some((f) => f.type === 'explosion')).toBe(true)
    expect(scored).toBeGreaterThanOrEqual(getBallKind('explosive').hitBonus)
    expect(Math.hypot(next.vx, next.vy)).toBeGreaterThan(100)
  })

  it('picks among four ball kinds', () => {
    const seen = new Set()
    for (let i = 0; i < 80; i += 1) seen.add(pickBallKind(() => i / 80))
    expect(seen.size).toBe(4)
  })

  it('morphs to a different kind and clears pending bounce', () => {
    const ball = {
      ...createInitialBall(layout.ballStart, 'kinetic'),
      pendingBounce: { nx: 1, ny: 0, restitution: 1, kickX: 0, kickY: 0 },
      bounceDelayLeft: 0.1,
    }
    const nextKind = pickDifferentBallKind('kinetic', () => 0)
    expect(nextKind).not.toBe('kinetic')
    const morphed = morphBall(ball, nextKind)
    expect(morphed.kind).toBe(nextKind)
    expect(morphed.pendingBounce).toBeNull()
    expect(morphed.bounceDelayLeft).toBe(0)
  })

  it('schedules morph on a slow expert-friendly interval', () => {
    const t0 = scheduleNextMorph(() => 0)
    const t1 = scheduleNextMorph(() => 1)
    expect(t0).toBe(BALL_MORPH.minInterval)
    expect(t1).toBe(BALL_MORPH.maxInterval)
    expect(BALL_MORPH.minInterval).toBeGreaterThanOrEqual(10)
  })

  it('swats the ball with the center spinning bat', () => {
    const center = liveBumpers(layout.bumpers, 0).find((b) => b.kind === 'center')
    const seg = batSegment(center)
    const midX = (seg.ax + seg.bx) / 2
    const midY = (seg.ay + seg.by) / 2
    const ball = {
      ...createInitialBall(layout.ballStart, 'normal'),
      inLane: false,
      x: midX,
      y: midY,
      vx: 0,
      vy: 0,
    }
    const { ball: hit, scored } = stepPinball(
      ball,
      idleFlip,
      layout,
      1 / 120,
      idleKicker,
      liveBumpers(layout.bumpers, 0),
    )
    expect(Math.hypot(hit.vx, hit.vy)).toBeGreaterThan(0)
    expect(scored).toBeGreaterThanOrEqual(center.bat.score)
  })

  it('captures then auto-ejects from the left kicker', () => {
    const ball = {
      ...createInitialBall(layout.ballStart),
      inLane: false,
      x: layout.kicker.x,
      y: layout.kicker.y,
      vx: 10,
      vy: 10,
    }
    const caught = stepPinball(ball, idleFlip, layout, 1 / 60, idleKicker)
    expect(caught.kicker.active).toBe(true)

    let kicker = caught.kicker
    let next = caught.ball
    let ejected = false
    for (let i = 0; i < 120; i += 1) {
      const step = stepPinball(next, idleFlip, layout, 1 / 60, kicker)
      next = step.ball
      kicker = step.kicker
      if (!kicker.active && step.scored > 0) {
        ejected = true
        expect(next.vy).toBeLessThan(0)
        break
      }
    }
    expect(ejected).toBe(true)
  })
})
