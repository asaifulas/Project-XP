/**
 * Paint Edu templates — A4 page + geometric letter/digit/shape polylines for tracing.
 */

import {
  clipartBox,
  drawClipartImage,
  getClipartLabel,
  getClipartPaths,
  getClipartSvg,
} from './eduClipart.js'
import { getJawiLetter } from './eduJawi.js'
import { resamplePath } from './eduMagnetic.js'

/** Portrait A4 at 72dpi-ish (fits phones; ~1/2 letter height for glyphs). */
export const EDU_A4_W = 595
export const EDU_A4_H = 842

/** @typedef {{ x: number, y: number }} Point */
/**
 * @typedef {{
 *   id: string
 *   label: string
 *   kind: 'letter' | 'digit' | 'shape' | 'clipart' | 'jawi' | 'drawing'
 *   closed: boolean
 *   paths: Point[][]
 *   svgMarkup?: string | null
 *   guideImage?: CanvasImageSource | null
 * }} EduTemplate
 */

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} [steps]
 */
function oval(cx, cy, rx, ry, steps = 48) {
  /** @type {Point[]} */
  const pts = []
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2
    pts.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry })
  }
  return pts
}

function rectPath(x, y, w, h) {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
    { x, y },
  ]
}

function squarePath(cx, cy, size) {
  const h = size / 2
  return rectPath(cx - h, cy - h, size, size)
}

/**
 * Regular polygon, closed (first point repeated at end).
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} sides
 * @param {number} [rotation]
 * @returns {Point[]}
 */
function regularPolygon(cx, cy, r, sides, rotation = -Math.PI / 2) {
  /** @type {Point[]} */
  const pts = []
  for (let i = 0; i <= sides; i += 1) {
    const a = rotation + (i / sides) * Math.PI * 2
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
  }
  return pts
}

/**
 * Star polygon (outer/inner radii), closed.
 * @param {number} cx
 * @param {number} cy
 * @param {number} outerR
 * @param {number} innerR
 * @param {number} [points]
 * @returns {Point[]}
 */
function starPath(cx, cy, outerR, innerR, points = 5) {
  /** @type {Point[]} */
  const pts = []
  const n = points * 2
  for (let i = 0; i <= n; i += 1) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2
    const r = i % 2 === 0 ? outerR : innerR
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
  }
  return pts
}

function diamondPath(cx, cy, w, h) {
  return [
    { x: cx, y: cy - h / 2 },
    { x: cx + w / 2, y: cy },
    { x: cx, y: cy + h / 2 },
    { x: cx - w / 2, y: cy },
    { x: cx, y: cy - h / 2 },
  ]
}

function trapezoidPath(cx, cy, topW, botW, h) {
  return [
    { x: cx - topW / 2, y: cy - h / 2 },
    { x: cx + topW / 2, y: cy - h / 2 },
    { x: cx + botW / 2, y: cy + h / 2 },
    { x: cx - botW / 2, y: cy + h / 2 },
    { x: cx - topW / 2, y: cy - h / 2 },
  ]
}

/** Classic parametric heart, scaled into `size`. */
function heartPath(cx, cy, size) {
  /** @type {Point[]} */
  const pts = []
  const steps = 56
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    pts.push({
      x: cx + (x / 17) * (size * 0.5),
      y: cy + (y / 17) * (size * 0.5),
    })
  }
  return pts
}

/** @type {Record<string, string>} */
export const EDU_SHAPE_LABELS = {
  circle: 'Circle',
  square: 'Square',
  rectangle: 'Rectangle',
  triangle: 'Triangle',
  oval: 'Oval',
  diamond: 'Diamond',
  star: 'Star',
  pentagon: 'Pentagon',
  hexagon: 'Hexagon',
  octagon: 'Octagon',
  trapezoid: 'Trapezoid',
  heart: 'Heart',
}

/** Glyph box centered on A4. */
function glyphBox() {
  const marginX = 90
  const marginY = 160
  return {
    x: marginX,
    y: marginY,
    w: EDU_A4_W - marginX * 2,
    h: EDU_A4_H - marginY * 2 - 40,
  }
}

/**
 * Simple stroke-font style paths for uppercase Latin letters (kid-friendly).
 * @param {string} ch
 * @returns {Point[][]}
 */
