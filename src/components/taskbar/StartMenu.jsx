import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import profileImage from '../../assets/mine/profile.webp'
import { getAppById, getDesktopApps } from '../../registry/apps'
import { useShellStore } from '../../stores/useShellStore'
import { openExternalUrl } from '../../utils/openExternalUrl'
import { openForegroundPreserveStack } from '../../utils/windowStackUrl'
import XpIconImage from '../desktop/XpIconImage'

const menuItem = 'xp-menu-item select-none'

const PINNED_LEFT = ['ie', 'gmail', 'welcome', 'winamp', 'my_docs', 'my_computer']

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#3d8bfd" stroke="#0b3f9e" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontFamily="Tahoma, sans-serif"
        fontSize="13"
        fontWeight="bold"
        fill="#fff"
      >
        ?
      </text>
    </svg>
  )
}

function ControlPanelIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="1.5" fill="#e9e4d0" stroke="#6b6656" />
      <rect x="5" y="8" width="11" height="1.6" fill="#8a9bb8" />
      <rect x="5" y="12" width="14" height="1.6" fill="#8a9bb8" />
      <rect x="5" y="16" width="8" height="1.6" fill="#8a9bb8" />
      <circle cx="17" cy="8.8" r="2" fill="#3d8bfd" stroke="#0b3f9e" />
      <circle cx="7" cy="12.8" r="2" fill="#3d8bfd" stroke="#0b3f9e" />
      <circle cx="15" cy="16.8" r="2" fill="#3d8bfd" stroke="#0b3f9e" />
    </svg>
  )
}

function StartIcon({ src, node }) {
  return (
    <span className="xp-start-icon" aria-hidden>
      {node ?? <XpIconImage src={src} className="h-6 w-6 object-contain" />}
    </span>
  )
}

/** Two-line entry, as XP uses for Internet / E-mail. */
function StartTwoLineItem({ label, subtitle, iconSrc, onSelect }) {
  return (
    <button type="button" className={`${menuItem} xp-start-row`} role="menuitem" onClick={onSelect}>
      <StartIcon src={iconSrc} />
      <span className="flex min-w-0 flex-col leading-[1.15]">
        <span className="truncate font-bold">{label}</span>
        <span className="xp-start-sub truncate">{subtitle}</span>
      </span>
    </button>
  )
}

function StartSingleItem({ label, iconSrc, iconNode, onSelect }) {
  return (
    <button type="button" className={`${menuItem} xp-start-row`} role="menuitem" onClick={onSelect}>
      <StartIcon src={iconSrc} node={iconNode} />
      <span className="truncate">{label}</span>
    </button>
  )
}

