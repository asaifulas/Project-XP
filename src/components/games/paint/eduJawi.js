/**
 * Paint Edu — Jawi as ABC/123-style single-stroke polylines (kid tracing).
 *
 * Shapes follow familiar isolated Arabic/Jawi forms (as in XP Arial / Malaysian Jawi),
 * but are hand-built open strokes — not filled font outlines (those always look like
 * double calligraphy edges).
 *
 * @see https://salrc.uchicago.edu/resources/fonts/available/urdu/arial.shtml
 */

/** @typedef {{ x: number, y: number }} Point */

/** Keep in sync with eduTemplates A4 (avoid circular import). */
const A4_W = 595
const A4_H = 842

function glyphBox() {
  const marginX = 90
  const marginY = 160
  return {
    x: marginX,
    y: marginY,
    w: A4_W - marginX * 2,
    h: A4_H - marginY * 2 - 40,
  }
}

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} rx
 * @param {number} ry
 * @param {number} [steps]
 * @param {number} [a0]
 * @param {number} [a1]
 */
function arc(cx, cy, rx, ry, steps = 20, a0 = 0, a1 = Math.PI * 2) {
  /** @type {Point[]} */
  const pts = []
  for (let i = 0; i <= steps; i += 1) {
    const t = a0 + (i / steps) * (a1 - a0)
    pts.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry })
  }
  return pts
}

/** Nuqṭah — tiny mark kids tap (same spirit as a short ABC stroke). */
function nuqtah(cx, cy) {
  return arc(cx, cy, 5, 5, 6)
}

/**
 * Isolated ba/ta/tha/nun bowl — one open stroke (mouth up), like a wide U.
 * @param {number} L
 * @param {number} R
 * @param {number} yTop
 * @param {number} yBot
 */
function bowlUp(L, R, yTop, yBot) {
  const CX = (L + R) / 2
  const rx = (R - L) * 0.42
  const ry = (yBot - yTop) * 0.92
  // 0 → π: right → bottom → left (U bowl, mouth open upward) — canvas y grows down
  return arc(CX, yTop, rx, ry, 28, 0, Math.PI)
}

/**
 * Jim-family body — open to the right with a descending hook (one stroke).
 */
function jimStroke(L, R, T, B) {
  const W = R - L
  const H = B - T
  return [
    { x: R - W * 0.12, y: T + H * 0.22 },
    { x: CX_(L, R) + W * 0.05, y: T + H * 0.08 },
    { x: L + W * 0.22, y: T + H * 0.28 },
    { x: L + W * 0.2, y: T + H * 0.55 },
    { x: CX_(L, R), y: B - H * 0.08 },
    { x: R - W * 0.18, y: B - H * 0.28 },
  ]
}

function CX_(L, R) {
  return (L + R) / 2
}

/**
 * Sin teeth — one zigzag stroke.
 */
function sinStroke(L, R, T, B) {
  const W = R - L
  const y0 = T + (B - T) * 0.38
  const y1 = B - (B - T) * 0.18
  return [
    { x: L + W * 0.08, y: y0 },
    { x: L + W * 0.2, y: y1 },
    { x: L + W * 0.32, y: y0 },
    { x: L + W * 0.44, y: y1 },
    { x: L + W * 0.56, y: y0 },
    { x: L + W * 0.68, y: y1 },
    { x: L + W * 0.82, y: y0 },
  ]
}

/** @type {string[]} */
export const JAWI_LETTER_ORDER = [
  'ا',
  'ب',
  'ت',
  'ث',
  'ج',
  'چ',
  'ح',
  'خ',
  'د',
  'ذ',
  'ر',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ع',
  'غ',
  'ڠ',
  'ف',
  'ڤ',
  'ق',
  'ک',
  'ݢ',
  'ل',
  'م',
  'ن',
  'و',
  'ۏ',
  'ه',
  'ء',
  'ي',
  'ڽ',
]

/**
 * @returns {Record<string, { name: string, rumi: string, strokes: () => Point[][] }>}
 */
