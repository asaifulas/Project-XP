import { useEffect, useMemo, useState } from 'react'

function pad2(n) {
  return String(n).padStart(2, '0')
}

export default function AnalogClockWidget() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const { hourAngle, minuteAngle, secondAngle, label } = useMemo(() => {
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const hour12 = hours % 12

    const second = (seconds / 60) * 360
    const minute = (minutes / 60) * 360 + (seconds / 60) * 6
    const hour = (hour12 / 12) * 360 + (minutes / 60) * 30

    const labelText = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`

    return {
      hourAngle: hour,
      minuteAngle: minute,
      secondAngle: second,
      label: labelText,
    }
  }, [now])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-bold text-white/90">Clock</div>
        <div className="text-[11px] tabular-nums text-white/85">{label}</div>
      </div>

      <div className="mx-auto grid h-[170px] w-[170px] place-items-center rounded-full border border-white/15 bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
        <svg
          viewBox="0 0 100 100"
          className="h-[150px] w-[150px]"
          role="img"
          aria-label="Analog clock"
        >
          <defs>
            <radialGradient id="clockFace" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="48" fill="url(#clockFace)" stroke="rgba(255,255,255,0.25)" />

          {Array.from({ length: 60 }).map((_, i) => {
            const isHour = i % 5 === 0
            const len = isHour ? 7 : 3
            const stroke = isHour ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'
            const strokeWidth = isHour ? 1.4 : 1
            const angle = (i / 60) * 360

            return (
              <line
                key={i}
                x1="50"
                y1={isHour ? 10 : 12}
                x2="50"
                y2={isHour ? 10 + len : 12 + len}
                stroke={stroke}
                strokeWidth={strokeWidth}
                transform={`rotate(${angle} 50 50)`}
              />
            )
          })}

          <line
            x1="50"
            y1="50"
            x2="50"
            y2="26"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2.2"
            strokeLinecap="round"
            transform={`rotate(${hourAngle} 50 50)`}
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="17"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle} 50 50)`}
          />
          <line
            x1="50"
            y1="56"
            x2="50"
            y2="14"
            stroke="#ffcf2e"
            strokeWidth="1.1"
            strokeLinecap="round"
            transform={`rotate(${secondAngle} 50 50)`}
          />
          <circle cx="50" cy="50" r="2.6" fill="#ffcf2e" stroke="rgba(0,0,0,0.45)" />
        </svg>
      </div>
    </div>
  )
}

