import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDrag, useDragLayer } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useShellStore } from '../../stores/useShellStore'
import { FramelessWindowContext } from './FramelessWindowContext'
import WindowControls from './WindowControls'
import WindowTitleContextMenu from './WindowTitleContextMenu'
import WindowMenuBar from './WindowMenuBar'
import WordOfficeChrome from './WordOfficeChrome'
import ExcelOfficeChrome from './ExcelOfficeChrome'
import PowerPointOfficeChrome from './PowerPointOfficeChrome'
import FolderExplorerChrome from '../apps/folder/FolderExplorerChrome'
import {
  XP_FOLDER_FRAME_CLASS,
  XP_FOLDER_FRAME_HEIGHT_ONLY_CLASS,
  XP_STANDARD_FRAME_CLASS,
  XP_STANDARD_FRAME_HEIGHT_ONLY_CLASS,
} from '../../constants/xpWindow'

const PHONE_LAYOUT_QUERY = '(max-width: 767px)'

function usePhoneLayout() {
  const [isPhone, setIsPhone] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(PHONE_LAYOUT_QUERY).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(PHONE_LAYOUT_QUERY)
    const onChange = () => setIsPhone(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isPhone
}

/**
 * @param {'xp' | 'none'} [chrome]
 *   `none`: no XP title bar or menu; embed custom chrome and use `useFramelessWindow()`.
 * @param {'default' | 'word' | 'excel' | 'ppt' | 'ppt-full' | 'pdf' | 'folder' | 'ie' | 'certimagic'} [shell]
 *   `word`: Word 2003–style workspace with centered A4 page (see registry `window.shell`).
 *   `excel`: Excel 2003–style grid workspace (toolbars, formula bar, sheets).
 *   `ppt`: PowerPoint 2003–style slide workspace (outline + stage).
 *   `ppt-full`: Self-contained deck fills the client area (no outer slide chrome).
 *   `pdf`: Adobe Reader–style viewer (see `PdfReaderApp`).
 *   `folder`: Explorer-style host (tasks pane + main area for nested app shortcuts). Restored size uses 1024×768; maximize fills the desktop as usual.
 *   `ie`: Internet Explorer 7–style chrome with embedded browsing area (see `InternetExplorerApp`).
 *   `certimagic`: Excel-look workbook that renders app children (sheet tabs live inside the app).
 * @param {boolean} [allowMaximize]
 *   When false, maximize/restore is disabled (e.g. Calculator, Winamp). Full-screen maximize only applies to XP chrome.
 * @param {string} [explorerAddressPath]
 *   Address bar path when `shell === 'folder'` (defaults from `title` if omitted).
 * @param {boolean} [compactRestoredFrame]
 *   When true, restored window uses intrinsic height (no fixed standard height); for small fixed-width apps like Calculator.
 */
export default function WindowFrame({
  programId,
  title,
  iconSrc,
  children,
  onClose,
  onActivate,
  showMenuBar = true,
  className = '',
  isActive = true,
  stackIndex = 0,
  chrome = 'xp',
  shell = 'default',
  allowMaximize = true,
  allowMinimize = true,
  explorerAddressPath,
  explorerVariant,
  compactRestoredFrame = false,
  noClientPadding = false,
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [titleMenu, setTitleMenu] = useState(null)
  const programs = useShellStore((s) => s.runningPrograms)
  const upsertProgram = useShellStore((s) => s.upsertProgram)
  const removeProgram = useShellStore((s) => s.removeProgram)
  const setActiveProgram = useShellStore((s) => s.setActiveProgram)
  const setWindowFramePosition = useShellStore((s) => s.setWindowFramePosition)
  const removeWindowFramePosition = useShellStore((s) => s.removeWindowFramePosition)

  const pid = programId ?? title

  const storedPosition = useShellStore((s) => s.windowFramePositions[pid])
  /*
   * Cascade a new window down-right, but never past the viewport. The restored
   * frame is `min(1440px, 100% - 24px)` wide, so a fixed 28px x put the right
   * frame edge (and the 3px Luna border, and any scrollbar) off-screen at
   * 1440-wide desktops. Clamp against the width this window will actually use.
   */
  const defaultPosition = useMemo(() => {
    const offset = stackIndex * 28
    if (typeof window === 'undefined') return { x: 28 + offset, y: 24 + offset }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const frameW = Math.min(shell === 'folder' ? 1024 : 1440, vw - 24)
    return {
      x: Math.max(8, Math.min(28 + offset, vw - frameW - 12)),
      y: Math.max(8, Math.min(24 + offset, vh - 120)),
    }
  }, [stackIndex, shell])

  const baseX =
    storedPosition && Number.isFinite(storedPosition.x)
      ? storedPosition.x
      : defaultPosition.x
  const baseY =
    storedPosition && Number.isFinite(storedPosition.y)
      ? storedPosition.y
      : defaultPosition.y

  const program = programs.find((p) => p.id === pid)

  const isFrameless = chrome === 'none'
  const isPhone = usePhoneLayout()

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: 'WINDOW_FRAME',
      canDrag: !isPhone && (isFrameless ? !isMaximized : !(isMaximized && allowMaximize)),
      item: () => ({
        pid,
        title,
        x: baseX,
        y: baseY,
      }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset()
        if (!delta || !item) return
        setWindowFramePosition(item.pid, {
          x: item.x + delta.x,
          y: item.y + delta.y,
        })
      },
    }),
    [allowMaximize, baseX, baseY, isFrameless, isMaximized, isPhone, pid, setWindowFramePosition, title],
  )

  const liveDelta = useDragLayer((monitor) =>
    monitor.getDifferenceFromInitialOffset(),
  )
  const liveX = baseX + (isDragging && liveDelta ? liveDelta.x : 0)
  const liveY = baseY + (isDragging && liveDelta ? liveDelta.y : 0)

  useEffect(() => {
    // Remove native browser drag ghost so the real window movement is visible.
    previewRef(getEmptyImage(), { captureDraggingState: true })
  }, [previewRef])

  useEffect(() => {
    upsertProgram({
      id: pid,
      title,
      iconSrc: iconSrc ?? null,
      active: isActive,
      minimized: false,
    })
  }, [pid, title, iconSrc, isActive, upsertProgram])

  useEffect(() => {
    if (!program) return
    setIsMinimized(Boolean(program.minimized))
  }, [program])

  useEffect(() => {
    if (!allowMaximize && isMaximized) setIsMaximized(false)
  }, [allowMaximize, isMaximized])

  useEffect(() => {
    if (!titleMenu) return

    const dismiss = () => setTitleMenu(null)
    const onPointerDown = (event) => {
      if (event.button !== 0) return
      dismiss()
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismiss()
    }

    const timeoutId = window.setTimeout(() => {
      window.addEventListener('pointerdown', onPointerDown)
    }, 0)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [titleMenu])

  if (!isOpen) return null
  if (isMinimized) return null

  function handleClose() {
    // Navigation should win over local unmount, otherwise the URL can remain
    // on the closed route (e.g. frameless apps), causing it to re-stack later.
    try {
      onClose?.()
    } finally {
      removeWindowFramePosition(pid)
      removeProgram(pid)
      setIsOpen(false)
    }
  }

  function handleMinimize() {
    setIsMinimized(true)
    upsertProgram({
      id: pid,
      title,
      active: false,
      minimized: true,
    })
  }

  function handleToggleMaximize() {
    if (!allowMaximize) return
    setIsMaximized((v) => !v)
    setIsMinimized(false)
    upsertProgram({
      id: pid,
      title,
      active: true,
      minimized: false,
    })
  }

  function openTitleMenu(event) {
    event.preventDefault()
    event.stopPropagation()
    const menuWidth = 160
    const menuHeight = 96
    const x = Math.max(4, Math.min(event.clientX, window.innerWidth - menuWidth))
    const y = Math.max(4, Math.min(event.clientY, window.innerHeight - menuHeight))
    setTitleMenu({ x, y })
  }

  const framelessValue = isFrameless
    ? {
        attachDragRef: dragRef,
        onMinimize: allowMinimize ? handleMinimize : null,
        onClose: handleClose,
        onTitleContextMenu: openTitleMenu,
      }
    : null

  /** Matches `.xp-taskbar { height: 34px }` in `index.css` — fill viewport above taskbar. */
  const maximizedXpClasses =
    'fixed left-0 right-0 top-0 z-[45] m-0 flex h-[calc(100svh-34px)] max-h-[calc(100svh-34px)] w-full max-w-none flex-col rounded-none border-x-0 border-t-0 border-b-0 shadow-[0_1px_0_rgba(0,0,0,0.25)]'
  /** Phone: every open window fills the screen above the taskbar, ignoring desktop frame size. */
  const phoneFillClasses =
    'fixed inset-x-0 top-0 m-0 flex !h-[calc(100svh-34px)] !max-h-[calc(100svh-34px)] !w-full !max-w-none flex-col rounded-none border-x-0 border-t-0 border-b-0'
  const fillsViewport = isPhone || (isMaximized && !isFrameless && allowMaximize)

  const hasExplicitWidthClass =
    /\bw-/.test(className) || /\bmax-w-/.test(className) || /\bmin-w-/.test(className)

  /** Restored XP frame: 1440×1080 by default; `shell: 'folder'` uses 1024×768 unless `className` / `compactRestoredFrame` specialize (e.g. Calculator, Winamp). */
  const useStandardRestoredFrame =
    !isPhone && chrome === 'xp' && !isFrameless && !(isMaximized && allowMaximize)
  const standardRestoredFrameClasses = useStandardRestoredFrame
    ? compactRestoredFrame
      ? 'flex flex-col'
      : hasExplicitWidthClass
        ? shell === 'folder'
          ? XP_FOLDER_FRAME_HEIGHT_ONLY_CLASS
          : XP_STANDARD_FRAME_HEIGHT_ONLY_CLASS
        : shell === 'folder'
          ? XP_FOLDER_FRAME_CLASS
          : XP_STANDARD_FRAME_CLASS
    : ''

  return (
    <FramelessWindowContext.Provider value={framelessValue}>
      <section
        className={[
          'pointer-events-auto will-change-transform',
          fillsViewport ? 'max-w-none' : 'absolute',
          isFrameless
            ? 'rounded-sm border-0 bg-transparent shadow-[0_14px_42px_rgba(0,0,0,0.55)]'
            : 'xp-window',
          isPhone ? phoneFillClasses : isMaximized && !isFrameless && allowMaximize ? maximizedXpClasses : '',
          isPhone || !isMaximized || isFrameless || !allowMaximize ? (isActive ? 'z-50' : 'z-[38]') : '',
          !isPhone && isMaximized && isFrameless ? 'inset-2' : '',
          !fillsViewport || isFrameless
            ? ['left-0 top-0', standardRestoredFrameClasses].filter(Boolean).join(' ')
            : '',
          isDragging && !fillsViewport ? 'opacity-90' : '',
          className,
          fillsViewport ? '!w-full !max-w-none' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          fillsViewport
            ? undefined
            : { transform: `translate(${liveX}px, ${liveY}px)` }
        }
        role="dialog"
        aria-label={title}
        data-active={isActive ? 'true' : 'false'}
        onMouseDown={() => {
          if (!isActive) {
            onActivate?.()
            return
          }
          setActiveProgram(pid)
        }}
      >
        {!isFrameless ? (
          <header
            ref={isPhone || (isMaximized && allowMaximize) ? null : dragRef}
            onContextMenu={openTitleMenu}
            className={`xp-titlebar flex h-8 shrink-0 items-center justify-between border-b border-xp-window-frame px-2 shadow-xp-window-title ${isPhone || (isMaximized && !isFrameless && allowMaximize) ? 'rounded-none' : 'rounded-t-[5px]'} ${isPhone || (isMaximized && allowMaximize) ? 'cursor-default' : 'cursor-move'}`}
          >
            <div
              className="xp-title-text flex h-full min-w-0 flex-1 items-center gap-2 truncate pr-3"
              onDoubleClick={(e) => {
                e.stopPropagation()
                handleToggleMaximize()
              }}
              title={allowMaximize ? 'Double-click to maximize or restore' : undefined}
            >
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt=""
                  className="h-4 w-4 shrink-0 select-none object-contain"
                  draggable="false"
                />
              ) : (
                <span
                  className="h-4 w-4 shrink-0 rounded-sm bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
                  aria-hidden
                />
              )}
              {title}
            </div>
            <WindowControls
              isMaximized={isMaximized}
              maximizeDisabled={!allowMaximize}
              minimizeDisabled={!allowMinimize}
              onMinimize={handleMinimize}
              onToggleMaximize={handleToggleMaximize}
              onClose={handleClose}
            />
          </header>
        ) : null}

        <>
          {!isFrameless && shell === 'default' && showMenuBar ? <WindowMenuBar /> : null}
          <div
            className={
              isFrameless
                ? isPhone
                  ? 'flex min-h-0 flex-1 flex-col overflow-auto p-0'
                  : 'max-h-[85svh] overflow-visible p-0'
                : shell === 'word' ||
                    shell === 'excel' ||
                    shell === 'ppt' ||
                    shell === 'ppt-full' ||
                    shell === 'pdf' ||
                    shell === 'folder' ||
                    shell === 'ie' ||
                    shell === 'certimagic'
                  ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-0'
                  : compactRestoredFrame
                    ? `xp-client shrink-0 overflow-visible ${noClientPadding ? 'p-0' : 'p-4'}`
                    : 'xp-client flex min-h-0 flex-1 overflow-auto p-4'
            }
          >
            {!isFrameless && shell === 'word' ? <WordOfficeChrome>{children}</WordOfficeChrome> : null}
            {!isFrameless && shell === 'excel' ? <ExcelOfficeChrome /> : null}
            {!isFrameless && shell === 'certimagic' ? children : null}
            {!isFrameless && shell === 'ppt' ? (
              <PowerPointOfficeChrome>{children}</PowerPointOfficeChrome>
            ) : null}
            {!isFrameless && shell === 'ppt-full' ? children : null}
            {!isFrameless && shell === 'pdf' ? children : null}
            {!isFrameless && shell === 'ie' ? children : null}
            {!isFrameless && shell === 'folder' ? (
              <FolderExplorerChrome
                addressPath={explorerAddressPath ?? `C:\\Documents and Settings\\${title}`}
                variant={explorerVariant ?? 'default'}
              >
                {children}
              </FolderExplorerChrome>
            ) : null}
            {shell !== 'word' &&
            shell !== 'excel' &&
            shell !== 'ppt' &&
            shell !== 'ppt-full' &&
            shell !== 'pdf' &&
            shell !== 'folder' &&
            shell !== 'ie' &&
            shell !== 'certimagic'
              ? children
              : null}
          </div>
        </>
        {titleMenu
          ? createPortal(
              <WindowTitleContextMenu
                x={titleMenu.x}
                y={titleMenu.y}
                isMaximized={isMaximized}
                allowMaximize={allowMaximize && !isFrameless}
                allowMinimize={allowMinimize}
                onDismiss={() => setTitleMenu(null)}
                onMinimize={handleMinimize}
                onToggleMaximize={handleToggleMaximize}
                onClose={handleClose}
              />,
              document.body,
            )
          : null}
      </section>
    </FramelessWindowContext.Provider>
  )
}

