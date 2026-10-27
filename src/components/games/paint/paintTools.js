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

/** Default match slack so soft AA fringes next to ink get filled (coloring-book feel). */
export const FLOOD_FILL_TOLERANCE = 32

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

/**
 * Outline / ink walls for watercolor pour basins (dark near-neutral strokes).
 * Vivid paint and paper stay pourable.
 * @param {[number, number, number, number]} rgba
 */
export function isPourBarrier(rgba) {
  const [r, g, b, a] = rgba
  if (a < 128) return true
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  const chroma = Math.max(r, g, b) - Math.min(r, g, b)
  return lum < 165 && chroma < 48
}

function isNearBlank(rgba) {
  return rgba[0] >= 245 && rgba[1] >= 245 && rgba[2] >= 245 && rgba[3] >= 200
}

/**
 * Watercolor pour: blend `pourRgba` into the contiguous non-ink basin from (x,y).
 * Near the click the pour dominates; farther pixels keep more of the existing wash.
 * Pouring again (same or new color) layers — like adding more pigment to wet paper.
 * @param {ImageData} imageData
 * @param {number} x
 * @param {number} y
 * @param {[number, number, number, number]} pourRgba
 * @returns {number} pixels touched
 */
export function pourFill(imageData, x, y, pourRgba) {
  const { width, height, data } = imageData
  const sx = Math.floor(x)
  const sy = Math.floor(y)
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return 0

  const seed = colorAt(data, (sy * width + sx) * 4)
  if (isPourBarrier(seed)) return 0

  /** @type {number[]} */
  const region = []
  const seen = new Uint8Array(width * height)
  /** @type {number[]} */
  const stack = [sx, sy]
  seen[sy * width + sx] = 1
  let maxDist = 1
  let blankCount = isNearBlank(seed) ? 1 : 0

  while (stack.length) {
    const cy = stack.pop()
    const cx = stack.pop()
    if (cx === undefined || cy === undefined) break
    region.push(cx, cy)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const nidx = ny * width + nx
      if (seen[nidx]) continue
      const n = colorAt(data, nidx * 4)
      if (isPourBarrier(n)) continue
      seen[nidx] = 1
      const d = Math.hypot(nx - sx, ny - sy)
      if (d > maxDist) maxDist = d
      if (isNearBlank(n)) blankCount += 1
      stack.push(nx, ny)
    }
  }

  if (!region.length) return 0

  const pixelCount = region.length / 2
  // Mostly paper → solid first wash; already pigmented → local layering.
  const blankBasin = blankCount / pixelCount >= 0.7
  let touched = 0
  for (let i = 0; i < region.length; i += 2) {
    const px = region[i]
    const py = region[i + 1]
    const dist = Math.hypot(px - sx, py - sy)
    const t = 1 - Math.min(1, dist / maxDist)
    // Soft falloff from pour point (watercolor bleed).
    const falloff = t * t * (3 - 2 * t)
    const weight = blankBasin
      ? Math.min(1, 0.88 + 0.12 * falloff)
      : 0.18 + 0.72 * falloff
    const idx = (py * width + px) * 4
    const inv = 1 - weight
    data[idx] = Math.round(data[idx] * inv + pourRgba[0] * weight)
    data[idx + 1] = Math.round(data[idx + 1] * inv + pourRgba[1] * weight)
    data[idx + 2] = Math.round(data[idx + 2] * inv + pourRgba[2] * weight)
    data[idx + 3] = 255
    touched += 1
  }

  return touched
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
  'airbrush',
  'eraser',
  'fill',
  'eyedropper',
  'magnify',
  'line',
  'rect',
  'ellipse',
])

/** Quick picks in the tool well. */
export const STROKE_PRESETS = [1, 2, 3, 4, 5, 8, 12, 16, 24]
export const MIN_STROKE = 1
export const MAX_STROKE = 72
/** Classic XP Paint zoom factors (plus zoom-out for Edu / phones). */
export const ZOOM_PRESETS = [0.25, 0.5, 1, 2, 4, 6, 8]
export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 8

/**
 * Clamp a freehand tool size (px).
 * @param {unknown} value
 */
export function clampStrokeSize(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return MIN_STROKE
  return Math.min(MAX_STROKE, Math.max(MIN_STROKE, n))
}

/**
 * Clamp canvas zoom factor.
 * @param {unknown} value
 */
export function clampZoom(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 1
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(n * 100) / 100))
}

/**
 * Zoom that fits the document into a scroll viewport (with padding).
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {number} viewW
 * @param {number} viewH
 * @param {number} [pad]
 */
export function fitZoomForViewport(canvasW, canvasH, viewW, viewH, pad = 24) {
  if (canvasW <= 0 || canvasH <= 0 || viewW <= 0 || viewH <= 0) return 1
  const availW = Math.max(1, viewW - pad)
  const availH = Math.max(1, viewH - pad)
  return clampZoom(Math.min(availW / canvasW, availH / canvasH))
}

/**
 * Soft spray sample points (denser toward the center).
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} count
 * @param {() => number} [rng]
 * @returns {{ x: number, y: number }[]}
 */
export function airbrushDots(cx, cy, radius, count, rng = Math.random) {
  const r = Math.max(1, radius)
  const n = Math.max(0, Math.floor(count))
  /** @type {{ x: number, y: number }[]} */
  const dots = []
  for (let i = 0; i < n; i += 1) {
    const a = rng() * Math.PI * 2
    // sqrt → more dots near center (airbrush plume)
    const dist = Math.sqrt(rng()) * r
    dots.push({ x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist })
  }
  return dots
}

/**
 * Stamp soft spray into a 2D context at (x, y).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {{ radius: number, color: string, density?: number, rng?: () => number }} opts
 */
export function stampAirbrush(ctx, x, y, opts) {
  const radius = Math.max(1, opts.radius)
  const density = opts.density ?? 0.55
  const count = Math.max(6, Math.round(radius * radius * density * 0.35))
  const dots = airbrushDots(x, y, radius, count, opts.rng)
  ctx.save()
  ctx.fillStyle = opts.color
  for (const d of dots) {
    const s = 1 + (radius > 12 ? 1 : 0)
    ctx.fillRect(Math.round(d.x), Math.round(d.y), s, s)
  }
  ctx.restore()
}

export const MAX_UNDO = 20
export const CANVAS_W = 640
export const CANVAS_H = 480
export const MIN_CANVAS = 1
export const MAX_CANVAS = 3000
