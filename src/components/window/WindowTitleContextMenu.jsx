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
      className="xp-menu fixed z-[80] min-w-[148px]"
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
        className="xp-menu-item"
        disabled={!allowMinimize}
        onClick={() => {
          onDismiss()
          onMinimize()
        }}
      >
        <span className="xp-menu-gutter" aria-hidden />
        <span>Minimize</span>
      </button>
      <button
        type="button"
        role="menuitem"
        className="xp-menu-item"
        disabled={!allowMaximize}
        onClick={() => {
          onDismiss()
          onToggleMaximize()
        }}
      >
        <span className="xp-menu-gutter" aria-hidden />
        <span>{isMaximized ? 'Restore' : 'Maximize'}</span>
      </button>
      <div className="xp-menu-sep" role="separator" />
      <button
        type="button"
        role="menuitem"
        className="xp-menu-item"
        onClick={() => {
          onDismiss()
          onClose()
        }}
      >
        <span className="xp-menu-gutter" aria-hidden />
        <span>Close</span>
      </button>
    </div>
  )
}
