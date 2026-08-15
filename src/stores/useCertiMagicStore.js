import { create } from 'zustand'
import { parseCsv } from '../components/apps/certimagic/parseCsv.js'
import { colLetter, GRID_COLS, GRID_ROWS } from '../components/apps/certimagic/excelGrid.js'
import {
  clamp01,
  DEFAULT_FIELD_STYLE,
  nudgePosition,
  textStyleFromField,
} from '../components/apps/certimagic/fieldStyle.js'

export const CERTIMAGIC_SHEETS = ['Recipients', 'Certificate', 'Merge']
export const MAX_CERTIMAGIC_ROWS = GRID_ROWS

const SAMPLE_COLUMNS = ['no', 'name', 'ic_no']
const SAMPLE_ROWS = [
  { no: '1', name: 'Ahmad Saifullah', ic_no: '900101-14-1234' },
  { no: '2', name: 'Siti Aminah', ic_no: '910202-10-5678' },
  { no: '3', name: 'Lim Wei Ming', ic_no: '880315-10-3344' },
]

let fieldSeq = 0

function nextFieldId() {
  fieldSeq += 1
  return `field-${fieldSeq}`
}

function emptyRow(columns) {
  return Object.fromEntries(columns.map((column) => [column, '']))
}

export function uniqueColumnName(raw, columns, index) {
  const base = String(raw ?? '').trim() || `Column${index + 1}`
  const taken = new Set(columns.filter((_, i) => i !== index))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}_${n}`)) n += 1
  return `${base}_${n}`
}

function remapRow(row, from, to) {
  const next = {}
  Object.keys(row).forEach((key) => {
    next[key === from ? to : key] = row[key]
  })
  return next
}

function ensureColumns(columns, count) {
  const target = Math.min(Math.max(count, 0), GRID_COLS)
  const next = [...columns]
  while (next.length < target) {
    const index = next.length
    next.push(uniqueColumnName(colLetter(index), next, index))
  }
  return next
}

function withColumns(rows, columns) {
  return rows.map((row) => {
    const next = { ...row }
    columns.forEach((column) => {
      if (!(column in next)) next[column] = ''
    })
    return next
  })
}

function ensureRows(rows, columns, count) {
  const target = Math.min(Math.max(count, 0), GRID_ROWS)
  const next = withColumns(rows, columns)
  while (next.length < target) {
    next.push(emptyRow(columns))
  }
  return next
}

function createInitialState() {
  return {
    sheet: 'Recipients',
    columns: SAMPLE_COLUMNS,
    rows: SAMPLE_ROWS.map((row) => ({ ...row })),
    templateDataUrl: null,
    templateName: '',
    fields: [],
    selectedFieldId: null,
    notice: 'Import a CSV or edit the sample list, then place fields on Certificate.',
  }
}

export const useCertiMagicStore = create((set, get) => ({
  ...createInitialState(),

  reset: () => set(createInitialState()),

  setSheet: (sheet) => {
    if (!CERTIMAGIC_SHEETS.includes(sheet)) return
    set({ sheet })
  },

  importCsv: (text) => {
    const parsed = parseCsv(text)
    const rows = parsed.rows.slice(0, MAX_CERTIMAGIC_ROWS)
    set({
      columns: parsed.columns,
      rows,
      fields: [],
      selectedFieldId: null,
      notice:
        parsed.rows.length > MAX_CERTIMAGIC_ROWS
          ? `Imported first ${MAX_CERTIMAGIC_ROWS} rows.`
          : `Imported ${rows.length} recipient${rows.length === 1 ? '' : 's'}.`,
    })
  },

  setCell: (rowIndex, column, value) => {
    const colIndex = get().columns.indexOf(column)
    if (colIndex === -1) return
    get().setCellAt(rowIndex, colIndex, value)
  },

  setCellAt: (rowIndex, colIndex, value) => {
    if (rowIndex < 0 || colIndex < 0 || rowIndex >= GRID_ROWS || colIndex >= GRID_COLS) return
    const { columns, rows } = get()
    const nextColumns = ensureColumns(columns, colIndex + 1)
    const nextRows = ensureRows(rows, nextColumns, rowIndex + 1)
    const column = nextColumns[colIndex]
    nextRows[rowIndex] = { ...nextRows[rowIndex], [column]: value }
    set({ columns: nextColumns, rows: nextRows })
  },

  addRow: () =>
    set((state) => ({
      rows: [...state.rows.map((row) => ({ ...row })), emptyRow(state.columns)],
    })),

  renameColumn: (index, nextName) => {
    const { columns, rows, fields } = get()
    if (index < 0 || index >= GRID_COLS) return
    const nextColumns = ensureColumns(columns, index + 1)
    const from = nextColumns[index]
    const to = uniqueColumnName(nextName, nextColumns, index)
    const renamed = nextColumns.map((column, i) => (i === index ? to : column))
    const nextRows = withColumns(
      from === to ? rows : rows.map((row) => remapRow(row, from, to)),
      renamed,
    )
    set({
      columns: renamed,
      rows: nextRows,
      fields:
        from === to
          ? fields
          : fields.map((field) => (field.column === from ? { ...field, column: to } : field)),
    })
  },

  setTemplate: (dataUrl, name) =>
    set({
      templateDataUrl: dataUrl,
      templateName: name ?? 'certificate',
      notice: 'Drop columns from the sidebar onto the certificate.',
    }),

  addField: ({ column, x, y, ...rest }) => {
    const id = nextFieldId()
    const style = textStyleFromField({ ...DEFAULT_FIELD_STYLE, ...rest })
    set((state) => ({
      fields: [...state.fields, { id, column, x, y, ...style }],
      selectedFieldId: id,
    }))
    return id
  },

  moveField: (id, x, y) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === id ? { ...field, x: clamp01(x), y: clamp01(y) } : field,
      ),
    })),

  nudgeField: (id, dx, dy) =>
    set((state) => ({
      fields: state.fields.map((field) => {
        if (field.id !== id) return field
        const next = nudgePosition(field.x, field.y, dx, dy)
        return { ...field, ...next }
      }),
    })),

  setFieldFontSize: (id, fontSize) => get().updateFieldStyle(id, { fontSize }),

  updateFieldStyle: (id, patch) =>
    set((state) => ({
      fields: state.fields.map((field) => {
        if (field.id !== id || !patch) return field
        const next = { ...field, ...patch }
        if ('x' in patch) next.x = clamp01(patch.x)
        if ('y' in patch) next.y = clamp01(patch.y)
        return { ...next, ...textStyleFromField(next), x: next.x, y: next.y, id: field.id, column: field.column }
      }),
    })),

  removeField: (id) =>
    set((state) => ({
      fields: state.fields.filter((field) => field.id !== id),
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
    })),

  selectField: (id) => set({ selectedFieldId: id }),
}))
