/**
 * Pure Minesweeper board logic (immutable).
 * Regional mine hits: blast a 3×3 neighborhood, deduct score, spend a life — game continues until lives hit 0.
 *
 * @typedef {{
 *   mine: boolean,
 *   revealed: boolean,
 *   flagged: boolean,
 *   adjacent: number,
 *   detonated?: boolean,
 * }} Cell
 * @typedef {{
 *   width: number,
 *   height: number,
 *   mineCount: number,
 *   cells: Cell[],
 *   status: 'ready' | 'playing' | 'won' | 'lost',
 *   minesPlaced: boolean,
 *   flagCount: number,
 *   revealedCount: number,
 *   difficulty: string,
 *   score: number,
 *   lives: number,
 *   lastSweep: number,
 *   lastPenalty: number,
 * }} Game
 */

export const DIFFICULTIES = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
}

export const START_LIVES = 3
/** Points per newly revealed safe cell (regional clear). */
export const POINTS_PER_CELL = 10
/** Base score lost when a mine detonates (plus per-cell blast penalty). */
export const MINE_HIT_PENALTY = 50
export const BLAST_CELL_PENALTY = 5

/**
 * @param {number} r
 * @param {number} c
 * @param {number} height
 * @param {number} width
 * @returns {[number, number][]}
 */
export function adjacentCoords(r, c, height, width) {
  /** @type {[number, number][]} */
  const out = []
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < height && nc >= 0 && nc < width) out.push([nr, nc])
    }
  }
  return out
}

function emptyCell() {
  return { mine: false, revealed: false, flagged: false, adjacent: 0, detonated: false }
}

function cloneCells(cells) {
  return cells.map((c) => ({ ...c }))
}

function idx(game, r, c) {
  return r * game.width + c
}

function inBounds(game, r, c) {
  return r >= 0 && r < game.height && c >= 0 && c < game.width
}

function detonatedCount(cells) {
  return cells.reduce((n, c) => n + (c.detonated ? 1 : 0), 0)
}

/**
 * @param {{
 *   difficulty?: keyof typeof DIFFICULTIES,
 *   width?: number,
 *   height?: number,
 *   mines?: number,
 *   lives?: number,
 * }} [opts]
 * @returns {Game}
 */
export function createGame(opts = {}) {
  const preset =
    opts.difficulty && DIFFICULTIES[opts.difficulty]
      ? DIFFICULTIES[opts.difficulty]
      : null
  const width = opts.width ?? preset?.width ?? 9
  const height = opts.height ?? preset?.height ?? 9
  const mineCount = opts.mines ?? preset?.mines ?? 10
  const difficulty = opts.difficulty ?? 'custom'
  const cells = Array.from({ length: width * height }, emptyCell)
  return {
    width,
    height,
    mineCount,
    cells,
    status: 'ready',
    minesPlaced: false,
    flagCount: 0,
    revealedCount: 0,
    difficulty,
    score: 0,
    lives: opts.lives ?? START_LIVES,
    lastSweep: 0,
    lastPenalty: 0,
  }
}

function recomputeAdjacent(game) {
  const cells = cloneCells(game.cells)
  for (let r = 0; r < game.height; r += 1) {
    for (let c = 0; c < game.width; c += 1) {
      const i = idx(game, r, c)
      if (cells[i].mine) {
        cells[i] = { ...cells[i], adjacent: 0 }
        continue
      }
      let n = 0
      for (const [nr, nc] of adjacentCoords(r, c, game.height, game.width)) {
        if (cells[idx(game, nr, nc)].mine) n += 1
      }
      cells[i] = { ...cells[i], adjacent: n }
    }
  }
  return { ...game, cells }
}

/**
 * Place mines avoiding protected keys `"r,c"`. Uses Fisher–Yates on candidates.
 * @param {Game} game
 * @param {Set<string>} protectedSet
 * @param {() => number} [random]
 */
