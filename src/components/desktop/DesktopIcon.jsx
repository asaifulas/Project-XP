import { useRef } from 'react'
import {
  XP_DESKTOP_ICON_CELL_HEIGHT_PX,
  XP_DESKTOP_ICON_CELL_WIDTH_PX,
} from '../../constants/xpDesktop'

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
      style={{
        width: XP_DESKTOP_ICON_CELL_WIDTH_PX,
        height: XP_DESKTOP_ICON_CELL_HEIGHT_PX,
      }}
      className={[
        'group box-border flex cursor-default flex-col items-center justify-start gap-1 rounded p-2 text-left text-white',
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
            className="h-12 w-12 select-none object-contain"
            draggable="false"
          />
        ) : (
          <span
            aria-hidden
            className="h-10 w-10 rounded bg-gradient-to-br from-zinc-200 to-zinc-400"
          />
        )}
      </span>
      <span className="flex min-h-[2.2em] w-full flex-1 items-start justify-center text-center text-[11px] leading-[1.1] line-clamp-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]">
        {label}
      </span>
    </button>
  )
}

