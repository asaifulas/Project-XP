/**
 * Tool cursors as SVG data-URIs (hotspot = drawing tip).
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
  eraser: cursorUrl(ERASER, 8, 24, 'cell'),
  fill: cursorUrl(FILL, 8, 24, 'cell'),
  eyedropper: cursorUrl(DROPPER, 8, 24, 'crosshair'),
  magnify: cursorUrl(MAGNIFY, 13, 13, 'zoom-in'),
  line: cursorUrl(LINE, 4, 28, 'crosshair'),
  rect: cursorUrl(RECT, 6, 8, 'crosshair'),
  ellipse: cursorUrl(ELLIPSE, 15, 7, 'crosshair'),
}

export function cursorForTool(tool) {
  return TOOL_CURSORS[tool] ?? 'crosshair'
}
