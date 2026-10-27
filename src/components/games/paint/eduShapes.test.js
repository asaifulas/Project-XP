import { describe, expect, it } from 'vitest'
import {
  EDU_SHAPE_IDS,
  EDU_SHAPE_LABELS,
  getEduTemplate,
} from './eduTemplates.js'
import { simplifyClipartStrokes, svgMarkupToPolylines } from './svgToPolylines.js'

describe('edu shapes', () => {
  it('lists common kid shapes including star and pentagon', () => {
    expect(EDU_SHAPE_IDS).toEqual(
      expect.arrayContaining([
        'shape:circle',
        'shape:square',
        'shape:triangle',
        'shape:star',
        'shape:pentagon',
        'shape:hexagon',
        'shape:heart',
      ]),
    )
    expect(EDU_SHAPE_IDS.length).toBeGreaterThanOrEqual(10)
  })

  it('builds a closed star with enough points to snap to', () => {
    const tmpl = getEduTemplate('shape:star')
    expect(tmpl?.kind).toBe('shape')
    expect(tmpl?.closed).toBe(true)
    expect(tmpl?.label).toBe(EDU_SHAPE_LABELS.star)
    expect(tmpl?.paths.length).toBe(1)
    expect(tmpl.paths[0].length).toBeGreaterThan(10)
  })

  it('builds pentagon / hexagon / heart guides', () => {
    for (const id of ['shape:pentagon', 'shape:hexagon', 'shape:heart', 'shape:oval']) {
      const tmpl = getEduTemplate(id)
      expect(tmpl?.kind).toBe('shape')
      expect(tmpl?.paths[0]?.length).toBeGreaterThan(4)
    }
  })
})

describe('simplifyClipartStrokes silhouettes', () => {
  it('keeps a single full-bbox silhouette instead of dropping it as a page frame', () => {
    const svg = `
      <svg viewBox="0 0 100 100">
        <path d="M10 50 L50 10 L90 50 L50 90 Z" style="fill:#000000;stroke:#000"/>
      </svg>`
    const raw = svgMarkupToPolylines(svg)
    expect(raw.length).toBe(1)
    const simple = simplifyClipartStrokes(raw)
    expect(simple.length).toBe(1)
    expect(simple[0].length).toBeGreaterThan(3)
  })
})
