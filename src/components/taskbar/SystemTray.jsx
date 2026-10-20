import { useEffect, useState } from 'react'

function formatClock(d) {
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/* Flat monochrome tray glyphs — emoji render as colour clip-art and differ per OS. */
function NetworkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
      <rect x="1" y="3" width="9" height="6" rx="0.5" opacity="0.95" />
      <rect x="6" y="7" width="9" height="6" rx="0.5" opacity="0.6" />
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
      <path d="M2.5 6h2L8 3.3v9.4L4.5 10h-2z" fill="currentColor" />
      <path
        d="M10.2 5.6a3.4 3.4 0 0 1 0 4.8M12.3 3.6a6.2 6.2 0 0 1 0 8.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function SystemTray() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className="xp-tray ml-auto inline-flex shrink-0 items-center gap-1.5"
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex opacity-90" title="Network" aria-hidden>
        <NetworkIcon />
      </span>
      <span className="inline-flex opacity-90" title="Volume" aria-hidden>
        <VolumeIcon />
      </span>
      <span className="text-[11px] tabular-nums text-white">{formatClock(now)}</span>
    </div>
  )
}
