import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ToolIcon from './ToolIcon.jsx'

/** @type {Map<string, string>} */
const cache = new Map()

/**
 * Cursor = the tool's icon in the upper right, with a crosshair at the lower left.
 * The crosshair's centre is the hotspot: the point the tool paints.
 * @param {string} id
 * @returns {string} CSS cursor value
 */
export function toolIconCursor(id) {
  const hit = cache.get(id)
  if (hit) return hit
  const icon = renderToStaticMarkup(createElement(ToolIcon, { id, size: 16 })).replace('<svg ', '<svg x="0" y="0" ')
  const placed = id === 'fill' ? `<g transform="translate(30 4) scale(-1 1)">${icon}</g>` : `<g transform="translate(14 4)">${icon}</g>`
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
    '<path d="M8 16V31M1 24H15" stroke="#fff" stroke-width="3"/>' +
    '<path d="M8 16V31M1 24H15" stroke="#000" stroke-width="1"/>' +
    placed +
    '</svg>'
  const value = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 8 24, crosshair`
  cache.set(id, value)
  return value
}
