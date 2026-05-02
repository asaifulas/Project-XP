import { useEffect, useMemo, useRef, useState } from 'react'

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

  const disabledBtn =
    'cursor-not-allowed select-none opacity-80 grayscale-[0.35] disabled:pointer-events-none disabled:opacity-70'
  const toolBtn =
    'inline-flex h-[20px] w-[20px] items-center justify-center text-[9px] font-bold text-zinc-700'
  const toolGroup =
    'inline-flex h-[22px] items-stretch overflow-hidden rounded-sm border border-black/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
  const toolSep = 'w-px bg-black/20'

  const officeBlueStrip =
    'bg-[linear-gradient(180deg,#eaf2ff_0%,#cfe0ff_40%,#b4ccfb_100%)]'

  const headerFace =
    'bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_55%,#efefef_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.08)]'

  const cellW = 64
  const cellH = 18
  const rowHeaderW = 36
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
          aria-label="Excel menu"
        >
          {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Data', 'Window', 'Help'].map(
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
            {['N', 'O', 'S', 'P', '🖨', '↩', '↪', '∑'].map((t, i) => (
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
            {['B', 'I', 'U', '%', '$', '↔', '↕'].map((t, i) => (
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
                {i !== 6 ? <span className={toolSep} /> : null}
              </span>
            ))}
          </div>
        </div>

        <div className="flex h-[28px] items-center gap-1 border-b border-black/25 px-1 py-0.5">
          <div className="flex items-center gap-1">
            <input
              className="h-[20px] w-[56px] rounded-sm border border-black/25 bg-white px-1 font-mono text-[11px]"
              value={nameBox}
              readOnly
              aria-label="Name box"
            />
            <div className="flex h-[20px] w-[18px] items-center justify-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f8f8f8_0%,#dfdfdf_100%)] text-[10px] text-black/70">
              ▾
            </div>
          </div>

          <div className="flex h-[20px] w-[20px] items-center justify-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f8f8f8_0%,#dfdfdf_100%)] text-[10px] text-black/70">
            fx
          </div>

          <input
            className="h-[20px] min-w-0 flex-1 rounded-sm border border-black/25 bg-white px-2 text-[11px]"
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
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#808080]">
        <div className="flex min-h-0 min-w-0 flex-1 overflow-auto bg-[#808080] p-2">
          <div
            className="relative bg-white shadow-[1px_1px_0_#000,2px_2px_6px_rgba(0,0,0,0.35)]"
            style={{
              width: rowHeaderW + cols.length * cellW + 20,
              minHeight: colHeaderH + rows.length * cellH + 12,
            }}
          >
            <div
              className={`sticky left-0 top-0 z-[5] border-b border-r border-black/20 ${headerFace}`}
              style={{ width: rowHeaderW, height: colHeaderH }}
              aria-hidden
            />

            <div
              className="sticky top-0 z-[4] flex border-b border-black/20"
              style={{ marginLeft: rowHeaderW }}
              aria-label="Column headers"
            >
              {cols.map((c, i) => (
                <div
                  key={c}
                  className={[
                    'flex items-center justify-center border-r border-black/20 text-[11px] text-black/80',
                    headerFace,
                    i === active.c ? 'bg-[linear-gradient(180deg,#fff9cf_0%,#f2df8b_100%)]' : '',
                  ].join(' ')}
                  style={{ width: cellW, height: colHeaderH }}
                >
                  {c}
                </div>
              ))}
            </div>

            <div
              className="sticky left-0 z-[4] border-r border-black/20"
              style={{ top: colHeaderH, width: rowHeaderW }}
              aria-label="Row headers"
            >
              {rows.map((r, i) => (
                <div
                  key={r}
                  className={[
                    'flex items-center justify-center border-b border-black/10 text-[11px] text-black/75',
                    headerFace,
                    i === active.r ? 'bg-[linear-gradient(180deg,#fff9cf_0%,#f2df8b_100%)]' : '',
                  ].join(' ')}
                  style={{ height: cellH }}
                >
                  {r}
                </div>
              ))}
            </div>

            <div
              className="absolute left-0 top-0"
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
                          'relative flex items-center border-b border-r border-black/10 px-1 text-left',
                          'bg-white text-[11px] leading-none text-black',
                          isActive ? 'z-[2] outline-none' : '',
                        ].join(' ')}
                        style={{ width: cellW, height: cellH }}
                        aria-label={`Cell ${c}${r}`}
                      >
                        {isActive ? (
                          <span
                            className="pointer-events-none absolute inset-0 border border-[#0b5bd3]"
                            aria-hidden
                          />
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

            <div
              className="pointer-events-none absolute"
              aria-hidden
              style={{
                left: rowHeaderW + active.c * cellW + cellW - 3,
                top: colHeaderH + active.r * cellH + cellH - 3,
                width: 6,
                height: 6,
                background: '#0b5bd3',
                border: '1px solid #083a8b',
              }}
            />
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-black/20 bg-[#d4d0c8]">
        <div className="flex h-[22px] items-center gap-1 border-b border-black/15 px-1 text-[10px] text-zinc-900">
          <div className="flex h-[18px] items-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            Ready
          </div>
          <div className="h-[18px] w-px bg-black/20" aria-hidden />
          <div className="flex min-w-0 flex-1 items-end gap-1">
            {['Sheet1', 'Sheet2', 'Sheet3'].map((s) => {
              const isActive = sheet === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSheet(s)}
                  className={[
                    'relative h-[18px] px-3 text-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
                    isActive
                      ? 'z-[2] -mb-px border border-black/35 bg-white font-semibold'
                      : 'border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] text-black/75 hover:bg-[linear-gradient(180deg,#ffffff_0%,#efe6c7_100%)]',
                  ].join(' ')}
                  style={{
                    clipPath:
                      'polygon(8px 0%, calc(100% - 6px) 0%, 100% 100%, 0% 100%)',
                  }}
                >
                  {s}
                </button>
              )
            })}
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="ml-1 flex h-[18px] w-[18px] items-center justify-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] text-[12px] text-black/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              title="Insert Worksheet"
            >
              +
            </button>
          </div>

          <div
            className="flex h-[18px] items-center rounded-sm border border-black/25 bg-[linear-gradient(180deg,#f6f3e6_0%,#e7e1cf_100%)] px-2 text-[10px] text-black/70"
            aria-label="Zoom"
          >
            100%
          </div>
        </div>
      </footer>
    </div>
  )
}

