import { useRef } from 'react'
import { CERTIMAGIC_SHEETS, useCertiMagicStore } from '../../../stores/useCertiMagicStore'
import CertificateSheet from './CertificateSheet'
import MergeSheet from './MergeSheet'
import RecipientsSheet from './RecipientsSheet'

const disabledBtn =
  'cursor-not-allowed select-none opacity-80 grayscale-[0.35] disabled:pointer-events-none disabled:opacity-70'
const toolBtn =
  'inline-flex h-[20px] w-[20px] items-center justify-center text-[9px] font-bold text-zinc-700'
const toolGroup =
  'inline-flex h-[22px] items-stretch overflow-hidden rounded-sm border border-black/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
const toolSep = 'w-px bg-black/20'
const officeBlueStrip = 'bg-[linear-gradient(180deg,#eaf2ff_0%,#cfe0ff_40%,#b4ccfb_100%)]'

export default function CertiMagicApp() {
  const sheet = useCertiMagicStore((s) => s.sheet)
  const setSheet = useCertiMagicStore((s) => s.setSheet)
  const importCsv = useCertiMagicStore((s) => s.importCsv)
  const notice = useCertiMagicStore((s) => s.notice)
  const rows = useCertiMagicStore((s) => s.rows)
  const selectedFieldId = useCertiMagicStore((s) => s.selectedFieldId)
  const fields = useCertiMagicStore((s) => s.fields)
  const csvRef = useRef(null)
  const selected = fields.find((field) => field.id === selectedFieldId)

  const formula =
    sheet === 'Certificate' && selected
      ? `={${selected.column}}`
      : sheet === 'Merge'
        ? `=${rows.length}`
        : `=COUNTA(Recipients)`

  function onCsv(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') importCsv(reader.result)
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#d4d0c8] text-[11px] text-black">
      <div
        className={[
          'flex shrink-0 flex-col border-b border-black/25',
          officeBlueStrip,
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
        ].join(' ')}
      >
        <nav
          className="flex h-[22px] items-center gap-1 border-b border-black/15 px-1.5 text-[11px] leading-none"
          aria-label="CertiMagic menu"
        >
          <button
            type="button"
            className="rounded-sm px-1.5 py-0.5 hover:bg-white/40"
            onClick={() => csvRef.current?.click()}
          >
            File
          </button>
          {['Edit', 'View', 'Insert', 'Format', 'Tools', 'Data', 'Window', 'Help'].map((m) => (
            <button
              key={m}
              type="button"
              disabled
              aria-disabled="true"
              className={`rounded-sm px-1.5 py-0.5 ${disabledBtn}`}
            >
              {m}
            </button>
          ))}
        </nav>

        <div className="flex h-[26px] min-w-0 items-center gap-1 overflow-x-hidden border-b border-black/15 px-1 py-0.5">
          <div className={toolGroup}>
            <button
              type="button"
              className={`${toolBtn} px-1 text-[10px]`}
              title="Import CSV"
              onClick={() => csvRef.current?.click()}
            >
              CSV
            </button>
            <span className={toolSep} />
            {['N', 'O', 'S', 'P'].map((t) => (
              <button
                key={t}
                type="button"
                disabled
                aria-disabled="true"
                className={`${toolBtn} ${disabledBtn} px-0.5`}
                tabIndex={-1}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            ref={csvRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              onCsv(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        <div className="flex h-[28px] items-center gap-1 border-b border-black/25 px-1 py-0.5">
          <input
            className="h-[20px] w-[88px] rounded-sm border border-black/25 bg-white px-1 font-mono text-[11px]"
            value={sheet}
            readOnly
            aria-label="Name box"
          />
          <div className="flex h-[20px] w-[20px] items-center justify-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f8f8f8_0%,#dfdfdf_100%)] text-[10px] text-black/70">
            fx
          </div>
          <input
            className="h-[20px] min-w-0 flex-1 rounded-sm border border-black/25 bg-white px-2 text-[11px]"
            value={formula}
            readOnly
            aria-label="Formula bar"
          />
        </div>
      </div>

      {sheet === 'Recipients' ? <RecipientsSheet /> : null}
      {sheet === 'Certificate' ? <CertificateSheet /> : null}
      {sheet === 'Merge' ? <MergeSheet /> : null}

      <footer className="shrink-0 border-t border-black/20 bg-[#d4d0c8]">
        <div className="flex h-[22px] items-center gap-1 border-b border-black/15 px-1 text-[10px] text-zinc-900">
          <div className="flex h-[18px] max-w-[42%] items-center truncate rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            {notice}
          </div>
          <div className="h-[18px] w-px bg-black/20" aria-hidden />
          <div className="flex min-w-0 flex-1 items-end gap-1">
            {CERTIMAGIC_SHEETS.map((name) => {
              const isActive = sheet === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSheet(name)}
                  className={[
                    'relative h-[18px] px-3 text-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
                    isActive
                      ? 'z-[2] -mb-px border border-black/35 bg-white font-semibold'
                      : 'border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] text-black/75 hover:bg-[linear-gradient(180deg,#ffffff_0%,#efe6c7_100%)]',
                  ].join(' ')}
                  style={{
                    clipPath: 'polygon(8px 0%, calc(100% - 6px) 0%, 100% 100%, 0% 100%)',
                  }}
                >
                  {name}
                </button>
              )
            })}
          </div>
          <div className="flex h-[18px] items-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] px-2 text-[10px] text-black/70">
            100%
          </div>
        </div>
      </footer>
    </div>
  )
}
