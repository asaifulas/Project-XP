import { XpDialogActions, XpDialogTabRow } from '../window/XpDialogChrome'

const TABS = ['Desktop', 'Screen Saver', 'Appearance', 'Settings']

/**
 * Windows XP Display Properties — Desktop tab (wallpaper picker).
 *
 * @param {{ wallpapers: { id: string, name: string, src: string }[], currentWallpaper: { id: string, src: string } | null, onSelectWallpaper: (id: string) => void, onClose: () => void }} props
 */
export default function DisplayPropertiesContent({
  wallpapers,
  currentWallpaper,
  onSelectWallpaper,
  onClose,
}) {
  return (
    <div className="flex min-w-0 flex-col bg-[#ece9d8] text-[11px] text-black">
      <div className="bg-[#ece9d8] px-2 pt-1">
        <XpDialogTabRow tabs={TABS} activeTab="Desktop" />
      </div>

      <div className="border border-t-0 border-[#919b9c] bg-[#ece9d8] px-4 py-3">
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
                    onClick={() => onSelectWallpaper(wallpaper.id)}
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
      </div>

      <XpDialogActions onClose={onClose} />
    </div>
  )
}
