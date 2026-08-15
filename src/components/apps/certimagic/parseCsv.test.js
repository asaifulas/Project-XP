import { describe, expect, it } from 'vitest'
import { parseCsv } from './parseCsv.js'

describe('parseCsv', () => {
  it('returns empty columns and rows for blank input', () => {
    expect(parseCsv('')).toEqual({ columns: [], rows: [] })
    expect(parseCsv('   ')).toEqual({ columns: [], rows: [] })
    expect(parseCsv(null)).toEqual({ columns: [], rows: [] })
  })

  it('uses the first row as headers and following rows as records', () => {
    const csv = 'no,name,ic_no\n1,Ahmad,900101-14-1234\n2,Siti,910202-10-5678'
    expect(parseCsv(csv)).toEqual({
      columns: ['no', 'name', 'ic_no'],
      rows: [
        { no: '1', name: 'Ahmad', ic_no: '900101-14-1234' },
        { no: '2', name: 'Siti', ic_no: '910202-10-5678' },
      ],
    })
  })

  it('keeps commas inside quoted fields', () => {
    const csv = 'name,city\n"Ahmad, Jr.",Kuala Lumpur'
    expect(parseCsv(csv)).toEqual({
      columns: ['name', 'city'],
      rows: [{ name: 'Ahmad, Jr.', city: 'Kuala Lumpur' }],
    })
  })

  it('skips empty data rows and strips a BOM', () => {
    const csv = '\uFEFFno,name\n1,Ahmad\n\n2,Siti\n'
    expect(parseCsv(csv).rows).toEqual([
      { no: '1', name: 'Ahmad' },
      { no: '2', name: 'Siti' },
    ])
  })

  it('makes duplicate headers unique', () => {
    const csv = 'name,name\nA,B'
    expect(parseCsv(csv)).toEqual({
      columns: ['name', 'name_2'],
      rows: [{ name: 'A', name_2: 'B' }],
    })
  })
})
