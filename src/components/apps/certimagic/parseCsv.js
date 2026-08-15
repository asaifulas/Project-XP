function uniquifyHeaders(headers) {
  const seen = new Map()
  return headers.map((raw, index) => {
    const base = String(raw ?? '').trim() || `Column${index + 1}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base}_${count}`
  })
}

function parseRecords(text) {
  const src = String(text).replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else if (ch !== '\r') {
      field += ch
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

export function parseCsv(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return { columns: [], rows: [] }
  }

  const records = parseRecords(text)
  if (records.length === 0) {
    return { columns: [], rows: [] }
  }

  const columns = uniquifyHeaders(records[0])
  const rows = records
    .slice(1)
    .filter((record) => record.some((cell) => String(cell ?? '').trim() !== ''))
    .map((record) => {
      const next = {}
      columns.forEach((column, index) => {
        next[column] = record[index] != null ? String(record[index]).trim() : ''
      })
      return next
    })

  return { columns, rows }
}
