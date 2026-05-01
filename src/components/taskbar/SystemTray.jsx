import { useEffect, useState } from 'react'

function formatClock(d) {
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function SystemTray() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className="xp-tray ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 pl-2"
      role="status"
      aria-live="polite"
    >
      <span className="text-[11px] opacity-80" title="Network" aria-hidden>
        📶
      </span>
      <span className="text-[11px] opacity-80" title="Volume" aria-hidden>
        🔊
      </span>
      <span className="text-[11px] tabular-nums tracking-wide text-white">
        {formatClock(now)}
      </span>
    </div>
  )
}
