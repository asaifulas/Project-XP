import { describe, expect, it } from 'vitest'
import {
  DESKTOP_EDGE_PAD,
  MIN_FRAME_H,
  MIN_FRAME_W,
  TASKBAR_H,
  desktopBounds,
  resizeFrame,
} from './windowFrameGeometry.js'

describe('desktopBounds', () => {
  it('subtracts taskbar and edge pad', () => {
    expect(desktopBounds({ innerWidth: 1000, innerHeight: 800 })).toEqual({
      width: 1000 - DESKTOP_EDGE_PAD,
      height: 800 - TASKBAR_H - DESKTOP_EDGE_PAD,
    })
  })
})

describe('resizeFrame', () => {
  const desk = { width: 1000, height: 700 }

  it('grows southeast without leaving the desktop', () => {
    const next = resizeFrame({ x: 100, y: 50, w: 400, h: 300 }, 'se', { dx: 2000, dy: 2000 }, desk)
    expect(next.x).toBe(100)
    expect(next.y).toBe(50)
    expect(next.w).toBe(desk.width - 100)
    expect(next.h).toBe(desk.height - 50)
  })

  it('respects minimum size when shrinking', () => {
    const next = resizeFrame({ x: 40, y: 40, w: 400, h: 300 }, 'se', { dx: -900, dy: -900 }, desk)
    expect(next.w).toBe(MIN_FRAME_W)
    expect(next.h).toBe(MIN_FRAME_H)
  })

  it('moves origin when dragging the west edge', () => {
    const next = resizeFrame({ x: 200, y: 80, w: 400, h: 300 }, 'w', { dx: -50, dy: 0 }, desk)
    expect(next.x).toBe(150)
    expect(next.w).toBe(450)
    expect(next.y).toBe(80)
    expect(next.h).toBe(300)
  })

  it('clamps west drag so the frame stays on-desktop', () => {
    const next = resizeFrame({ x: 20, y: 20, w: 400, h: 300 }, 'w', { dx: -100, dy: 0 }, desk)
    expect(next.x).toBe(0)
    expect(next.w).toBeGreaterThanOrEqual(MIN_FRAME_W)
    expect(next.x + next.w).toBeLessThanOrEqual(desk.width)
  })
})
