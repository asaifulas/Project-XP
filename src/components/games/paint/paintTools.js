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

/** @returns {Uint8Array} 1 where the pixel is ink (a pour wall) */
function pourWallMask(data, width, height) {
  const wall = new Uint8Array(width * height)
  for (let i = 0; i < wall.length; i += 1) {
    const o = i * 4
    if (isPourBarrier([data[o], data[o + 1], data[o + 2], data[o + 3]])) wall[i] = 1
  }
  return wall
}

/**
 * Plain basin: every non-ink pixel 4-connected to the seed.
 * @returns {Int32Array} pixel indices (y * width + x)
 */
function plainBasin(wall, width, height, seed) {
  const out = []
  const seen = new Uint8Array(width * height)
  const stack = [seed]
  seen[seed] = 1
  while (stack.length) {
    const i = stack.pop()
    out.push(i)
    const x = i % width
    if (x > 0 && !seen[i - 1] && !wall[i - 1]) (seen[i - 1] = 1), stack.push(i - 1)
    if (x < width - 1 && !seen[i + 1] && !wall[i + 1]) (seen[i + 1] = 1), stack.push(i + 1)
    if (i >= width && !seen[i - width] && !wall[i - width]) (seen[i - width] = 1), stack.push(i - width)
    if (i < width * (height - 1) && !seen[i + width] && !wall[i + width]) (seen[i + width] = 1), stack.push(i + width)
  }
  return Int32Array.from(out)
}

/**
 * Chamfer (3-4) distance from each pixel to the nearest ink pixel, in thirds of a pixel.
 * Two raster passes, so it is cheap enough to recompute on every pour.
 */
function inkDistance(wall, width, height) {
  const INF = 1 << 29
  const d = new Int32Array(width * height)
  for (let i = 0; i < d.length; i += 1) d[i] = wall[i] ? 0 : INF
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x
      let v = d[i]
      if (!v) continue
      if (x > 0) v = Math.min(v, d[i - 1] + 3)
      if (y > 0) {
        v = Math.min(v, d[i - width] + 3)
        if (x > 0) v = Math.min(v, d[i - width - 1] + 4)
        if (x < width - 1) v = Math.min(v, d[i - width + 1] + 4)
      }
      d[i] = v
    }
  }
  for (let y = height - 1; y >= 0; y -= 1) {
    for (let x = width - 1; x >= 0; x -= 1) {
      const i = y * width + x
      let v = d[i]
      if (!v) continue
      if (x < width - 1) v = Math.min(v, d[i + 1] + 3)
      if (y < height - 1) {
        v = Math.min(v, d[i + width] + 3)
        if (x < width - 1) v = Math.min(v, d[i + width + 1] + 4)
        if (x > 0) v = Math.min(v, d[i + width - 1] + 4)
      }
      d[i] = v
    }
  }
  return d
}

/**
 * Gap-closing basin for sketchy line art whose strokes almost (but do not quite) meet.
 *
 * 1. Core: pixels more than `radius` px from any ink. A gap narrower than about 2×radius
 *    has no core pixels in it, so the core region cannot leak through it.
 * 2. The seed's core region is the one the seed lies in, or the nearest one within
 *    radius+1 steps (a tap right next to a line still picks the area it is in).
 * 3. Grow back: add non-ink pixels within radius+1 steps of that core, so colour reaches the
 *    lines with no white rim. Through a closed gap it reaches at most a pixel or so past the mouth.
 *
 * @returns {Int32Array | null} pixel indices, or null when the seed has no core nearby
 *   (thin strands narrower than 2×radius); the caller then tries a smaller radius.
 */
