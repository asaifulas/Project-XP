/**
 * @param {{ x: number, y: number, onClose: () => void, onOpen?: () => void, onProperties?: () => void }} props
 */
export default function DesktopIconContextMenu({ x, y, onClose, onOpen, onProperties }) {
  return (
    <div
      className="xp-menu absolute z-50 min-w-[196px]"
      style={{ left: x, top: y }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        type="button"
        role="menuitem"
        className="xp-menu-item font-bold"
        onClick={() => {
          onOpen?.()
          onClose()
        }}
      >
        <span className="xp-menu-gutter" aria-hidden />
        <span>Open</span>
      </button>
      <button type="button" role="menuitem" className="xp-menu-item" disabled>
        <span className="xp-menu-gutter" aria-hidden />
        <span>Explore</span>
      </button>
      <button type="button" role="menuitem" className="xp-menu-item" disabled>
        <span className="xp-menu-gutter" aria-hidden />
        <span>Search...</span>
      </button>
      <div className="xp-menu-sep" role="separator" />
      <button type="button" role="menuitem" className="xp-menu-item" disabled>
        <span className="xp-menu-gutter" aria-hidden />
        <span>Map Network Drive...</span>
      </button>
      <button type="button" role="menuitem" className="xp-menu-item" disabled>
        <span className="xp-menu-gutter" aria-hidden />
        <span>Disconnect Network Drive...</span>
      </button>
      <div className="xp-menu-sep" role="separator" />
      <button type="button" role="menuitem" className="xp-menu-item" disabled>
        <span className="xp-menu-gutter" aria-hidden />
        <span>Create Shortcut</span>
      </button>
      <button type="button" role="menuitem" className="xp-menu-item" disabled>
        <span className="xp-menu-gutter" aria-hidden />
        <span>Delete</span>
      </button>
      <button type="button" role="menuitem" className="xp-menu-item" disabled>
        <span className="xp-menu-gutter" aria-hidden />
        <span>Rename</span>
      </button>
      <div className="xp-menu-sep" role="separator" />
      <button
        type="button"
        role="menuitem"
        className="xp-menu-item"
        onClick={() => {
          onProperties?.()
          onClose()
        }}
      >
        <span className="xp-menu-gutter" aria-hidden />
        <span>Properties</span>
      </button>
    </div>
  )
}
