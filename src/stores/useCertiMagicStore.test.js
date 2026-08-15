import { beforeEach, describe, expect, it } from 'vitest'
import { useCertiMagicStore } from './useCertiMagicStore.js'

describe('useCertiMagicStore', () => {
  beforeEach(() => {
    useCertiMagicStore.getState().reset()
  })

  it('imports csv into columns and rows without mutating the previous rows array', () => {
    const before = useCertiMagicStore.getState().rows
    useCertiMagicStore.getState().importCsv('no,name\n1,Ahmad')
    const after = useCertiMagicStore.getState()
    expect(after.columns).toEqual(['no', 'name'])
    expect(after.rows).toEqual([{ no: '1', name: 'Ahmad' }])
    expect(after.rows).not.toBe(before)
    expect(after.fields).toEqual([])
  })

  it('updates a cell immutably', () => {
    useCertiMagicStore.getState().importCsv('name\nAhmad')
    const before = useCertiMagicStore.getState().rows
    useCertiMagicStore.getState().setCell(0, 'name', 'Siti')
    const after = useCertiMagicStore.getState().rows
    expect(after).toEqual([{ name: 'Siti' }])
    expect(after).not.toBe(before)
    expect(before[0]).toEqual({ name: 'Ahmad' })
  })

  it('adds a placed field and can move it', () => {
    useCertiMagicStore.getState().addField({ column: 'name', x: 0.2, y: 0.3 })
    const [field] = useCertiMagicStore.getState().fields
    expect(field).toMatchObject({ column: 'name', x: 0.2, y: 0.3, fontSize: 14 })
    expect(field.id).toBeTruthy()
    useCertiMagicStore.getState().moveField(field.id, 0.8, 0.9)
    expect(useCertiMagicStore.getState().fields[0]).toMatchObject({ x: 0.8, y: 0.9 })
  })

  it('nudges a selected field and updates style immutably', () => {
    useCertiMagicStore.getState().addField({ column: 'name', x: 0.5, y: 0.5 })
    const id = useCertiMagicStore.getState().fields[0].id
    const before = useCertiMagicStore.getState().fields
    useCertiMagicStore.getState().nudgeField(id, 0.001, -0.001)
    useCertiMagicStore.getState().updateFieldStyle(id, { bold: true, letterSpacing: 1 })
    const after = useCertiMagicStore.getState().fields
    expect(after[0].x).toBeCloseTo(0.501, 5)
    expect(after[0].y).toBeCloseTo(0.499, 5)
    expect(after[0]).toMatchObject({ bold: true, letterSpacing: 1 })
    expect(after).not.toBe(before)
  })

  it('clears placed fields when columns change via csv import', () => {
    useCertiMagicStore.getState().addField({ column: 'name', x: 0.5, y: 0.5 })
    useCertiMagicStore.getState().importCsv('title\nHello')
    expect(useCertiMagicStore.getState().fields).toEqual([])
  })

  it('renames a column header and remaps rows and fields immutably', () => {
    useCertiMagicStore.getState().importCsv('name,ic_no\nAhmad,111')
    useCertiMagicStore.getState().addField({ column: 'name', x: 0.4, y: 0.5 })
    const beforeRows = useCertiMagicStore.getState().rows
    const beforeFields = useCertiMagicStore.getState().fields
    useCertiMagicStore.getState().renameColumn(0, 'full_name')
    const after = useCertiMagicStore.getState()
    expect(after.columns).toEqual(['full_name', 'ic_no'])
    expect(after.rows).toEqual([{ full_name: 'Ahmad', ic_no: '111' }])
    expect(after.rows).not.toBe(beforeRows)
    expect(after.fields[0]).toMatchObject({ column: 'full_name', x: 0.4, y: 0.5 })
    expect(after.fields).not.toBe(beforeFields)
    expect(beforeRows[0]).toEqual({ name: 'Ahmad', ic_no: '111' })
  })

  it('keeps renamed headers unique', () => {
    useCertiMagicStore.getState().importCsv('name,ic_no\nAhmad,111')
    useCertiMagicStore.getState().renameColumn(1, 'name')
    expect(useCertiMagicStore.getState().columns).toEqual(['name', 'name_2'])
    expect(useCertiMagicStore.getState().rows[0]).toEqual({ name: 'Ahmad', name_2: '111' })
  })

  it('creates later columns and rows when a distant cell is edited', () => {
    useCertiMagicStore.getState().importCsv('name\nAhmad')
    useCertiMagicStore.getState().setCellAt(5, 3, 'Kuala Lumpur')
    const after = useCertiMagicStore.getState()
    expect(after.columns[0]).toBe('name')
    expect(after.columns[3]).toBeTruthy()
    expect(after.columns).toHaveLength(4)
    expect(after.rows).toHaveLength(6)
    expect(after.rows[5][after.columns[3]]).toBe('Kuala Lumpur')
    expect(after.rows[0].name).toBe('Ahmad')
  })

  it('names a header beyond the current used range', () => {
    useCertiMagicStore.getState().importCsv('name\nAhmad')
    useCertiMagicStore.getState().renameColumn(4, 'city')
    const after = useCertiMagicStore.getState()
    expect(after.columns[4]).toBe('city')
    expect(after.columns).toHaveLength(5)
  })
})
