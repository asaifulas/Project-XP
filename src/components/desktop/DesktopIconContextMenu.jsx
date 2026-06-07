const MENU_ITEM =
  'block w-full px-4 py-[3px] text-left text-[11px] leading-tight text-black hover:bg-[#316ac5] hover:text-white disabled:cursor-default disabled:text-zinc-400 disabled:hover:bg-transparent disabled:hover:text-zinc-400'
const MENU_ITEM_BOLD = `${MENU_ITEM} font-bold`
const MENU_SEP = 'my-[2px] border-t border-[#aca899]'

/**
 * @param {{ x: number, y: number, onClose: () => void, onOpen?: () => void, onProperties?: () => void }} props
 */
export default function DesktopIconContextMenu({ x, y, onClose, onOpen, onProperties }) {
  return (
    <div
      className="absolute z-50 min-w-[196px] border border-[#aca899] bg-white py-[2px] shadow-[2px_2px_4px_rgba(0,0,0,0.25)]"
      style={{ left: x, top: y }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        type="button"
        role="menuitem"
        className={MENU_ITEM_BOLD}
        onClick={() => {
          onOpen?.()
          onClose()
        }}
      >
        Open
      </button>
      <button type="button" role="menuitem" className={MENU_ITEM} disabled>
        Explore
      </button>
      <button type="button" role="menuitem" className={MENU_ITEM} disabled>
        Search...
      </button>
      <div className={MENU_SEP} role="separator" />
      <button type="button" role="menuitem" className={MENU_ITEM} disabled>
        Map Network Drive...
      </button>
      <button type="button" role="menuitem" className={MENU_ITEM} disabled>
        Disconnect Network Drive...
      </button>
      <div className={MENU_SEP} role="separator" />
      <button type="button" role="menuitem" className={MENU_ITEM} disabled>
        Create Shortcut
      </button>
      <button type="button" role="menuitem" className={MENU_ITEM} disabled>
        Delete
      </button>
      <button type="button" role="menuitem" className={MENU_ITEM} disabled>
        Rename
      </button>
      <div className={MENU_SEP} role="separator" />
      <button
        type="button"
        role="menuitem"
        className={MENU_ITEM}
        onClick={() => {
          onProperties?.()
          onClose()
        }}
      >
        Properties
      </button>
    </div>
  )
}
