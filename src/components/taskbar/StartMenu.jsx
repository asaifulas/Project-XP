import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import profileImage from '../../assets/mine/profile.png'
import { getAppById, getDesktopApps } from '../../registry/apps'
import { useShellStore } from '../../stores/useShellStore'
import { openExternalUrl } from '../../utils/openExternalUrl'
import { openForegroundPreserveStack } from '../../utils/windowStackUrl'

const menuItem = 'xp-menu-item select-none'

const PINNED_LEFT = ['ie', 'gmail', 'welcome', 'winamp', 'my_docs', 'my_computer']
const PINNED_RIGHT = [
  { id: 'my_docs', label: 'My Documents' },
  { id: 'my_computer', label: 'My Computer' },
  { id: 'welcome', label: 'Help and Support' },
]

function ItemIcon({ src }) {
  return (
    <span className="xp-menu-gutter" aria-hidden>
      {src ? (
        <img src={src} alt="" className="h-4 w-4 object-contain" draggable="false" />
      ) : (
        <span className="h-4 w-4 rounded-sm bg-gradient-to-br from-xp-micon-t to-xp-micon-b" />
      )}
    </span>
  )
}

function StartMenuItem({ label, iconSrc, onSelect }) {
  return (
    <button type="button" className={menuItem} role="menuitem" onClick={onSelect}>
      <ItemIcon src={iconSrc} />
      <span className="truncate">{label}</span>
    </button>
  )
}

function StartMenuRightItem({ label, onSelect }) {
  return (
    <button type="button" className={menuItem} role="menuitem" onClick={onSelect}>
      <span className="xp-menu-gutter" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  )
}

export default function StartMenu({ open, onRequestClose }) {
  const panelRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const setWallpaperSettingsOpen = useShellStore((s) => s.setWallpaperSettingsOpen)
  const [allProgramsOpen, setAllProgramsOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      setAllProgramsOpen(false)
      return
    }

    function onPointerDown(event) {
      if (!panelRef.current) return
      if (panelRef.current.contains(event.target)) return
      onRequestClose()
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') onRequestClose()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onRequestClose])

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

  const pinnedLeft = PINNED_LEFT.map((id) => getAppById(id)).filter(Boolean)
  const programs = getDesktopApps()

  return (
    <div
      ref={panelRef}
      id="xp-start-menu"
      className="xp-start-menu absolute bottom-[calc(100%-1px)] left-0 z-50 w-[min(420px,calc(100vw-16px))] overflow-hidden border-b-0"
      role="menu"
      aria-label="Start menu"
    >
      <div className="xp-start-menu-header flex items-center gap-2.5 px-3 py-2.5">
        <div className="h-12 w-12 shrink-0 rounded border border-white/25 bg-gradient-to-br from-xp-avatar-t to-xp-avatar-b shadow-xp-avatar">
          <img
            src={profileImage}
            alt=""
            className="h-full w-full rounded object-cover"
            draggable="false"
          />
        </div>
        <div className="text-[13px] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.45)]">
          Saiful
        </div>
      </div>

      <div className="relative grid min-h-[280px] grid-cols-2">
        <div className="xp-start-left flex flex-col py-1.5" role="presentation">
          {pinnedLeft.slice(0, 2).map((app) => (
            <StartMenuItem
              key={app.id}
              label={app.id === 'ie' ? 'Internet' : 'E-mail'}
              iconSrc={app.icon}
              onSelect={() => openApp(app.id)}
            />
          ))}
          <div className="xp-menu-sep" role="separator" />
          {pinnedLeft.slice(2).map((app) => (
            <StartMenuItem
              key={app.id}
              label={app.desktop?.label ?? app.title}
              iconSrc={app.icon}
              onSelect={() => openApp(app.id)}
            />
          ))}
          <button
            type="button"
            className={`${menuItem} mt-auto font-bold`}
            role="menuitem"
            aria-expanded={allProgramsOpen}
            onClick={() => setAllProgramsOpen((openPrograms) => !openPrograms)}
          >
            <span className="xp-menu-gutter" aria-hidden>
              <span className="h-4 w-4 rounded-sm bg-gradient-to-br from-xp-micon-t to-xp-micon-b" />
            </span>
            <span>All Programs</span>
            <span className="ml-auto text-[10px] opacity-70" aria-hidden>
              {allProgramsOpen ? '◀' : '▶'}
            </span>
          </button>
        </div>

        <div className="xp-start-right py-2" role="presentation">
          {PINNED_RIGHT.map((item) => (
            <StartMenuRightItem
              key={item.label}
              label={item.label}
              onSelect={() => openApp(item.id)}
            />
          ))}
          <StartMenuRightItem label="Control Panel" onSelect={openControlPanel} />
        </div>

        {allProgramsOpen ? (
          <div
            className="xp-menu absolute inset-1 z-10 overflow-y-auto shadow-none"
            role="presentation"
          >
            <button
              type="button"
              className={`${menuItem} font-bold`}
              onClick={() => setAllProgramsOpen(false)}
            >
              <span className="xp-menu-gutter" aria-hidden>
                ◀
              </span>
              <span>All Programs</span>
            </button>
            <div className="xp-menu-sep" role="separator" />
            {programs.map((app) => (
              <StartMenuItem
                key={app.id}
                label={app.desktop.label}
                iconSrc={app.icon}
                onSelect={() => openApp(app.id)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="xp-start-footer grid grid-cols-2 gap-px px-2 pb-2 pt-1.5">
        <button
          type="button"
          className="flex h-7 cursor-default items-center justify-center gap-1.5 rounded border border-black/45 bg-black/15 font-xp text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105"
          onClick={onRequestClose}
        >
          {/* Flat monochrome glyphs, not emoji: color emoji render as 2024 clip-art
              on top of a 2001 chrome (and differ per platform). */}
          <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M8 1.5A3 3 0 0 0 5 4.5V6H4v9h8V6h-1V4.5a3 3 0 0 0-3-3Zm0 1.6a1.4 1.4 0 0 1 1.4 1.4V6H6.6V4.5A1.4 1.4 0 0 1 8 3.1Zm0 6.1a1.1 1.1 0 0 1 .6 2v1.6H7.4v-1.6a1.1 1.1 0 0 1 .6-2Z" />
          </svg>
          Log Off
        </button>
        <button
          type="button"
          className="flex h-7 cursor-default items-center justify-center gap-1.5 rounded border border-black/45 bg-black/15 font-xp text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105"
          onClick={onRequestClose}
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M8 2.4v4.8" />
            <path d="M4.9 4.4a4.6 4.6 0 1 0 6.2 0" />
          </svg>
          Turn Off Computer...
        </button>
      </div>
    </div>
  )
}
