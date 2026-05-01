import { useEffect, useRef } from 'react'
import profileImage from '../../assets/mine/profile.png'

const menuItem =
  'xp-start-item flex cursor-default select-none items-center gap-2 px-3 py-1.5 pl-2.5 font-xp text-[11px]'

const menuItemRight =
  'xp-start-item flex cursor-default select-none items-center px-3 py-1.5 font-xp text-[11px]'

const menuItemIcon =
  'h-4 w-4 shrink-0 rounded-sm bg-gradient-to-br from-xp-micon-t to-xp-micon-b'

function StartMenuItem({ label }) {
  return (
    <div className={menuItem} role="menuitem">
      <span className={menuItemIcon} aria-hidden />
      <span>{label}</span>
    </div>
  )
}

function StartMenuRightItem({ label }) {
  return (
    <div className={menuItemRight} role="menuitem">
      <span>{label}</span>
    </div>
  )
}

export default function StartMenu({ open, onRequestClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(e) {
      if (!panelRef.current) return
      if (panelRef.current.contains(e.target)) return
      onRequestClose()
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') onRequestClose()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onRequestClose])

  if (!open) return null

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
            alt="User"
            className="h-full w-full rounded object-cover"
            draggable="false"
          />
        </div>
        <div className="text-[13px] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.45)]">
          User
        </div>
      </div>

      <div className="grid min-h-[280px] grid-cols-2">
        <div
          className="xp-start-left py-1.5"
          role="presentation"
        >
          <StartMenuItem label="Internet" />
          <StartMenuItem label="E-mail" />
          <div className="my-1 border-t border-black/40" aria-hidden />
          <StartMenuItem label="My Documents" />
          <StartMenuItem label="My Recent Documents" />
          <StartMenuItem label="My Computer" />
          <StartMenuItem label="My Network Places" />
          <div className={`${menuItem} font-bold`}>
            <span className={menuItemIcon} aria-hidden />
            <span>All Programs</span>
            <span className="ml-auto text-[10px] opacity-70" aria-hidden>
              ▶
            </span>
          </div>
        </div>

        <div
          className="xp-start-right py-2"
          role="presentation"
        >
          <StartMenuRightItem label="My Documents" />
          <StartMenuRightItem label="My Computer" />
          <StartMenuRightItem label="Control Panel" />
          <StartMenuRightItem label="Set Program Access and Defaults" />
          <StartMenuRightItem label="Connect To" />
          <StartMenuRightItem label="Printers and Faxes" />
          <StartMenuRightItem label="Help and Support" />
          <StartMenuRightItem label="Search" />
          <StartMenuRightItem label="Run..." />
        </div>
      </div>

      <div className="xp-start-footer grid grid-cols-2 gap-px px-2 pb-2 pt-1.5">
        <button
          type="button"
          className="flex h-7 cursor-default items-center justify-center gap-1.5 rounded border border-black/45 bg-black/15 font-xp text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105"
        >
          <span aria-hidden>🔒</span>
          Log Off
        </button>
        <button
          type="button"
          className="flex h-7 cursor-default items-center justify-center gap-1.5 rounded border border-black/45 bg-black/15 font-xp text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105"
        >
          <span aria-hidden>⏻</span>
          Turn Off Computer...
        </button>
      </div>
    </div>
  )
}
