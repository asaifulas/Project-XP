import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, Thumbnail, pdfjs } from 'react-pdf'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  IconActualSize,
  IconBinoculars,
  IconContinuous,
  IconEmail,
  IconFitPage,
  IconFitWidth,
  IconGreenNav,
  IconHand,
  IconHelp,
  IconOpen,
  IconPageNav,
  IconPrint,
  IconRotate,
  IconSave,
  IconSelectText,
  IconSinglePage,
  IconSnapshot,
  IconZoomIn,
  IconZoomOut,
} from '../../window/retro/officeIcons'

// react-pdf sets workerSrc to the bare specifier `pdf.worker.mjs`, which fails in the browser.
// Always override with a Vite-resolved asset URL.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

/** Luna rebar band (same as the XP Explorer / IE6 windows). */
const rebar =
  'border-b border-[#aca899] bg-[linear-gradient(180deg,#fffcf8_0%,#f0ebe0_40%,#e4dfd4_100%)] shadow-[inset_0_1px_0_#fff]'

const btn =
  'flex h-[24px] shrink-0 cursor-default items-center gap-1 rounded-[3px] border border-transparent px-[3px] text-[11px] text-black enabled:hover:border-[#c2bba6] enabled:hover:bg-[linear-gradient(180deg,#ffffff_0%,#f6f4ee_55%,#e8e4d6_100%)] enabled:active:bg-[#e3dfd0] enabled:active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.18)] disabled:opacity-45'
const btnOn = 'border-[#a8a08a] bg-[#e3dfd0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)]'

function Sep() {
  return <span className="mx-[3px] h-[20px] w-px shrink-0 bg-[#c5c2b2] shadow-[1px_0_0_#fff]" aria-hidden />
}

/** Dotted grip at the start of each Reader toolbar. */
function Grip() {
  return (
    <span className="mr-[2px] flex h-[18px] w-[3px] shrink-0 flex-col justify-between" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="h-[2px] w-[2px] bg-[#a29c8a] shadow-[1px_1px_0_#fff]" />
      ))}
    </span>
  )
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function roundZoom(z) {
  return Math.round(z * 1000) / 1000
}

