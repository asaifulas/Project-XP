/**
 * Ball kinds: normal + 3 “broken” specials (random on spawn + mid-play morph).
 */

export const BALL_KINDS = {
  normal: {
    id: 'normal',
    label: 'Standard',
    spawnBonus: 0,
    hitBonus: 0,
    colors: { hi: '#ffffff', mid: '#d8dce4', dark: '#687078', rim: '#404850' },
  },
  kinetic: {
    id: 'kinetic',
    label: 'Kinetic',
    spawnBonus: 75,
    hitBonus: 40,
    /** Seconds before a stored bounce fires. */
    bounceDelay: 0.16,
    colors: { hi: '#e0ffff', mid: '#40d0d8', dark: '#187888', rim: '#0a4850' },
  },
  explosive: {
    id: 'explosive',
    label: 'Explosive',
    spawnBonus: 100,
    hitBonus: 60,
    blastSpeed: 280,
    colors: { hi: '#ffe8c0', mid: '#ff7030', dark: '#a02810', rim: '#601008' },
  },
  magnetic: {
    id: 'magnetic',
    label: 'Magnetic',
    spawnBonus: 90,
    hitBonus: 35,
    range: 72,
    strength: 140,
    colors: { hi: '#f0e0ff', mid: '#b060e8', dark: '#5820a0', rim: '#301060' },
  },
}

/** Mid-play morph cadence — slow enough for experts, not spammy. */
export const BALL_MORPH = {
  /** Earliest seconds after spawn / last morph before next can fire. */
  minInterval: 14,
  /** Latest seconds (uniform random between min and max). */
  maxInterval: 28,
  /** Bonus score when a mid-play morph happens. */
  bonus: 50,
}

const KIND_IDS = Object.keys(BALL_KINDS)

/** Equal chance among all 4 kinds. */
export function pickBallKind(random = Math.random) {
  return KIND_IDS[Math.floor(random() * KIND_IDS.length)]
}

/** Pick a kind different from the current one (for morph). */
export function pickDifferentBallKind(current, random = Math.random) {
  const others = KIND_IDS.filter((id) => id !== current)
  if (others.length === 0) return current
  return others[Math.floor(random() * others.length)]
}

/** Seconds until the next allowed morph. */
export function scheduleNextMorph(random = Math.random) {
  const span = BALL_MORPH.maxInterval - BALL_MORPH.minInterval
  return BALL_MORPH.minInterval + random() * span
}

/**
 * Swap kind mid-play; clears pending kinetic bounce so state doesn't leak.
 * @param {object} ball
 * @param {string} nextKind
 */
export function morphBall(ball, nextKind) {
  const id = BALL_KINDS[nextKind] ? nextKind : 'normal'
  return {
    ...ball,
    kind: id,
    pendingBounce: null,
    bounceDelayLeft: 0,
  }
}

export function getBallKind(kind) {
  return BALL_KINDS[kind] ?? BALL_KINDS.normal
}

/**
 * @param {{ x: number, y: number }} start
 * @param {string} [kind]
 * @param {number} [r]
 */
export function createBall(start, kind = 'normal', r = 7) {
  const id = BALL_KINDS[kind] ? kind : 'normal'
  return {
    x: start.x,
    y: start.y,
    vx: 0,
    vy: 0,
    r,
    inLane: true,
    kind: id,
    pendingBounce: null,
    bounceDelayLeft: 0,
  }
}
