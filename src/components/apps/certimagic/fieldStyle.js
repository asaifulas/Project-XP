export const REFERENCE_WIDTH = 800

export const DEFAULT_FIELD_STYLE = {
  fontSize: 14,
  letterSpacing: 0,
  bold: false,
  italic: false,
  color: '#000000',
  textAlign: 'left',
  rotate: 0,
  fontFamily: 'Arial',
}

export const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Palatino Linotype',
  'Trebuchet MS',
  'Verdana',
  'Tahoma',
  'Courier New',
  'Comic Sans MS',
  'Impact',
]

export const NUDGE_STEP = 0.001
export const NUDGE_STEP_FAST = 0.01

export const PRESET_COLORS = ['#000000', '#FF0000', '#0A09FF', '#FFA500', '#800080', '#14e136']

export function clamp01(n) {
  const value = Number(n)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

export function nudgePosition(x, y, dx, dy) {
  return { x: clamp01(x + dx), y: clamp01(y + dy) }
}

export function textStyleFromField(field = {}) {
  return {
    fontSize: Number(field.fontSize) || DEFAULT_FIELD_STYLE.fontSize,
    letterSpacing: Number(field.letterSpacing) || 0,
    bold: Boolean(field.bold),
    italic: Boolean(field.italic),
    color: field.color || DEFAULT_FIELD_STYLE.color,
    textAlign: field.textAlign === 'center' || field.textAlign === 'right' ? field.textAlign : 'left',
    rotate: Number(field.rotate) || 0,
    fontFamily: FONT_FAMILIES.includes(field.fontFamily) ? field.fontFamily : DEFAULT_FIELD_STYLE.fontFamily,
  }
}

export function scaleForWidth(width) {
  const w = Number(width)
  if (!Number.isFinite(w) || w <= 0) return 1
  return w / REFERENCE_WIDTH
}
