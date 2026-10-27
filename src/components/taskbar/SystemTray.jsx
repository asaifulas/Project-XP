import { useEffect, useRef, useState } from 'react'
import { useShellStore } from '../../stores/useShellStore'

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

function VolumeIcon({ muted }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
      <path d="M2.5 6h2L8 3.3v9.4L4.5 10h-2z" fill="currentColor" />
      {muted ? (
        <path d="M10 5.5l4 5M14 5.5l-4 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      ) : (
        <path
          d="M10.2 5.6a3.4 3.4 0 0 1 0 4.8M12.3 3.6a6.2 6.2 0 0 1 0 8.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

function ClippyTrayIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <ellipse cx="8" cy="9" rx="5" ry="5.5" fill="#f4e4a6" stroke="#333" strokeWidth="0.8" />
      <circle cx="6.2" cy="8" r="0.9" fill="#222" />
      <circle cx="9.8" cy="8" r="0.9" fill="#222" />
      <path d="M6 11.2c1.2 1 2.8 1 4 0" fill="none" stroke="#222" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M5 4.5L3.5 2.2M11 4.5L12.5 2.2" stroke="#333" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  )
}

export default function SystemTray() {
  const [now, setNow] = useState(() => new Date())
  const [volumeOpen, setVolumeOpen] = useState(false)
  const volumeRef = useRef(/** @type {HTMLDivElement | null} */ (null))

  const masterVolume = useShellStore((s) => s.masterVolume)
  const masterMuted = useShellStore((s) => s.masterMuted)
  const setMasterVolume = useShellStore((s) => s.setMasterVolume)
  const toggleMasterMute = useShellStore((s) => s.toggleMasterMute)
  const clippyInTray = useShellStore((s) => s.clippyInTray)
  const setClippyInTray = useShellStore((s) => s.setClippyInTray)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!volumeOpen) return undefined
    const onPointerDown = (event) => {
      if (volumeRef.current?.contains(/** @type {Node} */ (event.target))) return
      setVolumeOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setVolumeOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [volumeOpen])

  // Apply master volume to any HTML media currently on the page (preserve per-element base).
  useEffect(() => {
    const gain = masterMuted ? 0 : masterVolume
    for (const el of document.querySelectorAll('audio, video')) {
      if (!(el instanceof HTMLMediaElement)) continue
      if (el.dataset.shellBaseVolume == null) {
        el.dataset.shellBaseVolume = String(el.volume)
      }
      const base = Number(el.dataset.shellBaseVolume)
      el.volume = Math.min(1, Math.max(0, (Number.isFinite(base) ? base : 1) * gain))
    }
  }, [masterMuted, masterVolume])

  return (
    <div
      className="xp-tray relative ml-auto inline-flex shrink-0 items-center gap-1.5"
      role="status"
      aria-live="polite"
    >
      {clippyInTray ? (
        <button
          type="button"
          className="inline-flex items-center justify-center opacity-95 hover:opacity-100"
          title="Show Clippy"
          aria-label="Show Clippy"
          onClick={() => setClippyInTray(false)}
        >
          <ClippyTrayIcon />
        </button>
      ) : null}
      <span className="inline-flex opacity-90" title="Network" aria-hidden>
        <NetworkIcon />
      </span>
      <div className="relative" ref={volumeRef}>
        <button
          type="button"
          className="inline-flex items-center justify-center opacity-90 hover:opacity-100"
          title={masterMuted ? 'Unmute' : 'Volume'}
          aria-label="Volume"
          aria-expanded={volumeOpen}
          onClick={() => setVolumeOpen((v) => !v)}
          onContextMenu={(event) => {
            event.preventDefault()
            toggleMasterMute()
          }}
        >
          <VolumeIcon muted={masterMuted || masterVolume <= 0} />
        </button>
        {volumeOpen ? (
          <div
            className="xp-volume-popup absolute bottom-[calc(100%+4px)] right-0 z-[90]"
            role="dialog"
            aria-label="Volume"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <span className="xp-volume-popup-title">Volume</span>
            <div className="xp-volume-track-wrap">
              <div className="xp-volume-ticks" aria-hidden>
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="xp-volume-slider-slot">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round((masterMuted ? 0 : masterVolume) * 100)}
                  onChange={(event) => {
                    const next = Number(event.target.value) / 100
                    setMasterVolume(next)
                  }}
                  className="xp-volume-slider"
                  aria-label="Master volume"
                  aria-orientation="vertical"
                  aria-valuetext={
                    masterMuted ? 'Muted' : `${Math.round(masterVolume * 100)} percent`
                  }
                />
              </div>
            </div>
            <label className="xp-volume-mute">
              <input
                type="checkbox"
                checked={masterMuted || masterVolume <= 0}
                onChange={() => toggleMasterMute()}
              />
              Mute
            </label>
          </div>
        ) : null}
      </div>
      <span className="text-[11px] tabular-nums text-white">{formatClock(now)}</span>
    </div>
  )
}
