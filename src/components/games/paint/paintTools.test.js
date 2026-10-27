import { describe, expect, it } from 'vitest'
import {
  airbrushDots,
  clampTextSize,
  clampZoom,
  DEFAULT_TEXT_SIZE,
  fitZoomForViewport,
  floodFill,
  hexToRgba,
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  pourFill,
  rgbaToHex,
  scrollForZoomAtPoint,
} from './paintTools.js'

function pixel(img, x, y) {
  const i = (y * img.width + x) * 4
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]]
}

function makeImageData(width, height, fill = [255, 255, 255, 255]) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill[0]
    data[i + 1] = fill[1]
    data[i + 2] = fill[2]
    data[i + 3] = fill[3]
  }
  return { width, height, data }
}

describe('hexToRgba / rgbaToHex', () => {
  it('parses hex colors', () => {
    expect(hexToRgba('#ff0000')).toEqual([255, 0, 0, 255])
    expect(hexToRgba('#0f0')).toEqual([0, 255, 0, 255])
  })

  it('round-trips opaque rgb', () => {
    expect(rgbaToHex(0, 0, 255)).toBe('#0000ff')
  })
})

describe('floodFill', () => {
  it('fills a contiguous white region', () => {
    const img = makeImageData(4, 4, [255, 255, 255, 255])
    // Wall down the middle column
    for (let y = 0; y < 4; y += 1) {
      const i = (y * 4 + 2) * 4
      img.data[i] = 0
      img.data[i + 1] = 0
      img.data[i + 2] = 0
    }
    const filled = floodFill(img, 0, 0, [255, 0, 0, 255])
    expect(filled).toBe(8) // left two columns
    expect(img.data[0]).toBe(255)
    expect(img.data[1]).toBe(0)
    // Right of wall stays white
    const right = (0 * 4 + 3) * 4
    expect(img.data[right]).toBe(255)
    expect(img.data[right + 1]).toBe(255)
  })

  it('no-ops when fill matches target', () => {
    const img = makeImageData(2, 2, [0, 0, 0, 255])
    expect(floodFill(img, 0, 0, [0, 0, 0, 255])).toBe(0)
  })

  it('ignores out-of-bounds start', () => {
    const img = makeImageData(2, 2)
    expect(floodFill(img, -1, 0, [0, 0, 0, 255])).toBe(0)
  })

  it('with tolerance, fills anti-aliased near-white fringe without crossing grey wall', () => {
    // Row: white | near-white fringe | solid grey wall | white
    const img = makeImageData(4, 1, [255, 255, 255, 255])
    img.data[4] = 240
    img.data[5] = 240
    img.data[6] = 240
    img.data[8] = 128
    img.data[9] = 128
    img.data[10] = 128

    const filled = floodFill(img, 0, 0, [255, 0, 255, 255], 32)
    expect(filled).toBe(2) // white + fringe
    expect(img.data[0]).toBe(255)
    expect(img.data[1]).toBe(0)
    expect(img.data[4]).toBe(255)
    expect(img.data[5]).toBe(0)
    // Wall and far side stay
    expect(img.data[8]).toBe(128)
    expect(img.data[12]).toBe(255)
    expect(img.data[13]).toBe(255)
  })
})

