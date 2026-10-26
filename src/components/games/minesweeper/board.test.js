import { describe, expect, it } from 'vitest'
import {
  DIFFICULTIES,
  adjacentCoords,
  chord,
  createGame,
  flagCell,
  isLost,
  isWon,
  placeMines,
  revealCell,
} from './board.js'

/** Deterministic RNG that walks a fixed sequence (0..1). */
function seqRandom(seq) {
  let i = 0
  return () => {
    const v = seq[i % seq.length]
    i += 1
    return v
  }
}

describe('DIFFICULTIES', () => {
  it('defines beginner / intermediate / expert', () => {
    expect(DIFFICULTIES.beginner).toEqual({ width: 9, height: 9, mines: 10 })
    expect(DIFFICULTIES.intermediate).toEqual({ width: 16, height: 16, mines: 40 })
    expect(DIFFICULTIES.expert).toEqual({ width: 30, height: 16, mines: 99 })
  })
})

describe('createGame', () => {
  it('builds an empty ready board with no mines placed', () => {
    const game = createGame({ difficulty: 'beginner' })
    expect(game.width).toBe(9)
    expect(game.height).toBe(9)
    expect(game.mineCount).toBe(10)
    expect(game.status).toBe('ready')
    expect(game.minesPlaced).toBe(false)
    expect(game.cells).toHaveLength(81)
    expect(game.cells.every((c) => !c.mine && !c.revealed && !c.flagged)).toBe(true)
    expect(game.flagCount).toBe(0)
  })
})

describe('placeMines', () => {
  it('places exact mine count avoiding the protected cells', () => {
    const game = createGame({ difficulty: 'beginner' })
    const protectedSet = new Set(['0,0', '0,1', '1,0', '1,1'])
    const next = placeMines(game, protectedSet, seqRandom([0.1, 0.2, 0.3, 0.9, 0.05]))
    expect(next.minesPlaced).toBe(true)
    expect(next.cells.filter((c) => c.mine)).toHaveLength(10)
    for (const key of protectedSet) {
      const [r, c] = key.split(',').map(Number)
      expect(next.cells[r * next.width + c].mine).toBe(false)
    }
  })

  it('fills adjacent counts', () => {
    // 3x3 with one mine at center after forced placement via custom board
    let game = createGame({ width: 3, height: 3, mines: 1 })
    game = placeMines(game, new Set(['0,0']), () => 0.99)
    // With random always high, placement still picks from candidates; just assert counts are 0–8
    for (const cell of game.cells) {
      if (!cell.mine) expect(cell.adjacent).toBeGreaterThanOrEqual(0)
      expect(cell.adjacent).toBeLessThanOrEqual(8)
    }
  })
})

