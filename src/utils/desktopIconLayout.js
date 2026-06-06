import {
  XP_DESKTOP_ICON_CELL_HEIGHT_PX,
  XP_DESKTOP_ICON_CELL_WIDTH_PX,
} from '../constants/xpDesktop'

export const XP_DESKTOP_ICON_GAP_X_PX = 12

/**
 * Column-major default layout (fill down, then next column).
 *
 * @param {number} count
 * @param {{ width: number, height: number }} bounds
 * @returns {Array<{ x: number, y: number }>}
 */
export function computeDefaultDesktopIconPositions(count, bounds) {
  const cellW = XP_DESKTOP_ICON_CELL_WIDTH_PX
  const cellH = XP_DESKTOP_ICON_CELL_HEIGHT_PX
  const gapX = XP_DESKTOP_ICON_GAP_X_PX
  const rowsPerCol = Math.max(1, Math.floor(bounds.height / cellH))

  return Array.from({ length: count }, (_, index) => {
    const col = Math.floor(index / rowsPerCol)
    const row = index % rowsPerCol
    return {
      x: col * (cellW + gapX),
      y: row * cellH,
    }
  })
}

/**
 * @param {number} x
 * @param {number} y
 * @param {{ width: number, height: number }} bounds
 */
export function snapDesktopIconPosition(x, y, bounds) {
  const cellW = XP_DESKTOP_ICON_CELL_WIDTH_PX
  const cellH = XP_DESKTOP_ICON_CELL_HEIGHT_PX
  const gapX = XP_DESKTOP_ICON_GAP_X_PX

  const col = Math.round(x / (cellW + gapX))
  const row = Math.round(y / cellH)

  const snappedX = col * (cellW + gapX)
  const snappedY = row * cellH

  const maxX = Math.max(0, bounds.width - cellW)
  const maxY = Math.max(0, bounds.height - cellH)

  return {
    x: Math.min(maxX, Math.max(0, snappedX)),
    y: Math.min(maxY, Math.max(0, snappedY)),
  }
}
