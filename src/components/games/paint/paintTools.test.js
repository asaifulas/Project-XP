import { describe, expect, it } from 'vitest'
import { floodFill, hexToRgba, rgbaToHex } from './paintTools.js'

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
})
