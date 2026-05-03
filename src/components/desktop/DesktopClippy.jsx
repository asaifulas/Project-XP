import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDesktopApps } from '../../registry/apps'
import { openForegroundPreserveStack } from '../../utils/windowStackUrl'

const clippySrcList = Object.values(
  import.meta.glob('../../assets/clippy/*.gif', { eager: true, import: 'default' }),
)

/** Larger than source (100×100) for readability; scaled with soft glow. */
const CLIPPY_PX = 168
/** Horizontal layout mirrors `WidgetsSidebar.jsx`: `w-[260px]`, `right-3`, `top-3` (also `bottom-[42px]` on sidebar — workspace height already excludes taskbar). */
const WIDGET_COL_W = 260
const WIDGET_INSET_R = 12
const WIDGET_INSET_T = 12
/** Gap between Clippy group right edge and the widget column. */
const WIDGET_GAP = 12

const MARGIN = 12

/** Fallback footprint before first layout measure. */
const GROUP_FALLBACK_W = 380
const GROUP_FALLBACK_H = 200

/** Clicks shorter than this distance count as tap (reopen balloon), not drag. */
const DRAG_THRESHOLD_PX = 8
/** `border-y-[8px]` triangle → half of visual height for centering on Clippy. */
const TAIL_HALF_H = 8

const CLIPPY_SESSION_KEY = 'porto-desktop-clippy-gif'

function pickRandomClippySrc(exclude = null) {
  if (clippySrcList.length === 0) return ''
  if (clippySrcList.length === 1) return clippySrcList[0] ?? ''
  let picked = ''
  for (let i = 0; i < 32; i += 1) {
    picked = clippySrcList[Math.floor(Math.random() * clippySrcList.length)] ?? ''
    if (picked && picked !== exclude) break
  }
  return picked
}

function readSessionClippySrc() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CLIPPY_SESSION_KEY)
    if (raw && clippySrcList.includes(raw)) return raw
  } catch {
    /* private mode / SSR */
  }
  return null
}

function writeSessionClippySrc(url) {
  try {
    sessionStorage.setItem(CLIPPY_SESSION_KEY, url)
  } catch {
    /* ignore */
  }
}

