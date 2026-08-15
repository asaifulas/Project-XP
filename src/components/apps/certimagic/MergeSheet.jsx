import { useState } from 'react'
import { useCertiMagicStore } from '../../../stores/useCertiMagicStore'
import { filledRows, canGenerate } from './merge.js'
import { downloadMergedPdf } from './pdf.js'

export default function MergeSheet() {
  const rows = useCertiMagicStore((s) => s.rows)
  const fields = useCertiMagicStore((s) => s.fields)
  const templateDataUrl = useCertiMagicStore((s) => s.templateDataUrl)
  const columns = useCertiMagicStore((s) => s.columns)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const ready = canGenerate({ rows, templateDataUrl, fields })
  const outputRows = filledRows(rows)
  const labelColumn = columns.includes('name') ? 'name' : columns[0]

  async function onGenerate() {
    if (!ready || busy) return
    setBusy(true)
    setError(null)
    try {
      await downloadMergedPdf({ templateDataUrl, rows: outputRows, fields })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate PDFs.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#ece9d8]">
      <div className="flex items-center gap-2 border-b border-black/20 px-3 py-2 text-[11px]">
        <button
          type="button"
          disabled={!ready || busy}
          onClick={onGenerate}
          className="rounded-sm border border-black/30 bg-[linear-gradient(180deg,#f8f8f8_0%,#dfdfdf_100%)] px-3 py-1 font-semibold disabled:opacity-50"
        >
          {busy ? 'Generating…' : 'Generate PDF'}
        </button>
        <span className="text-black/75">
          {outputRows.length} certificate{outputRows.length === 1 ? '' : 's'} · {fields.length} field
          {fields.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3 text-[12px]">
        {!templateDataUrl ? <p>Upload a certificate on the Certificate sheet.</p> : null}
        {templateDataUrl && fields.length === 0 ? (
          <p>Drag at least one column onto the certificate.</p>
        ) : null}
        {outputRows.length === 0 ? <p>Add recipients on the Recipients sheet.</p> : null}
        {error ? <p className="text-red-800">{error}</p> : null}
        {ready ? (
          <div className="border border-black/25 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="border-b border-black/20 bg-[#cfe0ff] px-2 py-1 font-semibold">Output preview</div>
            <ol className="max-h-[50vh] overflow-auto py-1">
              {outputRows.map((row, index) => (
                <li key={`${index}-${row[labelColumn] ?? ''}`} className="border-b border-black/10 px-2 py-1">
                  {index + 1}. {row[labelColumn] || `Row ${index + 1}`}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  )
}
