import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Taskbar from '../taskbar/Taskbar'
import { useShellStore } from '../../stores/useShellStore'
import WindowFrame from '../window/WindowFrame'
import DesktopClippy from '../desktop/DesktopClippy'
import DesktopIcon from '../desktop/DesktopIcon'
import WidgetsSidebar from '../widgets/WidgetsSidebar'
import { openForegroundPreserveStack } from '../../utils/windowStackUrl'
import { getDesktopApps } from '../../registry/apps'

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
  const [wallpaperSettingsOpen, setWallpaperSettingsOpen] = useState(false)

  useEffect(() => {
    const closeMenu = () =>
      setContextMenu((menu) => (menu.open ? { ...menu, open: false } : menu))
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
        setWallpaperSettingsOpen(false)
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

  const handleRefreshDesktop = () => {
    window.location.reload()
  }

  const handleOpenWallpaperSettings = () => {
    setWallpaperSettingsOpen(true)
    setContextMenu((menu) => ({ ...menu, open: false }))
  }

  const closeContextMenu = () => {
    setContextMenu((menu) => ({ ...menu, open: false }))
  }

  const desktopApps = getDesktopApps()
  const mainDesktopApps = desktopApps.filter((app) => app.id !== 'recycle')
  const recycleApp = desktopApps.find((app) => app.id === 'recycle')

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
          <div className="pointer-events-none absolute bottom-3 left-3 top-3 z-20">
            <div className="pointer-events-auto flex h-full max-h-full max-w-[calc(100%-17.5rem)] flex-col flex-wrap content-start gap-x-3 gap-y-2">
              {mainDesktopApps.map((app) => (
                  <DesktopIcon
                    key={app.id}
                    label={app.desktop.label}
                    iconSrc={app.icon}
                    className="shrink-0"
                    onOpen={() =>
                      openForegroundPreserveStack(navigate, location, app.path, app.id)
                    }
                  />
                ))}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-[42px] right-3 top-3 z-30 flex w-[260px] flex-col gap-2">
            <div className="pointer-events-auto min-h-0 flex-1 overflow-hidden">
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

        {wallpaperSettingsOpen ? (
          <div className="absolute inset-0 z-50">
            <button
              type="button"
              aria-label="Close wallpaper settings"
              className="absolute inset-0 h-full w-full bg-black/30"
              onClick={() => setWallpaperSettingsOpen(false)}
            />
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-6">
              <WindowFrame
                programId="display-properties"
                title="Display Properties"
                onClose={() => setWallpaperSettingsOpen(false)}
                showMenuBar={false}
                className="pointer-events-auto"
              >
                <div className="mb-3 flex gap-2 border-b border-[#b7b4a8] text-[11px]">
                  <span className="border border-[#b7b4a8] border-b-[#f8fafc] bg-[#f8fafc] px-3 py-1 font-semibold">
                    Desktop
                  </span>
                  <span className="px-3 py-1 text-zinc-600">Screen Saver</span>
                  <span className="px-3 py-1 text-zinc-600">Appearance</span>
                  <span className="px-3 py-1 text-zinc-600">Settings</span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.2fr]">
                  <div className="border border-[#7f9db9] bg-white p-1">
                    <div className="h-44 border border-[#404040] bg-black p-2">
                      {currentWallpaper?.src ? (
                        <div
                          className="h-full w-full border border-[#8a8a8a] bg-cover bg-center"
                          style={{ backgroundImage: `url(${currentWallpaper.src})` }}
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 text-[11px] text-zinc-700">
                      Preview of your current desktop background
                    </p>
                  </div>

                  <div className="border border-[#7f9db9] bg-white p-1">
                    <div className="max-h-56 overflow-auto">
                      {wallpapers.map((wallpaper) => {
                        const isActive = currentWallpaper?.id === wallpaper.id

                        return (
                          <button
                            key={wallpaper.id}
                            type="button"
                            onClick={() => setWallpaper(wallpaper.id)}
                            className={`flex w-full items-center gap-2 border px-2 py-1 text-left text-xs ${
                              isActive
                                ? 'border-[#316ac5] bg-[#316ac5] text-white'
                                : 'border-transparent hover:border-[#9ab8e8] hover:bg-[#eaf3ff]'
                            }`}
                          >
                            <div
                              className="h-10 w-14 shrink-0 border border-[#666] bg-cover bg-center"
                              style={{ backgroundImage: `url(${wallpaper.src})` }}
                            />
                            <span className="truncate">{wallpaper.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-[#b7b4a8] pt-3">
                  <button
                    type="button"
                    onClick={() => setWallpaperSettingsOpen(false)}
                    className="border border-[#7f9db9] bg-[#ece9d8] px-4 py-1 text-xs shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899]"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setWallpaperSettingsOpen(false)}
                    className="border border-[#7f9db9] bg-[#ece9d8] px-4 py-1 text-xs shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899]"
                  >
                    Cancel
                  </button>
                </div>
              </WindowFrame>
            </div>
          </div>
        ) : null}
      </div>
      <Taskbar />
    </div>
  )
}
