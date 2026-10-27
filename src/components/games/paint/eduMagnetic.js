/**
 * Magnetic tracing helpers for Paint Edu mode (kids letter/shape tracing).
 */

/** @typedef {'beginner' | 'medium' | 'expert'} MagneticLevel */
/** @typedef {{ x: number, y: number }} Point */

/** @type {Record<MagneticLevel, { snapRadius: number, pull: number, smooth: number }>} */
export const MAGNETIC_LEVELS = {
  beginner: { snapRadius: 52, pull: 0.95, smooth: 0.55 },
  medium: { snapRadius: 30, pull: 0.72, smooth: 0.35 },
  expert: { snapRadius: 16, pull: 0.42, smooth: 0.18 },
}

/**
 * @param {Point} a
 * @param {Point} b
 */
export function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

/**
 * Closest point on segment AB to P.
 * @param {Point} p
 * @param {Point} a
 * @param {Point} b
 */
export function closestOnSegment(p, a, b) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const len2 = abx * abx + aby * aby
  if (len2 < 1e-8) return { x: a.x, y: a.y, t: 0 }
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2
  t = Math.max(0, Math.min(1, t))
  return { x: a.x + abx * t, y: a.y + aby * t, t }
}

/**
 * Nearest point on a polyline (open or closed).
 * @param {Point} p
 * @param {Point[]} path
 * @param {{ closed?: boolean }} [opts]
 * @returns {{ point: Point, distance: number } | null}
 */
export function nearestOnPath(p, path, opts = {}) {
  if (!path || path.length === 0) return null
  if (path.length === 1) {
    return { point: { x: path[0].x, y: path[0].y }, distance: dist(p, path[0]) }
  }
  let best = /** @type {{ point: Point, distance: number } | null} */ (null)
  const last = path.length - 1
  const segCount = opts.closed ? path.length : last
  for (let i = 0; i < segCount; i += 1) {
    const a = path[i]
    const b = path[(i + 1) % path.length]
    const c = closestOnSegment(p, a, b)
    const d = dist(p, c)
    if (!best || d < best.distance) best = { point: { x: c.x, y: c.y }, distance: d }
  }
  return best
}

/**
 * Snap a freehand sample toward the template path.
 * Outside snapRadius → returns original (no stick).
 * @param {Point} sample
 * @param {Point[]} path
 * @param {MagneticLevel} level
 * @param {{ closed?: boolean, previous?: Point | null }} [opts]
 */
export function magneticSnap(sample, path, level, opts = {}) {
  return magneticSnapToPaths(sample, [path], level, opts)
}

/**
 * Snap against multiple strokes; picks the nearest path within radius.
 * @param {Point} sample
 * @param {Point[][]} paths
 * @param {MagneticLevel} level
 * @param {{ closed?: boolean, previous?: Point | null }} [opts]
 */
export function magneticSnapToPaths(sample, paths, level, opts = {}) {
  const cfg = MAGNETIC_LEVELS[level] ?? MAGNETIC_LEVELS.medium
  /** @type {{ point: Point, distance: number } | null} */
  let best = null
  for (const path of paths) {
    if (!path?.length) continue
    const hit = nearestOnPath(sample, path, { closed: Boolean(opts.closed) })
    if (hit && (!best || hit.distance < best.distance)) best = hit
  }
  if (!best || best.distance > cfg.snapRadius) {
    return { x: sample.x, y: sample.y, snapped: false }
  }
  let x = sample.x + (best.point.x - sample.x) * cfg.pull
  let y = sample.y + (best.point.y - sample.y) * cfg.pull
  if (opts.previous && cfg.smooth > 0) {
    x = opts.previous.x * cfg.smooth + x * (1 - cfg.smooth)
    y = opts.previous.y * cfg.smooth + y * (1 - cfg.smooth)
  }
  return { x, y, snapped: true }
}

/**
 * Densify a polyline so dash/dot rendering and snap feel even.
 * @param {Point[]} path
 * @param {number} spacing
 * @param {{ closed?: boolean }} [opts]
 */
export function resamplePath(path, spacing, opts = {}) {
  if (!path || path.length === 0) return []
  if (path.length === 1) return [{ x: path[0].x, y: path[0].y }]
  const out = [{ x: path[0].x, y: path[0].y }]
  const closed = Boolean(opts.closed)
  const count = closed ? path.length : path.length - 1
  let carry = 0
  for (let i = 0; i < count; i += 1) {
    const a = path[i]
    const b = path[(i + 1) % path.length]
    const segLen = dist(a, b)
    if (segLen < 1e-6) continue
    let pos = spacing - carry
    while (pos <= segLen) {
      const t = pos / segLen
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
      pos += spacing
    }
    carry = (segLen + carry) % spacing
  }
  if (!closed) {
    const last = path[path.length - 1]
    const tip = out[out.length - 1]
    if (!tip || dist(tip, last) > 0.5) out.push({ x: last.x, y: last.y })
  }
  return out
}