function upperLetterPaths(ch) {
  const box = glyphBox()
  const L = box.x
  const R = box.x + box.w
  const T = box.y
  const B = box.y + box.h
  const CX = (L + R) / 2
  const CY = (T + B) / 2
  const W = box.w
  const H = box.h

  /** @type {Record<string, () => Point[][]>} */
  const map = {
    A: () => [
      [
        { x: L + W * 0.08, y: B },
        { x: CX, y: T },
        { x: R - W * 0.08, y: B },
      ],
      [
        { x: L + W * 0.28, y: CY + H * 0.08 },
        { x: R - W * 0.28, y: CY + H * 0.08 },
      ],
    ],
    B: () => [
      [
        { x: L + W * 0.15, y: T },
        { x: L + W * 0.15, y: B },
      ],
      oval(L + W * 0.42, T + H * 0.22, W * 0.32, H * 0.2).slice(0, 25),
      oval(L + W * 0.45, T + H * 0.72, W * 0.36, H * 0.24).slice(0, 25),
    ],
    C: () => [oval(CX + W * 0.06, CY, W * 0.38, H * 0.42, 40).slice(8, 33)],
    D: () => [
      [
        { x: L + W * 0.18, y: T },
        { x: L + W * 0.18, y: B },
      ],
      oval(L + W * 0.42, CY, W * 0.36, H * 0.42, 40).slice(0, 21),
    ],
    E: () => [
      [
        { x: R - W * 0.15, y: T },
        { x: L + W * 0.18, y: T },
        { x: L + W * 0.18, y: B },
        { x: R - W * 0.15, y: B },
      ],
      [
        { x: L + W * 0.18, y: CY },
        { x: R - W * 0.28, y: CY },
      ],
    ],
    F: () => [
      [
        { x: L + W * 0.2, y: B },
        { x: L + W * 0.2, y: T },
        { x: R - W * 0.12, y: T },
      ],
      [
        { x: L + W * 0.2, y: CY },
        { x: R - W * 0.3, y: CY },
      ],
    ],
    G: () => [
      oval(CX + W * 0.04, CY, W * 0.38, H * 0.42, 40).slice(6, 34),
      [
        { x: CX + W * 0.05, y: CY },
        { x: R - W * 0.18, y: CY },
        { x: R - W * 0.18, y: CY + H * 0.28 },
      ],
    ],
    H: () => [
      [
        { x: L + W * 0.18, y: T },
        { x: L + W * 0.18, y: B },
      ],
      [
        { x: R - W * 0.18, y: T },
        { x: R - W * 0.18, y: B },
      ],
      [
        { x: L + W * 0.18, y: CY },
        { x: R - W * 0.18, y: CY },
      ],
    ],
    I: () => [
      [
        { x: L + W * 0.28, y: T },
        { x: R - W * 0.28, y: T },
      ],
      [
        { x: CX, y: T },
        { x: CX, y: B },
      ],
      [
        { x: L + W * 0.28, y: B },
        { x: R - W * 0.28, y: B },
      ],
    ],
    J: () => [
      [
        { x: L + W * 0.35, y: T },
        { x: R - W * 0.18, y: T },
      ],
      [
        { x: R - W * 0.28, y: T },
        { x: R - W * 0.28, y: B - H * 0.22 },
      ],
      oval(CX, B - H * 0.22, W * 0.28, H * 0.2, 24).slice(0, 13),
    ],
    K: () => [
      [
        { x: L + W * 0.2, y: T },
        { x: L + W * 0.2, y: B },
      ],
      [
        { x: R - W * 0.12, y: T },
        { x: L + W * 0.2, y: CY },
        { x: R - W * 0.12, y: B },
      ],
    ],
    L: () => [
      [
        { x: L + W * 0.22, y: T },
        { x: L + W * 0.22, y: B },
        { x: R - W * 0.15, y: B },
      ],
    ],
    M: () => [
      [
        { x: L + W * 0.1, y: B },
        { x: L + W * 0.1, y: T },
        { x: CX, y: CY + H * 0.05 },
        { x: R - W * 0.1, y: T },
        { x: R - W * 0.1, y: B },
      ],
    ],
    N: () => [
      [
        { x: L + W * 0.15, y: B },
        { x: L + W * 0.15, y: T },
        { x: R - W * 0.15, y: B },
        { x: R - W * 0.15, y: T },
      ],
    ],
    O: () => [oval(CX, CY, W * 0.36, H * 0.42)],
    P: () => [
      [
        { x: L + W * 0.2, y: B },
        { x: L + W * 0.2, y: T },
      ],
      oval(L + W * 0.42, T + H * 0.24, W * 0.3, H * 0.22).slice(0, 25),
    ],
    Q: () => [
      oval(CX, CY - H * 0.02, W * 0.36, H * 0.4),
      [
        { x: CX + W * 0.08, y: CY + H * 0.18 },
        { x: R - W * 0.12, y: B },
      ],
    ],
    R: () => [
      [
        { x: L + W * 0.2, y: B },
        { x: L + W * 0.2, y: T },
      ],
      oval(L + W * 0.42, T + H * 0.24, W * 0.3, H * 0.22).slice(0, 25),
      [
        { x: L + W * 0.38, y: CY },
        { x: R - W * 0.12, y: B },
      ],
    ],
    S: () => [
      [
        { x: R - W * 0.2, y: T + H * 0.12 },
        ...oval(CX, T + H * 0.22, W * 0.32, H * 0.16, 20).slice(10, 20),
        ...oval(CX, B - H * 0.22, W * 0.34, H * 0.18, 20).slice(0, 12),
        { x: L + W * 0.2, y: B - H * 0.1 },
      ],
    ],
    T: () => [
      [
        { x: L + W * 0.12, y: T },
        { x: R - W * 0.12, y: T },
      ],
      [
        { x: CX, y: T },
        { x: CX, y: B },
      ],
    ],
    U: () => [
      [
        { x: L + W * 0.18, y: T },
        { x: L + W * 0.18, y: B - H * 0.25 },
        ...oval(CX, B - H * 0.25, W * 0.32, H * 0.22, 20).slice(0, 11),
        { x: R - W * 0.18, y: B - H * 0.25 },
        { x: R - W * 0.18, y: T },
      ],
    ],
    V: () => [
      [
        { x: L + W * 0.1, y: T },
        { x: CX, y: B },
        { x: R - W * 0.1, y: T },
      ],
    ],
    W: () => [
      [
        { x: L + W * 0.05, y: T },
        { x: L + W * 0.22, y: B },
        { x: CX, y: CY },
        { x: R - W * 0.22, y: B },
        { x: R - W * 0.05, y: T },
      ],
    ],
    X: () => [
      [
        { x: L + W * 0.12, y: T },
        { x: R - W * 0.12, y: B },
      ],
      [
        { x: R - W * 0.12, y: T },
        { x: L + W * 0.12, y: B },
      ],
    ],
    Y: () => [
      [
        { x: L + W * 0.12, y: T },
        { x: CX, y: CY },
        { x: R - W * 0.12, y: T },
      ],
      [
        { x: CX, y: CY },
        { x: CX, y: B },
      ],
    ],
    Z: () => [
      [
        { x: L + W * 0.15, y: T },
        { x: R - W * 0.15, y: T },
        { x: L + W * 0.15, y: B },
        { x: R - W * 0.15, y: B },
      ],
    ],
  }

  const fn = map[ch]
  return fn ? fn() : []
}