function gapClosedBasin(wall, dist, width, height, seed, radius) {
  const n = width * height
  const coreMin = Math.round(radius * 3)
  const reach = Math.ceil(radius) + 1
  const isCore = (i) => dist[i] > coreMin
  const neighbours8 = (i, visit) => {
    const x = i % width
    const up = i >= width
    const down = i < n - width
    const left = x > 0
    const right = x < width - 1
    if (left) visit(i - 1)
    if (right) visit(i + 1)
    if (up) {
      visit(i - width)
      if (left) visit(i - width - 1)
      if (right) visit(i - width + 1)
    }
    if (down) {
      visit(i + width)
      if (left) visit(i + width - 1)
      if (right) visit(i + width + 1)
    }
  }

  // 2. find the core pixel that owns the seed
  let start = -1
  if (isCore(seed)) {
    start = seed
  } else {
    const steps = new Int16Array(n).fill(-1)
    steps[seed] = 0
    let frontier = [seed]
    for (let s = 1; s <= reach && start < 0 && frontier.length; s += 1) {
      const next = []
      for (const i of frontier) {
        neighbours8(i, (j) => {
          if (steps[j] >= 0 || wall[j]) return
          steps[j] = s
          if (start < 0 && isCore(j)) start = j
          next.push(j)
        })
        if (start >= 0) break
      }
      frontier = next
    }
    if (start < 0) return null
  }

  // 1. the core region (4-connected, so it never slips diagonally between pixels)
  const inRegion = new Uint8Array(n)
  const out = [start]
  inRegion[start] = 1
  for (let k = 0; k < out.length; k += 1) {
    const i = out[k]
    const x = i % width
    if (x > 0 && !inRegion[i - 1] && isCore(i - 1)) (inRegion[i - 1] = 1), out.push(i - 1)
    if (x < width - 1 && !inRegion[i + 1] && isCore(i + 1)) (inRegion[i + 1] = 1), out.push(i + 1)
    if (i >= width && !inRegion[i - width] && isCore(i - width)) (inRegion[i - width] = 1), out.push(i - width)
    if (i < n - width && !inRegion[i + width] && isCore(i + width)) (inRegion[i + width] = 1), out.push(i + width)
  }

  // 3. grow back towards the lines
  let frontier = out.slice()
  for (let s = 1; s <= reach && frontier.length; s += 1) {
    const next = []
    for (const i of frontier) {
      neighbours8(i, (j) => {
        if (inRegion[j] || wall[j]) return
        inRegion[j] = 1
        out.push(j)
        next.push(j)
      })
    }
    frontier = next
  }
  return Int32Array.from(out)
}

/** Largest leftover sliver (px) that is absorbed into a gap-closed fill. */
const MAX_POCKET = 900

/**
 * Absorb white slivers the gap-closed fill could not reach: wedges where strokes cross and the
 * space behind short stroke ends lie deeper than the grow-back distance.
 *
 * A leftover pocket (non-ink, unfilled, connected to the fill) is absorbed when it is small,
 * has no core of its own (so it is not a separate area), and borders only this fill, ink or the
 * page edge. Anything that leads on into a neighbouring area is part of a larger leftover with a
 * core, so it is never absorbed and the gaps stay closed.
 *
 * @param {Int32Array} basin  gap-closed fill (pixel indices)
 * @returns {Int32Array} basin plus absorbed pockets
 */
function absorbPockets(basin, wall, dist, width, height, radius) {
  const n = width * height
  const coreMin = Math.round(radius * 3)
  const filled = new Uint8Array(n)
  for (const i of basin) filled[i] = 1
  const seen = new Uint8Array(n)
  const extra = []

  /** Visit the 4 neighbours of `i`. */
  const each4 = (i, visit) => {
    const x = i % width
    if (x > 0) visit(i - 1)
    if (x < width - 1) visit(i + 1)
    if (i >= width) visit(i - width)
    if (i < n - width) visit(i + width)
  }

  for (const b of basin) {
    each4(b, (start) => {
      if (filled[start] || wall[start] || seen[start]) return
      // flood one leftover pocket; give up early once it is clearly a real area
      const pocket = [start]
      seen[start] = 1
      let keep = true
      for (let k = 0; k < pocket.length; k += 1) {
        const i = pocket[k]
        if (dist[i] > coreMin) keep = false
        if (pocket.length > MAX_POCKET) keep = false
        each4(i, (j) => {
          if (seen[j] || filled[j] || wall[j]) return
          seen[j] = 1
          pocket.push(j)
        })
      }
      if (keep) for (const i of pocket) extra.push(i)
    })
  }

  if (!extra.length) return basin
  const out = new Int32Array(basin.length + extra.length)
  out.set(basin)
  out.set(extra, basin.length)
  return out
}

/** Gap size (canvas px, as a radius) closed for Edu coloring-book drawings. */
export const DRAWING_GAP_CLOSE = 4

/**
 * Watercolor pour: blend `pourRgba` into the contiguous non-ink basin from (x,y).
 * Near the click the pour dominates; farther pixels keep more of the existing wash.
 * Pouring again (same or new color) layers — like adding more pigment to wet paper.
 *
 * `opts.gapClose` (px): treat outline gaps up to about twice this wide as closed, so colour
 * stays inside drawings whose strokes do not quite meet. Areas too thin for that radius
 * retry with smaller radii and finally pour like a plain flood fill.
 *
 * @param {ImageData} imageData
 * @param {number} x
 * @param {number} y
 * @param {[number, number, number, number]} pourRgba
 * @param {{ gapClose?: number }} [opts]
 * @returns {number} pixels touched
 */
