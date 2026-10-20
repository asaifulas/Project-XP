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
      <div className="xp-gadget-title flex items-center justify-between">
        <span>Calendar</span>
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            className="xp-button px-1.5 py-0 text-black"
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
            className="xp-button px-1.5 py-0 text-black"
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

      <div className="px-2 pt-2 text-[11px]">{label}</div>

      <div className="grid grid-cols-7 gap-1 p-2 text-[10px]">
        {weekdays.map((w) => (
          <div key={w} className="text-center font-semibold text-black">
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
                'grid h-6 place-items-center border text-center',
                active
                  ? 'border-[#0831d9] bg-[#316ac5] text-white'
                  : 'border-[#b7c4e0] bg-white text-black',
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

