import { describe, expect, it } from 'vitest'
import { buildMergeJobs, canGenerate, resolveFieldValue } from './merge.js'

describe('resolveFieldValue', () => {
  it('returns the cell as a string', () => {
    expect(resolveFieldValue({ name: 'Ahmad' }, 'name')).toBe('Ahmad')
  })

  it('returns an empty string when the column is missing', () => {
    expect(resolveFieldValue({ name: 'Ahmad' }, 'ic_no')).toBe('')
    expect(resolveFieldValue(null, 'name')).toBe('')
  })
})

describe('buildMergeJobs', () => {
  it('builds one job per row with placed field values', () => {
    const rows = [
      { name: 'Ahmad', ic_no: '111' },
      { name: 'Siti', ic_no: '222' },
    ]
    const fields = [
      { id: 'f1', column: 'name', x: 0.5, y: 0.4, fontSize: 28 },
      { id: 'f2', column: 'ic_no', x: 0.5, y: 0.5, fontSize: 16 },
    ]
    expect(buildMergeJobs(rows, fields)[0].texts[0]).toMatchObject({
      column: 'name',
      x: 0.5,
      y: 0.4,
      fontSize: 28,
      value: 'Ahmad',
    })
    expect(buildMergeJobs(rows, fields)[1].texts[1]).toMatchObject({
      column: 'ic_no',
      fontSize: 16,
      value: '222',
    })
  })

  it('skips empty rows', () => {
    const jobs = buildMergeJobs(
      [{ name: '   ' }, { name: 'Ahmad' }],
      [{ column: 'name', x: 0.5, y: 0.4, fontSize: 20 }],
    )
    expect(jobs).toHaveLength(1)
    expect(jobs[0].texts[0].value).toBe('Ahmad')
  })
})

describe('canGenerate', () => {
  it('requires rows, a template, and at least one field', () => {
    expect(
      canGenerate({
        rows: [{ name: 'A' }],
        templateDataUrl: 'data:image/png;base64,xx',
        fields: [{ column: 'name' }],
      }),
    ).toBe(true)
    expect(
      canGenerate({
        rows: [],
        templateDataUrl: 'data:image/png;base64,xx',
        fields: [{ column: 'name' }],
      }),
    ).toBe(false)
    expect(
      canGenerate({
        rows: [{ name: 'A' }],
        templateDataUrl: null,
        fields: [{ column: 'name' }],
      }),
    ).toBe(false)
    expect(
      canGenerate({
        rows: [{ name: '   ' }],
        templateDataUrl: 'data:image/png;base64,xx',
        fields: [{ column: 'name' }],
      }),
    ).toBe(false)
  })
})
