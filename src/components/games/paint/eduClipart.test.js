import { describe, expect, it } from 'vitest'
import {
  EDU_CLIPART_CATEGORIES,
  getClipartLabel,
  getClipartPaths,
  getClipartSvg,
  hardenGuidePixels,
  listEduClipartIds,
} from './eduClipart.js'
import { eduJawiMenuItems, getJawiLetter, listEduJawiIds } from './eduJawi.js'
import { getEduTemplate } from './eduTemplates.js'
import {
  pathDToPolylines,
  simplifyClipartStrokes,
  svgMarkupToPolylines,
} from './svgToPolylines.js'

describe('svgToPolylines', () => {
  it('parses a simple path', () => {
    const strokes = pathDToPolylines('M0 0 L10 0 L10 10 Z')
    expect(strokes.length).toBe(1)
    expect(strokes[0].length).toBeGreaterThan(3)
  })

  it('skips white-filled background rects by default', () => {
    const svg = `
      <svg>
        <rect x="0" y="0" width="1000" height="800" style="fill:#ffffff;stroke:#000"/>
        <path d="M10 10 L90 10 L50 90 Z" style="fill:none;stroke:#000"/>
      </svg>`
    const strokes = svgMarkupToPolylines(svg)
    expect(strokes.length).toBe(1)
    expect(strokes[0][0].x).toBeCloseTo(10)
  })

  it('simplifies dense stroke sets', () => {
    /** @type {{x:number,y:number}[][]} */
    const dense = []
    for (let s = 0; s < 40; s += 1) {
      const stroke = []
      for (let i = 0; i < 200; i += 1) stroke.push({ x: i, y: s * 2 + (i % 3) })
      dense.push(stroke)
    }
    const simple = simplifyClipartStrokes(dense, { maxStrokes: 5, maxPointsPerStroke: 40 })
    expect(simple.length).toBeLessThanOrEqual(5)
    expect(simple[0].length).toBeLessThanOrEqual(41)
  })
})

describe('hardenGuidePixels', () => {
  it('turns AA fringe into pure white or solid outline (no soft halo)', () => {
    const data = new Uint8ClampedArray([
      // pure white interior
      255, 255, 255, 255,
      // light AA fringe (would leave a crunchy white ring after fill)
      230, 230, 230, 255,
      // mid grey AA
      180, 180, 180, 255,
      // dark outline
      40, 40, 40, 200,
    ])
    hardenGuidePixels(data, { whiteCutoff: 220, outlineRgb: [90, 90, 90] })
    expect([...data.slice(0, 4)]).toEqual([255, 255, 255, 255])
    expect([...data.slice(4, 8)]).toEqual([255, 255, 255, 255])
    expect([...data.slice(8, 12)]).toEqual([90, 90, 90, 255])
    expect([...data.slice(12, 16)]).toEqual([90, 90, 90, 255])
  })
})

describe('eduClipart (Openclipart SVG pack)', () => {
  it('exposes categories from the downloaded pack', () => {
    expect(EDU_CLIPART_CATEGORIES.length).toBeGreaterThanOrEqual(4)
    const total = EDU_CLIPART_CATEGORIES.reduce((n, c) => n + c.items.length, 0)
    expect(total).toBeGreaterThan(20)
  })

  it('keeps airplane svg markup and a bounded path count', () => {
    expect(getClipartSvg('airplane')).toContain('<svg')
    const strokes = getClipartPaths('airplane')
    const pts = strokes.reduce((n, s) => n + s.length, 0)
    expect(strokes.length).toBeGreaterThan(0)
    expect(strokes.length).toBeLessThanOrEqual(14)
    expect(pts).toBeLessThan(2000)
    expect(getClipartLabel('airplane').toLowerCase()).toMatch(/plane|airplane/)
  })

  it('resolves airplane via getEduTemplate with svgMarkup', () => {
    const ids = listEduClipartIds()
    expect(ids).toContain('clipart:airplane')
    const tmpl = getEduTemplate('clipart:airplane')
    expect(tmpl?.kind).toBe('clipart')
    expect(tmpl?.svgMarkup).toContain('<svg')
  })
})

describe('eduJawi (ABC-style single strokes)', () => {
  it('lists modern Jawi letters', () => {
    const ids = listEduJawiIds()
    expect(ids.length).toBeGreaterThanOrEqual(30)
    expect(ids).toContain('jawi:ا')
    expect(ids).toContain('jawi:ب')
  })

  it('Alif is one vertical stroke like letter I', () => {
    const alif = getJawiLetter('ا')
    expect(alif?.name).toBe('Alif')
    expect(alif?.paths.length).toBe(1)
    expect(alif?.paths[0].length).toBe(2)
  })

  it('Ba is bowl + one nuqṭah (open strokes, not font outline)', () => {
    const ba = getJawiLetter('ب')
    expect(ba?.name).toBe('Ba')
    expect(ba?.paths.length).toBe(2)
    expect(ba.paths[0].length).toBeGreaterThan(5)
  })

  it('resolves via getEduTemplate', () => {
    const tmpl = getEduTemplate('jawi:م')
    expect(tmpl?.kind).toBe('jawi')
    expect(tmpl?.label).toContain('Mim')
    expect(eduJawiMenuItems().some((item) => item.id === 'jawi:ڤ')).toBe(true)
  })
})
