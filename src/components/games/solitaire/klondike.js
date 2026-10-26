import { createDeck, isRed, shuffle } from './deck.js'

/**
 * @typedef {import('./deck.js').Card} Card
 * @typedef {{
 *   drawCount: 1 | 3,
 *   stock: Card[],
 *   waste: Card[],
 *   foundations: Card[][],
 *   tableau: Card[][],
 *   history: object[],
 * }} Game
 */

function emptyFoundations() {
  return [[], [], [], []]
}

function emptyTableau() {
  return [[], [], [], [], [], [], []]
}

function cloneCards(cards) {
  return cards.map((c) => ({ ...c }))
}

function cloneGame(game) {
  return {
    drawCount: game.drawCount,
    stock: cloneCards(game.stock),
    waste: cloneCards(game.waste),
    foundations: game.foundations.map(cloneCards),
    tableau: game.tableau.map(cloneCards),
    history: game.history ?? [],
  }
}

function pushHistory(game) {
  const snapshot = {
    drawCount: game.drawCount,
    stock: cloneCards(game.stock),
    waste: cloneCards(game.waste),
    foundations: game.foundations.map(cloneCards),
    tableau: game.tableau.map(cloneCards),
  }
  return {
    ...cloneGame(game),
    history: [...(game.history ?? []), snapshot],
  }
}

/**
 * Hand-crafted or resumed state (no deal).
 * @param {Partial<Game> & { drawCount?: 1|3 }} partial
 * @returns {Game}
 */
export function newGame(partial = {}) {
  return {
    drawCount: partial.drawCount === 3 ? 3 : 1,
    stock: cloneCards(partial.stock ?? []),
    waste: cloneCards(partial.waste ?? []),
    foundations: (partial.foundations ?? emptyFoundations()).map(cloneCards),
    tableau: (partial.tableau ?? emptyTableau()).map(cloneCards),
    history: partial.history ?? [],
  }
}

/**
 * Deal a fresh Klondike layout.
 * @param {{ drawCount?: 1|3, random?: () => number }} [opts]
 */
export function createGame(opts = {}) {
  const drawCount = opts.drawCount === 3 ? 3 : 1
  const shuffled = shuffle(createDeck(), opts.random ?? Math.random)
  const tableau = emptyTableau()
  let cursor = 0
  for (let pile = 0; pile < 7; pile += 1) {
    for (let n = 0; n <= pile; n += 1) {
      const card = { ...shuffled[cursor], faceUp: n === pile }
      cursor += 1
      tableau[pile].push(card)
    }
  }
  const stock = shuffled.slice(cursor).map((c) => ({ ...c, faceUp: false }))
  return newGame({
    drawCount,
    stock,
    waste: [],
    foundations: emptyFoundations(),
    tableau,
    history: [],
  })
}

/** @param {Card[]} moving top of run must be face-up */
export function canDropOnTableau(moving, targetTop) {
  if (!moving?.length) return false
  const head = moving[0]
  if (!head.faceUp) return false
  if (!targetTop) return head.rank === 13
  if (targetTop.faceUp !== true) return false
  return isRed(head.suit) !== isRed(targetTop.suit) && head.rank === targetTop.rank - 1
}

export function canDropOnFoundation(card, foundationTop) {
  if (!card?.faceUp) return false
  if (!foundationTop) return card.rank === 1
  return card.suit === foundationTop.suit && card.rank === foundationTop.rank + 1
}

/**
 * Draw from stock (or recycle waste → stock when empty).
 * @param {Game} game
 */
export function drawFromStock(game) {
  if (game.stock.length === 0 && game.waste.length === 0) return game
  const base = pushHistory(game)
  if (base.stock.length === 0) {
    const recycled = base.waste
      .slice()
      .reverse()
      .map((c) => ({ ...c, faceUp: false }))
    return {
      ...base,
      stock: recycled,
      waste: [],
    }
  }
  const n = Math.min(base.drawCount, base.stock.length)
  const drawn = base.stock.slice(0, n).map((c) => ({ ...c, faceUp: true }))
  return {
    ...base,
    stock: base.stock.slice(n),
    waste: [...base.waste, ...drawn],
  }
}

export function undo(game) {
  const history = game.history ?? []
  if (history.length === 0) return game
  const prev = history[history.length - 1]
  return newGame({
    ...prev,
    history: history.slice(0, -1),
  })
}