/** One GIF per browser tab session; refresh reuses it until you shuffle in the balloon. */
function getInitialClippySrc() {
  const stored = readSessionClippySrc()
  if (stored) return stored
  const picked = pickRandomClippySrc()
  if (picked) writeSessionClippySrc(picked)
  return picked
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function widgetColumnLeftX(containerWidth) {
  return containerWidth - WIDGET_COL_W - WIDGET_INSET_R
}

/** Max `pos.x` so a group of width `gw` cannot overlap sticky / clock / calendar column. */
function maxClippyX(containerWidth, groupWidth) {
  return Math.max(0, widgetColumnLeftX(containerWidth) - WIDGET_GAP - groupWidth)
}

function clampClippyPosition(containerWidth, containerHeight, groupWidth, groupHeight, x, y) {
  return {
    x: clamp(x, 0, maxClippyX(containerWidth, groupWidth)),
    y: clamp(y, 0, Math.max(0, containerHeight - groupHeight)),
  }
}

function ClippyBalloon({ items, onNavigate, onClose, onShuffleLook, clippyPx }) {
  const tailBottomPx = clippyPx / 2 - TAIL_HALF_H

  return (
    <div className="pointer-events-auto relative flex max-h-[min(320px,45vh)] max-w-[min(240px,calc(100vw-20rem))] shrink-0 flex-col">
      <div
        className="relative rounded-xl border border-black/[0.06] bg-[#fffef0] px-2.5 pb-2 pl-2.5 pr-7 pt-2"
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.95), 0 6px 14px rgba(0,0,0,0.08), 0 18px 44px rgba(0,0,0,0.14), 0 36px 88px rgba(0,0,0,0.16), 0 56px 140px rgba(0,0,0,0.12)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation hints"
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded border border-zinc-500/40 bg-white/80 text-[13px] font-bold leading-none text-zinc-700 shadow-sm hover:bg-[#c42b1c] hover:text-white hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#316ac5]"
        >
          ×
        </button>
        <p className="mb-1.5 border-b border-amber-200/80 pb-1 text-[11px] font-bold leading-tight text-zinc-900">
          It looks like you want to go to…
        </p>
        <nav aria-label="Site navigation from Clippy">
          <ul className="max-h-[min(260px,38vh)] space-y-0.5 overflow-y-auto pr-0.5 text-[11px] leading-snug text-zinc-900 no-scrollbar">
            {items.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onNavigate(item)}
                  className="w-full rounded px-1 py-0.5 text-left text-[#0000ee] underline decoration-[#0000ee]/70 underline-offset-2 hover:bg-[#316ac5] hover:text-white hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#316ac5]"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-2 border-t border-amber-200/80 pt-1.5 text-[10px] text-zinc-600">
          <button
            type="button"
            onClick={onShuffleLook}
            className="text-[#0000ee] underline decoration-[#0000ee]/60 underline-offset-2 hover:bg-[#316ac5] hover:text-white hover:decoration-white"
          >
            Try a different assistant look
          </button>
        </p>
      </div>
      {/* Speech tail: horizontal toward Clippy, vertically centered on character (items-end aligns bottoms). */}
      <div
        className="pointer-events-none absolute left-full -ml-px h-0 w-0 border-y-[8px] border-l-[10px] border-y-transparent border-l-[#fffef0] [filter:drop-shadow(0_10px_22px_rgba(0,0,0,0.14))_drop-shadow(0_22px_48px_rgba(0,0,0,0.11))]"
        style={{ bottom: tailBottomPx, top: 'auto' }}
        aria-hidden
      />
    </div>
  )
}

/**
 * Draggable Clippy beside the sticky-notes region (initial spawn), above the taskbar
 * (positioned inside the desktop workspace only). High z-index so it floats over windows.
 */
export default function DesktopClippy() {
  const navigate = useNavigate()
  const location = useLocation()
  const boundsRef = useRef(null)
  const groupRef = useRef(null)
  const dragRef = useRef(null)
  const placedRef = useRef(false)

  const [src, setSrc] = useState(getInitialClippySrc)
  const [pos, setPos] = useState({ x: MARGIN, y: MARGIN })
  const [balloonOpen, setBalloonOpen] = useState(true)

  const shuffleClippyLook = () => {
    const next = pickRandomClippySrc(src)
    if (!next) return
    writeSessionClippySrc(next)
    setSrc(next)
  }

  const navItems = useMemo(() => {
    const desktop = getDesktopApps().map((app) => ({
      key: app.id,
      label: app.desktop.label,
      path: app.path,
      appId: app.id,
    }))
    return [{ key: 'home', label: 'Desktop', path: '/', appId: null }, ...desktop]
  }, [])

  const handleNav = (item) => {
    if (item.path === '/' && item.appId == null) {
      navigate({ pathname: '/', search: '' })
      return
    }
    openForegroundPreserveStack(navigate, location, item.path, item.appId)
  }

  useLayoutEffect(() => {
    const el = boundsRef.current
    const group = groupRef.current
    if (!el || !group || placedRef.current) return

    const w = el.clientWidth
    const h = el.clientHeight
    if (w <= 0 || h <= 0) return

    const gw = group.offsetWidth || GROUP_FALLBACK_W
    const gh = group.offsetHeight || GROUP_FALLBACK_H
    if (gw <= 0 || gh <= 0) return

    placedRef.current = true

    const maxX = maxClippyX(w, gw)
    const minX = MARGIN
    const flushBeside = Math.min(maxX, Math.max(minX, w - gw - WIDGET_COL_W - WIDGET_INSET_R - WIDGET_GAP))
    const nudgeLeft = Math.min(56, Math.max(0, flushBeside - minX))
    const x = flushBeside - (nudgeLeft > 0 ? Math.random() * nudgeLeft * 0.4 : 0)

    const maxY = Math.max(MARGIN, h - gh - MARGIN)
    const bandTop = WIDGET_INSET_T
    const bandBottom = Math.min(WIDGET_INSET_T + 180, maxY)
    const y =
      bandBottom > bandTop ? bandTop + Math.random() * (bandBottom - bandTop) : MARGIN

    setPos(clampClippyPosition(w, h, gw, gh, x, y))
  }, [])

  useEffect(() => {
    const panel = boundsRef.current
    const group = groupRef.current
    if (!panel || !group) return

    const rect = panel.getBoundingClientRect()
    const gw = group.offsetWidth || CLIPPY_PX
    const gh = group.offsetHeight || CLIPPY_PX

    setPos((p) => clampClippyPosition(rect.width, rect.height, gw, gh, p.x, p.y))
  }, [balloonOpen])

  const onPointerDown = (event) => {
    if (event.button !== 0) return

    const panel = boundsRef.current
    if (!panel) return

    const rect = panel.getBoundingClientRect()
    dragRef.current = {
      offsetX: event.clientX - rect.left - pos.x,
      offsetY: event.clientY - rect.top - pos.y,
      startClientX: event.clientX,
      startClientY: event.clientY,
      didDrag: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event) => {
    if (dragRef.current == null) return

    const panel = boundsRef.current
    const group = groupRef.current
    if (!panel) return

    const dx = event.clientX - dragRef.current.startClientX
    const dy = event.clientY - dragRef.current.startClientY
    if (dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
      dragRef.current.didDrag = true
    }

    const gw = group?.offsetWidth ?? GROUP_FALLBACK_W
    const gh = group?.offsetHeight ?? GROUP_FALLBACK_H

    const rect = panel.getBoundingClientRect()
    const nx = event.clientX - rect.left - dragRef.current.offsetX
    const ny = event.clientY - rect.top - dragRef.current.offsetY

    setPos(clampClippyPosition(rect.width, rect.height, gw, gh, nx, ny))
  }

  const endDrag = (event) => {
    const state = dragRef.current
    if (state && !state.didDrag && !balloonOpen) {
      setBalloonOpen(true)
    }

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
  }

  if (!src) return null

  return (
    <div
      ref={boundsRef}
      className="pointer-events-none absolute inset-0 z-[60] overflow-visible"
    >
      <div
        ref={groupRef}
        className="pointer-events-none absolute flex flex-row items-end gap-1"
        style={{ left: pos.x, top: pos.y }}
      >
        {balloonOpen ? (
          <ClippyBalloon
            items={navItems}
            onNavigate={handleNav}
            onClose={() => setBalloonOpen(false)}
            onShuffleLook={shuffleClippyLook}
            clippyPx={CLIPPY_PX}
          />
        ) : null}
        <div
          role="presentation"
          className="pointer-events-auto shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
          style={{ width: CLIPPY_PX, height: CLIPPY_PX }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <img
            src={src}
            alt=""
            width={CLIPPY_PX}
            height={CLIPPY_PX}
            className="pointer-events-none h-full w-full object-contain [filter:drop-shadow(0_8px_22px_rgba(0,0,0,0.15))_drop-shadow(0_22px_52px_rgba(0,0,0,0.14))_drop-shadow(0_40px_88px_rgba(0,0,0,0.1))]"
            draggable={false}
          />
          <span className="sr-only">Clippy assistant — drag the character to move</span>
        </div>
      </div>
    </div>
  )
}
