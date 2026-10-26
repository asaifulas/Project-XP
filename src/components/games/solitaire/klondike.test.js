import { describe, expect, it } from 'vitest'
import { createDeck, isRed } from './deck.js'
import {
  canDropOnFoundation,
  canDropOnTableau,
  createGame,
  drawFromStock,
  isWon,
  moveCards,
  newGame,
  undo,
} from './klondike.js'

/** Deterministic RNG that walks a fixed sequence. */
function seqRandom(seq) {
  let i = 0
  return () => {
    const v = seq[i % seq.length]
    i += 1
    return v
  }
}

describe('deck', () => {
  it('builds 52 unique cards', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(52)
    expect(new Set(deck.map((c) => c.id)).size).toBe(52)
  })
})

describe('klondike deal', () => {
  it('deals 7 tableau piles with correct counts and top face-up', () => {
    const game = createGame({ drawCount: 1, random: () => 0.5 })
    expect(game.tableau).toHaveLength(7)
    game.tableau.forEach((pile, i) => {
      expect(pile).toHaveLength(i + 1)
      expect(pile[pile.length - 1].faceUp).toBe(true)
      for (let j = 0; j < pile.length - 1; j += 1) {
        expect(pile[j].faceUp).toBe(false)
      }
    })
    const dealt = game.tableau.reduce((n, p) => n + p.length, 0)
    expect(dealt).toBe(28)
    expect(game.stock.length + game.waste.length).toBe(24)
    expect(game.foundations.every((f) => f.length === 0)).toBe(true)
  })
})

describe('tableau rules', () => {
  it('allows alternating colors descending by one', () => {
    expect(
      canDropOnTableau(
        [{ suit: 'hearts', rank: 7, id: 'h7', faceUp: true }],
        { suit: 'spades', rank: 8, id: 's8', faceUp: true },
      ),
    ).toBe(true)
    expect(
      canDropOnTableau(
        [{ suit: 'hearts', rank: 7, id: 'h7', faceUp: true }],
        { suit: 'diamonds', rank: 8, id: 'd8', faceUp: true },
      ),
    ).toBe(false)
    expect(
      canDropOnTableau(
        [{ suit: 'spades', rank: 13, id: 's13', faceUp: true }],
        null,
      ),
    ).toBe(true)
    expect(
      canDropOnTableau(
        [{ suit: 'hearts', rank: 12, id: 'h12', faceUp: true }],
        null,
      ),
    ).toBe(false)
  })
})

describe('foundation rules', () => {
  it('builds same suit ascending from ace', () => {
    expect(canDropOnFoundation({ suit: 'clubs', rank: 1, id: 'c1', faceUp: true }, null)).toBe(
      true,
    )
    expect(
      canDropOnFoundation(
        { suit: 'clubs', rank: 2, id: 'c2', faceUp: true },
        { suit: 'clubs', rank: 1, id: 'c1', faceUp: true },
      ),
    ).toBe(true)
    expect(
      canDropOnFoundation(
        { suit: 'hearts', rank: 2, id: 'h2', faceUp: true },
        { suit: 'clubs', rank: 1, id: 'c1', faceUp: true },
      ),
    ).toBe(false)
  })
})

describe('draw and undo', () => {
  it('draws one card to waste and undoes', () => {
    let game = createGame({ drawCount: 1, random: () => 0.42 })
    const stockBefore = game.stock.length
    game = drawFromStock(game)
    expect(game.waste).toHaveLength(1)
    expect(game.stock).toHaveLength(stockBefore - 1)
    expect(game.waste[0].faceUp).toBe(true)
    game = undo(game)
    expect(game.waste).toHaveLength(0)
    expect(game.stock).toHaveLength(stockBefore)
  })

  it('recycles waste into stock when stock empty (draw-1)', () => {
    let game = createGame({ drawCount: 1, random: () => 0.3 })
    while (game.stock.length > 0) {
      game = drawFromStock(game)
    }
    expect(game.stock).toHaveLength(0)
    expect(game.waste.length).toBeGreaterThan(0)
    const wasteCount = game.waste.length
    game = drawFromStock(game)
    expect(game.waste).toHaveLength(0)
    expect(game.stock).toHaveLength(wasteCount)
  })
})

describe('moves', () => {
  it('moves a face-up tableau card onto a valid tableau target', () => {
    // Build a minimal hand-crafted state
    let game = newGame({
      drawCount: 1,
      stock: [],
      waste: [],
      foundations: [[], [], [], []],
      tableau: [
        [{ suit: 'spades', rank: 8, id: 's8', faceUp: true }],
        [{ suit: 'hearts', rank: 7, id: 'h7', faceUp: true }],
        [],
        [],
        [],
        [],
        [],
      ],
    })
    const result = moveCards(game, { type: 'tableau', pile: 1, index: 0 }, { type: 'tableau', pile: 0 })
    expect(result.ok).toBe(true)
    expect(result.game.tableau[0].map((c) => c.id)).toEqual(['s8', 'h7'])
    expect(result.game.tableau[1]).toHaveLength(0)
  })

  it('moves ace from waste to foundation', () => {
    let game = newGame({
      drawCount: 1,
      stock: [],
      waste: [{ suit: 'diamonds', rank: 1, id: 'd1', faceUp: true }],
      foundations: [[], [], [], []],
      tableau: [[], [], [], [], [], [], []],
    })
    const result = moveCards(game, { type: 'waste' }, { type: 'foundation', pile: 0 })
    expect(result.ok).toBe(true)
    expect(result.game.foundations[0][0].id).toBe('d1')
    expect(result.game.waste).toHaveLength(0)
  })

  it('flips newly exposed tableau card after move', () => {
    let game = newGame({
      drawCount: 1,
      stock: [],
      waste: [],
      foundations: [[], [], [], []],
      tableau: [
        [
          { suit: 'clubs', rank: 5, id: 'c5', faceUp: false },
          { suit: 'hearts', rank: 7, id: 'h7', faceUp: true },
        ],
        [{ suit: 'spades', rank: 8, id: 's8', faceUp: true }],
        [],
        [],
        [],
        [],
        [],
      ],
    })
    const result = moveCards(game, { type: 'tableau', pile: 0, index: 1 }, { type: 'tableau', pile: 1 })
    expect(result.ok).toBe(true)
    expect(result.game.tableau[0][0].faceUp).toBe(true)
  })
})

describe('win', () => {
  it('detects a completed game', () => {
    const foundations = SUITS_FULL_FOUNDATIONS()
    const game = newGame({
      drawCount: 1,
      stock: [],
      waste: [],
      foundations,
      tableau: [[], [], [], [], [], [], []],
    })
    expect(isWon(game)).toBe(true)
    expect(isWon(createGame({ drawCount: 1, random: () => 0.2 }))).toBe(false)
  })
})

function SUITS_FULL_FOUNDATIONS() {
  return ['clubs', 'diamonds', 'hearts', 'spades'].map((suit) =>
    Array.from({ length: 13 }, (_, i) => ({
      suit,
      rank: i + 1,
      id: `${suit}-${i + 1}`,
      faceUp: true,
    })),
  )
}

// silence unused import if tree-shaken oddly
void isRed
void seqRandom