export function placeMines(game, protectedSet, random = Math.random) {
  const candidates = []
  for (let r = 0; r < game.height; r += 1) {
    for (let c = 0; c < game.width; c += 1) {
      if (!protectedSet.has(`${r},${c}`)) candidates.push([r, c])
    }
  }
  const minesToPlace = Math.min(game.mineCount, candidates.length)
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const tmp = candidates[i]
    candidates[i] = candidates[j]
    candidates[j] = tmp
  }
  const cells = cloneCells(game.cells)
  for (let i = 0; i < minesToPlace; i += 1) {
    const [r, c] = candidates[i]
    cells[idx(game, r, c)] = { ...cells[idx(game, r, c)], mine: true }
  }
  return recomputeAdjacent({
    ...game,
    cells,
    minesPlaced: true,
  })
}

function protectedAround(r, c, height, width) {
  const set = new Set([`${r},${c}`])
  for (const [nr, nc] of adjacentCoords(r, c, height, width)) {
    set.add(`${nr},${nc}`)
  }
  return set
}

function revealFlood(game, startR, startC) {
  const cells = cloneCells(game.cells)
  let revealedCount = game.revealedCount
  let newly = 0
  /** @type {[number, number][]} */
  const stack = [[startR, startC]]
  const seen = new Set()

  while (stack.length) {
    const [r, c] = stack.pop()
    const key = `${r},${c}`
    if (seen.has(key)) continue
    seen.add(key)
    if (!inBounds(game, r, c)) continue
    const i = idx(game, r, c)
    const cell = cells[i]
    if (cell.revealed || cell.flagged || cell.mine) continue
    cells[i] = { ...cell, revealed: true }
    revealedCount += 1
    newly += 1
    if (cell.adjacent === 0) {
      for (const [nr, nc] of adjacentCoords(r, c, game.height, game.width)) {
        stack.push([nr, nc])
      }
    }
  }

  return { cells, revealedCount, newly }
}

function checkWin(game, cells, revealedCount) {
  const safe = game.width * game.height - game.mineCount
  if (revealedCount >= safe) {
    return { ...game, cells, revealedCount, status: /** @type {const} */ ('won') }
  }
  return { ...game, cells, revealedCount, status: game.status === 'ready' ? 'playing' : game.status }
}

/**
 * Detonate one mine: clear a 3×3 region (hit mine + neighbors).
 * Neighboring undetonated mines stay armed but are left hidden; safe neighbors open.
 * Score loses base penalty + per newly opened blast cell.
 */
function regionalMineHit(game, r, c) {
  const cells = cloneCells(game.cells)
  const hit = idx(game, r, c)
  let revealedCount = game.revealedCount
  let blastOpened = 0
  let flagDelta = 0

  const markOpen = (i, patch) => {
    const prev = cells[i]
    if (prev.flagged) flagDelta -= 1
    const wasHiddenSafe = !prev.revealed && !prev.mine
    cells[i] = {
      ...prev,
      ...patch,
      revealed: true,
      flagged: false,
    }
    if (wasHiddenSafe) {
      revealedCount += 1
      blastOpened += 1
    }
  }

  markOpen(hit, { detonated: true })

  for (const [nr, nc] of adjacentCoords(r, c, game.height, game.width)) {
    const i = idx(game, nr, nc)
    const cell = cells[i]
    if (cell.mine && !cell.detonated) {
      // Leave other mines armed — regional hit only clears this mine's pad
      continue
    }
    if (!cell.revealed) markOpen(i, {})
  }

  const penalty = MINE_HIT_PENALTY + blastOpened * BLAST_CELL_PENALTY
  const lives = game.lives - 1
  const score = Math.max(0, game.score - penalty)
  const flagCount = Math.max(0, game.flagCount + flagDelta)

  if (lives <= 0) {
    for (let k = 0; k < cells.length; k += 1) {
      if (cells[k].mine) cells[k] = { ...cells[k], revealed: true }
    }
    return {
      ...game,
      cells,
      revealedCount,
      flagCount,
      lives: 0,
      score,
      lastSweep: 0,
      lastPenalty: penalty,
      status: /** @type {const} */ ('lost'),
    }
  }

  const after = checkWin(
    {
      ...game,
      flagCount,
      lives,
      score,
      lastSweep: 0,
      lastPenalty: penalty,
      status: 'playing',
    },
    cells,
    revealedCount,
  )
  return after
}

