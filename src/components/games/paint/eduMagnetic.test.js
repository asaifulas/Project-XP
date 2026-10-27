import { describe, expect, it } from 'vitest'
import {
  closestOnSegment,
  magneticSnap,
  nearestOnPath,
  resamplePath,
} from './eduMagnetic.js'

describe('eduMagnetic', () => {
  it('projects onto a segment midpoint', () => {
    const c = closestOnSegment({ x: 5, y: 10 }, { x: 0, y: 0 }, { x: 10, y: 0 })
    expect(c.x).toBeCloseTo(5)
    expect(c.y).toBeCloseTo(0)
  })

  it('finds nearest point on a polyline', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ]
    const hit = nearestOnPath({ x: 90, y: 5 }, path)
    expect(hit).not.toBeNull()
    expect(hit.point.x).toBeCloseTo(90)
    expect(hit.point.y).toBeCloseTo(0)
    expect(hit.distance).toBeCloseTo(5)
  })

  it('snaps strongly on beginner inside radius', () => {
    const path = [
      { x: 0, y: 50 },
      { x: 200, y: 50 },
    ]
    const out = magneticSnap({ x: 100, y: 70 }, path, 'beginner')
    expect(out.snapped).toBe(true)
    expect(out.y).toBeLessThan(70)
    expect(Math.abs(out.y - 50)).toBeLessThan(Math.abs(70 - 50))
  })

  it('does not snap when far outside radius', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]
    const out = magneticSnap({ x: 500, y: 500 }, path, 'expert')
    expect(out.snapped).toBe(false)
    expect(out.x).toBe(500)
    expect(out.y).toBe(500)
  })

  it('resamples a path to roughly even spacing', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]
    const dense = resamplePath(path, 10)
    expect(dense.length).toBeGreaterThan(8)
    expect(dense[0]).toEqual({ x: 0, y: 0 })
    expect(dense[dense.length - 1].x).toBeCloseTo(100)
  })
})
