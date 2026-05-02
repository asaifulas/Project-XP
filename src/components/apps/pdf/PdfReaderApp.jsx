import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// react-pdf sets workerSrc to the bare specifier `pdf.worker.mjs`, which fails in the browser.
// Always override with a Vite-resolved asset URL.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const disabledBtn =
  'cursor-not-allowed select-none opacity-80 grayscale-[0.35] disabled:pointer-events-none disabled:opacity-70'
const toolBtn =
  'inline-flex h-[20px] w-[20px] items-center justify-center text-[9px] font-bold text-zinc-700'
const toolGroup =
  'inline-flex h-[22px] items-stretch overflow-hidden rounded-sm border border-black/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
const toolSep = 'w-px bg-black/20'
const officeBlueStrip =
  'bg-[linear-gradient(180deg,#eaf2ff_0%,#cfe0ff_40%,#b4ccfb_100%)]'

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function roundZoom(z) {
  return Math.round(z * 1000) / 1000
}

/**
 * Adobe Reader–style PDF workspace (menus, toolbar, thumbnails strip, dark canvas).
 *
 * @param {{ src: string }} props
 *   `src`: bundled PDF URL (Vite: `import url from '...pdf?url'`).
 */
export default function PdfReaderApp({ src }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [loadError, setLoadError] = useState(null)

  const scrollAreaRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const pageAnchorRefs = useRef(/** @type {Record<number, HTMLDivElement | null>} */ ({}))
  const visiblePageRef = useRef(1)

  const onDocumentLoadSuccess = useCallback((pdf) => {
    setLoadError(null)
    setNumPages(pdf.numPages)
    setPageNumber(1)
    setPageInput('1')
  }, [])

  const onDocumentLoadError = useCallback((err) => {
    setLoadError(err?.message || 'Failed to load PDF')
    setNumPages(null)
  }, [])

  const goPage = useCallback(
    (next) => {
      if (!numPages) return
      const p = clamp(next, 1, numPages)
      visiblePageRef.current = p
      setPageNumber(p)
      setPageInput(String(p))
      requestAnimationFrame(() => {
        pageAnchorRefs.current[p]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    [numPages],
  )

  /** Word-like continuous scroll: toolbar page follows whichever page is most visible. */
  useEffect(() => {
    const root = scrollAreaRef.current
    if (!root || !numPages) return

    let ticking = false
    const updateVisiblePage = () => {
      ticking = false
      const rootRect = root.getBoundingClientRect()
      const anchorY = rootRect.top + Math.min(100, rootRect.height * 0.12)
      let best = 1
      let bestScore = -Infinity
      for (let p = 1; p <= numPages; p += 1) {
        const el = pageAnchorRefs.current[p]
        if (!el) continue
        const r = el.getBoundingClientRect()
        const visibleTop = Math.max(r.top, rootRect.top)
        const visibleBottom = Math.min(r.bottom, rootRect.bottom)
        const visibleH = Math.max(0, visibleBottom - visibleTop)
        if (visibleH < 4) continue
        const overlap = visibleH / Math.max(1, r.height)
        const dist = Math.abs(r.top - anchorY)
        const score = overlap * 1000 - dist
        if (score > bestScore) {
          bestScore = score
          best = p
        }
      }
      if (best !== visiblePageRef.current) {
        visiblePageRef.current = best
        setPageNumber(best)
        setPageInput(String(best))
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(updateVisiblePage)
      }
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    updateVisiblePage()
    return () => root.removeEventListener('scroll', onScroll)
  }, [numPages, scale])

  const zoomPresets = useMemo(() => [0.5, 0.75, 1, 1.25, 1.5, 2], [])

  const zoomSelectOptions = useMemo(() => {
    const merged = [...zoomPresets, scale]
    return [...new Set(merged.map(roundZoom))].sort((a, b) => a - b)
  }, [scale, zoomPresets])

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
          aria-label="Adobe Reader menu"
        >
          {['File', 'Edit', 'View', 'Window', 'Help'].map((m) => (
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

        <div
          className="flex h-[26px] min-w-0 flex-wrap items-center gap-1 border-b border-black/15 px-1 py-0.5"
          aria-label="Reader toolbar"
        >
          <div className={toolGroup}>
            {['📂', '💾', '🖨', '✉'].map((t, i) => (
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
                {i === 2 ? <span className={toolSep} /> : null}
              </span>
            ))}
          </div>

          <div className={toolGroup}>
            <button
              type="button"
              className={`${toolBtn} px-0.5 hover:bg-white/30`}
              aria-label="Previous page"
              disabled={!numPages || pageNumber <= 1}
              onClick={() => goPage(pageNumber - 1)}
            >
              ▲
            </button>
            <button
              type="button"
              className={`${toolBtn} px-0.5 hover:bg-white/30`}
              aria-label="Next page"
              disabled={!numPages || pageNumber >= numPages}
              onClick={() => goPage(pageNumber + 1)}
            >
              ▼
            </button>
            <span className={toolSep} />
            <label className="flex items-center gap-0.5 px-1 text-[10px] text-zinc-800">
              <input
                type="text"
                inputMode="numeric"
                className="h-[18px] w-8 rounded-sm border border-[#7f9db9] bg-white px-1 text-center text-[10px] text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                onBlur={() => {
                  const n = Number.parseInt(pageInput, 10)
                  if (!numPages || !Number.isFinite(n)) {
                    setPageInput(String(pageNumber))
                    return
                  }
                  goPage(n)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.currentTarget.blur()
                  }
                }}
              />
              <span className="whitespace-nowrap text-zinc-600">
                / {numPages ?? '—'}
              </span>
            </label>
          </div>

          <div className={toolGroup}>
            <button
              type="button"
              className={`${toolBtn} px-0.5 hover:bg-white/30`}
              aria-label="Zoom out"
              onClick={() => setScale((s) => roundZoom(clamp(s - 0.1, 0.25, 3)))}
            >
              −
            </button>
            <button
              type="button"
              className={`${toolBtn} px-0.5 hover:bg-white/30`}
              aria-label="Zoom in"
              onClick={() => setScale((s) => roundZoom(clamp(s + 0.1, 0.25, 3)))}
            >
              +
            </button>
            <span className={toolSep} />
            <select
              aria-label="Zoom level"
              className="h-[20px] max-w-[5.5rem] border-0 bg-transparent pl-1 pr-6 text-[10px] text-zinc-800"
              value={String(roundZoom(scale))}
              onChange={(e) => setScale(roundZoom(Number(e.target.value)))}
            >
              {zoomSelectOptions.map((z) => (
                <option key={z} value={String(z)}>
                  {Math.round(z * 1000) / 10}%
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {['Tools', 'Sign', 'Comment'].map((label) => (
              <button
                key={label}
                type="button"
                disabled
                aria-disabled="true"
                className="h-[22px] rounded-sm border border-black/20 bg-[linear-gradient(180deg,#f6f3e6_0%,#e0dcc8_100%)] px-2 text-[10px] font-semibold text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] disabled:opacity-70"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-row">
        <aside
          className="flex w-9 shrink-0 flex-col items-center gap-1 border-r border-black/20 bg-[#c6c3ba] py-2"
          aria-label="Navigation panels"
        >
          <button
            type="button"
            title="Page thumbnails"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-black/25 bg-[#ece9d8] text-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
            aria-label="Page thumbnails"
          >
            📄
          </button>
          <button
            type="button"
            title="Bookmarks"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-black/25 bg-[#ece9d8] text-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
            aria-label="Bookmarks"
          >
            🔖
          </button>
        </aside>

        <div
          ref={scrollAreaRef}
          className="relative min-h-0 min-w-0 flex-1 overflow-auto bg-[#4a4a4a]"
        >
          {loadError ? (
            <p className="p-4 text-center text-sm text-white/90">{loadError}</p>
          ) : (
            <div className="flex min-h-full justify-center px-4 py-6">
              <Document
                file={src}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <p className="text-sm text-white/80">Loading, please wait…</p>
                }
              >
                {numPages ? (
                  <div className="flex flex-col items-center gap-5">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                      <div
                        key={p}
                        ref={(el) => {
                          pageAnchorRefs.current[p] = el
                        }}
                        data-pdf-page={p}
                        className="shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
                      >
                        <Page
                          pageNumber={p}
                          scale={scale}
                          renderTextLayer
                          renderAnnotationLayer
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