function builders() {
  const box = glyphBox()
  const L = box.x
  const R = box.x + box.w
  const T = box.y
  const B = box.y + box.h
  const CX = (L + R) / 2
  const CY = (T + B) / 2
  const W = box.w
  const H = box.h

  const bowlT = T + H * 0.32
  const bowlB = B - H * 0.14
  const above = T + H * 0.14
  const below = B - H * 0.04

  return {
    ا: {
      name: 'Alif',
      rumi: 'a',
      strokes: () => [
        [
          { x: CX, y: T + H * 0.06 },
          { x: CX, y: B - H * 0.08 },
        ],
      ],
    },
    ب: {
      name: 'Ba',
      rumi: 'b',
      strokes: () => [bowlUp(L + W * 0.08, R - W * 0.08, bowlT, bowlB), nuqtah(CX, below)],
    },
    ت: {
      name: 'Ta',
      rumi: 't',
      strokes: () => [
        bowlUp(L + W * 0.08, R - W * 0.08, bowlT, bowlB),
        nuqtah(CX - W * 0.09, above),
        nuqtah(CX + W * 0.09, above),
      ],
    },
    ث: {
      name: 'Sa',
      rumi: 's',
      strokes: () => [
        bowlUp(L + W * 0.08, R - W * 0.08, bowlT, bowlB),
        nuqtah(CX, above - H * 0.05),
        nuqtah(CX - W * 0.1, above + H * 0.02),
        nuqtah(CX + W * 0.1, above + H * 0.02),
      ],
    },
    ج: {
      name: 'Jim',
      rumi: 'j',
      strokes: () => [jimStroke(L, R, T, B), nuqtah(CX, CY + H * 0.08)],
    },
    چ: {
      name: 'Ca',
      rumi: 'c',
      strokes: () => [
        jimStroke(L, R, T, B),
        nuqtah(CX - W * 0.08, CY + H * 0.04),
        nuqtah(CX + W * 0.08, CY + H * 0.04),
        nuqtah(CX, CY + H * 0.14),
      ],
    },
    ح: {
      name: 'Ha pedas',
      rumi: 'h',
      strokes: () => [jimStroke(L, R, T, B)],
    },
    خ: {
      name: 'Kha',
      rumi: 'kh',
      strokes: () => [jimStroke(L, R, T, B), nuqtah(CX, T + H * 0.1)],
    },
    د: {
      name: 'Dal',
      rumi: 'd',
      // Small backwards-C / hook — one stroke
      strokes: () => [arc(CX + W * 0.02, CY, W * 0.2, H * 0.28, 18, -0.35, Math.PI * 0.9)],
    },
    ذ: {
      name: 'Zal',
      rumi: 'z',
      strokes: () => [
        arc(CX + W * 0.02, CY, W * 0.2, H * 0.28, 18, -0.35, Math.PI * 0.9),
        nuqtah(CX + W * 0.05, T + H * 0.2),
      ],
    },
    ر: {
      name: 'Ra',
      rumi: 'r',
      strokes: () => [
        [
          { x: CX + W * 0.12, y: T + H * 0.32 },
          { x: CX + W * 0.02, y: T + H * 0.42 },
          ...arc(CX - W * 0.05, CY + H * 0.08, W * 0.16, H * 0.22, 14, -0.3, Math.PI * 0.85),
        ],
      ],
    },
    ز: {
      name: 'Zai',
      rumi: 'z',
      strokes: () => [
        [
          { x: CX + W * 0.12, y: T + H * 0.32 },
          { x: CX + W * 0.02, y: T + H * 0.42 },
          ...arc(CX - W * 0.05, CY + H * 0.08, W * 0.16, H * 0.22, 14, -0.3, Math.PI * 0.85),
        ],
        nuqtah(CX + W * 0.06, T + H * 0.2),
      ],
    },
    س: {
      name: 'Sin',
      rumi: 's',
      strokes: () => [sinStroke(L, R, T, B)],
    },
    ش: {
      name: 'Syin',
      rumi: 'sy',
      strokes: () => [
        sinStroke(L, R, T, B),
        nuqtah(CX, above - H * 0.04),
        nuqtah(CX - W * 0.1, above + H * 0.02),
        nuqtah(CX + W * 0.1, above + H * 0.02),
      ],
    },
    ص: {
      name: 'Sad',
      rumi: 's',
      strokes: () => [
        [
          { x: L + W * 0.15, y: T + H * 0.42 },
          ...arc(CX - W * 0.08, CY, W * 0.26, H * 0.2, 18, Math.PI * 0.85, Math.PI * 2 - 0.2),
          { x: R - W * 0.14, y: T + H * 0.38 },
          { x: R - W * 0.2, y: B - H * 0.22 },
          { x: CX + W * 0.02, y: B - H * 0.14 },
        ],
      ],
    },
    ض: {
      name: 'Dad',
      rumi: 'd',
      strokes: () => [
        [
          { x: L + W * 0.15, y: T + H * 0.42 },
          ...arc(CX - W * 0.08, CY, W * 0.26, H * 0.2, 18, Math.PI * 0.85, Math.PI * 2 - 0.2),
          { x: R - W * 0.14, y: T + H * 0.38 },
          { x: R - W * 0.2, y: B - H * 0.22 },
          { x: CX + W * 0.02, y: B - H * 0.14 },
        ],
        nuqtah(CX, T + H * 0.18),
      ],
    },
    ط: {
      name: 'To',
      rumi: 't',
      strokes: () => [
        // Open oval body (not a filled ring outline)
        arc(CX, CY + H * 0.06, W * 0.26, H * 0.26, 24, 0.35, Math.PI * 2 - 0.35),
        [
          { x: CX + W * 0.1, y: T + H * 0.1 },
          { x: CX + W * 0.1, y: CY },
        ],
      ],
    },
    ظ: {
      name: 'Zo',
      rumi: 'z',
      strokes: () => [
        arc(CX, CY + H * 0.06, W * 0.26, H * 0.26, 24, 0.35, Math.PI * 2 - 0.35),
        [
          { x: CX + W * 0.1, y: T + H * 0.1 },
          { x: CX + W * 0.1, y: CY },
        ],
        nuqtah(CX - W * 0.06, T + H * 0.22),
      ],
    },
    ع: {
      name: 'Ain',
      rumi: "'",
      strokes: () => [
        [
          { x: R - W * 0.2, y: T + H * 0.28 },
          { x: CX, y: T + H * 0.12 },
          { x: L + W * 0.28, y: T + H * 0.35 },
          { x: L + W * 0.3, y: CY },
          { x: CX, y: B - H * 0.16 },
          { x: R - W * 0.22, y: B - H * 0.3 },
        ],
      ],
    },
    غ: {
      name: 'Ghain',
      rumi: 'gh',
      strokes: () => [
        [
          { x: R - W * 0.2, y: T + H * 0.28 },
          { x: CX, y: T + H * 0.12 },
          { x: L + W * 0.28, y: T + H * 0.35 },
          { x: L + W * 0.3, y: CY },
          { x: CX, y: B - H * 0.16 },
          { x: R - W * 0.22, y: B - H * 0.3 },
        ],
        nuqtah(CX, T + H * 0.04),
      ],
    },
    ڠ: {
      name: 'Nga',
      rumi: 'ng',
      strokes: () => [
        [
          { x: R - W * 0.2, y: T + H * 0.28 },
          { x: CX, y: T + H * 0.12 },
          { x: L + W * 0.28, y: T + H * 0.35 },
          { x: L + W * 0.3, y: CY },
          { x: CX, y: B - H * 0.16 },
          { x: R - W * 0.22, y: B - H * 0.3 },
        ],
        nuqtah(CX, above - H * 0.06),
        nuqtah(CX - W * 0.1, above),
        nuqtah(CX + W * 0.1, above),
      ],
    },
    ف: {
      name: 'Fa',
      rumi: 'f',
      strokes: () => [
        [
          { x: R - W * 0.12, y: CY },
          ...arc(CX, CY - H * 0.06, W * 0.2, H * 0.18, 16, 0.2, Math.PI * 2 - 0.5),
          { x: L + W * 0.22, y: B - H * 0.18 },
        ],
        nuqtah(CX, T + H * 0.16),
      ],
    },
    ڤ: {
      name: 'Pa',
      rumi: 'p',
      strokes: () => [
        [
          { x: R - W * 0.12, y: CY },
          ...arc(CX, CY - H * 0.06, W * 0.2, H * 0.18, 16, 0.2, Math.PI * 2 - 0.5),
          { x: L + W * 0.22, y: B - H * 0.18 },
        ],
        nuqtah(CX, above - H * 0.04),
        nuqtah(CX - W * 0.1, above + H * 0.02),
        nuqtah(CX + W * 0.1, above + H * 0.02),
      ],
    },
    ق: {
      name: 'Qaf',
      rumi: 'q',
      strokes: () => [
        [
          { x: R - W * 0.1, y: CY },
          ...arc(CX, CY, W * 0.24, H * 0.24, 18, 0.15, Math.PI * 2 - 0.4),
          { x: L + W * 0.24, y: B - H * 0.12 },
        ],
        nuqtah(CX - W * 0.08, T + H * 0.16),
        nuqtah(CX + W * 0.08, T + H * 0.16),
      ],
    },
    ک: {
      name: 'Kaf',
      rumi: 'k',
      strokes: () => [
        [
          { x: L + W * 0.32, y: T + H * 0.08 },
          { x: L + W * 0.32, y: B - H * 0.12 },
          { x: R - W * 0.18, y: B - H * 0.22 },
        ],
        [
          { x: L + W * 0.32, y: T + H * 0.34 },
          { x: R - W * 0.16, y: T + H * 0.18 },
        ],
      ],
    },
    ݢ: {
      name: 'Ga',
      rumi: 'g',
      strokes: () => [
        [
          { x: L + W * 0.32, y: T + H * 0.08 },
          { x: L + W * 0.32, y: B - H * 0.12 },
          { x: R - W * 0.18, y: B - H * 0.22 },
        ],
        [
          { x: L + W * 0.32, y: T + H * 0.34 },
          { x: R - W * 0.16, y: T + H * 0.18 },
        ],
        nuqtah(CX + W * 0.04, T + H * 0.06),
      ],
    },
    ل: {
      name: 'Lam',
      rumi: 'l',
      strokes: () => [
        [
          { x: CX - W * 0.04, y: T + H * 0.06 },
          { x: CX - W * 0.04, y: B - H * 0.2 },
          { x: CX + W * 0.22, y: B - H * 0.12 },
        ],
      ],
    },
    م: {
      name: 'Mim',
      rumi: 'm',
      strokes: () => [
        [
          ...arc(CX, CY - H * 0.08, W * 0.16, H * 0.14, 16, -0.6, Math.PI * 1.5),
          { x: CX + W * 0.06, y: B - H * 0.1 },
        ],
      ],
    },
    ن: {
      name: 'Nun',
      rumi: 'n',
      strokes: () => [
        bowlUp(L + W * 0.12, R - W * 0.12, bowlT + H * 0.04, bowlB - H * 0.04),
        nuqtah(CX, above),
      ],
    },
    و: {
      name: 'Wau',
      rumi: 'w',
      strokes: () => [
        [
          ...arc(CX, CY - H * 0.1, W * 0.14, H * 0.12, 14, -0.5, Math.PI * 1.35),
          { x: CX + W * 0.14, y: B - H * 0.16 },
        ],
      ],
    },
    ۏ: {
      name: 'Va',
      rumi: 'v',
      strokes: () => [
        [
          ...arc(CX, CY - H * 0.1, W * 0.14, H * 0.12, 14, -0.5, Math.PI * 1.35),
          { x: CX + W * 0.14, y: B - H * 0.16 },
        ],
        nuqtah(CX, above - H * 0.02),
        nuqtah(CX - W * 0.09, above + H * 0.04),
        nuqtah(CX + W * 0.09, above + H * 0.04),
      ],
    },
    ه: {
      name: 'Ha',
      rumi: 'h',
      // Two loops as two short strokes (like B’s bumps in ABC)
      strokes: () => [
        arc(CX, CY - H * 0.14, W * 0.14, H * 0.12, 14, 0.2, Math.PI * 2 - 0.2),
        arc(CX, CY + H * 0.14, W * 0.14, H * 0.12, 14, 0.2, Math.PI * 2 - 0.2),
      ],
    },
    ء: {
      name: 'Hamzah',
      rumi: "'",
      strokes: () => [
        [
          { x: CX + W * 0.08, y: T + H * 0.3 },
          { x: CX - W * 0.06, y: T + H * 0.4 },
          { x: CX + W * 0.06, y: T + H * 0.52 },
          { x: CX - W * 0.02, y: T + H * 0.64 },
        ],
      ],
    },
    ي: {
      name: 'Ya',
      rumi: 'y',
      strokes: () => [
        [
          { x: R - W * 0.14, y: T + H * 0.38 },
          { x: R - W * 0.18, y: B - H * 0.22 },
          { x: CX, y: B - H * 0.1 },
          { x: L + W * 0.22, y: B - H * 0.24 },
          { x: L + W * 0.2, y: T + H * 0.42 },
        ],
        nuqtah(CX - W * 0.08, below),
        nuqtah(CX + W * 0.08, below),
      ],
    },
    ڽ: {
      name: 'Nya',
      rumi: 'ny',
      strokes: () => [
        [
          { x: R - W * 0.14, y: T + H * 0.38 },
          { x: R - W * 0.18, y: B - H * 0.22 },
          { x: CX, y: B - H * 0.1 },
          { x: L + W * 0.22, y: B - H * 0.24 },
          { x: L + W * 0.2, y: T + H * 0.42 },
        ],
        nuqtah(CX, below - H * 0.06),
        nuqtah(CX - W * 0.1, below),
        nuqtah(CX + W * 0.1, below),
      ],
    },
  }
}

/** @returns {string[]} */
export function listEduJawiIds() {
  return JAWI_LETTER_ORDER.map((ch) => `jawi:${ch}`)
}

/**
 * @param {string} ch
 * @returns {{ name: string, rumi: string, paths: Point[][] } | null}
 */
export function getJawiLetter(ch) {
  const entry = builders()[ch]
  if (!entry) return null
  return {
    name: entry.name,
    rumi: entry.rumi,
    paths: entry.strokes(),
  }
}

/**
 * @returns {Array<{ id: string, label: string, ch: string }>}
 */
export function eduJawiMenuItems() {
  const map = builders()
  return JAWI_LETTER_ORDER.map((ch) => {
    const entry = map[ch]
    return {
      id: `jawi:${ch}`,
      ch,
      label: entry ? `${ch}  ${entry.name}` : ch,
    }
  })
}
