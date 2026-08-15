import { textStyleFromField } from './fieldStyle.js'

export function resolveFieldValue(row, column) {
  if (!row || column == null) return ''
  const value = row[column]
  return value == null ? '' : String(value)
}

export function filledRows(rows) {
  return (Array.isArray(rows) ? rows : []).filter((row) =>
    Object.values(row ?? {}).some((value) => String(value ?? '').trim() !== ''),
  )
}

export function buildMergeJobs(rows, fields) {
  const list = filledRows(rows)
  const placed = Array.isArray(fields) ? fields : []
  return list.map((row, index) => ({
    index,
    texts: placed.map((field) => ({
      column: field.column,
      x: field.x,
      y: field.y,
      value: resolveFieldValue(row, field.column),
      ...textStyleFromField(field),
    })),
  }))
}

export function canGenerate({ rows, templateDataUrl, fields }) {
  return Boolean(filledRows(rows).length && templateDataUrl && fields?.length)
}
