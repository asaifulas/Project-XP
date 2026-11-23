import { EDU_DRAWING_CATEGORIES } from './eduClipart.js'
import { EDU_DIGIT_IDS, EDU_LETTER_IDS, EDU_SHAPE_IDS } from './eduTemplates.js'
import { eduJawiMenuItems } from './eduJawi.js'

const isUpper = (id) => id.slice(7) === id.slice(7).toUpperCase()

/**
 * Edu pages that Prev / Next step through, one list per menu group:
 * A–Z, a–z, 0–9, Jawi, shapes, and each drawing category.
 */
export const EDU_SEQUENCES = [
  EDU_LETTER_IDS.filter(isUpper),
  EDU_LETTER_IDS.filter((id) => !isUpper(id)),
  EDU_DIGIT_IDS,
  eduJawiMenuItems().map((item) => item.id),
  EDU_SHAPE_IDS,
  ...EDU_DRAWING_CATEGORIES.map((category) => category.items.map((item) => `drawing:${item.id}`)),
]

/**
 * The pages before and after `id` in its group, wrapping at the ends
 * (Next on Z goes to A). Null when `id` is not in any group.
 * @param {string | null} id
 * @returns {{ prev: string, next: string } | null}
 */
export function eduNeighbours(id) {
  if (!id) return null
  for (const seq of EDU_SEQUENCES) {
    const i = seq.indexOf(id)
    if (i < 0) continue
    if (seq.length < 2) return null
    return { prev: seq[(i - 1 + seq.length) % seq.length], next: seq[(i + 1) % seq.length] }
  }
  return null
}
