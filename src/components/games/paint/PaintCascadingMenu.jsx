import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** Visible height for long XP flyouts (phone + desktop). */
const MENU_MAX_HEIGHT = 'min(50vh, 288px)'
const MENU_MIN_WIDTH = 176

/**
 * Classic XP cascading popup (white sheet, blue hover, check gutter, ► flyouts).
 * Long lists scroll; flyouts portal to document.body so fixed coords stay correct
 * even when an ancestor (WindowFrame) uses CSS transform.
 * @param {{
 *   items: Array<{
 *     label?: string
 *     action?: () => void
 *     disabled?: boolean
 *     bold?: boolean
 *     checked?: boolean
 *     separator?: boolean
 *     submenu?: Array<unknown>
 *   }>
 *   onClose: () => void
 *   depth?: number
 * }} props
 */
export default function PaintCascadingMenu({ items, onClose, depth = 0 }) {
  const [openSub, setOpenSub] = useState(/** @type {string | null} */ (null))
  const [flyoutPos, setFlyoutPos] = useState(/** @type {{ top: number, left: number } | null} */ (null))
  const menuRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const rowRefs = useRef(/** @type {Record<string, HTMLDivElement | null>} */ ({}))

  useLayoutEffect(() => {
    if (!openSub) {
      setFlyoutPos(null)
      return undefined
    }

    const update = () => {
      const row = rowRefs.current[openSub]
      if (!row) return
      const rect = row.getBoundingClientRect()
      const spaceRight = window.innerWidth - rect.right
      const openLeft = spaceRight < MENU_MIN_WIDTH + 8
      // 1px overlap with parent sheet (classic XP)
      const left = openLeft ? Math.max(4, rect.left - MENU_MIN_WIDTH + 1) : rect.right - 1
      const maxTop = Math.max(4, window.innerHeight - 48)
      const top = Math.min(Math.max(4, rect.top - 3), maxTop)
      setFlyoutPos({ top, left })
    }

    update()

    const menu = menuRef.current
    menu?.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)

    return () => {
      menu?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [openSub])

  const openItem = openSub
    ? items.find((item, index) => {
        if (item.separator) return false
        return `${depth}-${item.label}-${index}` === openSub
      })
    : null
  const openSubmenu =
    openItem && Array.isArray(openItem.submenu) ? /** @type {typeof items} */ (openItem.submenu) : null

  const flyout =
    openSubmenu && flyoutPos && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="z-[10000]"
            style={{
              position: 'fixed',
              top: flyoutPos.top,
              left: flyoutPos.left,
            }}
            // Keep hover chain alive when moving into the flyout
            onMouseEnter={() => {
              if (openSub) setOpenSub(openSub)
            }}
          >
            <PaintCascadingMenu items={openSubmenu} onClose={onClose} depth={depth + 1} />
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div
        ref={menuRef}
        className="xp-menu z-30 min-w-[176px]"
        style={{
          maxHeight: MENU_MAX_HEIGHT,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        role="menu"
        onWheel={(event) => event.stopPropagation()}
      >
        {items.map((item, index) => {
          if (item.separator) {
            return <div key={`sep-${depth}-${index}`} className="xp-menu-sep" role="separator" />
          }

          const hasSub = Array.isArray(item.submenu) && item.submenu.length > 0
          const key = `${depth}-${item.label}-${index}`
          const isOpen = openSub === key

          return (
            <div
              key={key}
              ref={(node) => {
                rowRefs.current[key] = node
              }}
              className="relative"
              onMouseEnter={() => {
                if (hasSub && !item.disabled) setOpenSub(key)
                else if (!hasSub) setOpenSub(null)
              }}
            >
              <button
                type="button"
                role="menuitem"
                disabled={Boolean(item.disabled)}
                aria-haspopup={hasSub ? 'menu' : undefined}
                aria-expanded={hasSub ? isOpen : undefined}
                className={[
                  'xp-menu-item',
                  isOpen ? '!bg-[#316ac5] !text-white' : '',
                  item.bold ? 'font-bold' : '',
                ].join(' ')}
                onClick={(event) => {
                  event.stopPropagation()
                  if (item.disabled) return
                  if (hasSub) {
                    // Hover already opens; a click must not toggle it shut (mouseenter → click = close).
                    setOpenSub(key)
                    return
                  }
                  onClose()
                  item.action?.()
                }}
              >
                <span className="xp-menu-gutter" aria-hidden>
                  {item.checked ? (
                    <span className="text-[11px] font-bold leading-none">✓</span>
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 pr-1">{item.label}</span>
                {hasSub ? (
                  <span className="mr-1 shrink-0 text-[10px] leading-none" aria-hidden>
                    ►
                  </span>
                ) : (
                  <span className="mr-1 inline-block w-2.5 shrink-0" aria-hidden />
                )}
              </button>
            </div>
          )
        })}
      </div>
      {flyout}
    </>
  )
}
