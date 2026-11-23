import { useEffect, useMemo, useRef, useState } from 'react'
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
  TinyCaret,
  ToolbarRow,
} from './retro/office2003'
import {
  Glyph,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconAutoSum,
  IconBorders,
  IconChart,
  IconCopy,
  IconCurrency,
  IconCut,
  IconDecDecimal,
  IconDrawing,
  IconEmail,
  IconFillColor,
  IconFontColor,
  IconFormatPainter,
  IconHelp,
  IconHyperlink,
  IconIncDecimal,
  IconIndent,
  IconMergeCenter,
  IconNew,
  IconOpen,
  IconOutdent,
  IconPaste,
  IconPreview,
  IconPrint,
  IconRedo,
  IconSave,
  IconSortAsc,
  IconSortDesc,
  IconSpelling,
  IconUndo,
} from './retro/officeIcons'

function colName(index) {
  let n = index
  let name = ''
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name
    n = Math.floor(n / 26) - 1
  }
  return name
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/** Excel 2003 header faces: pale blue, orange when the row/column holds the active cell. */
const headerFace = 'bg-[linear-gradient(180deg,#f9fbfd_0%,#e4ecf7_55%,#d6e1f1_100%)]'
const headerActive = 'bg-[linear-gradient(180deg,#fbe2a6_0%,#f8cf6e_55%,#f2b84c_100%)] font-bold'
const gridLine = 'border-[#c6c6c6]'

/** Small tab-scroll button (|◄ ◄ ► ►|) left of the sheet tabs. */
function TabScroll({ d }) {
  return (
    <span className="flex h-[15px] w-[15px] items-center justify-center" aria-hidden>
      <svg width="9" height="7" viewBox="0 0 9 7">
        <path d={d} fill="#4b5568" />
      </svg>
    </span>
  )
}

