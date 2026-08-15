import { describe, expect, it } from 'vitest'
import { colLetter, GRID_COLS, GRID_ROWS } from './excelGrid.js'

describe('colLetter', () => {
  it('matches Excel column letters', () => {
    expect(colLetter(0)).toBe('A')
    expect(colLetter(25)).toBe('Z')
    expect(colLetter(26)).toBe('AA')
    expect(colLetter(255)).toBe('IV')
  })
})

describe('grid size', () => {
  it('uses an Excel-scale sheet', () => {
    expect(GRID_COLS).toBe(256)
    expect(GRID_ROWS).toBe(4096)
  })
})
