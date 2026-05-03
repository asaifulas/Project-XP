import AnalogClockWidget from './AnalogClockWidget'
import CalendarWidget from './CalendarWidget'
import SystemMetersWidget from './SystemMetersWidget'
import StickyNotesWidget from './StickyNotesWidget'

export default function WidgetsSidebar() {
  return (
    <aside
      className="xp-glass-sidebar pointer-events-auto z-30 flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden"
      aria-label="Desktop widgets"
    >
      <div className="xp-glass-panel xp-glass-sticky-undocked flex h-[min(380px,58vh)] min-h-[220px] shrink-0 flex-col overflow-hidden p-3">
        <StickyNotesWidget />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <div className="xp-glass-panel shrink-0 p-3">
          <AnalogClockWidget />
        </div>
        <div className="xp-glass-panel shrink-0 p-3">
          <CalendarWidget />
        </div>
        <div className="xp-glass-panel shrink-0 p-3">
          <SystemMetersWidget />
        </div>
      </div>
    </aside>
  )
}
