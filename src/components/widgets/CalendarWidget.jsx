import { useMemo, useState } from 'react'

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function CalendarWidget() {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [cursorMonth, setCursorMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const { label, days } = useMemo(() => {
    const year = cursorMonth.getFullYear()
    const month = cursorMonth.getMonth()
    const first = new Date(year, month, 1)
    const firstWeekday = first.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null)
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d))

    const monthLabel = first.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })

    return { label: monthLabel, days: cells }
  }, [cursorMonth])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-bold text-white/90">Calendar</div>
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            className="rounded border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] text-white/90 hover:bg-white/15"
            onClick={() =>
              setCursorMonth(
                (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
              )
            }
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            className="rounded border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] text-white/90 hover:bg-white/15"
            onClick={() =>
              setCursorMonth(
                (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
              )
            }
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-2 text-[11px] text-white/85">{label}</div>

      <div className="grid grid-cols-7 gap-1 text-[10px]">
        {weekdays.map((w) => (
          <div key={w} className="text-center font-semibold text-white/70">
            {w}
          </div>
        ))}

        {days.map((d, idx) => {
          if (!d) {
            return <div key={`empty-${idx}`} className="h-6" />
          }

          const active = isSameDay(d, today)
          return (
            <div
              key={d.toISOString()}
              className={[
                'grid h-6 place-items-center rounded border text-center',
                active
                  ? 'border-white/40 bg-white/25 text-white'
                  : 'border-white/10 bg-black/15 text-white/85',
              ].join(' ')}
            >
              {d.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

