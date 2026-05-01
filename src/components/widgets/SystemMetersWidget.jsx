import { useEffect, useMemo, useState } from 'react'

function clamp01(n) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(k)))
  const value = bytes / k ** i
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

function Meter({ label, value, hint }) {
  const pct = Math.round(clamp01(value) * 100)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-white/85">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums">{hint ?? `${pct}%`}</span>
      </div>
      <div className="h-2.5 rounded border border-white/15 bg-black/25">
        <div
          className="h-full rounded bg-gradient-to-r from-[#55ffb2] to-[#2ea6ff]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function SystemMetersWidget() {
  const [ram, setRam] = useState(() => ({
    supported: false,
    used: 0,
    total: 0,
  }))
  const [storage, setStorage] = useState(() => ({
    supported: false,
    used: 0,
    total: 0,
  }))

  useEffect(() => {
    const update = async () => {
      const memory = /** @type {any} */ (performance).memory
      if (memory && typeof memory.usedJSHeapSize === 'number') {
        setRam({
          supported: true,
          used: memory.usedJSHeapSize,
          total: memory.jsHeapSizeLimit || memory.totalJSHeapSize || 0,
        })
      } else {
        setRam((prev) => ({ ...prev, supported: false }))
      }

      if (navigator.storage?.estimate) {
        try {
          const { usage, quota } = await navigator.storage.estimate()
          setStorage({
            supported: true,
            used: typeof usage === 'number' ? usage : 0,
            total: typeof quota === 'number' ? quota : 0,
          })
        } catch {
          setStorage((prev) => ({ ...prev, supported: false }))
        }
      } else {
        setStorage((prev) => ({ ...prev, supported: false }))
      }
    }

    void update()
    const id = window.setInterval(update, 10_000)
    return () => window.clearInterval(id)
  }, [])

  const ramRatio = useMemo(() => {
    if (!ram.supported || ram.total <= 0) return 0
    return clamp01(ram.used / ram.total)
  }, [ram])

  const storageRatio = useMemo(() => {
    if (!storage.supported || storage.total <= 0) return 0
    return clamp01(storage.used / storage.total)
  }, [storage])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-bold text-white/90">Meters</div>
        <div className="text-[10px] text-white/60">browser estimates</div>
      </div>

      <div className="flex flex-col gap-2">
        <Meter
          label="RAM"
          value={ramRatio}
          hint={
            ram.supported
              ? `${formatBytes(ram.used)} / ${formatBytes(ram.total)}`
              : 'N/A'
          }
        />
        <Meter
          label="HDD"
          value={storageRatio}
          hint={
            storage.supported
              ? `${formatBytes(storage.used)} / ${formatBytes(storage.total)}`
              : 'N/A'
          }
        />
      </div>
    </div>
  )
}