/**
 * Lowercase — slightly smaller box, simpler forms.
 * @param {string} ch
 */
function lowerLetterPaths(ch) {
  const box = glyphBox()
  const inset = 40
  const L = box.x + inset
  const R = box.x + box.w - inset
  const T = box.y + inset * 1.2
  const B = box.y + box.h - inset
  const CX = (L + R) / 2
  const CY = (T + B) / 2
  const W = R - L
  const H = B - T
  const xHeight = T + H * 0.35

  /** @type {Record<string, () => Point[][]>} */
  const map = {
    a: () => [
      oval(CX, CY + H * 0.05, W * 0.28, H * 0.28),
      [
        { x: R - W * 0.15, y: xHeight },
        { x: R - W * 0.15, y: B },
      ],
    ],
    b: () => [
      [
        { x: L + W * 0.2, y: T },
        { x: L + W * 0.2, y: B },
      ],
      oval(CX + W * 0.05, CY + H * 0.08, W * 0.28, H * 0.28),
    ],
    c: () => [oval(CX + W * 0.04, CY + H * 0.05, W * 0.28, H * 0.28, 36).slice(6, 30)],
    d: () => [
      [
        { x: R - W * 0.2, y: T },
        { x: R - W * 0.2, y: B },
      ],
      oval(CX - W * 0.05, CY + H * 0.08, W * 0.28, H * 0.28),
    ],
    e: () => [
      [
        { x: L + W * 0.18, y: CY + H * 0.02 },
        { x: R - W * 0.18, y: CY + H * 0.02 },
      ],
      oval(CX, CY + H * 0.05, W * 0.3, H * 0.28, 36).slice(4, 32),
    ],
    f: () => [
      oval(CX + W * 0.1, T + H * 0.18, W * 0.18, H * 0.14, 20).slice(10, 20),
      [
        { x: CX, y: T + H * 0.18 },
        { x: CX, y: B },
      ],
      [
        { x: L + W * 0.25, y: CY },
        { x: R - W * 0.2, y: CY },
      ],
    ],
    g: () => [
      oval(CX, CY, W * 0.28, H * 0.26),
      [
        { x: R - W * 0.18, y: CY - H * 0.15 },
        { x: R - W * 0.18, y: B - H * 0.05 },
      ],
      oval(CX, B - H * 0.08, W * 0.26, H * 0.14, 20).slice(0, 12),
    ],
    h: () => [
      [
        { x: L + W * 0.22, y: T },
        { x: L + W * 0.22, y: B },
      ],
      [
        { x: L + W * 0.22, y: CY },
        ...oval(CX + W * 0.08, CY + H * 0.12, W * 0.24, H * 0.24, 20).slice(12, 20),
        { x: R - W * 0.18, y: B },
      ],
    ],
    i: () => [
      [
        { x: CX, y: xHeight },
        { x: CX, y: B },
      ],
      [{ x: CX, y: T + H * 0.08 }],
    ],
    j: () => [
      [
        { x: CX + W * 0.05, y: xHeight },
        { x: CX + W * 0.05, y: B - H * 0.1 },
      ],
      oval(CX - W * 0.05, B - H * 0.08, W * 0.16, H * 0.1, 16).slice(0, 9),
      [{ x: CX + W * 0.05, y: T + H * 0.08 }],
    ],
    k: () => [
      [
        { x: L + W * 0.22, y: T },
        { x: L + W * 0.22, y: B },
      ],
      [
        { x: R - W * 0.15, y: xHeight },
        { x: L + W * 0.22, y: CY + H * 0.05 },
        { x: R - W * 0.15, y: B },
      ],
    ],
    l: () => [
      [
        { x: CX, y: T },
        { x: CX, y: B },
      ],
    ],
    m: () => [
      [
        { x: L + W * 0.12, y: B },
        { x: L + W * 0.12, y: xHeight },
        { x: L + W * 0.35, y: CY },
        { x: CX, y: xHeight },
        { x: CX, y: B },
      ],
      [
        { x: CX, y: xHeight },
        { x: R - W * 0.35, y: CY },
        { x: R - W * 0.12, y: xHeight },
        { x: R - W * 0.12, y: B },
      ],
    ],
    n: () => [
      [
        { x: L + W * 0.2, y: B },
        { x: L + W * 0.2, y: xHeight },
        ...oval(CX + W * 0.05, CY + H * 0.05, W * 0.26, H * 0.22, 18).slice(12, 18),
        { x: R - W * 0.18, y: B },
      ],
    ],
    o: () => [oval(CX, CY + H * 0.05, W * 0.3, H * 0.28)],
    p: () => [
      [
        { x: L + W * 0.2, y: xHeight },
        { x: L + W * 0.2, y: B + H * 0.05 },
      ],
      oval(CX + W * 0.05, CY + H * 0.05, W * 0.28, H * 0.26),
    ],
    q: () => [
      [
        { x: R - W * 0.2, y: xHeight },
        { x: R - W * 0.2, y: B + H * 0.05 },
      ],
      oval(CX - W * 0.05, CY + H * 0.05, W * 0.28, H * 0.26),
    ],
    r: () => [
      [
        { x: L + W * 0.25, y: B },
        { x: L + W * 0.25, y: xHeight },
      ],
      oval(CX + W * 0.1, CY, W * 0.22, H * 0.18, 18).slice(12, 18),
    ],
    s: () => [
      [
        { x: R - W * 0.22, y: xHeight + H * 0.05 },
        ...oval(CX, CY - H * 0.05, W * 0.24, H * 0.12, 16).slice(8, 16),
        ...oval(CX, CY + H * 0.18, W * 0.24, H * 0.12, 16).slice(0, 10),
        { x: L + W * 0.22, y: B - H * 0.05 },
      ],
    ],
    t: () => [
      [
        { x: CX, y: T + H * 0.1 },
        { x: CX, y: B },
      ],
      [
        { x: L + W * 0.25, y: xHeight },
        { x: R - W * 0.2, y: xHeight },
      ],
    ],
    u: () => [
      [
        { x: L + W * 0.2, y: xHeight },
        { x: L + W * 0.2, y: B - H * 0.12 },
        ...oval(CX, B - H * 0.12, W * 0.26, H * 0.16, 16).slice(0, 9),
        { x: R - W * 0.2, y: B - H * 0.12 },
        { x: R - W * 0.2, y: B },
      ],
    ],
    v: () => [
      [
        { x: L + W * 0.15, y: xHeight },
        { x: CX, y: B },
        { x: R - W * 0.15, y: xHeight },
      ],
    ],
    w: () => [
      [
        { x: L + W * 0.08, y: xHeight },
        { x: L + W * 0.25, y: B },
        { x: CX, y: CY + H * 0.1 },
        { x: R - W * 0.25, y: B },
        { x: R - W * 0.08, y: xHeight },
      ],
    ],
    x: () => [
      [
        { x: L + W * 0.18, y: xHeight },
        { x: R - W * 0.18, y: B },
      ],
      [
        { x: R - W * 0.18, y: xHeight },
        { x: L + W * 0.18, y: B },
      ],
    ],
    y: () => [
      [
        { x: L + W * 0.15, y: xHeight },
        { x: CX, y: CY + H * 0.15 },
        { x: R - W * 0.15, y: xHeight },
      ],
      [
        { x: CX, y: CY + H * 0.15 },
        { x: CX - W * 0.05, y: B + H * 0.02 },
      ],
    ],
    z: () => [
      [
        { x: L + W * 0.2, y: xHeight },
        { x: R - W * 0.2, y: xHeight },
        { x: L + W * 0.2, y: B },
        { x: R - W * 0.2, y: B },
      ],
    ],
  }
  const fn = map[ch]
  return fn ? fn() : []
}