/** Rows in the flyout keep XP's tighter 16px icon rhythm. */
function FlyoutItem({ label, iconSrc, onSelect }) {
  return (
    <button type="button" className={`${menuItem} flyout-row`} role="menuitem" onClick={onSelect}>
      <span className="xp-menu-gutter" aria-hidden>
        <XpIconImage src={iconSrc} className="h-4 w-4 object-contain" />
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}

export default function StartMenu({ open, onRequestClose }) {
  const wrapperRef = useRef(null)
  const panelRef = useRef(null)
  const allProgramsRef = useRef(null)
  const allProgramsArrowRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const setWallpaperSettingsOpen = useShellStore((s) => s.setWallpaperSettingsOpen)
  const [allProgramsOpen, setAllProgramsOpen] = useState(false)
  const [flyoutPos, setFlyoutPos] = useState({ left: 0, bottom: 46 })

  useEffect(() => {
    if (!open) {
      setAllProgramsOpen(false)
      return
    }

    function onPointerDown(event) {
      if (!wrapperRef.current) return
      if (wrapperRef.current.contains(event.target)) return
      onRequestClose()
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        if (allProgramsOpen) setAllProgramsOpen(false)
        else onRequestClose()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onRequestClose, allProgramsOpen])

  /*
   * XP opens the flyout at the green arrow on the All Programs row — not at the
   * outer edge of the Start menu — and aligns its bottom to that row. Measure the
   * arrow so the flyout follows the row if the menu's metrics change.
   */
  useEffect(() => {
    if (!allProgramsOpen) return
    const panel = panelRef.current
    const arrow = allProgramsArrowRef.current
    if (!panel || !arrow) return
    const panelRect = panel.getBoundingClientRect()
    const arrowRect = arrow.getBoundingClientRect()
    setFlyoutPos({
      left: Math.max(0, Math.round(arrowRect.right - panelRect.left) - 2),
      bottom: Math.max(0, Math.round(panelRect.bottom - arrowRect.bottom)),
    })
  }, [allProgramsOpen, open])

  if (!open) return null

  function openApp(appId) {
    const app = getAppById(appId)
    onRequestClose()
    if (!app) return
    if (app.externalUrl) {
      openExternalUrl(app.externalUrl)
      return
    }
    if (app.path) openForegroundPreserveStack(navigate, location, app.path, app.id)
  }

  function openControlPanel() {
    onRequestClose()
    setWallpaperSettingsOpen(true)
  }

  const ie = getAppById('ie')
  const mail = getAppById('gmail')
  const pinnedLeft = PINNED_LEFT.slice(2).map((id) => getAppById(id)).filter(Boolean)
  const myDocs = getAppById('my_docs')
  const myComputer = getAppById('my_computer')
  const programs = getDesktopApps()

  return (
    <div className="absolute bottom-[calc(100%-1px)] left-0 z-50" ref={wrapperRef}>
      <div
        ref={panelRef}
        id="xp-start-menu"
        className="xp-start-menu relative max-h-[calc(100svh-40px)] w-[min(430px,calc(100vw-16px))] overflow-y-auto overflow-x-hidden border-b-0"
        role="menu"
        aria-label="Start menu"
      >
        <div className="xp-start-menu-header flex items-center gap-3 px-3 py-2.5">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[3px] border-2 border-white/55 bg-gradient-to-br from-xp-avatar-t to-xp-avatar-b shadow-xp-avatar">
            <img
              src={profileImage}
              alt=""
              className="h-full w-full object-cover"
              draggable="false"
            />
          </div>
          <div className="text-[14px] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.45)]">
            Saiful
          </div>
        </div>

        <div className="grid min-h-[320px] grid-cols-[1.05fr_1fr]">
          <div className="xp-start-left flex flex-col py-1.5" role="presentation">
            <StartTwoLineItem
              label="Internet"
              subtitle={ie?.title ?? 'Internet Explorer'}
              iconSrc={ie?.icon}
              onSelect={() => openApp('ie')}
            />
            <StartTwoLineItem
              label="E-mail"
              subtitle={mail?.title ?? mail?.desktop?.label ?? 'Gmail'}
              iconSrc={mail?.icon}
              onSelect={() => openApp('gmail')}
            />
            <div className="xp-menu-sep" role="separator" />
            {pinnedLeft.map((app) => (
              <StartSingleItem
                key={app.id}
                label={app.desktop?.label ?? app.title}
                iconSrc={app.icon}
                onSelect={() => openApp(app.id)}
              />
            ))}
            <button
              type="button"
              ref={allProgramsRef}
              className={`${menuItem} xp-allprograms-row mt-auto font-bold`}
              role="menuitem"
              aria-expanded={allProgramsOpen}
              aria-haspopup="menu"
              onClick={() => setAllProgramsOpen((openPrograms) => !openPrograms)}
            >
              <span className="flex-1">All Programs</span>
              <span ref={allProgramsArrowRef} className="xp-allprograms-arrow" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#3f9d33" stroke="#1b5a11" />
                  <path d="M9.5 6.8 16.2 12l-6.7 5.2z" fill="#fff" />
                </svg>
              </span>
            </button>
          </div>

          <div className="xp-start-right py-1.5" role="presentation">
            <StartSingleItem
              label="My Documents"
              iconSrc={myDocs?.icon}
              onSelect={() => openApp('my_docs')}
            />
            <StartSingleItem
              label="My Computer"
              iconSrc={myComputer?.icon}
              onSelect={() => openApp('my_computer')}
            />
            <div className="xp-menu-sep" role="separator" />
            <StartSingleItem
              label="Help and Support"
              iconNode={<HelpIcon />}
              onSelect={() => openApp('welcome')}
            />
            <StartSingleItem
              label="Control Panel"
              iconNode={<ControlPanelIcon />}
              onSelect={openControlPanel}
            />
          </div>
        </div>

        <div className="xp-start-footer grid grid-cols-2 gap-px px-2 pb-2 pt-1.5">
          <button
            type="button"
            className="flex h-8 cursor-default items-center justify-center gap-1.5 rounded border border-black/45 bg-black/15 font-xp text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105"
            onClick={onRequestClose}
          >
            {/* XP's footer icons are coloured: a yellow key for Log Off, a red
                power button for Turn Off. */}
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4">
              <circle cx="4.6" cy="6" r="3.1" fill="#ffd24a" stroke="#8a6b00" />
              <circle cx="4.6" cy="6" r="1.1" fill="#fffbe0" />
              <path d="M6.8 8.2 13 13.4" stroke="#d9b13a" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M11.2 11.7l1.6 1.7M12.9 10.1l1.7 1.7" stroke="#8a6b00" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Log Off
          </button>
          <button
            type="button"
            className="flex h-8 cursor-default items-center justify-center gap-1.5 rounded border border-black/45 bg-black/15 font-xp text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105"
            onClick={onRequestClose}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4">
              <circle cx="8" cy="8" r="7" fill="#d0342c" stroke="#7a1712" />
              <path d="M8 3.6v4.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              <path
                d="M5.2 5.5a4.3 4.3 0 1 0 5.6 0"
                fill="none"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            Turn Off Computer...
          </button>
        </div>
      </div>

      {/* All Programs flyout: a second popup to the right, not an overlay. */}
      {allProgramsOpen ? (
        <div
          className="xp-menu absolute z-10 max-h-[70svh] w-[250px] overflow-y-auto"
          style={{ left: flyoutPos.left, bottom: flyoutPos.bottom }}
          role="menu"
          aria-label="All Programs"
        >
          {programs.map((app) => (
            <FlyoutItem
              key={app.id}
              label={app.desktop.label}
              iconSrc={app.icon}
              onSelect={() => openApp(app.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
