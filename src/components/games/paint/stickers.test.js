import { describe, expect, it } from 'vitest'
import {
  fitStickerSize,
  hexToRgb,
  hitTestSticker,
  knockoutWhite,
  rotationToward,
  scaleToward,
  stickerHandles,
  tintInk,
  viewBoxAspect,
} from './stickers.js'

const plain = { cx: 300, cy: 400, w: 200, h: 100, rot: 0 }

describe('stickers', () => {
  it('fits half the page width and keeps the aspect ratio', () => {
    expect(fitStickerSize(2, 600, 800)).toEqual({ w: 300, h: 150 })
  })

  it('caps the height at 80% of the page for tall pictures', () => {
    const { w, h } = fitStickerSize(0.25, 600, 800)
    expect(h).toBeCloseTo(640)
    expect(w / h).toBeCloseTo(0.25)
  })

  it('hits the move area inside an unrotated sticker', () => {
    expect(hitTestSticker(plain, { x: 300, y: 400 }, 1)).toBe('move')
    expect(hitTestSticker(plain, { x: 10, y: 10 }, 1)).toBeNull()
  })

  it('hits the corner and rotate handles before the body', () => {
    const { corner, rotate } = stickerHandles(plain, 1)
    expect(hitTestSticker(plain, corner, 1)).toBe('resize')
    expect(hitTestSticker(plain, rotate, 1)).toBe('rotate')
  })

  it('follows rotation when hit testing', () => {
    const turned = { ...plain, rot: Math.PI / 2 }
    expect(hitTestSticker(turned, { x: 300 + 30, y: 400 }, 1)).toBe('move')
    expect(hitTestSticker(turned, { x: 300, y: 400 + 120 }, 1)).toBeNull()
  })

  it('rotate handle points toward the pointer', () => {
    const rot = rotationToward(plain, { x: 300 + 100, y: 400 })
    const { rotate } = stickerHandles({ ...plain, rot }, 1)
    expect(rotate.y).toBeCloseTo(400)
    expect(rotate.x).toBeGreaterThan(300)
  })

  it('resize scales from the pointer distance and keeps a minimum size', () => {
    const k = scaleToward(plain, { x: 300 + 2 * 100, y: 400 + 2 * 50 })
    expect(k).toBeCloseTo(2)
    expect(scaleToward(plain, { x: 301, y: 401 })).toBeGreaterThan(0)
  })

  it('reads the aspect ratio from the SVG viewBox', () => {
    expect(viewBoxAspect('<svg viewBox="0 0 400 200"></svg>')).toBe(2)
    expect(viewBoxAspect('<svg viewBox="-10 -10 100 50"></svg>')).toBe(2)
    expect(viewBoxAspect('<svg></svg>')).toBeNull()
  })

  it('makes white transparent and keeps dark ink opaque', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255, 128, 128, 128, 255])
    knockoutWhite(data)
    expect(data[3]).toBe(0)
    expect(data[7]).toBe(255)
    expect(data[11]).toBe(254)
  })

  it('keeps transparent background transparent', () => {
    const data = new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 255])
    knockoutWhite(data)
    expect(data[3]).toBe(0)
    expect(data[7]).toBe(255)
  })

  it('reads palette hex colours', () => {
    expect(hexToRgb('#1f6fd1')).toEqual([31, 111, 209])
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
  })

  it('tints every pixel with the palette colour and keeps alpha', () => {
    const data = new Uint8ClampedArray([9, 9, 9, 0, 1, 2, 3, 128])
    tintInk(data, [255, 0, 0])
    expect(Array.from(data)).toEqual([255, 0, 0, 0, 255, 0, 0, 128])
  })
})