/**
 * @param {string} digit
 */
function digitPaths(digit) {
  const box = glyphBox()
  const L = box.x + 40
  const R = box.x + box.w - 40
  const T = box.y + 30
  const B = box.y + box.h - 30
  const CX = (L + R) / 2
  const CY = (T + B) / 2
  const W = R - L
  const H = B - T

  /** @type {Record<string, () => Point[][]>} */
  const map = {
    '1': () => [
      [
        { x: CX - W * 0.15, y: T + H * 0.18 },
        { x: CX, y: T },
        { x: CX, y: B },
      ],
      [
        { x: CX - W * 0.22, y: B },
        { x: CX + W * 0.22, y: B },
      ],
    ],
    '2': () => [
      [
        { x: L + W * 0.15, y: T + H * 0.2 },
        ...oval(CX, T + H * 0.22, W * 0.32, H * 0.18, 20).slice(10, 20),
        { x: L + W * 0.15, y: B },
        { x: R - W * 0.15, y: B },
      ],
    ],
    '3': () => [
      oval(CX - W * 0.02, T + H * 0.22, W * 0.3, H * 0.18, 20).slice(8, 20),
      oval(CX, B - H * 0.24, W * 0.34, H * 0.22, 22).slice(0, 14),
    ],
    '4': () => [
      [
        { x: R - W * 0.28, y: T },
        { x: L + W * 0.15, y: CY + H * 0.05 },
        { x: R - W * 0.12, y: CY + H * 0.05 },
      ],
      [
        { x: R - W * 0.28, y: T },
        { x: R - W * 0.28, y: B },
      ],
    ],
    '5': () => [
      [
        { x: R - W * 0.18, y: T },
        { x: L + W * 0.2, y: T },
        { x: L + W * 0.2, y: CY },
        { x: CX, y: CY },
      ],
      oval(CX, B - H * 0.24, W * 0.32, H * 0.22, 22).slice(0, 16),
    ],
    '6': () => [
      [
        { x: R - W * 0.2, y: T + H * 0.15 },
        ...oval(CX, CY + H * 0.08, W * 0.34, H * 0.36, 36).slice(8, 36),
      ],
      oval(CX, CY + H * 0.18, W * 0.24, H * 0.2),
    ],
    '7': () => [
      [
        { x: L + W * 0.15, y: T },
        { x: R - W * 0.12, y: T },
        { x: CX - W * 0.05, y: B },
      ],
    ],
    '8': () => [
      oval(CX, T + H * 0.24, W * 0.28, H * 0.2),
      oval(CX, B - H * 0.26, W * 0.32, H * 0.24),
    ],
    '9': () => [
      oval(CX, T + H * 0.28, W * 0.3, H * 0.24),
      [
        { x: R - W * 0.2, y: T + H * 0.28 },
        { x: R - W * 0.2, y: B - H * 0.15 },
        ...oval(CX, B - H * 0.2, W * 0.3, H * 0.18, 18).slice(0, 10),
      ],
    ],
    '0': () => [oval(CX, CY, W * 0.34, H * 0.42)],
  }
  const fn = map[digit]
  return fn ? fn() : []
}

