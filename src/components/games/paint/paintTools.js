/**
 * Pure helpers for XP Paint (flood fill + color parsing).
 */

/**
 * @param {string} hex
 * @returns {[number, number, number, number]}
 */
export function hexToRgba(hex) {
  const raw = String(hex || '#000000').replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.padEnd(6, '0').slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return [0, 0, 0, 255]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255]
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} [a]
 */
export function rgbaToHex(r, g, b, a = 255) {
  if (a < 128) return '#ffffff'
  const h = (n) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function colorAt(data, i) {
  return [data[i], data[i + 1], data[i + 2], data[i + 3]]
}

function sameColor(a, b, tolerance = 0) {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance &&
    Math.abs(a[3] - b[3]) <= tolerance
  )
}

/**
 * Flood-fill ImageData in place (scanline / BFS).
 * @param {ImageData} imageData
 * @param {number} x
 * @param {number} y
 * @param {[number, number, number, number]} fillRgba
 * @param {number} [tolerance]
 * @returns {number} pixels filled
 */
export function floodFill(imageData, x, y, fillRgba, tolerance = 0) {
  const { width, height, data } = imageData
  const sx = Math.floor(x)
  const sy = Math.floor(y)
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return 0

  const start = (sy * width + sx) * 4
  const target = colorAt(data, start)
  if (sameColor(target, fillRgba, tolerance)) return 0

  /** @type {number[]} */
  const stack = [sx, sy]
  let filled = 0
  const seen = new Uint8Array(width * height)

  while (stack.length) {
    const cy = stack.pop()
    let cx = stack.pop()
    if (cx === undefined || cy === undefined) break

    // Move left to run start
    while (cx > 0) {
      const i = (cy * width + (cx - 1)) * 4
      if (!sameColor(colorAt(data, i), target, tolerance)) break
      cx -= 1
    }

    let spanUp = false
    let spanDown = false
    while (cx < width) {
      const idx = cy * width + cx
      const i = idx * 4
      if (seen[idx] || !sameColor(colorAt(data, i), target, tolerance)) break
      seen[idx] = 1
      data[i] = fillRgba[0]
      data[i + 1] = fillRgba[1]
      data[i + 2] = fillRgba[2]
      data[i + 3] = fillRgba[3]
      filled += 1

      if (cy > 0) {
        const above = ((cy - 1) * width + cx) * 4
        const match = sameColor(colorAt(data, above), target, tolerance)
        if (!spanUp && match) {
          stack.push(cx, cy - 1)
          spanUp = true
        } else if (spanUp && !match) {
          spanUp = false
        }
      }
      if (cy < height - 1) {
        const below = ((cy + 1) * width + cx) * 4
        const match = sameColor(colorAt(data, below), target, tolerance)
        if (!spanDown && match) {
          stack.push(cx, cy + 1)
          spanDown = true
        } else if (spanDown && !match) {
          spanDown = false
        }
      }
      cx += 1
    }
  }

  return filled
}

/** Classic XP Paint palette — 2 rows × 14. */
export const DEFAULT_COLORS = [
  '#000000',
  '#808080',
  '#800000',
  '#808000',
  '#008000',
  '#008080',
  '#000080',
  '#800080',
  '#808040',
  '#004040',
  '#0000ff',
  '#0080ff',
  '#00ffff',
  '#ff8040',
  '#ffffff',
  '#c0c0c0',
  '#ff0000',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0000ff',
  '#ff00ff',
  '#ffff80',
  '#00ff80',
  '#80ffff',
  '#8080ff',
  '#ff0080',
  '#ff80ff',
]

export const TOOLS = /** @type {const} */ ([
  'pencil',
  'brush',
  'eraser',
  'fill',
  'eyedropper',
  'magnify',
  'line',
  'rect',
  'ellipse',
])

export const STROKE_PRESETS = [1, 2, 3, 4, 5]
/** Classic XP Paint zoom factors. */
export const ZOOM_PRESETS = [1, 2, 6, 8]

export const MAX_UNDO = 20
export const CANVAS_W = 640
export const CANVAS_H = 480
export const MIN_CANVAS = 1
export const MAX_CANVAS = 3000