/**
 * @param {Game} game
 * @param {number} r
 * @param {number} c
 * @param {() => number} [random]
 * @returns {{ ok: boolean, game: Game }}
 */
export function revealCell(game, r, c, random = Math.random) {
  if (game.status === 'won' || game.status === 'lost') return { ok: false, game }
  if (!inBounds(game, r, c)) return { ok: false, game }
  const i = idx(game, r, c)
  const cell = game.cells[i]
  if (cell.revealed || cell.flagged) return { ok: false, game }

  let next = game
  if (!next.minesPlaced) {
    next = placeMines(next, protectedAround(r, c, next.height, next.width), random)
    next = { ...next, status: 'playing' }
  }

  const target = next.cells[idx(next, r, c)]
  if (target.mine) {
    return { ok: true, game: regionalMineHit(next, r, c) }
  }

  const flooded = revealFlood(next, r, c)
  const gained = flooded.newly * POINTS_PER_CELL
  const scored = {
    ...next,
    score: next.score + gained,
    lastSweep: flooded.newly,
    lastPenalty: 0,
  }
  return { ok: true, game: checkWin(scored, flooded.cells, flooded.revealedCount) }
}

/**
 * @param {Game} game
 * @param {number} r
 * @param {number} c
 * @returns {{ ok: boolean, game: Game }}
 */
export function flagCell(game, r, c) {
  if (game.status === 'won' || game.status === 'lost') return { ok: false, game }
  if (!inBounds(game, r, c)) return { ok: false, game }
  const i = idx(game, r, c)
  const cell = game.cells[i]
  if (cell.revealed) return { ok: false, game }
  const cells = cloneCells(game.cells)
  const flagged = !cell.flagged
  cells[i] = { ...cell, flagged }
  return {
    ok: true,
    game: {
      ...game,
      cells,
      flagCount: game.flagCount + (flagged ? 1 : -1),
      status: game.status === 'ready' ? 'playing' : game.status,
      lastSweep: 0,
      lastPenalty: 0,
    },
  }
}

/**
 * Chord: if revealed number and adjacent flags == adjacent, reveal other neighbors.
 * @param {Game} game
 * @param {number} r
 * @param {number} c
 * @param {() => number} [random]
 */
export function chord(game, r, c, random = Math.random) {
  if (game.status === 'won' || game.status === 'lost') return { ok: false, game }
  if (!inBounds(game, r, c)) return { ok: false, game }
  const cell = game.cells[idx(game, r, c)]
  if (!cell.revealed || cell.adjacent === 0) return { ok: false, game }

  let flags = 0
  const neighbors = adjacentCoords(r, c, game.height, game.width)
  for (const [nr, nc] of neighbors) {
    if (game.cells[idx(game, nr, nc)].flagged) flags += 1
  }
  if (flags !== cell.adjacent) return { ok: false, game }

  let next = game
  let totalSweep = 0
  let totalPenalty = 0
  for (const [nr, nc] of neighbors) {
    const n = next.cells[idx(next, nr, nc)]
    if (n.revealed || n.flagged) continue
    const result = revealCell(next, nr, nc, random)
    next = result.game
    totalSweep += next.lastSweep
    totalPenalty += next.lastPenalty
    if (next.status === 'lost' || next.status === 'won') break
  }
  return {
    ok: true,
    game: { ...next, lastSweep: totalSweep, lastPenalty: totalPenalty },
  }
}

export function isWon(game) {
  return game.status === 'won'
}

export function isLost(game) {
  return game.status === 'lost'
}

/** Mines still armed (not flagged estimate — for LED: total − flags − detonated). */
export function minesRemaining(game) {
  return game.mineCount - game.flagCount - detonatedCount(game.cells)
}
