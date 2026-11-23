import { describe, expect, it } from 'vitest'
import { eduNeighbours } from './eduSequence.js'

describe('eduNeighbours', () => {
  it('steps through uppercase letters', () => {
    expect(eduNeighbours('letter:B')).toEqual({ prev: 'letter:A', next: 'letter:C' })
  })

  it('wraps at the ends and keeps upper and lower case apart', () => {
    expect(eduNeighbours('letter:Z').next).toBe('letter:A')
    expect(eduNeighbours('letter:a').prev).toBe('letter:z')
  })

  it('steps through digits', () => {
    expect(eduNeighbours('digit:0')).toEqual({ prev: 'digit:9', next: 'digit:1' })
  })

  it('returns null for unknown pages', () => {
    expect(eduNeighbours(null)).toBeNull()
    expect(eduNeighbours('nope')).toBeNull()
  })
})