/**
 * Adobe Reader 7 (Windows XP era): menus, File/Basic/Zoom toolbars, vertical navigation
 * tabs with a Pages thumbnail panel, grey document area, and the status bar with page navigation.
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
  const [panel, setPanel] = useState(/** @type {null | 'pages' | 'bookmarks'} */ (null))
  const [pageSizePt, setPageSizePt] = useState(/** @type {null | { w: number, h: number }} */ (null))

  const scrollAreaRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const pageAnchorRefs = useRef(/** @type {Record<number, HTMLDivElement | null>} */ ({}))
  const visiblePageRef = useRef(1)

  const onDocumentLoadSuccess = useCallback((pdf) => {
    setLoadError(null)
    setNumPages(pdf.numPages)
    setPageNumber(1)
    setPageInput('1')
    pdf
      .getPage(1)
      .then((p) => {
        const [x0, y0, x1, y1] = p.view
        setPageSizePt({ w: x1 - x0, h: y1 - y0 })
      })
      .catch(() => {})
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

  /** Continuous scroll: the status bar page follows whichever page is most visible. */
  useEffect(() => {
    const root = scrollAreaRef.current
    if (!root || !numPages) return undefined

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
    // pages mount empty and grow once pdf.js renders them: re-check when any page changes size
    const ro = new ResizeObserver(onScroll)
    Object.values(pageAnchorRefs.current).forEach((el) => el && ro.observe(el))
    updateVisiblePage()
    return () => {
      root.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [numPages, scale])

  const zoomPresets = useMemo(() => [0.5, 0.75, 1, 1.25, 1.5, 2], [])

  const zoomSelectOptions = useMemo(() => {
    const merged = [...zoomPresets, scale]
    return [...new Set(merged.map(roundZoom))].sort((a, b) => a - b)
  }, [scale, zoomPresets])

  /** Fit Page / Fit Width use the first page's size and the free space in the document area. */
  const fitTo = useCallback(
    (mode) => {
      const area = scrollAreaRef.current
      if (!area || !pageSizePt) return
      const availW = area.clientWidth - 40
      const availH = area.clientHeight - 24
      const byW = availW / pageSizePt.w
      const next = mode === 'width' ? byW : Math.min(byW, availH / pageSizePt.h)
      setScale(roundZoom(clamp(next, 0.25, 3)))
    },
    [pageSizePt],
  )

  /* On narrow windows (phones) open at Fit Width instead of 100%, once per document. */
  const autoFitDoneRef = useRef(false)
  useEffect(() => {
    const area = scrollAreaRef.current
    if (!pageSizePt || !area || autoFitDoneRef.current) return
    autoFitDoneRef.current = true
    if (area.clientWidth - 40 < pageSizePt.w) fitTo('width')
  }, [pageSizePt, fitTo])

  const pageSizeLabel = pageSizePt
    ? `${(pageSizePt.w / 72).toFixed(2)} x ${(pageSizePt.h / 72).toFixed(2)} in`
    : ''

  const togglePanel = (name) => setPanel((p) => (p === name ? null : name))

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#ece9d8] font-xp text-[11px] text-black">
      {/* Menu bar */}
      <nav className={`flex h-[22px] shrink-0 items-center px-1 ${rebar}`} aria-label="Adobe Reader menu">
        {['File', 'Edit', 'View', 'Document', 'Tools', 'Window', 'Help'].map((m) => (
          <span
            key={m}
            className="cursor-default select-none whitespace-nowrap rounded-[2px] px-[7px] py-[2px] text-[11px] hover:bg-[#316ac5] hover:text-white"
          >
            {m}
          </span>
        ))}
      </nav>

      {/* Toolbars */}
      <div className={`flex h-[32px] shrink-0 items-center gap-[2px] overflow-hidden whitespace-nowrap px-1 ${rebar}`}>
        <Grip />
        <button type="button" className={btn} title="Open" tabIndex={-1}>
          <IconOpen />
        </button>
        <button type="button" className={btn} title="Save a Copy" tabIndex={-1}>
          <IconSave />
        </button>
        <button type="button" className={btn} title="Print" tabIndex={-1}>
          <IconPrint />
        </button>
        <button type="button" className={`${btn} hidden sm:flex`} title="Email" tabIndex={-1}>
          <IconEmail />
        </button>
        <button type="button" className={`${btn} hidden md:flex`} title="Search" tabIndex={-1}>
          <IconBinoculars />
          <span>Search</span>
        </button>
        <Sep />
        <Grip />
        <button type="button" className={`${btn} ${btnOn}`} title="Hand Tool" tabIndex={-1}>
          <IconHand />
        </button>
        <button type="button" className={`${btn} hidden sm:flex`} title="Select Text" tabIndex={-1}>
          <IconSelectText />
          <span>Select</span>
        </button>
        <button type="button" className={`${btn} hidden md:flex`} title="Snapshot Tool" tabIndex={-1}>
          <IconSnapshot />
        </button>
        <Sep />
        <Grip />
        <button
          type="button"
          className={btn}
          title="Zoom Out"
          onClick={() => setScale((s) => roundZoom(clamp(s - 0.1, 0.25, 3)))}
        >
          <IconZoomOut />
        </button>
        <div className="mx-[2px] flex h-[20px] w-[64px] shrink-0 items-stretch border border-[#7f9db9] bg-white">
          <select
            aria-label="Zoom level"
            className="min-w-0 flex-1 cursor-default appearance-none border-0 bg-transparent pl-1 font-xp text-[11px] text-black outline-none"
            value={String(roundZoom(scale))}
            onChange={(e) => setScale(roundZoom(Number(e.target.value)))}
          >
            {zoomSelectOptions.map((z) => (
              <option key={z} value={String(z)}>
                {Math.round(z * 100)}%
              </option>
            ))}
          </select>
          <span className="pointer-events-none flex w-[15px] items-center justify-center rounded-[2px] border border-[#b9cdf3] bg-[linear-gradient(180deg,#e6eefc_0%,#c4d6f8_50%,#b2c8f4_100%)]" aria-hidden>
            <svg width="7" height="4" viewBox="0 0 7 4">
              <path d="M0 0h7L3.5 4z" fill="#4d6185" />
            </svg>
          </span>
        </div>
        <button
          type="button"
          className={btn}
          title="Zoom In"
          onClick={() => setScale((s) => roundZoom(clamp(s + 0.1, 0.25, 3)))}
        >
          <IconZoomIn />
        </button>
        <Sep />
        <button type="button" className={`${btn} hidden sm:flex`} title="Actual Size" onClick={() => setScale(1)}>
          <IconActualSize />
        </button>
        <button type="button" className={`${btn} hidden sm:flex`} title="Fit Page" onClick={() => fitTo('page')}>
          <IconFitPage />
        </button>
        <button type="button" className={`${btn} hidden sm:flex`} title="Fit Width" onClick={() => fitTo('width')}>
          <IconFitWidth />
        </button>
        <button type="button" className={`${btn} hidden md:flex`} title="Rotate Clockwise" tabIndex={-1}>
          <IconRotate />
        </button>
        <button type="button" className={`${btn} ml-auto hidden md:flex`} title="Help" tabIndex={-1}>
          <IconHelp />
          <span>Help</span>
          <svg width="5" height="3" viewBox="0 0 5 3" aria-hidden>
            <path d="M0 0h5L2.5 3z" fill="#1a1a1a" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1">
        {/* Vertical navigation tabs */}
        <div className="flex w-[22px] shrink-0 flex-col gap-[2px] border-r border-[#aca899] bg-[#ece9d8] pt-1" role="tablist" aria-label="Navigation panels">
          {[
            { id: 'bookmarks', label: 'Bookmarks' },
            { id: 'pages', label: 'Pages' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={panel === t.id}
              onClick={() => togglePanel(t.id)}
              className={[
                'flex cursor-default items-center justify-center rounded-r-[3px] border border-l-0 py-2 text-[11px] [writing-mode:vertical-rl]',
                panel === t.id
                  ? 'border-[#aca899] bg-white'
                  : 'border-[#c9c4b2] bg-[linear-gradient(90deg,#f7f5ee_0%,#e6e1d2_100%)] hover:bg-white',
              ].join(' ')}
            >
              <span className="rotate-180">{t.label}</span>
            </button>
          ))}
        </div>

        {loadError ? (
          <p className="flex-1 bg-[#8a8a8a] p-4 text-center text-sm text-white">{loadError}</p>
        ) : (
          <Document
            file={src}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex min-h-0 min-w-0 flex-1"
            loading={<p className="flex-1 bg-[#8a8a8a] p-4 text-center text-[12px] text-white">Loading, please wait…</p>}
          >
            {panel ? (
              <aside className="flex w-[150px] shrink-0 flex-col border-r border-[#aca899] bg-white" aria-label={panel === 'pages' ? 'Pages' : 'Bookmarks'}>
                <div className="flex h-[22px] shrink-0 items-center justify-between border-b border-[#aca899] bg-[linear-gradient(180deg,#fdfcfa_0%,#ebe7dc_100%)] px-1.5">
                  <span className="font-bold">{panel === 'pages' ? 'Pages' : 'Bookmarks'}</span>
                  <span className="text-[11px]">
                    Options{' '}
                    <svg className="inline" width="5" height="3" viewBox="0 0 5 3" aria-hidden>
                      <path d="M0 0h5L2.5 3z" fill="#1a1a1a" />
                    </svg>
                  </span>
                </div>
                {panel === 'pages' && numPages ? (
                  <div className="flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto py-3">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                      <div
                        key={p}
                        className="flex cursor-default flex-col items-center gap-1"
                        aria-current={p === pageNumber ? 'page' : undefined}
                      >
                        <span className={`block border-2 ${p === pageNumber ? 'border-[#316ac5]' : 'border-transparent'}`}>
                          <span className="block border border-[#8a8a8a]">
                            {/* Thumbnail renders its own link; onItemClick scrolls the document */}
                            <Thumbnail pageNumber={p} width={96} onItemClick={() => goPage(p)} />
                          </span>
                        </span>
                        <span className={p === pageNumber ? 'bg-[#316ac5] px-1 text-white' : 'px-1'}>{p}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-2 text-[11px] text-[#555]">This document has no bookmarks.</p>
                )}
              </aside>
            ) : null}

            <div ref={scrollAreaRef} className="relative min-h-0 min-w-0 flex-1 overflow-auto bg-[#8a8a8a]">
              {numPages ? (
                // w-max + min-w-full: centred when narrower than the view, scrollable (not clipped) when wider
                <div className="flex min-h-full w-max min-w-full flex-col items-center gap-3 px-4 py-3">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                    <div
                      key={p}
                      ref={(el) => {
                        pageAnchorRefs.current[p] = el
                      }}
                      data-pdf-page={p}
                      className="border border-black shadow-[3px_3px_0_rgba(0,0,0,0.35)]"
                    >
                      <Page pageNumber={p} scale={scale} renderTextLayer renderAnnotationLayer />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Document>
        )}
      </div>

      {/* Status bar: page size, page navigation, back/forward, page layout */}
      <footer className="flex h-[24px] shrink-0 items-center gap-1 border-t border-white bg-[#ece9d8] px-1 shadow-[0_-1px_0_#aca899] text-[11px]">
        <span className="hidden w-[110px] shrink-0 truncate pl-1 text-[#333] sm:block">{pageSizeLabel}</span>
        <div className="mx-auto flex items-center gap-[1px]">
          <button type="button" className={btn} title="First Page" disabled={!numPages || pageNumber <= 1} onClick={() => goPage(1)}>
            <IconPageNav dir="first" />
          </button>
          <button type="button" className={btn} title="Previous Page" aria-label="Previous page" disabled={!numPages || pageNumber <= 1} onClick={() => goPage(pageNumber - 1)}>
            <IconPageNav dir="prev" />
          </button>
          <label className="mx-1 flex items-center gap-1 whitespace-nowrap">
            <input
              type="text"
              inputMode="numeric"
              aria-label="Page number"
              className="h-[18px] w-[30px] border border-[#7f9db9] bg-white px-1 text-center font-xp text-[11px] text-black outline-none"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
              onFocus={(e) => e.target.select()}
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
            <span>of {numPages ?? '—'}</span>
          </label>
          <button type="button" className={btn} title="Next Page" aria-label="Next page" disabled={!numPages || pageNumber >= numPages} onClick={() => goPage(pageNumber + 1)}>
            <IconPageNav dir="next" />
          </button>
          <button type="button" className={btn} title="Last Page" disabled={!numPages || pageNumber >= numPages} onClick={() => goPage(numPages)}>
            <IconPageNav dir="last" />
          </button>
          <Sep />
          <button type="button" className={`${btn} hidden sm:flex`} title="Previous View" tabIndex={-1}>
            <IconGreenNav dir="back" />
          </button>
          <button type="button" className={`${btn} hidden sm:flex`} title="Next View" tabIndex={-1}>
            <IconGreenNav dir="forward" />
          </button>
        </div>
        <div className="hidden items-center gap-[1px] sm:flex">
          <button type="button" className={btn} title="Single Page" tabIndex={-1}>
            <IconSinglePage />
          </button>
          <button type="button" className={`${btn} ${btnOn}`} title="Continuous" tabIndex={-1}>
            <IconContinuous />
          </button>
        </div>
        <span
          className="h-[12px] w-[12px] shrink-0 self-end"
          style={{
            background:
              'linear-gradient(135deg, transparent 0 45%, #fff 45% 52%, #aca899 52% 60%, transparent 60% 70%, #fff 70% 76%, #aca899 76% 84%, transparent 84%)',
          }}
          aria-hidden
        />
      </footer>
    </div>
  )
}
