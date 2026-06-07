import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Taskbar from '../taskbar/Taskbar'
import { useShellStore } from '../../stores/useShellStore'
import WindowFrame from '../window/WindowFrame'
import DesktopClippy from '../desktop/DesktopClippy'
import DesktopIcon from '../desktop/DesktopIcon'
import DesktopIconsArea from '../desktop/DesktopIconsArea'
import WidgetsSidebar from '../widgets/WidgetsSidebar'
import { openForegroundPreserveStack } from '../../utils/windowStackUrl'
import { getDesktopApps } from '../../registry/apps'
import { openExternalUrl } from '../../utils/openExternalUrl'
import { useDesktopIconStore } from '../../stores/useDesktopIconStore'
import DesktopIconContextMenu from '../desktop/DesktopIconContextMenu'
import SystemPropertiesContent from '../windows/SystemPropertiesContent'
import DisplayPropertiesContent from '../windows/DisplayPropertiesContent'
import myComputerIcon from '../../assets/icons/my_computer.png'

/**
 * Desktop shell: workspace + Windows XP–style taskbar.
 * Styling is Tailwind-only (see `tailwind.config.js` `xp.*` tokens).
 */
export default function AppLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const wallpapers = useShellStore((state) => state.wallpapers)
  const currentWallpaper = useShellStore((state) => state.currentWallpaper)
  const setWallpaper = useShellStore((state) => state.setWallpaper)
  const [contextMenu, setContextMenu] = useState({
    open: false,
    x: 0,
    y: 0,
  })
  const systemPropertiesOpen = useShellStore((s) => s.systemPropertiesOpen)
  const setSystemPropertiesOpen = useShellStore((s) => s.setSystemPropertiesOpen)
  const wallpaperSettingsOpen = useShellStore((s) => s.wallpaperSettingsOpen)
  const setWallpaperSettingsOpen = useShellStore((s) => s.setWallpaperSettingsOpen)
  const [iconContextMenu, setIconContextMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    appId: null,
  })

  useEffect(() => {
    const closeMenu = () => {
      setContextMenu((menu) => (menu.open ? { ...menu, open: false } : menu))
      setIconContextMenu((menu) => (menu.open ? { ...menu, open: false, appId: null } : menu))
    }
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
        setWallpaperSettingsOpen(false)
        setSystemPropertiesOpen(false)
      }
    }

    window.addEventListener('click', closeMenu)
    window.addEventListener('resize', closeMenu)
    window.addEventListener('keydown', onEscape)

    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('resize', closeMenu)
      window.removeEventListener('keydown', onEscape)
    }
  }, [])

  const handleDesktopContextMenu = (event) => {
    event.preventDefault()
    closeIconContextMenu()
    const menuWidth = 220
    const menuHeight = 120
    const nextX = Math.max(0, Math.min(event.clientX, window.innerWidth - menuWidth))
    const nextY = Math.max(0, Math.min(event.clientY, window.innerHeight - menuHeight))

    setContextMenu({
      open: true,
      x: nextX,
      y: nextY,
    })
  }

  const resetIconPositions = useDesktopIconStore((s) => s.resetIconPositions)

  const handleRefreshDesktop = () => {
    resetIconPositions()
    closeContextMenu()
  }

  const handleOpenWallpaperSettings = () => {
    setWallpaperSettingsOpen(true)
    setContextMenu((menu) => ({ ...menu, open: false }))
  }

  const closeContextMenu = () => {
    setContextMenu((menu) => ({ ...menu, open: false }))
  }

  const closeIconContextMenu = () => {
    setIconContextMenu((menu) => (menu.open ? { ...menu, open: false, appId: null } : menu))
  }

  const handleIconContextMenu = (app, event) => {
    if (app.id !== 'my_computer') return

    const menuWidth = 196
    const menuHeight = 280
    const nextX = Math.max(0, Math.min(event.clientX, window.innerWidth - menuWidth))
    const nextY = Math.max(0, Math.min(event.clientY, window.innerHeight - menuHeight))

    closeContextMenu()
    setIconContextMenu({
      open: true,
      x: nextX,
      y: nextY,
      appId: app.id,
    })
  }

  const handleOpenSystemProperties = () => {
    setSystemPropertiesOpen(true)
    closeIconContextMenu()
  }

  const desktopApps = getDesktopApps()
  const mainDesktopApps = desktopApps.filter((app) => app.id !== 'recycle')
  const recycleApp = desktopApps.find((app) => app.id === 'recycle')
  const myComputerApp = mainDesktopApps.find((app) => app.id === 'my_computer')

  const openDesktopApp = (app) => {
    if (app.externalUrl) {
      openExternalUrl(app.externalUrl)
      return
    }
    openForegroundPreserveStack(navigate, location, app.path, app.id)
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-xp-desktop font-xp text-xp-panel antialiased">
      <div
        className="relative flex-1 overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,theme(colors.xp.desktop-glow),theme(colors.xp.desktop)_55%,theme(colors.xp.desktop-edge)_100%)]"
        onContextMenu={handleDesktopContextMenu}
      >
        {currentWallpaper?.src ? (
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${currentWallpaper.src})` }}
          />
        ) : null}
        <div className="relative z-10 h-full">
          {/* Explicit width: reserve `right-3` + `w-[260px]` for widgets/recycle. */}
          <div className="pointer-events-none absolute bottom-3 left-3 top-3 z-20 min-h-0 w-[max(0px,calc(100%-17.75rem))]">
            <DesktopIconsArea
              apps={mainDesktopApps}
              onOpenApp={openDesktopApp}
              onIconContextMenu={handleIconContextMenu}
            />
          </div>
          <div className="pointer-events-none absolute bottom-[42px] right-3 top-3 z-30 flex w-[260px] flex-col gap-2">
            <div className="pointer-events-auto min-h-0 flex-1 overflow-y-auto no-scrollbar">
              <WidgetsSidebar />
            </div>
            {recycleApp ? (
              <div className="pointer-events-auto flex shrink-0 justify-center pt-0.5">
                <DesktopIcon
                  label={recycleApp.desktop.label}
                  iconSrc={recycleApp.icon}
                  className="shrink-0"
                  onOpen={() =>
                    openForegroundPreserveStack(
                      navigate,
                      location,
                      recycleApp.path,
                      recycleApp.id,
                    )
                  }
                />
              </div>
            ) : null}
          </div>
          <DesktopClippy />
          {children}
        </div>

        {contextMenu.open ? (
          <div
            className="absolute z-40 min-w-56 border border-zinc-600 bg-white py-1 text-[13px] leading-[1.2] text-black shadow-[2px_2px_8px_rgba(0,0,0,0.2)]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={closeContextMenu}
              className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              <span>View</span>
              <span aria-hidden>›</span>
            </button>
            <button
              type="button"
              onClick={closeContextMenu}
              className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              <span>Sort by</span>
              <span aria-hidden>›</span>
            </button>
            <button
              type="button"
              onClick={handleRefreshDesktop}
              className="block w-full bg-[#f9f000] px-3 py-1 text-left"
            >
              Refresh
            </button>
            <div className="my-1 border-t border-zinc-300" />
            <button
              type="button"
              disabled
              className="block w-full cursor-not-allowed px-3 py-1 text-left text-zinc-400"
            >
              Paste
            </button>
            <button
              type="button"
              disabled
              className="block w-full cursor-not-allowed px-3 py-1 text-left text-zinc-400"
            >
              Paste shortcut
            </button>
            <button
              type="button"
              onClick={closeContextMenu}
              className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              <span>Undo Delete</span>
              <span>Ctrl+Z</span>
            </button>
            <button
              type="button"
              onClick={closeContextMenu}
              className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              <span className="inline-block h-3.5 w-3.5 rounded-sm bg-gradient-to-br from-cyan-400 to-blue-600" />
              <span>Git GUI Here</span>
            </button>
            <button
              type="button"
              onClick={closeContextMenu}
              className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              <span className="inline-block h-3.5 w-3.5 rounded-sm bg-gradient-to-br from-cyan-400 to-blue-600" />
              <span>Git Bash Here</span>
            </button>
            <div className="my-1 border-t border-zinc-300" />
            <button
              type="button"
              onClick={closeContextMenu}
              className="block w-full px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              Intel Graphics Settings
            </button>
            <button
              type="button"
              onClick={closeContextMenu}
              className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              <span>New</span>
              <span aria-hidden>›</span>
            </button>
            <div className="my-1 border-t border-zinc-300" />
            <button
              type="button"
              onClick={handleOpenWallpaperSettings}
              className="block w-full px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              Display settings
            </button>
            <button
              type="button"
              onClick={handleOpenWallpaperSettings}
              className="block w-full px-3 py-1 text-left hover:bg-[#eaf3ff]"
            >
              Personalize
            </button>
          </div>
        ) : null}

        {iconContextMenu.open && iconContextMenu.appId === 'my_computer' ? (
          <DesktopIconContextMenu
            x={iconContextMenu.x}
            y={iconContextMenu.y}
            onClose={closeIconContextMenu}
            onOpen={() => myComputerApp && openDesktopApp(myComputerApp)}
            onProperties={handleOpenSystemProperties}
          />
        ) : null}

        {systemPropertiesOpen ? (
          <div className="absolute inset-0 z-50">
            <button
              type="button"
              aria-label="Close system properties"
              className="absolute inset-0 h-full w-full bg-black/30"
              onClick={() => setSystemPropertiesOpen(false)}
            />
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-6 pt-16">
              <WindowFrame
                programId="system-properties"
                title="System Properties"
                iconSrc={myComputerIcon}
                onClose={() => setSystemPropertiesOpen(false)}
                showMenuBar={false}
                allowMaximize={false}
                allowMinimize={false}
                compactRestoredFrame
                noClientPadding
                className="pointer-events-auto w-[min(500px,calc(100%-24px))]"
              >
                <SystemPropertiesContent onClose={() => setSystemPropertiesOpen(false)} />
              </WindowFrame>
            </div>
          </div>
        ) : null}

        {wallpaperSettingsOpen ? (
          <div className="absolute inset-0 z-50">
            <button
              type="button"
              aria-label="Close wallpaper settings"
              className="absolute inset-0 h-full w-full bg-black/30"
              onClick={() => setWallpaperSettingsOpen(false)}
            />
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-6 pt-16">
              <WindowFrame
                programId="display-properties"
                title="Display Properties"
                onClose={() => setWallpaperSettingsOpen(false)}
                showMenuBar={false}
                allowMaximize={false}
                allowMinimize={false}
                compactRestoredFrame
                noClientPadding
                className="pointer-events-auto w-[min(560px,calc(100%-24px))]"
              >
                <DisplayPropertiesContent
                  wallpapers={wallpapers}
                  currentWallpaper={currentWallpaper}
                  onSelectWallpaper={setWallpaper}
                  onClose={() => setWallpaperSettingsOpen(false)}
                />
              </WindowFrame>
            </div>
          </div>
        ) : null}
      </div>
      <Taskbar />
    </div>
  )
}
