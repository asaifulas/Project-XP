import { useRef } from 'react'

export default function DesktopIcon({
  label,
  iconSrc,
  onOpen,
  className = '',
}) {
  const lastClickAtRef = useRef(0)

  return (
    <button
      type="button"
      className={[
        'group flex w-[88px] cursor-default flex-col items-center gap-2 rounded p-2 text-left text-white',
        'hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => {
        // Some mobile browsers won’t reliably fire dblclick; keep a small fallback.
        const now = Date.now()
        const within = now - lastClickAtRef.current < 350
        lastClickAtRef.current = now
        if (within) onOpen?.()
      }}
      onDoubleClick={() => onOpen?.()}
      aria-label={label}
    >
      <span className="grid h-12 w-12 place-items-center rounded">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            className="h-12 w-12 select-none"
            draggable="false"
          />
        ) : (
          <span
            aria-hidden
            className="h-10 w-10 rounded bg-gradient-to-br from-zinc-200 to-zinc-400"
          />
        )}
      </span>
      <span className="w-full select-none text-center text-[11px] leading-[1.1] [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]">
        {label}
      </span>
    </button>
  )
}

