const MENU_ITEM =
  'block w-full px-4 py-[3px] text-left text-[11px] leading-tight text-black hover:bg-[#316ac5] hover:text-white disabled:cursor-default disabled:text-zinc-400 disabled:hover:bg-transparent disabled:hover:text-zinc-400'
const MENU_SEP = 'my-[2px] border-t border-[#aca899]'

/**
 * XP title-bar system menu. Right-click the top bar to close (and minimize / maximize).
 *
 * @param {{
 *   x: number,
 *   y: number,
 *   isMaximized: boolean,
 *   allowMaximize: boolean,
 *   allowMinimize: boolean,
 *   onDismiss: () => void,
 *   onMinimize: () => void,
 *   onToggleMaximize: () => void,
 *   onClose: () => void,
 * }} props
 */
export default function WindowTitleContextMenu({
  x,
  y,
  isMaximized,
  allowMaximize,
  allowMinimize,
  onDismiss,
  onMinimize,
  onToggleMaximize,
  onClose,
}) {
  return (
    <div
      className="fixed z-[80] min-w-[148px] border border-[#aca899] bg-white py-[2px] shadow-[2px_2px_4px_rgba(0,0,0,0.25)]"
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Window"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <button
        type="button"
        role="menuitem"
        className={MENU_ITEM}
        disabled={!allowMinimize}
        onClick={() => {
          onDismiss()
          onMinimize()
        }}
      >
        Minimize
      </button>
      <button
        type="button"
        role="menuitem"
        className={MENU_ITEM}
        disabled={!allowMaximize}
        onClick={() => {
          onDismiss()
          onToggleMaximize()
        }}
      >
        {isMaximized ? 'Restore' : 'Maximize'}
      </button>
      <div className={MENU_SEP} role="separator" />
      <button
        type="button"
        role="menuitem"
        className={MENU_ITEM}
        onClick={() => {
          onDismiss()
          onClose()
        }}
      >
        Close
      </button>
    </div>
  )
}