function shapePaths(shapeId) {
  const box = glyphBox()
  const CX = box.x + box.w / 2
  const CY = box.y + box.h / 2
  const size = Math.min(box.w, box.h) * 0.72
  const r = size / 2
  if (shapeId === 'circle') return [oval(CX, CY, r, r)]
  if (shapeId === 'oval') return [oval(CX, CY, r * 0.72, r)]
  if (shapeId === 'square') return [squarePath(CX, CY, size)]
  if (shapeId === 'rectangle') return [rectPath(CX - size * 0.55, CY - size * 0.35, size * 1.1, size * 0.7)]
  if (shapeId === 'triangle') return [regularPolygon(CX, CY, r, 3)]
  if (shapeId === 'diamond') return [diamondPath(CX, CY, size * 0.85, size)]
  if (shapeId === 'star') return [starPath(CX, CY, r, r * 0.42, 5)]
  if (shapeId === 'pentagon') return [regularPolygon(CX, CY, r, 5)]
  if (shapeId === 'hexagon') return [regularPolygon(CX, CY, r, 6)]
  if (shapeId === 'octagon') return [regularPolygon(CX, CY, r, 8)]
  if (shapeId === 'trapezoid') return [trapezoidPath(CX, CY, size * 0.55, size * 0.95, size * 0.7)]
  if (shapeId === 'heart') return [heartPath(CX, CY, size)]
  return []
}

