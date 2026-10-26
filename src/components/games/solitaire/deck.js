/** @typedef {'clubs'|'diamonds'|'hearts'|'spades'} Suit */
/** @typedef {{ suit: Suit, rank: number, id: string, faceUp: boolean }} Card */

export const SUITS = /** @type {const} */ (['clubs', 'diamonds', 'hearts', 'spades'])
export const RED_SUITS = new Set(['diamonds', 'hearts'])

export function isRed(suit) {
  return RED_SUITS.has(suit)
}

export function cardId(suit, rank) {
  return `${suit}-${rank}`
}

/** Fresh 52-card deck, all face-down. Ranks 1=A … 13=K. */
export function createDeck() {
  /** @type {Card[]} */
  const deck = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank += 1) {
      deck.push({ suit, rank, id: cardId(suit, rank), faceUp: false })
    }
  }
  return deck
}

/**
 * Fisher–Yates. Pass `random` for deterministic tests.
 * @param {Card[]} cards
 * @param {() => number} [random]
 */
export function shuffle(cards, random = Math.random) {
  const next = cards.slice()
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const tmp = next[i]
    next[i] = next[j]
    next[j] = tmp
  }
  return next
}

export function rankLabel(rank) {
  if (rank === 1) return 'A'
  if (rank === 11) return 'J'
  if (rank === 12) return 'Q'
  if (rank === 13) return 'K'
  return String(rank)
}

export function suitSymbol(suit) {
  if (suit === 'hearts') return '♥'
  if (suit === 'diamonds') return '♦'
  if (suit === 'clubs') return '♣'
  return '♠'
}
