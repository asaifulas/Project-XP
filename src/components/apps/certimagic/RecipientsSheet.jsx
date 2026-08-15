import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useCertiMagicStore } from '../../../stores/useCertiMagicStore'
import {
  COL_HEADER_H,
  COL_W,
  GRID_COLS,
  GRID_ROWS,
  ROW_H,
  ROW_HEADER_W,
  colLetter,
} from './excelGrid.js'

function HeaderCell({ index, column, active, onActivate }) {
  const renameColumn = useCertiMagicStore((s) => s.renameColumn)
  const [draft, setDraft] = useState(column)

  useEffect(() => {
    setDraft(column)
  }, [column])

  function commit() {
    const next = draft.trim()
    if (!next && !column) {
      setDraft('')
      return
    }
    if (next === column) {
      setDraft(column)
      return
    }
    renameColumn(index, draft)
  }

  return (
    <div
      className={[
        'flex h-full items-center gap-1 border-b border-r border-black/20 bg-[#efefef] px-1',
        active ? 'bg-[#f2df8b]' : '',
      ].join(' ')}
    >
      <span className="shrink-0 text-[10px] text-black/55">{colLetter(index)}</span>
      <input
        value={draft}
        placeholder={colLetter(index)}
        onFocus={onActivate}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            setDraft(column)
          }
        }}
        className="h-[18px] min-w-0 flex-1 bg-transparent px-0.5 font-semibold outline-none"
        aria-label={`Column ${colLetter(index)} header`}
      />
    </div>
  )
}

export default function RecipientsSheet() {
  const columns = useCertiMagicStore((s) => s.columns)
  const rows = useCertiMagicStore((s) => s.rows)
  const setCellAt = useCertiMagicStore((s) => s.setCellAt)
  const addRow = useCertiMagicStore((s) => s.addRow)
  const [active, setActive] = useState({ r: 0, c: 0 })
  const [scroll, setScroll] = useState({ left: 0, top: 0 })
  const [view, setView] = useState({ w: 900, h: 480 })
  const scrollerRef = useRef(null)

  useLayoutEffect(() => {
    const node = scrollerRef.current
    if (!node) return undefined
    function measure() {
      setView({ w: node.clientWidth, h: node.clientHeight })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const overscan = 3
  const colStart = Math.max(0, Math.floor(scroll.left / COL_W) - overscan)
  const colEnd = Math.min(GRID_COLS, colStart + Math.ceil(view.w / COL_W) + overscan + 2)
  const rowStart = Math.max(0, Math.floor(scroll.top / ROW_H) - overscan)
  const rowEnd = Math.min(GRID_ROWS, rowStart + Math.ceil(view.h / ROW_H) + overscan + 2)
  const totalW = ROW_HEADER_W + GRID_COLS * COL_W
  const totalH = COL_HEADER_H + GRID_ROWS * ROW_H

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#808080]">
      <div className="flex shrink-0 items-center gap-2 border-b border-black/20 bg-[#ece9d8] px-2 py-1 text-[11px]">
        <button
          type="button"
          onClick={addRow}
          className="rounded-sm border border-black/30 bg-[linear-gradient(180deg,#f8f8f8_0%,#dfdfdf_100%)] px-2 py-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        >
          Add row
        </button>
        <span className="font-mono text-black/80">
          {colLetter(active.c)}
          {active.r + 1}
        </span>
        <span className="text-black/70">
          {GRID_COLS} columns × {GRID_ROWS} rows · scroll like Excel · headers become merge fields
        </span>
      </div>
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-auto bg-[#808080]"
        onScroll={(e) => {
          const node = e.currentTarget
          setScroll({ left: node.scrollLeft, top: node.scrollTop })
        }}
      >
        <div className="relative m-2 bg-white shadow-[1px_1px_0_#000,2px_2px_6px_rgba(0,0,0,0.35)]" style={{ width: totalW, height: totalH }}>
          <div
            className="sticky top-0 z-[5] flex"
            style={{ height: COL_HEADER_H, width: totalW }}
          >
            <div
              className="sticky left-0 z-[6] border-b border-r border-black/20 bg-[#efefef]"
              style={{ width: ROW_HEADER_W, height: COL_HEADER_H, flexShrink: 0 }}
            />
            <div style={{ width: colStart * COL_W, flexShrink: 0 }} />
            {Array.from({ length: colEnd - colStart }, (_, i) => {
              const c = colStart + i
              return (
                <div key={c} style={{ width: COL_W, flexShrink: 0, height: COL_HEADER_H }}>
                  <HeaderCell
                    index={c}
                    column={columns[c] ?? ''}
                    active={c === active.c}
                    onActivate={() => setActive((prev) => ({ ...prev, c }))}
                  />
                </div>
              )
            })}
          </div>

          <div style={{ height: rowStart * ROW_H }} />

          {Array.from({ length: rowEnd - rowStart }, (_, i) => {
            const r = rowStart + i
            return (
              <div key={r} className="flex" style={{ height: ROW_H, width: totalW }}>
                <div
                  className={[
                    'sticky left-0 z-[4] flex items-center justify-center border-b border-r border-black/20 bg-[#efefef] text-[11px] text-black/75',
                    r === active.r ? 'bg-[#f2df8b]' : '',
                  ].join(' ')}
                  style={{ width: ROW_HEADER_W, height: ROW_H }}
                >
                  {r + 1}
                </div>
                <div style={{ width: colStart * COL_W, flexShrink: 0 }} />
                {Array.from({ length: colEnd - colStart }, (_, ci) => {
                  const c = colStart + ci
                  const column = columns[c]
                  const isActive = r === active.r && c === active.c
                  return (
                    <input
                      key={c}
                      value={column ? (rows[r]?.[column] ?? '') : ''}
                      onFocus={() => setActive({ r, c })}
                      onChange={(e) => setCellAt(r, c, e.target.value)}
                      className={[
                        'box-border border-b border-r border-black/15 bg-white px-1 text-[11px] outline-none',
                        isActive ? 'ring-1 ring-inset ring-[#0b5bd3]' : '',
                      ].join(' ')}
                      style={{ width: COL_W, height: ROW_H, flexShrink: 0 }}
                      aria-label={`${colLetter(c)}${r + 1}`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
