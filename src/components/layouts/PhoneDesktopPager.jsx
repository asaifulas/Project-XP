import { useRef, useState } from 'react'
import DesktopIcon from '../desktop/DesktopIcon'
import DesktopIconsArea from '../desktop/DesktopIconsArea'
import WidgetsSidebar from '../widgets/WidgetsSidebar'

const PAGE_COUNT = 2

/**
 * Phone home screens: desktop icons, then the widget sidebar.
 * Swipe horizontally, or use the ‹ › buttons.
 *
 * @param {{
 *   apps: Array<{ id: string, desktop: { label: string }, icon: string }>,
 *   recycleApp?: { id: string, desktop: { label: string }, icon: string, path?: string },
 *   onOpenApp: (app: { id: string, path?: string, externalUrl?: string }) => void,
 *   onIconContextMenu?: (app: { id: string }, event: MouseEvent) => void,
 *   onOpenRecycle?: () => void,
 * }} props
 */
export default function PhoneDesktopPager({
  apps,
  recycleApp,
  onOpenApp,
  onIconContextMenu,
  onOpenRecycle,
}) {
  const scrollerRef = useRef(null)
  const [page, setPage] = useState(0)

  function goTo(nextPage) {
    const scroller = scrollerRef.current
    if (!scroller) return
    const clamped = Math.max(0, Math.min(PAGE_COUNT - 1, nextPage))
    scroller.scrollTo({ left: clamped * scroller.clientWidth, behavior: 'smooth' })
  }

  function handleScroll() {
    const scroller = scrollerRef.current
    if (!scroller || scroller.clientWidth <= 0) return
    const next = Math.round(scroller.scrollLeft / scroller.clientWidth)
    setPage((current) => (current === next ? current : next))
  }

  return (
    <div className="absolute inset-0">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        <section
          className="h-full w-full shrink-0 snap-start pb-14"
          aria-label="Desktop icons"
        >
          <DesktopIconsArea
            apps={apps}
            draggable={false}
            onOpenApp={onOpenApp}
            onIconContextMenu={onIconContextMenu}
          />
        </section>
        <section
          className="flex h-full w-full shrink-0 snap-start flex-col gap-2 px-3 pb-14 pt-3"
          aria-label="Sidebar"
        >
          <div className="pointer-events-auto min-h-0 flex-1 overflow-y-auto no-scrollbar">
            <WidgetsSidebar />
          </div>
          {recycleApp ? (
            <div className="pointer-events-auto flex shrink-0 justify-center pb-1">
              <DesktopIcon
                label={recycleApp.desktop.label}
                iconSrc={recycleApp.icon}
                openOnSingleClick
                onOpen={onOpenRecycle}
              />
            </div>
          ) : null}
        </section>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-40 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Show desktop icons"
          disabled={page === 0}
          onClick={() => goTo(page - 1)}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-[28px] leading-none text-white shadow-md disabled:opacity-35"
        >
          ‹
        </button>
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className={page === 0 ? 'h-2 w-2 rounded-full bg-white' : 'h-2 w-2 rounded-full bg-white/40'} />
          <span className={page === 1 ? 'h-2 w-2 rounded-full bg-white' : 'h-2 w-2 rounded-full bg-white/40'} />
        </div>
        <button
          type="button"
          aria-label="Show sidebar"
          disabled={page === PAGE_COUNT - 1}
          onClick={() => goTo(page + 1)}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-[28px] leading-none text-white shadow-md disabled:opacity-35"
        >
          ›
        </button>
      </div>
    </div>
  )
}