/**
 * Flatten + densify for snap / render.
 * @param {Point[][]} strokes
 * @param {{ closed?: boolean, spacing?: number }} [opts]
 */
export function prepareTemplatePaths(strokes, opts = {}) {
  const spacing = opts.spacing ?? 6
  return strokes
    .filter((s) => s && s.length > 0)
    .map((s) => resamplePath(s, spacing, { closed: Boolean(opts.closed) }))
}

/**
 * @param {string} id
 * @returns {EduTemplate | null}
 */
export function getEduTemplate(id) {
  if (!id) return null

  if (id.startsWith('clipart:')) {
    const slug = id.slice(8)
    const svgMarkup = getClipartSvg(slug)
    const strokes = getClipartPaths(slug)
    if (!svgMarkup && !strokes.length) return null
    return {
      id,
      label: getClipartLabel(slug),
      kind: 'clipart',
      closed: false,
      // Coarser resample — clipart is a picture guide; paths are for magnetic only.
      paths: prepareTemplatePaths(strokes, { spacing: 14 }),
      svgMarkup,
      guideImage: null,
    }
  }

  if (id.startsWith('jawi:')) {
    const ch = id.slice(5)
    const letter = getJawiLetter(ch)
    if (!letter) return null
    return {
      id,
      label: `${ch} ${letter.name}`,
      kind: 'jawi',
      closed: false,
      paths: prepareTemplatePaths(letter.paths),
    }
  }

  if (id.startsWith('shape:')) {
    const shape = id.slice(6)
    const strokes = shapePaths(shape)
    if (!strokes.length) return null
    return {
      id,
      label: EDU_SHAPE_LABELS[shape] ?? shape[0].toUpperCase() + shape.slice(1),
      kind: 'shape',
      closed: true,
      paths: prepareTemplatePaths(strokes, { closed: true }),
    }
  }

  if (id.startsWith('digit:')) {
    const d = id.slice(6)
    const strokes = digitPaths(d)
    if (!strokes.length) return null
    return {
      id,
      label: d,
      kind: 'digit',
      closed: false,
      paths: prepareTemplatePaths(strokes),
    }
  }

  if (id.startsWith('letter:')) {
    const ch = id.slice(7)
    const strokes = ch === ch.toUpperCase() ? upperLetterPaths(ch) : lowerLetterPaths(ch)
    if (!strokes.length) return null
    return {
      id,
      label: ch,
      kind: 'letter',
      closed: false,
      paths: prepareTemplatePaths(strokes),
    }
  }

  return null
}

