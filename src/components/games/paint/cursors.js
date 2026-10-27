/**
 * Tool cursors as SVG data-URIs (hotspot = drawing tip / brush center).
 */

function cursorUrl(svg, hotX, hotY, fallback = 'crosshair') {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotX} ${hotY}, ${fallback}`
}

const PENCIL = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M4 28l2-8 14-14 6 6-14 14z" fill="#f4c27a" stroke="#333" stroke-width="1"/>
  <path d="M20 6l6 6 2-2-6-6z" fill="#222"/>
  <path d="M4 28l2-2 2 2z" fill="#333"/>
</svg>`

const BRUSH = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M14 4h4v14h-4z" fill="#c08040" stroke="#333" stroke-width="1"/>
  <path d="M12 18h8l-1 8h-6z" fill="#333"/>
  <circle cx="16" cy="28" r="3" fill="#222"/>
</svg>`

const AIRBRUSH = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M10 6h6l2 10h-4z" fill="#888" stroke="#333" stroke-width="1"/>
  <path d="M12 16h8l-2 10h-6z" fill="#555" stroke="#333" stroke-width="1"/>
  <circle cx="8" cy="24" r="1.2" fill="#333"/>
  <circle cx="14" cy="27" r="1" fill="#333"/>
  <circle cx="20" cy="24" r="1.4" fill="#333"/>
  <circle cx="17" cy="21" r="0.9" fill="#333"/>
</svg>`

const ERASER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect x="6" y="14" width="18" height="12" rx="2" transform="rotate(-25 15 20)" fill="#f2d84a" stroke="#333" stroke-width="1"/>
  <rect x="8" y="16" width="8" height="10" transform="rotate(-25 12 21)" fill="#ffe566" stroke="#333" stroke-width="0.5"/>
  <path d="M7 22l4 4" stroke="#c9a800" stroke-width="1" transform="rotate(-25 15 20)"/>
</svg>`

const FILL = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M8 10l10-6 8 12-10 8z" fill="#4a90d9" stroke="#222" stroke-width="1"/>
  <path d="M18 6l4 2-2 4z" fill="#ccc" stroke="#222" stroke-width="1"/>
  <path d="M10 24c0 4 4 6 6 2" fill="none" stroke="#222" stroke-width="1.5"/>
</svg>`

const DROPPER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M20 4l8 8-3 1-6-6z" fill="#ddd" stroke="#333" stroke-width="1"/>
  <path d="M18 8l6 6-12 12-6-6z" fill="#888" stroke="#333" stroke-width="1"/>
  <circle cx="8" cy="24" r="3" fill="#e33" stroke="#333" stroke-width="1"/>
</svg>`

const MAGNIFY = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="13" cy="13" r="8" fill="none" stroke="#222" stroke-width="2.5"/>
  <circle cx="13" cy="13" r="6" fill="#cfe8ff" fill-opacity="0.5"/>
  <path d="M19 19l8 8" stroke="#222" stroke-width="3" stroke-linecap="round"/>
  <path d="M13 9v8M9 13h8" stroke="#222" stroke-width="1.5"/>
</svg>`

const HAND = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M11 14V8.5a1.5 1.5 0 0 1 3 0V14M14 13V7a1.5 1.5 0 0 1 3 0v7M17 12.5V8a1.5 1.5 0 0 1 3 0v8M20 13v-2a1.5 1.5 0 0 1 3 0v7.5c0 4-2.5 7-7 7h-1c-3.5 0-6-2-7.5-4.5L6 16.5a1.6 1.6 0 0 1 2.7-1.7L11 18"
    fill="#f4e4c8" stroke="#333" stroke-width="1.2" stroke-linejoin="round"/>
</svg>`

const TEXT = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M6 6h20v4h-8v16h-4V10H6z" fill="#222"/>
  <path d="M8 8h16v2H18v14h-4V10H8z" fill="#eee"/>
</svg>`

const LINE = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M4 28L28 4" stroke="#000" stroke-width="2"/>
  <circle cx="4" cy="28" r="2" fill="#000"/>
</svg>`

const RECT = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect x="6" y="8" width="18" height="14" fill="none" stroke="#000" stroke-width="2"/>
  <circle cx="6" cy="8" r="2" fill="#000"/>
</svg>`

const ELLIPSE = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <ellipse cx="15" cy="15" rx="10" ry="8" fill="none" stroke="#000" stroke-width="2"/>
  <circle cx="15" cy="7" r="2" fill="#000"/>
</svg>`

/** @type {Record<string, string>} */
export const TOOL_CURSORS = {
  pencil: cursorUrl(PENCIL, 4, 28, 'crosshair'),
  brush: cursorUrl(BRUSH, 16, 28, 'crosshair'),
  airbrush: cursorUrl(AIRBRUSH, 16, 28, 'crosshair'),
  eraser: cursorUrl(ERASER, 8, 24, 'cell'),
  fill: cursorUrl(FILL, 8, 24, 'cell'),
  eyedropper: cursorUrl(DROPPER, 8, 24, 'crosshair'),
  magnify: cursorUrl(MAGNIFY, 13, 13, 'zoom-in'),
  hand: cursorUrl(HAND, 16, 16, 'grab'),
  text: cursorUrl(TEXT, 4, 4, 'text'),
  line: cursorUrl(LINE, 4, 28, 'crosshair'),
  rect: cursorUrl(RECT, 6, 8, 'crosshair'),
  ellipse: cursorUrl(ELLIPSE, 15, 7, 'crosshair'),
}

/**
 * Round stamp cursor sized to the brush diameter (CSS px). Hotspot = center.
 * @param {number} diameterCss
 * @param {{ fill?: string, stroke?: string }} [opts]
 */
export function brushSizeCursor(diameterCss, opts = {}) {
  const d = Math.max(4, Math.min(96, Math.round(diameterCss)))
  const pad = 2
  const size = d + pad * 2
  const c = size / 2
  const r = d / 2
  const fill = opts.fill ?? 'rgba(0,0,0,0.12)'
  const stroke = opts.stroke ?? '#000000'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${c}" cy="${c}" r="${Math.max(0.5, r - 0.5)}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
  <circle cx="${c}" cy="${c}" r="0.75" fill="${stroke}"/>
</svg>`
  return cursorUrl(svg, c, c, 'crosshair')
}

/**
 * @param {string} tool
 * @param {{ widthCss?: number, erase?: boolean }} [opts]
 */
export function cursorForTool(tool, opts = {}) {
  if (
    (tool === 'pencil' ||
      tool === 'brush' ||
      tool === 'airbrush' ||
      tool === 'eraser' ||
      tool === 'line') &&
    typeof opts.widthCss === 'number' &&
    opts.widthCss > 0
  ) {
    return brushSizeCursor(opts.widthCss, {
      fill:
        opts.erase || tool === 'eraser'
          ? 'rgba(242,216,74,0.35)'
          : tool === 'airbrush'
            ? 'rgba(0,0,0,0.06)'
            : 'rgba(0,0,0,0.14)',
      stroke: opts.erase || tool === 'eraser' ? '#8a7a10' : '#000',
    })
  }
  return TOOL_CURSORS[tool] ?? 'crosshair'
}