export function pourFill(imageData, x, y, pourRgba, opts = {}) {
  const { width, height, data } = imageData
  const sx = Math.floor(x)
  const sy = Math.floor(y)
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return 0

  const seed = sy * width + sx
  if (isPourBarrier(colorAt(data, seed * 4))) return 0

  const wall = pourWallMask(data, width, height)
  let basin = null
  const gapClose = opts.gapClose ?? 0
  if (gapClose > 0) {
    const dist = inkDistance(wall, width, height)
    for (let r = gapClose; r >= 1 && !basin; r -= 1) {
      basin = gapClosedBasin(wall, dist, width, height, seed, r)
      if (basin) basin = absorbPockets(basin, wall, dist, width, height, r)
    }
  }
  if (!basin) basin = plainBasin(wall, width, height, seed)
  if (!basin.length) return 0

  let maxDist = 1
  let blankCount = 0
  for (const idx of basin) {
    const d = Math.hypot((idx % width) - sx, Math.floor(idx / width) - sy)
    if (d > maxDist) maxDist = d
    if (isNearBlank(colorAt(data, idx * 4))) blankCount += 1
  }

  // Mostly paper → solid first wash; already pigmented → local layering.
  const blankBasin = blankCount / basin.length >= 0.7
  let touched = 0
  for (const pix of basin) {
    const px = pix % width
    const py = Math.floor(pix / width)
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
  'hand',
  'text',
  'line',
  'rect',
  'ellipse',
])

/** Offset from scroll content origin to the canvas bitmap (p-1 + 1px border). */
export const CANVAS_SCROLL_PAD = 5

/** Paint text tool — same XP Tahoma face already loaded for the shell. */
export const PAINT_TEXT_FONT = '"XP Tahoma", Tahoma, "MS Sans Serif", sans-serif'
export const MIN_TEXT_SIZE = 8
export const MAX_TEXT_SIZE = 128
export const DEFAULT_TEXT_SIZE = 24

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
 * Clamp Paint text size (px).
 * @param {unknown} value
 */
export function clampTextSize(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return DEFAULT_TEXT_SIZE
  return Math.min(MAX_TEXT_SIZE, Math.max(MIN_TEXT_SIZE, n))
}

/**
 * Draw multi-line text onto a canvas context (top-left baseline).
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {{ size: number, color: string, fontFamily?: string }} opts
 */
export function drawPaintText(ctx, text, x, y, opts) {
  const raw = String(text ?? '')
  if (!raw) return
  const size = clampTextSize(opts.size)
  const family = opts.fontFamily ?? PAINT_TEXT_FONT
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  ctx.save()
  ctx.font = `${size}px ${family}`
  ctx.fillStyle = opts.color
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  const lineHeight = Math.round(size * 1.2)
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], x, y + i * lineHeight)
  }
  ctx.restore()
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
 * Keep the content point under a viewport focus fixed when zoom changes.
 * @param {{
 *   scrollLeft: number,
 *   scrollTop: number,
 *   viewportX: number,
 *   viewportY: number,
 *   canvasW: number,
 *   canvasH: number,
 *   fromZoom: number,
 *   toZoom: number,
 *   padX?: number,
 *   padY?: number,
 * }} args
 */
export function scrollForZoomAtPoint({
  scrollLeft,
  scrollTop,
  viewportX,
  viewportY,
  canvasW,
  canvasH,
  fromZoom,
  toZoom,
  padX = CANVAS_SCROLL_PAD,
  padY = CANVAS_SCROLL_PAD,
}) {
  const from = fromZoom > 0 ? fromZoom : 1
  const to = toZoom > 0 ? toZoom : 1
  const contentX = scrollLeft + viewportX
  const contentY = scrollTop + viewportY
  const relX = contentX - padX
  const relY = contentY - padY
  const scale = to / from
  // Clamp focus to the canvas box so padding outside the bitmap does not explode scroll.
  const maxRelX = Math.max(0, canvasW * from)
  const maxRelY = Math.max(0, canvasH * from)
  const cx = Math.min(maxRelX, Math.max(0, relX))
  const cy = Math.min(maxRelY, Math.max(0, relY))
  const newContentX = padX + cx * scale
  const newContentY = padY + cy * scale
  return {
    scrollLeft: newContentX - viewportX,
    scrollTop: newContentY - viewportY,
  }
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
