/** Matches `.xp-taskbar { height: 30px }` — restored frames stay above it. */
export const TASKBAR_H = 30
export const MIN_FRAME_W = 280
export const MIN_FRAME_H = 160
export const DESKTOP_EDGE_PAD = 8

/**
 * Usable desktop box for restored XP windows (viewport minus taskbar).
 * @param {{ innerWidth?: number, innerHeight?: number }} [viewport]
 */
export function desktopBounds(viewport = typeof window !== 'undefined' ? window : { innerWidth: 1440, innerHeight: 900 }) {
  const width = Math.max(MIN_FRAME_W, (viewport.innerWidth ?? 1440) - DESKTOP_EDGE_PAD)
  const height = Math.max(
    MIN_FRAME_H,
    (viewport.innerHeight ?? 900) - TASKBAR_H - DESKTOP_EDGE_PAD,
  )
  return { width, height }
}

/**
 * Resize a restored frame from an edge/corner drag, clamped to the desktop.
 * @param {{ x: number, y: number, w: number, h: number }} frame
 * @param {'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'} edge
 * @param {{ dx: number, dy: number }} delta
 * @param {{ width: number, height: number }} desktop
 */
export function resizeFrame(frame, edge, delta, desktop) {
  let x = frame.x
  let y = frame.y
  let w = frame.w
  let h = frame.h
  const dx = delta.dx
  const dy = delta.dy

  if (edge.includes('e')) w += dx
  if (edge.includes('s')) h += dy
  if (edge.includes('w')) {
    w -= dx
    x += dx
  }
  if (edge.includes('n')) {
    h -= dy
    y += dy
  }

  if (w < MIN_FRAME_W) {
    if (edge.includes('w')) x -= MIN_FRAME_W - w
    w = MIN_FRAME_W
  }
  if (h < MIN_FRAME_H) {
    if (edge.includes('n')) y -= MIN_FRAME_H - h
    h = MIN_FRAME_H
  }

  if (x < 0) {
    w += x
    x = 0
  }
  if (y < 0) {
    h += y
    y = 0
  }

  if (x + w > desktop.width) w = desktop.width - x
  if (y + h > desktop.height) h = desktop.height - y

  w = Math.max(MIN_FRAME_W, Math.min(w, desktop.width))
  h = Math.max(MIN_FRAME_H, Math.min(h, desktop.height))

  if (x + w > desktop.width) x = Math.max(0, desktop.width - w)
  if (y + h > desktop.height) y = Math.max(0, desktop.height - h)

  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(w),
    h: Math.round(h),
  }
}
