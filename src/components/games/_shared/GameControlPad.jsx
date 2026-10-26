/**
 * In-game clickable pads (not the OS soft keyboard).
 * Hold via pointer capture so flippers stay up while pressed.
 * Center can be tap (`onCenter`) or hold (`onCenterChange`) — hold wins if both set.
 *
 * @param {{
 *   leftLabel?: string,
 *   rightLabel?: string,
 *   centerLabel?: string,
 *   onLeftChange: (pressed: boolean) => void,
 *   onRightChange: (pressed: boolean) => void,
 *   onCenter?: () => void,
 *   onCenterChange?: (pressed: boolean) => void,
 *   centerDisabled?: boolean,
 *   className?: string,
 * }} props
 */
export default function GameControlPad({
  leftLabel = '◀ Flipper',
  rightLabel = 'Flipper ▶',
  centerLabel = 'Plunge',
  onLeftChange,
  onRightChange,
  onCenter,
  onCenterChange,
  centerDisabled = false,
  className = '',
}) {
  function bindHold(onChange) {
    return {
      onPointerDown: (event) => {
        if (event.button !== 0 && event.pointerType === 'mouse') return
        event.currentTarget.setPointerCapture(event.pointerId)
        onChange(true)
      },
      onPointerUp: (event) => {
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
        onChange(false)
      },
      onPointerCancel: () => onChange(false),
      onLostPointerCapture: () => onChange(false),
    }
  }

  const padClass =
    'xp-button min-h-[48px] flex-1 touch-none select-none px-2 py-3 text-[11px] font-bold active:brightness-95'

  const centerHold = onCenterChange
    ? bindHold((pressed) => {
        if (centerDisabled) return
        onCenterChange(pressed)
      })
    : {
        onPointerDown: (event) => {
          if (centerDisabled) return
          if (event.button !== 0 && event.pointerType === 'mouse') return
          onCenter?.()
        },
      }

  return (
    <div
      className={`flex shrink-0 gap-2 border-t border-black/30 bg-[#d4d0c8] p-2 ${className}`}
      role="group"
      aria-label="Game controls"
    >
      <button type="button" className={padClass} aria-label={leftLabel} {...bindHold(onLeftChange)}>
        {leftLabel}
      </button>
      <button
        type="button"
        className={`${padClass} min-w-[88px] flex-none`}
        aria-label={centerLabel}
        disabled={centerDisabled}
        {...centerHold}
      >
        {centerLabel}
      </button>
      <button type="button" className={padClass} aria-label={rightLabel} {...bindHold(onRightChange)}>
        {rightLabel}
      </button>
    </div>
  )
}
