import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Microsoft Word 2003–style document workspace: grey canvas, centered A4 sheet(s),
 * optional task pane, rulers, toolbars, and status bar.
 *
 * Children should be one or more `WordA4Page` blocks (or a single flow wrapped by the host).
 * Zoom is capped at `DOC_ZOOM_MAX` but shrinks so a full **210mm** page width always fits
 * the document viewport (no horizontal clipping).
 */
const DOC_ZOOM_MAX = 1.38

export default function WordOfficeChrome({ children }) {
  const docViewportRef = useRef(null)
  const pageWidthMeasureRef = useRef(null)
  const [docZoom, setDocZoom] = useState(DOC_ZOOM_MAX)

  useLayoutEffect(() => {
    const viewport = docViewportRef.current
    const measure = pageWidthMeasureRef.current
    if (!viewport || !measure) return

    const update = () => {
      const pageW = measure.offsetWidth
      if (!pageW) return
      const padX =
        Number.parseFloat(getComputedStyle(viewport).paddingLeft || '0') +
        Number.parseFloat(getComputedStyle(viewport).paddingRight || '0')
      const avail = Math.max(0, viewport.clientWidth - padX)
      const fit = avail / pageW
      const next = Math.min(DOC_ZOOM_MAX, Math.max(0.42, fit))
      setDocZoom(next)
    }

    update()
    const ro = new ResizeObserver(() => update())
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [])
  const disabledBtn =
    'cursor-not-allowed select-none opacity-80 grayscale-[0.35] disabled:pointer-events-none disabled:opacity-70'
  const toolBtn = 'inline-flex h-[20px] w-[20px] items-center justify-center text-[9px] font-bold text-zinc-700'
  const toolGroup =
    'inline-flex h-[22px] items-stretch overflow-hidden rounded-sm border border-black/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
  const toolSep = 'w-px bg-black/20'

  const rulerBlue = 'bg-[#b7c8e6]'
  const rulerFace =
    'bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_55%,#efefef_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.08)]'
  const officeBlueStrip =
    'bg-[linear-gradient(180deg,#eaf2ff_0%,#cfe0ff_40%,#b4ccfb_100%)]'

  const rulerTopHeight = 18
  const rulerLeftWidth = 18
  const rulerInnerPad = 2
  const rulerUnitPx = 44 // closer to your screenshot spacing
  const rulerMarks = Array.from({ length: 16 }, (_, i) => i + 1) // 1..16

  const zoomPercent = Math.round(docZoom * 100)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#d4d0c8] text-[11px] text-black">
      <div
        className={[
          'flex shrink-0 flex-col border-b border-black/25',
          officeBlueStrip,
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
        ].join(' ')}
      >
        <nav
          className="flex h-[22px] items-center gap-1 border-b border-black/15 px-1.5 text-[11px] leading-none"
          aria-label="Word menu"
        >
          {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Table', 'Window', 'Help'].map(
            (m) => (
              <button
                key={m}
                type="button"
                disabled
                aria-disabled="true"
                className={`rounded-sm px-1.5 py-0.5 ${disabledBtn}`}
              >
                {m}
              </button>
            ),
          )}
        </nav>
        <div
          className="flex h-[26px] min-w-0 items-center gap-1 overflow-x-hidden border-b border-black/15 px-1 py-0.5"
          aria-hidden
        >
          <div className={toolGroup}>
            {['N', 'O', 'S', 'P', '🖨', '🔍', '↩', '↪'].map((t, i) => (
              <span key={`${t}-${i}`} className="flex items-center">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={`${toolBtn} ${disabledBtn} px-0.5`}
                  tabIndex={-1}
                >
                  {t}
                </button>
                {i === 3 || i === 5 ? <span className={toolSep} /> : null}
              </span>
            ))}
          </div>

          <div className={toolGroup}>
            {['X', 'C', 'V', 'A'].map((t, i) => (
              <span key={`${t}-${i}-clip`} className="flex items-center">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={`${toolBtn} ${disabledBtn} px-0.5`}
                  tabIndex={-1}
                >
                  {t}
                </button>
                {i !== 3 ? <span className={toolSep} /> : null}
              </span>
            ))}
          </div>

          <div className={toolGroup}>
            {['B', 'I', 'U', 'L', 'C', 'R', '•', '1.', '⇤', '⇥'].map((t, i) => (
              <span key={`${t}-${i}-fmt`} className="flex items-center">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={`${toolBtn} ${disabledBtn} px-0.5`}
                  tabIndex={-1}
                >
                  {t}
                </button>
                {i === 2 || i === 5 ? <span className={toolSep} /> : i !== 9 ? <span className={toolSep} /> : null}
              </span>
            ))}
          </div>
        </div>
        <div className="flex h-[26px] min-w-0 items-center gap-1 overflow-x-hidden border-b border-black/25 px-1 py-0.5">
          <select
            className="h-[20px] max-w-[88px] rounded-sm border border-black/25 bg-white px-1 text-[11px]"
            aria-label="Style"
            defaultValue="normal"
            disabled
          >
            <option value="normal">Normal</option>
          </select>
          <select
            className="h-[20px] max-w-[120px] rounded-sm border border-black/25 bg-white px-1 text-[11px]"
            aria-label="Font"
            defaultValue="tnr"
            disabled
          >
            <option value="tnr">Times New Roman</option>
          </select>
          <select
            className="h-[20px] w-14 rounded-sm border border-black/25 bg-white px-1 text-[11px]"
            aria-label="Font size"
            defaultValue="12"
            disabled
          >
            <option value="12">12</option>
            <option value="26">26</option>
          </select>
          <select
            key={zoomPercent}
            className="h-[20px] w-[52px] rounded-sm border border-black/25 bg-white px-1 text-[11px]"
            aria-label="Zoom"
            defaultValue={String(zoomPercent)}
            disabled
          >
            <option value={String(zoomPercent)}>{`${zoomPercent}%`}</option>
          </select>
          <div className={toolGroup}>
            {['B', 'I', 'U', 'A'].map((t, i) => (
              <span key={`${t}-${i}-biu`} className="flex items-center">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={`${toolBtn} ${disabledBtn} w-[22px] px-0.5`}
                  tabIndex={-1}
                >
                  {t}
                </button>
                {i !== 3 ? <span className={toolSep} /> : null}
              </span>
            ))}
          </div>
          <div className={toolGroup}>
            {['🖌', '🖍', '⬛', '🟦'].map((t, i) => (
              <span key={`${t}-${i}-colors`} className="flex items-center">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={`${toolBtn} ${disabledBtn} w-[22px] px-0.5`}
                  tabIndex={-1}
                >
                  {t}
                </button>
                {i !== 3 ? <span className={toolSep} /> : null}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#808080]">
          <div className="word-office-chrome-scroll flex min-h-0 min-w-0 flex-1 overflow-auto">
            <div
              className={[
                'sticky left-0 top-0 z-[3] flex shrink-0 flex-col border-r border-black/25',
                rulerBlue,
              ].join(' ')}
              aria-hidden
              style={{ width: rulerLeftWidth }}
            >
              <div
                className={`relative border-b border-black/25 ${rulerBlue}`}
                style={{ height: rulerTopHeight }}
              >
                <div
                  className={`absolute left-[2px] top-[2px] flex items-center justify-center border border-black/25 ${rulerFace}`}
                  style={{
                    width: rulerLeftWidth - rulerInnerPad * 2,
                    height: rulerTopHeight - rulerInnerPad * 2,
                  }}
                >
                  <span className="text-[9px] font-bold text-black/70">L</span>
                </div>
              </div>
              <div
                className="relative flex-1"
                style={{
                  padding: rulerInnerPad,
                }}
              >
                <div
                  className={`absolute inset-[2px] border border-black/25 ${rulerFace}`}
                  style={{
                    backgroundImage: [
                      // minor ticks
                      'repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 6px)',
                      // major ticks
                      'repeating-linear-gradient(to bottom, rgba(0,0,0,0.38) 0px, rgba(0,0,0,0.38) 1px, transparent 1px, transparent 44px)',
                    ].join(','),
                    backgroundSize: '100% 6px, 100% 44px',
                    backgroundPosition: 'left top, left top',
                  }}
                />
                <div className="pointer-events-none absolute left-[2px] top-[2px] flex w-[14px] flex-col">
                  {rulerMarks.map((n) => (
                    <div
                      key={`v-${n}`}
                      className="relative text-[8px] text-black/65"
                      style={{ height: rulerUnitPx }}
                    >
                      <div className="absolute left-[2px] top-[2px] origin-top-left rotate-90">
                        {n}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                className={[
                  'sticky top-0 z-[3] shrink-0 border-b border-black/25',
                ].join(' ')}
                aria-hidden
                style={{ height: rulerTopHeight }}
              >
                <div
                  className={`relative h-full w-full ${rulerBlue}`}
                >
                  <div
                    className={`absolute inset-[2px] border border-black/25 ${rulerFace}`}
                    style={{
                      backgroundImage: [
                        'repeating-linear-gradient(to right, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 6px)',
                        'repeating-linear-gradient(to right, rgba(0,0,0,0.38) 0px, rgba(0,0,0,0.38) 1px, transparent 1px, transparent 44px)',
                      ].join(','),
                      backgroundSize: '6px 100%, 44px 100%',
                      backgroundPosition: 'left top, left top',
                    }}
                  />
                  <div className="pointer-events-none absolute left-[2px] top-[2px] flex h-[14px]">
                    {rulerMarks.map((n) => (
                      <div key={`h-${n}`} className="relative" style={{ width: rulerUnitPx }}>
                        <div className="absolute left-[4px] top-[1px] text-[8px] text-black/65">
                          {n}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                ref={docViewportRef}
                className="flex min-h-0 min-w-0 flex-1 flex-col items-center px-4 pb-6 pt-3"
              >
                <div
                  ref={pageWidthMeasureRef}
                  className="pointer-events-none h-0 w-[210mm] shrink-0 opacity-0"
                  aria-hidden
                />
                <div
                  className="flex w-full min-w-0 flex-col items-center gap-10 pb-2 pt-1"
                  role="document"
                  style={{ zoom: docZoom }}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-black/20 bg-[#d4d0c8]">
        {/* Status bar */}
        <div className="flex h-[22px] items-center gap-1 px-1 text-[10px] text-zinc-900">
          {['Pg 1', 'Sec 1', '1/1', 'A 2,4 cm', 'R1', 'Col 1'].map((t) => (
            <div
              key={t}
              className="flex h-[18px] items-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] px-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            >
              {t}
            </div>
          ))}
          <div className="flex h-[18px] min-w-0 flex-1 items-center rounded-sm border border-black/20 bg-white/40 px-1.5 text-black/75">
            <span className="truncate">Italiano (Ital.)</span>
          </div>
          {['REC', 'REV', 'EXT', 'SSC'].map((t) => (
            <div
              key={t}
              className="flex h-[18px] items-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] px-1.5 text-[9px] text-black/60"
            >
              {t}
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
