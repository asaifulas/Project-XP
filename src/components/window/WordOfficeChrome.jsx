import { useLayoutEffect, useRef, useState } from 'react'
import {
  CommandDock,
  OfficeMenuBar,
  OfficeStatusBar,
  OfficeToolbar,
  SizeGrip,
  StatusPanel,
  TbButton,
  TbCombo,
  TbSep,
  ToolbarRow,
} from './retro/office2003'
import {
  Glyph,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBorders,
  IconBullets,
  IconColumns,
  IconCopy,
  IconCut,
  IconDrawing,
  IconEmail,
  IconExcelSheet,
  IconFontColor,
  IconFormatPainter,
  IconHelp,
  IconHighlight,
  IconHyperlink,
  IconIndent,
  IconJustify,
  IconLineSpacing,
  IconNew,
  IconNumbering,
  IconOpen,
  IconOutdent,
  IconPaste,
  IconPilcrow,
  IconPreview,
  IconPrint,
  IconRead,
  IconRedo,
  IconSave,
  IconSpelling,
  IconTable,
  IconUndo,
  IconViewNormal,
  IconViewOutline,
  IconViewPrint,
  IconViewWeb,
} from './retro/officeIcons'

/**
 * Microsoft Word 2003 (Windows XP) document workspace: Office 2003 command bars,
 * rulers aligned to the page, grey canvas with A4 sheet(s), view buttons and status bar.
 *
 * Children should be one or more `WordA4Page` blocks.
 * Zoom is capped at `DOC_ZOOM_MAX` but shrinks so a full page width always fits.
 */
const DOC_ZOOM_MAX = 1
/** `.word-page` geometry from index.css (96 dpi). */
const PAGE_PX = 794
const MARGIN_PX = 75.6
const CM_PX = 37.8
const RULER_H = 18

const rulerStrip = 'bg-[#dbe7f9]'

/** Horizontal ruler drawn over the page width: shaded margins, cm numbers, indent markers. */
function HorizontalRuler({ zoom }) {
  const w = PAGE_PX * zoom
  const m = MARGIN_PX * zoom
  const cm = CM_PX * zoom
  const textW = w - m * 2
  const ticks = []
  for (let q = 1; q * (cm / 4) < textW; q += 1) {
    const x = m + q * (cm / 4)
    if (q % 4 === 0) {
      ticks.push(
        <text key={q} x={x} y={11} fontSize={8} textAnchor="middle" fontFamily="Tahoma, sans-serif" fill="#3b3b3b">
          {q / 4}
        </text>,
      )
    } else {
      const h = q % 2 === 0 ? 4 : 2
      ticks.push(<rect key={q} x={x} y={8 - h / 2} width={1} height={h} fill="#3b3b3b" />)
    }
  }
  const right = w - m
  return (
    <svg width={w} height={14} viewBox={`0 0 ${w} 14`} className="block" aria-hidden>
      <rect x={0.5} y={0.5} width={w - 1} height={13} fill="#a9c2ec" stroke="#7f9db9" />
      <rect x={m} y={1} width={textW} height={12} fill="#fff" />
      {ticks}
      {/* first-line indent, hanging indent and left indent */}
      <path d={`M${m - 4} 0.5h8l-4 4.5z`} fill="#e9eef7" stroke="#4d5b74" />
      <path d={`M${m - 4} 10.5h8l-4-4.5z`} fill="#e9eef7" stroke="#4d5b74" />
      <rect x={m - 4} y={10.5} width={8} height={3} fill="#e9eef7" stroke="#4d5b74" />
      {/* right indent */}
      <path d={`M${right - 4} 13.5h8l-4-5z`} fill="#e9eef7" stroke="#4d5b74" />
    </svg>
  )
}

