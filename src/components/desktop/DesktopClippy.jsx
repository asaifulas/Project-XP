import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDesktopApps } from '../../registry/apps'
import { openExternalUrl } from '../../utils/openExternalUrl'
import { openForegroundPreserveStack } from '../../utils/windowStackUrl'

const clippySrcList = Object.values(
  import.meta.glob('../../assets/clippy/*.gif', { eager: true, import: 'default' }),
)

/** Larger than source (100×100) for readability; scaled with soft glow. */
const CLIPPY_PX = 120
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
const CLIPPY_SESSION_KEY = 'porto-desktop-clippy-gif'
const PHONE_LAYOUT_QUERY = '(max-width: 767px)'

/** Documents on the desktop, plus Winamp and CertiMagic. Not folders or system icons. */
const CLIPPY_NAV_IDS = new Set([
  'welcome',
  'journey',
  'profile',
  'experience',
  'biodata',
  'about',
  'project',
  'side_project',
  'acrobat_resume',
  'acrobat_projects',
  'winamp',
  'certimagic',
])

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

/** Phone has no side-by-side sidebar, so only the character has to stay on screen. */
function isPhoneContainer(containerWidth) {
  return containerWidth < 768
}

function clampClippyPosition(containerWidth, containerHeight, groupWidth, groupHeight, x, y) {
  if (isPhoneContainer(containerWidth)) {
    const extraW = Math.max(0, groupWidth - CLIPPY_PX)
    const extraH = Math.max(0, groupHeight - CLIPPY_PX)
    return {
      x: clamp(x, -extraW, Math.max(-extraW, containerWidth - groupWidth)),
      y: clamp(y, -extraH, Math.max(-extraH, containerHeight - groupHeight)),
    }
  }

  return {
    x: clamp(x, 0, maxClippyX(containerWidth, groupWidth)),
    y: clamp(y, 0, Math.max(0, containerHeight - groupHeight)),
  }
}

function ClippyBalloon({ items, onNavigate, onClose, onShuffleLook, ignoreClicksUntilRef }) {
  function swallowOpeningClick(event) {
    if (Date.now() >= ignoreClicksUntilRef.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div
      className="xp-clippy-balloon pointer-events-auto max-h-[min(320px,45vh)] shrink-0"
      onClickCapture={swallowOpeningClick}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation hints"
        className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center border border-black bg-[#ece9d8] text-[12px] leading-none text-black hover:bg-[#c42b1c] hover:text-white"
      >
        ×
      </button>
      <p className="mb-1 border-b border-black/30 pb-1 font-bold">It looks like you want to go to…</p>
      <nav aria-label="Site navigation from Clippy">
        <ul className="max-h-[min(220px,32vh)] overflow-y-auto no-scrollbar">
          {items.map((item) => (
            <li key={item.key}>
              <button type="button" onClick={() => onNavigate(item)} className="xp-clippy-link">
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-1 border-t border-black/30 pt-1">
        <button type="button" onClick={onShuffleLook} className="xp-clippy-link">
          Try a different assistant look
        </button>
      </p>
      <div className="xp-clippy-tail" aria-hidden />
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
  /** Phone fires a click on whatever appears under the finger after the balloon opens. */
  const ignoreBalloonClicksUntilRef = useRef(0)

  const [src, setSrc] = useState(getInitialClippySrc)
  const [pos, setPos] = useState({ x: MARGIN, y: MARGIN })
  const [balloonOpen, setBalloonOpen] = useState(true)
  const [phoneExpanded, setPhoneExpanded] = useState(false)
  const [isPhone, setIsPhone] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(PHONE_LAYOUT_QUERY).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(PHONE_LAYOUT_QUERY)
    const onChange = () => setIsPhone(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const shuffleClippyLook = () => {
    const next = pickRandomClippySrc(src)
    if (!next) return
    writeSessionClippySrc(next)
    setSrc(next)
  }

  const navItems = useMemo(() => {
    return getDesktopApps()
      .filter((app) => CLIPPY_NAV_IDS.has(app.id))
      .map((app) => ({
        key: app.id,
        label: app.desktop.label,
        path: app.path ?? '/',
        appId: app.id,
        externalUrl: app.externalUrl ?? null,
      }))
  }, [])

  const handleNav = (item) => {
    if (item.externalUrl) {
      openExternalUrl(item.externalUrl)
      return
    }
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

    let x
    let y
    if (isPhoneContainer(w)) {
      x = w - gw - MARGIN
      y = MARGIN
    } else {
      const maxX = maxClippyX(w, gw)
      const minX = MARGIN
      const flushBeside = Math.min(maxX, Math.max(minX, w - gw - WIDGET_COL_W - WIDGET_INSET_R - WIDGET_GAP))
      const nudgeLeft = Math.min(56, Math.max(0, flushBeside - minX))
      x = flushBeside - (nudgeLeft > 0 ? Math.random() * nudgeLeft * 0.4 : 0)

      const maxY = Math.max(MARGIN, h - gh - MARGIN)
      const bandTop = WIDGET_INSET_T
      const bandBottom = Math.min(WIDGET_INSET_T + 180, maxY)
      y = bandBottom > bandTop ? bandTop + Math.random() * (bandBottom - bandTop) : MARGIN
    }

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
      ignoreBalloonClicksUntilRef.current = Date.now() + 500
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
        className="pointer-events-none absolute flex flex-col items-start gap-1"
        style={{ left: pos.x, top: pos.y }}
      >
        {balloonOpen && isPhone && !phoneExpanded ? (
          <button
            type="button"
            className="xp-clippy-prompt pointer-events-auto relative"
            onClick={() => setPhoneExpanded(true)}
          >
            Need help? Ask Clippy
            <span className="xp-clippy-tail" aria-hidden />
          </button>
        ) : null}
        {balloonOpen && (!isPhone || phoneExpanded) ? (
          <ClippyBalloon
            items={navItems}
            onNavigate={handleNav}
            onClose={() => {
              setPhoneExpanded(false)
              setBalloonOpen(false)
            }}
            onShuffleLook={shuffleClippyLook}
            ignoreClicksUntilRef={ignoreBalloonClicksUntilRef}
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
