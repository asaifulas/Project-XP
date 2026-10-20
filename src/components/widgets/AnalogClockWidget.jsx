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
      <div className="xp-gadget-title flex items-center justify-between">
        <span>Clock</span>
        <span className="tabular-nums font-normal">{label}</span>
      </div>

      <div className="mx-auto my-2 grid h-[150px] w-[150px] place-items-center rounded-full border-2 border-[#0831d9] bg-white">
        <svg
          viewBox="0 0 100 100"
          className="h-[150px] w-[150px]"
          role="img"
          aria-label="Analog clock"
        >
          <defs>
            <radialGradient id="clockFace" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e7eefc" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="48" fill="url(#clockFace)" stroke="#0831d9" strokeWidth="1.5" />

          {Array.from({ length: 60 }).map((_, i) => {
            const isHour = i % 5 === 0
            const len = isHour ? 7 : 3
            const stroke = isHour ? '#1a1a1a' : '#8aa0c8'
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
            stroke="#1a1a1a"
            strokeWidth="2.2"
            strokeLinecap="round"
            transform={`rotate(${hourAngle} 50 50)`}
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="17"
            stroke="#1a1a1a"
            strokeWidth="1.6"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle} 50 50)`}
          />
          <line
            x1="50"
            y1="56"
            x2="50"
            y2="14"
            stroke="#c42b1c"
            strokeWidth="1.1"
            strokeLinecap="round"
            transform={`rotate(${secondAngle} 50 50)`}
          />
          <circle cx="50" cy="50" r="2.2" fill="#c42b1c" stroke="#1a1a1a" />
        </svg>
      </div>
    </div>
  )
}

