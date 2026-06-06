import { useRef } from 'react'
import {
  XP_DESKTOP_ICON_CELL_HEIGHT_PX,
  XP_DESKTOP_ICON_CELL_WIDTH_PX,
} from '../../constants/xpDesktop'
import { snapDesktopIconPosition } from '../../utils/desktopIconLayout'

const DRAG_THRESHOLD_PX = 5
const ZERO_POSITION = { x: 0, y: 0 }
const ZERO_BOUNDS = { width: 0, height: 0 }

/**
 * @param {{ x: number, y: number } | undefined} position
 * @param {{ width: number, height: number } | undefined} bounds
 */
export default function DesktopIcon({
  label,
  iconSrc,
  onOpen,
  position,
  bounds,
  onPositionChange,
  className = '',
}) {
  const lastClickAtRef = useRef(0)
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  })

  const isDraggable = Boolean(position && bounds && onPositionChange)
  const resolvedPosition = position ?? ZERO_POSITION
  const resolvedBounds = bounds ?? ZERO_BOUNDS

  function handlePointerDown(event) {
    if (!isDraggable || event.button !== 0) return
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: resolvedPosition.x,
      originY: resolvedPosition.y,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    if (!isDraggable) return
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY

    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return

    drag.moved = true
    onPositionChange({
      x: drag.originX + dx,
      y: drag.originY + dy,
    })
  }

  function handlePointerUp(event) {
    const drag = dragRef.current
    if (isDraggable && drag.active && drag.pointerId === event.pointerId) {
      drag.active = false
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // capture may already be released
      }

      if (drag.moved) {
        onPositionChange(
          snapDesktopIconPosition(
            resolvedPosition.x,
            resolvedPosition.y,
            resolvedBounds,
          ),
        )
        return
      }
    }

    const now = Date.now()
    const within = now - lastClickAtRef.current < 350
    lastClickAtRef.current = now
    if (within) onOpen?.()
  }

  function handlePointerCancel(event) {
    if (!isDraggable) return
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return
    drag.active = false
    if (drag.moved) {
      onPositionChange(
        snapDesktopIconPosition(
          resolvedPosition.x,
          resolvedPosition.y,
          resolvedBounds,
        ),
      )
    }
  }

  const baseStyle = {
    width: XP_DESKTOP_ICON_CELL_WIDTH_PX,
    height: XP_DESKTOP_ICON_CELL_HEIGHT_PX,
  }

  if (isDraggable) {
    baseStyle.transform = `translate(${resolvedPosition.x}px, ${resolvedPosition.y}px)`
  }

  return (
    <button
      type="button"
      style={baseStyle}
      className={[
        isDraggable ? 'absolute left-0 top-0' : 'relative',
        'box-border flex flex-col items-center justify-start gap-0.5 overflow-visible rounded px-1 py-1.5 text-white',
        isDraggable ? 'touch-none cursor-default select-none' : 'cursor-default',
        'hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerDown={isDraggable ? handlePointerDown : undefined}
      onPointerMove={isDraggable ? handlePointerMove : undefined}
      onPointerUp={isDraggable ? handlePointerUp : undefined}
      onPointerCancel={isDraggable ? handlePointerCancel : undefined}
      onClick={
        isDraggable
          ? undefined
          : () => {
              const now = Date.now()
              const within = now - lastClickAtRef.current < 350
              lastClickAtRef.current = now
              if (within) onOpen?.()
            }
      }
      onDoubleClick={(e) => {
        e.preventDefault()
        onOpen?.()
      }}
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
      <span className="flex w-full min-w-0 flex-1 items-start justify-center px-0.5 text-center text-[10px] leading-[1.15] [overflow-wrap:anywhere] [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]">
        {label}
      </span>
    </button>
  )
}
