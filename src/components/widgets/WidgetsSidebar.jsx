import AnalogClockWidget from './AnalogClockWidget'
import CalendarWidget from './CalendarWidget'
import SystemMetersWidget from './SystemMetersWidget'
import StickyNotesWidget from './StickyNotesWidget'

export default function WidgetsSidebar() {
  return (
    <aside
      className="pointer-events-auto z-30 flex h-full min-h-0 w-full min-w-0 flex-col gap-2 overflow-y-auto font-xp text-black no-scrollbar"
      aria-label="Desktop widgets"
    >
      <div className="xp-gadget flex max-h-[min(520px,72vh)] min-h-[220px] shrink-0 flex-col overflow-hidden">
        <StickyNotesWidget />
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <div className="xp-gadget shrink-0">
          <AnalogClockWidget />
        </div>
        <div className="xp-gadget shrink-0">
          <CalendarWidget />
        </div>
        <div className="xp-gadget shrink-0">
          <SystemMetersWidget />
        </div>
      </div>
    </aside>
  )
}