function peekFoundation(game, pile) {
  const f = game.foundations[pile]
  return f.length ? f[f.length - 1] : null
}

function peekTableau(game, pile) {
  const t = game.tableau[pile]
  return t.length ? t[t.length - 1] : null
}

function getMovingCards(game, from) {
  if (from.type === 'waste') {
    if (!game.waste.length) return null
    return [game.waste[game.waste.length - 1]]
  }
  if (from.type === 'foundation') {
    const f = game.foundations[from.pile]
    if (!f?.length) return null
    return [f[f.length - 1]]
  }
  if (from.type === 'tableau') {
    const pile = game.tableau[from.pile]
    if (!pile || from.index < 0 || from.index >= pile.length) return null
    const run = pile.slice(from.index)
    if (!run.length || !run[0].faceUp) return null
    // Validate run is a legal descending alt-color sequence
    for (let i = 1; i < run.length; i += 1) {
      const a = run[i - 1]
      const b = run[i]
      if (!b.faceUp) return null
      if (isRed(a.suit) === isRed(b.suit) || b.rank !== a.rank - 1) return null
    }
    return run
  }
  return null
}

/**
 * @param {Game} game
 * @param {{ type: string, pile?: number, index?: number }} from
 * @param {{ type: string, pile?: number }} to
 * @returns {{ ok: boolean, game: Game }}
 */
export function moveCards(game, from, to) {
  const moving = getMovingCards(game, from)
  if (!moving) return { ok: false, game }

  if (to.type === 'tableau') {
    const targetTop = peekTableau(game, to.pile)
    if (!canDropOnTableau(moving, targetTop)) return { ok: false, game }
    // Foundation/waste moves only one card onto tableau — already enforced by getMovingCards size for those
    if (from.type !== 'tableau' && moving.length !== 1) return { ok: false, game }
  } else if (to.type === 'foundation') {
    if (moving.length !== 1) return { ok: false, game }
    const top = peekFoundation(game, to.pile)
    if (!canDropOnFoundation(moving[0], top)) return { ok: false, game }
  } else {
    return { ok: false, game }
  }

  let next = pushHistory(game)

  // Remove from source
  if (from.type === 'waste') {
    next = { ...next, waste: next.waste.slice(0, -1) }
  } else if (from.type === 'foundation') {
    const foundations = next.foundations.map(cloneCards)
    foundations[from.pile] = foundations[from.pile].slice(0, -1)
    next = { ...next, foundations }
  } else if (from.type === 'tableau') {
    const tableau = next.tableau.map(cloneCards)
    tableau[from.pile] = tableau[from.pile].slice(0, from.index)
    // Flip newly exposed
    const pile = tableau[from.pile]
    if (pile.length && !pile[pile.length - 1].faceUp) {
      pile[pile.length - 1] = { ...pile[pile.length - 1], faceUp: true }
    }
    next = { ...next, tableau }
  }

  // Add to destination
  if (to.type === 'tableau') {
    const tableau = next.tableau.map(cloneCards)
    tableau[to.pile] = [...tableau[to.pile], ...moving.map((c) => ({ ...c, faceUp: true }))]
    next = { ...next, tableau }
  } else if (to.type === 'foundation') {
    const foundations = next.foundations.map(cloneCards)
    foundations[to.pile] = [...foundations[to.pile], { ...moving[0], faceUp: true }]
    next = { ...next, foundations }
  }

  return { ok: true, game: next }
}

export function isWon(game) {
  return game.foundations.every((f) => f.length === 13)
}

/**
 * Find first legal destination for a selection (auto-move helper).
 * Prefers foundations, then tableau.
 */
export function findAutoTarget(game, from) {
  const moving = getMovingCards(game, from)
  if (!moving) return null
  if (moving.length === 1) {
    for (let i = 0; i < 4; i += 1) {
      if (canDropOnFoundation(moving[0], peekFoundation(game, i))) {
        return { type: 'foundation', pile: i }
      }
    }
  }
  for (let i = 0; i < 7; i += 1) {
    if (from.type === 'tableau' && from.pile === i) continue
    if (canDropOnTableau(moving, peekTableau(game, i))) {
      return { type: 'tableau', pile: i }
    }
  }
  return null
}

export { getMovingCards }