export const EDU_LETTER_IDS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => `letter:${c}`),
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => `letter:${c}`),
]

export const EDU_DIGIT_IDS = '0123456789'.split('').map((d) => `digit:${d}`)

export const EDU_SHAPE_IDS = [
  'shape:circle',
  'shape:oval',
  'shape:square',
  'shape:rectangle',
  'shape:triangle',
  'shape:diamond',
  'shape:star',
  'shape:pentagon',
  'shape:hexagon',
  'shape:octagon',
  'shape:trapezoid',
  'shape:heart',
]

/** @typedef {'s' | 'm' | 'l' | 'xl'} EduGuideSize */

/** Dot / line thickness for Edu guides. */
export const EDU_GUIDE_SIZES = {
  s: {
    label: 'Small',
    line: 2,
    dot: 2.2,
    underlay: 2.5,
    dash: [10, 8],
    step: 3,
  },
  m: {
    label: 'Medium',
    line: 3.5,
    dot: 3.6,
    underlay: 4,
    dash: [16, 12],
    step: 2,
  },
  l: {
    label: 'Large',
    line: 5.5,
    dot: 5.8,
    underlay: 6.5,
    dash: [22, 14],
    step: 2,
  },
  xl: {
    label: 'Extra large',
    line: 8.5,
    dot: 9,
    underlay: 10,
    dash: [28, 16],
    step: 1,
  },
}

/**
 * Draw guide strokes onto a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {EduTemplate} template
 * @param {'dotted' | 'dash' | 'straight'} lineType
 * @param {EduGuideSize} [guideSize]
 */
export function drawEduTemplate(ctx, template, lineType, guideSize = 'm') {
  const size = EDU_GUIDE_SIZES[guideSize] ?? EDU_GUIDE_SIZES.m
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // High-contrast guide so it stays visible on white A4 (phone screens).
  ctx.strokeStyle = '#3a6ea5'
  ctx.fillStyle = '#3a6ea5'

  // Clipart: show the real SVG picture (kids recognize the plane/cat).
  // Path polylines alone looked like a blue scribble blob.
  if (template.kind === 'clipart' && template.guideImage) {
    drawClipartImage(ctx, template.guideImage, clipartBox(), 0.5)
    ctx.restore()
    return
  }

  // Soft continuous underlay (fill boundary + visibility)
  ctx.globalAlpha = 0.35
  ctx.lineWidth = size.underlay
  ctx.setLineDash([])
  for (const path of template.paths) {
    if (path.length < 2) continue
    ctx.beginPath()
    ctx.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i += 1) ctx.lineTo(path[i].x, path[i].y)
    if (template.closed) ctx.closePath()
    ctx.stroke()
  }

  ctx.globalAlpha = 1
  if (lineType === 'straight') {
    ctx.lineWidth = size.line
    ctx.setLineDash([])
    for (const path of template.paths) {
      if (path.length < 2) {
        if (path.length === 1) {
          ctx.beginPath()
          ctx.arc(path[0].x, path[0].y, size.dot, 0, Math.PI * 2)
          ctx.fill()
        }
        continue
      }
      ctx.beginPath()
      ctx.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i += 1) ctx.lineTo(path[i].x, path[i].y)
      if (template.closed) ctx.closePath()
      ctx.stroke()
    }
  } else if (lineType === 'dash') {
    ctx.lineWidth = size.line
    ctx.setLineDash(size.dash)
    for (const path of template.paths) {
      if (path.length < 2) continue
      ctx.beginPath()
      ctx.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i += 1) ctx.lineTo(path[i].x, path[i].y)
      if (template.closed) ctx.closePath()
      ctx.stroke()
    }
  } else {
    for (const path of template.paths) {
      for (let i = 0; i < path.length; i += size.step) {
        const p = path[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, size.dot, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  ctx.restore()
}

/**
 * Flatten all strokes for magnetic snap.
 * @param {EduTemplate} template
 */
export function flatTemplatePath(template) {
  /** @type {Point[]} */
  const out = []
  for (const path of template.paths) {
    for (const p of path) out.push(p)
  }
  return out
}