export default function ExcelOfficeChrome() {
  const [active, setActive] = useState({ r: 0, c: 0 })
  const [sheet, setSheet] = useState('Sheet1')
  const [cellsBySheet, setCellsBySheet] = useState(() => ({
    Sheet1: {},
    Sheet2: {},
    Sheet3: {},
  }))
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const captureRef = useRef(null)

  const cols = useMemo(() => Array.from({ length: 22 }, (_, i) => colName(i)), [])
  const rows = useMemo(() => Array.from({ length: 40 }, (_, i) => i + 1), [])

  const nameBox = `${cols[active.c]}${rows[active.r]}`
  const activeKey = `${cols[active.c]}${rows[active.r]}`
  const activeValue = cellsBySheet?.[sheet]?.[activeKey] ?? ''

  const cellW = 64
  const cellH = 17
  const rowHeaderW = 32
  const colHeaderH = 18

  useEffect(() => {
    if (isEditing) return
    setDraft(activeValue)
  }, [activeValue, isEditing, sheet])

  function moveActive(dr, dc) {
    setActive((prev) => ({
      r: clamp(prev.r + dr, 0, rows.length - 1),
      c: clamp(prev.c + dc, 0, cols.length - 1),
    }))
  }

  function commitDraft(nextValue = draft) {
    setCellsBySheet((prev) => ({
      ...prev,
      [sheet]: {
        ...(prev[sheet] ?? {}),
        [activeKey]: nextValue,
      },
    }))
    setIsEditing(false)
  }

  function clearActiveCell() {
    setCellsBySheet((prev) => {
      const nextSheet = { ...(prev[sheet] ?? {}) }
      delete nextSheet[activeKey]
      return { ...prev, [sheet]: nextSheet }
    })
    setDraft('')
    setIsEditing(false)
  }

  function beginEditing(initial = activeValue) {
    setIsEditing(true)
    setDraft(initial)
    // focus next tick so state applies first
    setTimeout(() => captureRef.current?.focus(), 0)
  }

  function handleGridKeyDown(e) {
    if (e.key === 'F2') {
      e.preventDefault()
      beginEditing(activeValue)
      return
    }

    if (e.key === 'Enter') {
      if (isEditing) {
        e.preventDefault()
        commitDraft()
        moveActive(1, 0)
      }
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      if (isEditing) commitDraft()
      moveActive(0, e.shiftKey ? -1 : 1)
      return
    }

    if (e.key === 'Escape') {
      if (isEditing) {
        e.preventDefault()
        setIsEditing(false)
        setDraft(activeValue)
      }
      return
    }

    if (!isEditing) {
      if (e.key === 'ArrowUp') return void (e.preventDefault(), moveActive(-1, 0))
      if (e.key === 'ArrowDown') return void (e.preventDefault(), moveActive(1, 0))
      if (e.key === 'ArrowLeft') return void (e.preventDefault(), moveActive(0, -1))
      if (e.key === 'ArrowRight') return void (e.preventDefault(), moveActive(0, 1))

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        clearActiveCell()
        return
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // start typing replaces contents (Excel behavior)
        e.preventDefault()
        beginEditing(e.key)
        return
      }
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#d4d0c8] font-xp text-[11px] text-black">
      <CommandDock>
        <OfficeMenuBar
          label="Excel menu"
          items={['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Data', 'Window', 'Help']}
        />
        <ToolbarRow>
          <OfficeToolbar>
            <TbButton icon={<IconNew />} title="New" />
            <TbButton icon={<IconOpen />} title="Open" />
            <TbButton icon={<IconSave />} title="Save" />
            <TbSep />
            <TbButton icon={<IconEmail />} title="E-mail" />
            <TbButton icon={<IconPrint />} title="Print" />
            <TbButton icon={<IconPreview />} title="Print Preview" />
            <TbButton icon={<IconSpelling />} title="Spelling" />
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
            <TbButton icon={<IconAutoSum />} title="AutoSum" caret />
            <TbButton icon={<IconSortAsc />} title="Sort Ascending" />
            <TbButton icon={<IconSortDesc />} title="Sort Descending" />
            <TbButton icon={<IconChart />} title="Chart Wizard" />
            <TbButton icon={<IconDrawing />} title="Drawing" />
            <TbCombo value="100%" width={52} label="Zoom" />
            <TbButton icon={<IconHelp />} title="Microsoft Office Excel Help" />
          </OfficeToolbar>
        </ToolbarRow>
        <ToolbarRow>
          <OfficeToolbar>
            <TbCombo value="Arial" width={110} label="Font" />
            <TbCombo value="10" width={38} label="Font size" />
            <TbSep />
            <TbButton icon={<Glyph style={{ fontWeight: 700 }}>B</Glyph>} title="Bold" />
            <TbButton icon={<Glyph style={{ fontStyle: 'italic', fontFamily: 'Times New Roman, serif', fontSize: 14 }}>I</Glyph>} title="Italic" />
            <TbButton icon={<Glyph style={{ textDecoration: 'underline' }}>U</Glyph>} title="Underline" />
            <TbSep />
            <TbButton icon={<IconAlignLeft />} title="Align Left" />
            <TbButton icon={<IconAlignCenter />} title="Center" />
            <TbButton icon={<IconAlignRight />} title="Align Right" />
            <TbButton icon={<IconMergeCenter />} title="Merge and Center" />
            <TbSep />
            <TbButton icon={<IconCurrency />} title="Currency Style" />
            <TbButton icon={<Glyph style={{ fontWeight: 700 }}>%</Glyph>} title="Percent Style" />
            <TbButton icon={<Glyph style={{ fontWeight: 700, fontSize: 15, marginTop: -5 }}>,</Glyph>} title="Comma Style" />
            <TbButton icon={<IconIncDecimal />} title="Increase Decimal" />
            <TbButton icon={<IconDecDecimal />} title="Decrease Decimal" />
            <TbSep />
            <TbButton icon={<IconOutdent />} title="Decrease Indent" />
            <TbButton icon={<IconIndent />} title="Increase Indent" />
            <TbSep />
            <TbButton icon={<IconBorders />} title="Borders" caret />
            <TbButton icon={<IconFillColor />} title="Fill Color" caret />
            <TbButton icon={<IconFontColor />} title="Font Color" caret />
          </OfficeToolbar>
        </ToolbarRow>

        {/* Formula bar */}
        <div className="flex h-[24px] items-center gap-[3px] px-[3px]">
          <div className="flex h-[19px] w-[76px] shrink-0 items-stretch border border-[#7f9db9] bg-white">
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-1 font-xp text-[11px] text-black outline-none"
              value={nameBox}
              readOnly
              aria-label="Name box"
            />
            <span className="flex w-[13px] items-center justify-center border-l border-[#c3d3f0] bg-[linear-gradient(180deg,#e9f0fd_0%,#c6d8f7_100%)]">
              <TinyCaret />
            </span>
          </div>
          <span className="mx-[2px] h-[18px] w-px bg-[#6a8ccb] shadow-[1px_0_0_#fff]" aria-hidden />
          <span
            className="flex h-[19px] w-[22px] shrink-0 items-center justify-center font-['Times_New_Roman',serif] text-[13px] italic text-[#1a1a1a]"
            title="Insert Function"
            aria-hidden
          >
            fx
          </span>
          <input
            className="h-[19px] min-w-0 flex-1 border border-[#7f9db9] bg-white px-1 font-xp text-[11px] outline-none"
            value={isEditing ? draft : activeValue}
            onFocus={() => beginEditing(isEditing ? draft : activeValue)}
            onChange={(e) => {
              setDraft(e.target.value)
              setIsEditing(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitDraft(e.currentTarget.value)
                moveActive(1, 0)
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                setIsEditing(false)
                setDraft(activeValue)
              }
            }}
            aria-label="Formula bar"
          />
        </div>
      </CommandDock>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <div className="flex min-h-0 min-w-0 flex-1 overflow-auto bg-white">
          <div
            className="relative bg-white"
            style={{
              width: rowHeaderW + cols.length * cellW,
              minHeight: colHeaderH + rows.length * cellH,
            }}
          >
            {/* select-all corner */}
            <div
              className={`sticky left-0 top-0 z-[5] border-b border-r border-[#9eb6ce] ${headerFace}`}
              style={{ width: rowHeaderW, height: colHeaderH }}
              aria-hidden
            >
              <svg className="absolute bottom-[2px] right-[2px]" width="8" height="8" viewBox="0 0 8 8">
                <path d="M8 0v8H0z" fill="#b6c7de" />
              </svg>
            </div>

            <div className="sticky top-0 z-[4] flex" style={{ marginLeft: rowHeaderW, marginTop: -colHeaderH }} aria-label="Column headers">
              {cols.map((c, i) => (
                <div
                  key={c}
                  className={[
                    'flex items-center justify-center border-b border-r border-[#9eb6ce] text-[11px] text-black',
                    i === active.c ? headerActive : headerFace,
                  ].join(' ')}
                  style={{ width: cellW, height: colHeaderH }}
                >
                  {c}
                </div>
              ))}
            </div>

            <div className="sticky left-0 z-[4]" style={{ width: rowHeaderW }} aria-label="Row headers">
              {rows.map((r, i) => (
                <div
                  key={r}
                  className={[
                    'flex items-center justify-center border-b border-r border-[#9eb6ce] text-[11px] text-black',
                    i === active.r ? headerActive : headerFace,
                  ].join(' ')}
                  style={{ height: cellH }}
                >
                  {r}
                </div>
              ))}
            </div>

            <div
              className="excel-sheet absolute left-0 top-0"
              style={{ paddingLeft: rowHeaderW, paddingTop: colHeaderH }}
              role="grid"
              aria-label="Spreadsheet grid"
              tabIndex={0}
              onKeyDown={handleGridKeyDown}
              onMouseDown={() => {
                // keep keyboard focus in grid like real Excel
                setTimeout(() => captureRef.current?.focus(), 0)
              }}
            >
              {rows.map((r, ri) => (
                <div key={r} className="flex">
                  {cols.map((c, ci) => {
                    const isActive = ri === active.r && ci === active.c
                    const key = `${c}${r}`
                    const value = cellsBySheet?.[sheet]?.[key] ?? ''
                    const displayValue = isActive && isEditing ? draft : value
                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => {
                          setActive({ r: ri, c: ci })
                          setIsEditing(false)
                        }}
                        onDoubleClick={() => beginEditing(value)}
                        className={[
                          `relative flex cursor-cell items-center border-b border-r ${gridLine} px-[2px] text-left`,
                          'bg-white font-[Arial,sans-serif] text-[12px] leading-none text-black',
                          isActive ? 'z-[2] outline-none' : '',
                        ].join(' ')}
                        style={{ width: cellW, height: cellH }}
                        aria-label={`Cell ${c}${r}`}
                      >
                        {isActive ? (
                          <span className="pointer-events-none absolute -inset-px border-2 border-black" aria-hidden />
                        ) : null}
                        <span className="truncate">{displayValue}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <input
              ref={captureRef}
              className="absolute left-[-9999px] top-[-9999px] h-px w-px opacity-0"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setIsEditing(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitDraft(e.currentTarget.value)
                  moveActive(1, 0)
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setIsEditing(false)
                  setDraft(activeValue)
                }
              }}
              onBlur={() => {
                // If focus leaves mid-edit (e.g. click elsewhere), commit like Excel.
                if (isEditing) commitDraft()
                setIsEditing(false)
              }}
              aria-hidden="true"
              tabIndex={-1}
            />

            {/* fill handle */}
            <div
              className="pointer-events-none absolute z-[3]"
              aria-hidden
              style={{
                left: rowHeaderW + active.c * cellW + cellW - 4,
                top: colHeaderH + active.r * cellH + cellH - 4,
                width: 6,
                height: 6,
                background: '#000',
                border: '1px solid #fff',
              }}
            />
          </div>
        </div>

        {/* Sheet tabs + horizontal scroll track */}
        <div className="flex h-[18px] shrink-0 items-stretch border-t border-[#9eb6ce] bg-[#ece9d8]">
          <div className="flex shrink-0 items-center px-[2px]" aria-hidden>
            <TabScroll d="M0 0h1.6v7H0zM9 0v7L2.4 3.5z" />
            <TabScroll d="M7.5 0v7L1 3.5z" />
            <TabScroll d="M1.5 0v7L8 3.5z" />
            <TabScroll d="M0 0v7l6.6-3.5zM7.4 0H9v7H7.4z" />
          </div>
          <div className="flex min-w-0 items-start overflow-hidden pl-[2px]" role="tablist" aria-label="Worksheets">
            {['Sheet1', 'Sheet2', 'Sheet3'].map((s, i) => {
              const isActive = sheet === s
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSheet(s)}
                  className={[
                    'group relative -ml-[6px] h-[17px] cursor-default px-[13px] text-[11px] text-black first:ml-0',
                    isActive ? 'font-bold' : '',
                  ].join(' ')}
                  style={{ zIndex: isActive ? 5 : 3 - i }}
                >
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 17" preserveAspectRatio="none" aria-hidden>
                    <path
                      d="M0 0.5 L6 16.5 L94 16.5 L100 0.5"
                      fill={isActive ? '#fff' : '#f0f0ea'}
                      stroke="#6d6d6d"
                      vectorEffect="non-scaling-stroke"
                      className={isActive ? '' : 'group-hover:fill-white'}
                    />
                  </svg>
                  <span className="relative">{s}</span>
                </button>
              )
            })}
          </div>
          <span className="ml-1 w-[5px] shrink-0 border-x border-[#b5b2a5] bg-[#ece9d8]" aria-hidden />
          <span className="min-w-[60px] flex-1 border-l border-[#d6d3c6] bg-[repeating-linear-gradient(45deg,#f3f1ea_0_2px,#ebe8de_2px_3px)]" aria-hidden />
        </div>
      </div>

      <OfficeStatusBar>
        <StatusPanel grow>Ready</StatusPanel>
        <StatusPanel className="hidden w-[120px] sm:flex"> </StatusPanel>
        <StatusPanel className="w-[44px]">NUM</StatusPanel>
        <SizeGrip />
      </OfficeStatusBar>
    </div>
  )
}