export default function WordOfficeChrome({ children }) {
  const docViewportRef = useRef(null)
  const scrollRef = useRef(null)
  const pageWidthMeasureRef = useRef(null)
  const [docZoom, setDocZoom] = useState(DOC_ZOOM_MAX)
  const [pages, setPages] = useState({ current: 1, total: 1 })

  useLayoutEffect(() => {
    const viewport = docViewportRef.current
    const measure = pageWidthMeasureRef.current
    if (!viewport || !measure) return undefined

    const update = () => {
      const pageW = measure.offsetWidth
      if (!pageW) return
      const padX =
        Number.parseFloat(getComputedStyle(viewport).paddingLeft || '0') +
        Number.parseFloat(getComputedStyle(viewport).paddingRight || '0')
      const avail = Math.max(0, viewport.clientWidth - padX)
      const fit = avail / pageW
      setDocZoom(Math.min(DOC_ZOOM_MAX, Math.max(0.42, fit)))
    }

    update()
    const ro = new ResizeObserver(() => update())
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [])

  /* Page N of M in the status bar follows the scroll position. */
  useLayoutEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return undefined
    const update = () => {
      const sheets = scroller.querySelectorAll('[data-word-a4-page]')
      const total = Math.max(1, sheets.length)
      const top = scroller.getBoundingClientRect().top + scroller.clientHeight / 3
      let current = 1
      sheets.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= top) current = i + 1
      })
      setPages((p) => (p.current === current && p.total === total ? p : { current, total }))
    }
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    return () => scroller.removeEventListener('scroll', update)
  }, [])

  const zoomPercent = Math.round(docZoom * 100)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#d4d0c8] font-xp text-[11px] text-black">
      <CommandDock>
        <OfficeMenuBar
          label="Word menu"
          items={['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Table', 'Window', 'Help']}
        />
        <ToolbarRow>
          <OfficeToolbar>
            <TbButton icon={<IconNew />} title="New Blank Document" />
            <TbButton icon={<IconOpen />} title="Open" />
            <TbButton icon={<IconSave />} title="Save" />
            <TbSep />
            <TbButton icon={<IconEmail />} title="E-mail" />
            <TbButton icon={<IconPrint />} title="Print" />
            <TbButton icon={<IconPreview />} title="Print Preview" />
            <TbButton icon={<IconSpelling />} title="Spelling and Grammar" />
            <TbSep />
            <TbButton icon={<IconCut />} title="Cut" />
            <TbButton icon={<IconCopy />} title="Copy" />
            <TbButton icon={<IconPaste />} title="Paste" />
            <TbButton icon={<IconFormatPainter />} title="Format Painter" />
            <TbSep />
            <TbButton icon={<IconUndo />} title="Undo" caret />
            <TbButton icon={<IconRedo />} title="Redo" caret />
            <TbSep />
            <TbButton icon={<IconHyperlink />} title="Insert Hyperlink" />
            <TbButton icon={<IconTable />} title="Insert Table" />
            <TbButton icon={<IconExcelSheet />} title="Insert Microsoft Excel Worksheet" />
            <TbButton icon={<IconColumns />} title="Columns" />
            <TbButton icon={<IconDrawing />} title="Drawing" />
            <TbButton icon={<IconPilcrow />} title="Show/Hide ¶" />
            <TbCombo value={`${zoomPercent}%`} width={52} label="Zoom" />
            <TbButton icon={<IconHelp />} title="Microsoft Office Word Help" />
            <TbButton icon={<IconRead />} label="Read" title="Read" />
          </OfficeToolbar>
        </ToolbarRow>
        <ToolbarRow>
          <OfficeToolbar>
            <TbCombo value="Normal + Times New" width={112} label="Style" />
            <TbCombo value="Times New Roman" width={120} label="Font" />
            <TbCombo value="12" width={38} label="Font size" />
            <TbSep />
            <TbButton icon={<Glyph style={{ fontWeight: 700 }}>B</Glyph>} title="Bold" />
            <TbButton icon={<Glyph style={{ fontStyle: 'italic', fontFamily: 'Times New Roman, serif', fontSize: 14 }}>I</Glyph>} title="Italic" />
            <TbButton icon={<Glyph style={{ textDecoration: 'underline' }}>U</Glyph>} title="Underline" />
            <TbSep />
            <TbButton icon={<IconAlignLeft />} title="Align Left" checked />
            <TbButton icon={<IconAlignCenter />} title="Center" />
            <TbButton icon={<IconAlignRight />} title="Align Right" />
            <TbButton icon={<IconJustify />} title="Justify" />
            <TbButton icon={<IconLineSpacing />} title="Line Spacing" caret />
            <TbSep />
            <TbButton icon={<IconNumbering />} title="Numbering" />
            <TbButton icon={<IconBullets />} title="Bullets" />
            <TbButton icon={<IconOutdent />} title="Decrease Indent" />
            <TbButton icon={<IconIndent />} title="Increase Indent" />
            <TbSep />
            <TbButton icon={<IconBorders />} title="Outside Border" caret />
            <TbButton icon={<IconHighlight />} title="Highlight" caret />
            <TbButton icon={<IconFontColor />} title="Font Color" caret />
          </OfficeToolbar>
        </ToolbarRow>
      </CommandDock>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#8c8c8c]">
        <div ref={scrollRef} className="word-office-chrome-scroll flex min-h-0 min-w-0 flex-1 overflow-auto">
          {/* vertical ruler */}
          <div className={`sticky left-0 top-0 z-[3] flex w-[18px] shrink-0 flex-col border-r border-[#7f9db9] ${rulerStrip}`} aria-hidden>
            <div className="sticky top-0 z-[4] flex shrink-0 items-center justify-center border-b border-[#7f9db9] bg-[#dbe7f9]" style={{ height: RULER_H }}>
              <span
                className="flex h-[13px] w-[13px] items-center justify-center border border-[#7f9db9] bg-white text-[9px] font-bold leading-none text-[#1a1a1a]"
                title="Left Tab"
              >
                L
              </span>
            </div>
            <div
              className="mx-[3px] mt-4 flex-1 border border-[#7f9db9] bg-white"
              style={{
                backgroundImage: [
                  'repeating-linear-gradient(to bottom, transparent 0 8.45px, rgba(0,0,0,0.45) 8.45px 9.45px)',
                  'linear-gradient(#a9c2ec, #a9c2ec)',
                ].join(','),
                backgroundSize: `4px ${CM_PX / 4}px, 100% ${MARGIN_PX * docZoom}px`,
                backgroundRepeat: 'repeat-y, no-repeat',
                backgroundPosition: 'center top, top',
              }}
            />
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {/* horizontal ruler, aligned with the page */}
            <div
              className={`sticky top-0 z-[3] flex shrink-0 items-center justify-center border-b border-[#7f9db9] px-4 ${rulerStrip}`}
              style={{ height: RULER_H }}
              aria-hidden
            >
              <HorizontalRuler zoom={docZoom} />
            </div>
            <div ref={docViewportRef} className="flex min-h-0 min-w-0 flex-1 flex-col items-center px-4 pb-6 pt-3">
              <div ref={pageWidthMeasureRef} className="pointer-events-none h-0 w-[210mm] shrink-0 opacity-0" aria-hidden />
              <div className="flex w-full min-w-0 flex-col items-center gap-10 pb-2 pt-1" role="document" style={{ zoom: docZoom }}>
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* view buttons + horizontal scroll track */}
        <div className="flex h-[17px] shrink-0 items-stretch border-t border-[#7f9db9] bg-[#f3f1ea]" aria-hidden>
          {[
            { icon: <IconViewNormal />, title: 'Normal View' },
            { icon: <IconViewWeb />, title: 'Web Layout View' },
            { icon: <IconViewPrint />, title: 'Print Layout View', on: true },
            { icon: <IconViewOutline />, title: 'Outline View' },
            { icon: <IconViewNormal />, title: 'Reading Layout' },
          ].map((v) => (
            <span
              key={v.title}
              title={v.title}
              className={`flex w-[22px] items-center justify-center border-r border-[#b9c9e4] ${v.on ? 'bg-[linear-gradient(180deg,#ffd599_0%,#ffe7a2_100%)] shadow-[inset_0_0_0_1px_#000080]' : ''}`}
            >
              {v.icon}
            </span>
          ))}
          <span className="flex-1 bg-[repeating-linear-gradient(45deg,#f3f1ea_0_2px,#ebe8de_2px_3px)]" />
        </div>
      </div>

      <OfficeStatusBar>
        <StatusPanel>Page {pages.current}</StatusPanel>
        <StatusPanel>Sec 1</StatusPanel>
        <StatusPanel>
          {pages.current}/{pages.total}
        </StatusPanel>
        <StatusPanel className="hidden sm:flex">At 2.5cm</StatusPanel>
        <StatusPanel className="hidden sm:flex">Ln 1</StatusPanel>
        <StatusPanel className="hidden sm:flex">Col 1</StatusPanel>
        <StatusPanel dim className="hidden md:flex">REC</StatusPanel>
        <StatusPanel dim className="hidden md:flex">TRK</StatusPanel>
        <StatusPanel dim className="hidden md:flex">EXT</StatusPanel>
        <StatusPanel dim className="hidden md:flex">OVR</StatusPanel>
        <StatusPanel grow>English (U.S.)</StatusPanel>
        <SizeGrip />
      </OfficeStatusBar>
    </div>
  )
}