describe('pourFill (watercolor blend)', () => {
  function boxedRegion() {
    // 5x5 white with black border; interior 3x3 pourable
    const img = makeImageData(5, 5, [255, 255, 255, 255])
    for (let x = 0; x < 5; x += 1) {
      for (const y of [0, 4]) {
        const i = (y * 5 + x) * 4
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 0
      }
    }
    for (let y = 0; y < 5; y += 1) {
      for (const x of [0, 4]) {
        const i = (y * 5 + x) * 4
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 0
      }
    }
    return img
  }

  it('first pour on blank covers the basin nearly solid and stops at ink walls', () => {
    const img = boxedRegion()
    const n = pourFill(img, 2, 2, [255, 0, 0, 255])
    expect(n).toBe(9)
    const center = pixel(img, 2, 2)
    expect(center[0]).toBeGreaterThan(240)
    expect(center[1]).toBeLessThan(20)
    // Wall untouched
    expect(pixel(img, 0, 0)).toEqual([0, 0, 0, 255])
  })

  it('second pour near the top blends yellow strongest at the pour point', () => {
    const img = boxedRegion()
    pourFill(img, 2, 2, [255, 0, 0, 255])
    pourFill(img, 2, 1, [255, 255, 0, 255])
    const top = pixel(img, 2, 1)
    const bottom = pixel(img, 2, 3)
    // Top has more yellow (higher G) than bottom
    expect(top[1]).toBeGreaterThan(bottom[1])
    // Bottom still clearly reddish
    expect(bottom[0]).toBeGreaterThan(bottom[1])
  })

  it('pouring the same color again at the top makes that side more dominant', () => {
    const img = boxedRegion()
    pourFill(img, 2, 2, [255, 0, 0, 255])
    pourFill(img, 2, 1, [255, 255, 0, 255])
    const before = pixel(img, 2, 1)
    pourFill(img, 2, 1, [255, 0, 0, 255])
    const after = pixel(img, 2, 1)
    // Red re-pour lowers green (less yellow) at the top
    expect(after[1]).toBeLessThan(before[1])
    expect(after[0]).toBeGreaterThanOrEqual(before[0] - 1)
  })
})

describe('airbrushDots', () => {
  it('keeps samples inside the spray radius', () => {
    let i = 0
    const seq = [0, 0.25, 0.5, 0.75, 0.1, 0.9, 0.3, 0.6]
    const rng = () => seq[i++ % seq.length]
    const dots = airbrushDots(10, 20, 8, 4, rng)
    expect(dots).toHaveLength(4)
    for (const d of dots) {
      expect(Math.hypot(d.x - 10, d.y - 20)).toBeLessThanOrEqual(8.01)
    }
  })
})

describe('zoom helpers', () => {
  it('clamps zoom to allowed range', () => {
    expect(clampZoom(0)).toBe(1)
    expect(clampZoom(0.1)).toBe(0.25)
    expect(clampZoom(99)).toBe(8)
    expect(clampZoom(1.555)).toBe(1.56)
  })

  it('fits A4 into a phone-sized viewport', () => {
    const z = fitZoomForViewport(595, 842, 360, 520, 24)
    expect(z).toBeLessThan(1)
    expect(z).toBeGreaterThanOrEqual(0.25)
    expect(595 * z).toBeLessThanOrEqual(360)
    expect(842 * z).toBeLessThanOrEqual(520)
  })

  it('clamps text size', () => {
    expect(clampTextSize(0)).toBe(MIN_TEXT_SIZE)
    expect(clampTextSize(999)).toBe(MAX_TEXT_SIZE)
    expect(clampTextSize('nope')).toBe(DEFAULT_TEXT_SIZE)
    expect(clampTextSize(24.6)).toBe(25)
  })

  it('keeps the focus content point under the same viewport pixel after zoom', () => {
    const pad = 5
    const fromZoom = 1
    const toZoom = 2
    const scrollLeft = 40
    const scrollTop = 10
    const viewportX = 100
    const viewportY = 80
    const next = scrollForZoomAtPoint({
      scrollLeft,
      scrollTop,
      viewportX,
      viewportY,
      canvasW: 640,
      canvasH: 480,
      fromZoom,
      toZoom,
      padX: pad,
      padY: pad,
    })
    const oldContentX = scrollLeft + viewportX
    const oldRel = oldContentX - pad
    const newContentX = next.scrollLeft + viewportX
    expect(newContentX - pad).toBeCloseTo(oldRel * (toZoom / fromZoom), 5)
  })
})
