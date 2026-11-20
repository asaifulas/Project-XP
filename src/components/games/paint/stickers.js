/**
 * Paint clipart stickers — placement geometry and white-to-transparent ink for placed pictures.
 * Sticker state lives in centre + size + rotation, in canvas pixels.
 */

/** @typedef {{ x: number, y: number }} Point */
/** @typedef {{ cx: number, cy: number, w: number, h: number, rot: number }} Sticker */

const MIN_SIDE = 24

/**
 * Half the page width, keeping the picture's aspect ratio and never taller than 80% of the page.
 * @param {number} aspect width / height
 * @param {number} canvasW
 * @param {number} canvasH
 */
export function fitStickerSize(aspect, canvasW, canvasH) {
  let w = canvasW / 2
  let h = w / aspect
  const maxH = canvasH * 0.8
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  return { w, h }
}

/**
 * @param {Sticker} s
 * @param {number} lx
 * @param {number} ly local offset from centre, before rotation
 * @returns {Point}
 */
export function localToCanvas(s, lx, ly) {
  const c = Math.cos(s.rot)
  const sn = Math.sin(s.rot)
  return { x: s.cx + lx * c - ly * sn, y: s.cy + lx * sn + ly * c }
}

/** Corner (resize) and rotate handle positions, in canvas pixels. */
export function stickerHandles(s, scale = 1) {
  return {
    corner: localToCanvas(s, s.w / 2, s.h / 2),
    rotate: localToCanvas(s, 0, -s.h / 2 - 26 * scale),
  }
}

/**
 * Which part of the sticker a pointer lands on.
 * @param {Sticker} s
 * @param {Point} p canvas pixels
 * @param {number} scale canvas pixels per screen pixel
 * @returns {'rotate' | 'resize' | 'move' | null}
 */
export function hitTestSticker(s, p, scale = 1) {
  const handles = stickerHandles(s, scale)
  const reach = 22 * scale
  if (Math.hypot(p.x - handles.rotate.x, p.y - handles.rotate.y) <= reach) return 'rotate'
  if (Math.hypot(p.x - handles.corner.x, p.y - handles.corner.y) <= reach) return 'resize'
  const dx = p.x - s.cx
  const dy = p.y - s.cy
  const lx = dx * Math.cos(s.rot) + dy * Math.sin(s.rot)
  const ly = -dx * Math.sin(s.rot) + dy * Math.cos(s.rot)
  if (Math.abs(lx) <= s.w / 2 && Math.abs(ly) <= s.h / 2) return 'move'
  return null
}

/**
 * Rotation that points the rotate handle at the pointer.
 * @param {Sticker} s
 * @param {Point} p
 */
export function rotationToward(s, p) {
  return Math.atan2(p.y - s.cy, p.x - s.cx) + Math.PI / 2
}

/**
 * Scale that makes the corner handle reach the pointer, keeping the aspect ratio.
 * @param {Sticker} start sticker when the drag began
 * @param {Point} p
 */
export function scaleToward(start, p) {
  const corner = localToCanvas(start, start.w / 2, start.h / 2)
  const base = Math.hypot(corner.x - start.cx, corner.y - start.cy) || 1
  const now = Math.hypot(p.x - start.cx, p.y - start.cy)
  const k = now / base
  const minK = MIN_SIDE / Math.min(start.w, start.h)
  return Math.max(minK, k)
}

/**
 * Width / height from an SVG's viewBox, or null when there is none.
 * @param {string | null | undefined} markup
 */
export function viewBoxAspect(markup) {
  const m = /viewBox\s*=\s*["']\s*[-\d.eE]+[\s,]+[-\d.eE]+[\s,]+([\d.eE]+)[\s,]+([\d.eE]+)/.exec(markup ?? '')
  if (!m) return null
  const vw = Number(m[1])
  const vh = Number(m[2])
  if (!vw || !vh) return null
  return vw / vh
}

/**
 * Makes near-white pixels transparent and keeps the ink, so a placed picture
 * doesn't cover what is already on the canvas. Respects existing transparency.
 * Mutates RGBA bytes in place.
 * @param {Uint8ClampedArray} data
 */
export function knockoutWhite(data) {
  for (let i = 0; i < data.length; i += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2])
    const ink = Math.min(255, (255 - min) * 2)
    data[i + 3] = Math.round((data[i + 3] * ink) / 255)
  }
  return data
}

/**
 * @param {string} hex e.g. "#1f6fd1"
 * @returns {[number, number, number]}
 */
export function hexToRgb(hex) {
  const n = Number.parseInt(String(hex).replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Paints every visible pixel in one colour, keeping each pixel's alpha.
 * Mutates RGBA bytes in place.
 * @param {Uint8ClampedArray} data
 * @param {[number, number, number]} rgb
 */
export function tintInk(data, rgb) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgb[0]
    data[i + 1] = rgb[1]
    data[i + 2] = rgb[2]
  }
  return data
}
