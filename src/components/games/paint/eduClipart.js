/**
 * Paint Edu clipart — CC0 Openclipart SVGs.
 * Visual guide = the SVG picture; magnetic uses a few simplified outline strokes
 * (raw path dumps are too dense / include white page frames).
 */

import manifest from '../../../assets/paint/clipart/manifest.json'
import {
  fitStrokesToBox,
  simplifyClipartStrokes,
  svgMarkupToPolylines,
} from './svgToPolylines.js'

/** @typedef {{ x: number, y: number }} Point */
/** @typedef {{ id: string, label: string }} ClipartItem */
/** @typedef {{ id: string, label: string, items: ClipartItem[] }} ClipartCategory */

const svgModules = import.meta.glob('../../../assets/paint/clipart/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** @type {Record<string, string>} */
const SVG_BY_ID = {}
for (const [filePath, raw] of Object.entries(svgModules)) {
  const base = filePath.split('/').pop()?.replace(/\.svg$/i, '')
  if (base && typeof raw === 'string') SVG_BY_ID[base] = raw
}

const CATEGORY_LABELS = {
  animals: 'Animals',
  transportation: 'Transportation',
  plants: 'Plants',
  buildings: 'Buildings',
  food: 'Food',
  nature: 'Nature',
  objects: 'Objects',
}

/** Glyph box centered on A4 (matches letter templates). */
export function clipartBox() {
  return { x: 90, y: 160, w: 595 - 180, h: 842 - 360 }
}

/**
 * @type {ClipartCategory[]}
 */
export const EDU_CLIPART_CATEGORIES = (() => {
  /** @type {Record<string, ClipartItem[]>} */
  const byCat = {}
  for (const item of manifest.items ?? []) {
    if (!SVG_BY_ID[item.id]) continue
    const cat = item.category || 'objects'
    if (!byCat[cat]) byCat[cat] = []
    byCat[cat].push({ id: item.id, label: item.label })
  }
  return Object.keys(CATEGORY_LABELS)
    .filter((id) => byCat[id]?.length)
    .map((id) => ({
      id,
      label: CATEGORY_LABELS[id],
      items: byCat[id],
    }))
})()

/** @returns {string[]} */
export function listEduClipartIds() {
  /** @type {string[]} */
  const ids = []
  for (const cat of EDU_CLIPART_CATEGORIES) {
    for (const item of cat.items) ids.push(`clipart:${item.id}`)
  }
  return ids
}

/**
 * @param {string} slug
 * @returns {string | null}
 */
export function getClipartSvg(slug) {
  return SVG_BY_ID[slug] ?? null
}

/** @type {Record<string, Point[][]>} */
const pathCache = {}

/**
 * Simplified outline strokes for magnetic snap (not the full SVG dump).
 * @param {string} slug
 * @returns {Point[][]}
 */
export function getClipartPaths(slug) {
  if (pathCache[slug]) return pathCache[slug]
  const svg = SVG_BY_ID[slug]
  if (!svg) return []
  const raw = svgMarkupToPolylines(svg, { skipRects: true, skipWhiteFills: true })
  if (!raw.length) return []
  const simplified = simplifyClipartStrokes(raw)
  if (!simplified.length) {
    // Fallback: keep a few longest raw strokes
    const fitted = fitStrokesToBox(simplifyClipartStrokes(raw, { maxStrokes: 8 }), clipartBox())
    pathCache[slug] = fitted
    return fitted
  }
  const fitted = fitStrokesToBox(simplified, clipartBox())
  pathCache[slug] = fitted
  return fitted
}

/**
 * @param {string} slug
 */
export function getClipartLabel(slug) {
  for (const cat of EDU_CLIPART_CATEGORIES) {
    const hit = cat.items.find((item) => item.id === slug)
    if (hit) return hit.label
  }
  return slug
}

/**
 * Posterize soft SVG raster pixels so interiors are pure white and ink is solid grey.
 * Stops flood-fill from leaving a crunchy white halo in the anti-aliased fringe.
 * @param {Uint8ClampedArray | Uint8Array} data
 * @param {{ whiteCutoff?: number, outlineRgb?: [number, number, number] }} [opts]
 */
export function hardenGuidePixels(data, opts = {}) {
  const whiteCutoff = opts.whiteCutoff ?? 220
  const [or, og, ob] = opts.outlineRgb ?? [90, 90, 90]
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 8) {
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = 255
      continue
    }
    const ar = a / 255
    const r = Math.round(data[i] * ar + 255 * (1 - ar))
    const g = Math.round(data[i + 1] * ar + 255 * (1 - ar))
    const b = Math.round(data[i + 2] * ar + 255 * (1 - ar))
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    if (lum >= whiteCutoff) {
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = 255
    } else {
      data[i] = or
      data[i + 1] = og
      data[i + 2] = ob
      data[i + 3] = 255
    }
  }
}

/**
 * Draw the SVG picture as a crisp coloring-book guide (no soft AA halo).
 * @param {CanvasRenderingContext2D} ctx
 * @param {CanvasImageSource} image
 * @param {{ x: number, y: number, w: number, h: number }} box
 * @param {number} [_alpha] unused — kept for call-site compat; guides are hardened opaque
 */
export function drawClipartImage(ctx, image, box, _alpha = 0.45) {
  const iw = /** @type {any} */ (image).naturalWidth || /** @type {any} */ (image).width || 1
  const ih = /** @type {any} */ (image).naturalHeight || /** @type {any} */ (image).height || 1
  const scale = Math.min(box.w / iw, box.h / ih)
  const tw = Math.max(1, Math.round(iw * scale))
  const th = Math.max(1, Math.round(ih * scale))
  const dx = Math.round(box.x + (box.w - tw) / 2)
  const dy = Math.round(box.y + (box.h - th) / 2)

  const off = typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (!off) return
  off.width = tw
  off.height = th
  const octx = off.getContext('2d', { willReadFrequently: true })
  if (!octx) return
  octx.imageSmoothingEnabled = true
  octx.drawImage(image, 0, 0, tw, th)
  const pixels = octx.getImageData(0, 0, tw, th)
  hardenGuidePixels(pixels.data)
  octx.putImageData(pixels, 0, 0)

  ctx.save()
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(off, dx, dy)
  ctx.restore()
}

/**
 * Load SVG markup as an HTMLImageElement.
 * @param {string} svgMarkup
 * @returns {Promise<HTMLImageElement>}
 */
export function loadSvgImage(svgMarkup) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG image failed to load'))
    }
    img.src = url
  })
}