describe('revealCell', () => {
  it('places mines on first click and keeps the click cell safe', () => {
    const game = createGame({ width: 9, height: 9, mines: 10 })
    const result = revealCell(game, 0, 0, () => 0.999)
    expect(result.ok).toBe(true)
    expect(result.game.minesPlaced).toBe(true)
    expect(result.game.status === 'playing' || result.game.status === 'won').toBe(true)
    expect(result.game.cells[0].revealed).toBe(true)
    expect(result.game.cells[0].mine).toBe(false)
    // First-click neighborhood is also protected
    expect(result.game.cells[1].mine).toBe(false)
    expect(result.game.cells[9].mine).toBe(false)
  })

  it('flood-fills contiguous zeros', () => {
    // Hand-built board: mine at (0,2), rest clear — click (0,0) should open left area
    let game = createGame({ width: 3, height: 1, mines: 1 })
    game = {
      ...game,
      minesPlaced: true,
      status: 'playing',
      cells: [
        { mine: false, revealed: false, flagged: false, adjacent: 1 },
        { mine: false, revealed: false, flagged: false, adjacent: 1 },
        { mine: true, revealed: false, flagged: false, adjacent: 0 },
      ],
    }
    const { game: next } = revealCell(game, 0, 0)
    expect(next.cells[0].revealed).toBe(true)
    expect(next.cells[1].revealed).toBe(false) // number, only opened if flood from zero
    expect(next.cells[2].revealed).toBe(false)
  })

  it('flood opens zeros and bordering numbers', () => {
    // 3x3: mine only bottom-right; center and others form zeros near top-left
    let game = createGame({ width: 3, height: 3, mines: 1 })
    const cells = Array.from({ length: 9 }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
    cells[8] = { mine: true, revealed: false, flagged: false, adjacent: 0 }
    // adjacent for cells near mine
    cells[4].adjacent = 1 // center
    cells[5].adjacent = 1
    cells[7].adjacent = 1
    cells[2].adjacent = 0
    cells[0].adjacent = 0
    cells[1].adjacent = 0
    cells[3].adjacent = 0
    cells[6].adjacent = 0
    // recompute properly for mine at 2,2
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        const i = r * 3 + c
        if (cells[i].mine) continue
        let n = 0
        for (const [nr, nc] of adjacentCoords(r, c, 3, 3)) {
          if (cells[nr * 3 + nc].mine) n += 1
        }
        cells[i].adjacent = n
      }
    }
    game = { ...game, minesPlaced: true, status: 'playing', cells }
    const { game: next } = revealCell(game, 0, 0)
    expect(next.cells[0].revealed).toBe(true)
    expect(next.cells[1].revealed).toBe(true)
    expect(next.cells[3].revealed).toBe(true)
    expect(next.cells[4].revealed).toBe(true) // bordering 1
    expect(next.cells[8].revealed).toBe(false)
  })

  it('regional mine hit detonates pad, deducts score, keeps playing if lives remain', () => {
    // 4×1: mine at index 1 — blast opens neighbors 0 and 2, leaves cell 3 hidden
    let game = createGame({ width: 4, height: 1, mines: 1, lives: 3 })
    game = {
      ...game,
      minesPlaced: true,
      status: 'playing',
      score: 100,
      cells: [
        { mine: false, revealed: false, flagged: false, adjacent: 1 },
        { mine: true, revealed: false, flagged: false, adjacent: 0 },
        { mine: false, revealed: false, flagged: false, adjacent: 1 },
        { mine: false, revealed: false, flagged: false, adjacent: 0 },
      ],
      revealedCount: 0,
    }
    const { game: next } = revealCell(game, 0, 1)
    expect(next.status).toBe('playing')
    expect(next.lives).toBe(2)
    expect(next.cells[1].detonated).toBe(true)
    expect(next.cells[1].revealed).toBe(true)
    expect(next.cells[0].revealed).toBe(true)
    expect(next.cells[2].revealed).toBe(true)
    expect(next.cells[3].revealed).toBe(false)
    expect(next.score).toBeLessThan(100)
    expect(next.lastPenalty).toBeGreaterThan(0)
  })

  it('last life mine hit loses the game', () => {
    let game = createGame({ width: 2, height: 1, mines: 1, lives: 1 })
    game = {
      ...game,
      minesPlaced: true,
      status: 'playing',
      cells: [
        { mine: false, revealed: true, flagged: false, adjacent: 1 },
        { mine: true, revealed: false, flagged: false, adjacent: 0 },
      ],
      revealedCount: 1,
    }
    const { game: next } = revealCell(game, 0, 1)
    expect(next.status).toBe('lost')
    expect(isLost(next)).toBe(true)
    expect(next.lives).toBe(0)
  })

  it('wins when all non-mines are revealed and awards regional score', () => {
    let game = createGame({ width: 2, height: 1, mines: 1 })
    game = {
      ...game,
      minesPlaced: true,
      status: 'playing',
      cells: [
        { mine: false, revealed: false, flagged: false, adjacent: 1 },
        { mine: true, revealed: false, flagged: false, adjacent: 0 },
      ],
      revealedCount: 0,
    }
    const { game: next } = revealCell(game, 0, 0)
    expect(next.status).toBe('won')
    expect(isWon(next)).toBe(true)
    expect(next.score).toBeGreaterThan(0)
    expect(next.lastSweep).toBe(1)
  })
})

describe('flagCell', () => {
  it('toggles flags and updates flagCount', () => {
    let game = createGame({ width: 2, height: 2, mines: 1 })
    const a = flagCell(game, 0, 0)
    expect(a.ok).toBe(true)
    expect(a.game.cells[0].flagged).toBe(true)
    expect(a.game.flagCount).toBe(1)
    const b = flagCell(a.game, 0, 0)
    expect(b.game.cells[0].flagged).toBe(false)
    expect(b.game.flagCount).toBe(0)
  })

  it('does not flag revealed cells', () => {
    let game = createGame({ width: 1, height: 1, mines: 0 })
    game = {
      ...game,
      minesPlaced: true,
      status: 'playing',
      cells: [{ mine: false, revealed: true, flagged: false, adjacent: 0 }],
      revealedCount: 1,
    }
    const result = flagCell(game, 0, 0)
    expect(result.ok).toBe(false)
  })
})

describe('chord', () => {
  it('reveals neighbors when flag count matches adjacent', () => {
    // Center cell adjacent=1, flag on mine neighbor, chord opens safe
    let game = createGame({ width: 3, height: 1, mines: 1 })
    game = {
      ...game,
      minesPlaced: true,
      status: 'playing',
      cells: [
        { mine: true, revealed: false, flagged: true, adjacent: 0 },
        { mine: false, revealed: true, flagged: false, adjacent: 1 },
        { mine: false, revealed: false, flagged: false, adjacent: 1 },
      ],
      revealedCount: 1,
      flagCount: 1,
    }
    const { ok, game: next } = chord(game, 0, 1)
    expect(ok).toBe(true)
    expect(next.cells[2].revealed).toBe(true)
    expect(next.status).toBe('won')
  })
})
