import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import profileImage from '../../assets/mine/profile.png'
import { getAppById, getDesktopApps } from '../../registry/apps'
import { useShellStore } from '../../stores/useShellStore'
import { openExternalUrl } from '../../utils/openExternalUrl'
import { openForegroundPreserveStack } from '../../utils/windowStackUrl'

const menuItem =
  'xp-start-item flex w-full cursor-default select-none items-center gap-2 px-3 py-1.5 pl-2.5 text-left font-xp text-[11px]'

const menuItemRight =
  'xp-start-item flex w-full cursor-default select-none items-center px-3 py-1.5 text-left font-xp text-[11px]'

const menuItemIcon =
  'h-4 w-4 shrink-0 rounded-sm bg-gradient-to-br from-xp-micon-t to-xp-micon-b'

const PINNED_LEFT = ['ie', 'gmail', 'welcome', 'winamp', 'my_docs', 'my_computer']
const PINNED_RIGHT = [
  { id: 'my_docs', label: 'My Documents' },
  { id: 'my_computer', label: 'My Computer' },
  { id: 'welcome', label: 'Help and Support' },
]

function ItemIcon({ src }) {
  if (!src) return <span className={menuItemIcon} aria-hidden />
  return (
    <img src={src} alt="" className="h-4 w-4 shrink-0 object-contain" draggable="false" />
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
    <button type="button" className={menuItemRight} role="menuitem" onClick={onSelect}>
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
      className="xp-start-menu absolute bottom-[calc(100%-1px)] left-0 z-50 w-[min(420px,calc(100vw-16px))] overflow-hidden rounded-t-md border-b-0"
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
        <div className="xp-start-left py-1.5" role="presentation">
          {pinnedLeft.slice(0, 2).map((app) => (
            <StartMenuItem
              key={app.id}
              label={app.id === 'ie' ? 'Internet' : 'E-mail'}
              iconSrc={app.icon}
              onSelect={() => openApp(app.id)}
            />
          ))}
          <div className="my-1 border-t border-black/40" aria-hidden />
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
            className={`${menuItem} font-bold`}
            role="menuitem"
            aria-expanded={allProgramsOpen}
            onClick={() => setAllProgramsOpen((openPrograms) => !openPrograms)}
          >
            <span className={menuItemIcon} aria-hidden />
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
            className="absolute inset-0 z-10 overflow-y-auto bg-white py-1"
            role="presentation"
          >
            <button
              type="button"
              className={`${menuItem} font-bold`}
              onClick={() => setAllProgramsOpen(false)}
            >
              <span aria-hidden>◀</span>
              <span>All Programs</span>
            </button>
            <div className="my-1 border-t border-black/20" aria-hidden />
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
          <span aria-hidden>🔒</span>
          Log Off
        </button>
        <button
          type="button"
          className="flex h-7 cursor-default items-center justify-center gap-1.5 rounded border border-black/45 bg-black/15 font-xp text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105"
          onClick={onRequestClose}
        >
          <span aria-hidden>⏻</span>
          Turn Off Computer...
        </button>
      </div>
    </div>
  )
}
