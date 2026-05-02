import { useEffect, useMemo, useState } from 'react'
import { useDrag, useDragLayer } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useShellStore } from '../../stores/useShellStore'
import { FramelessWindowContext } from './FramelessWindowContext'
import WindowControls from './WindowControls'
import WindowMenuBar from './WindowMenuBar'
import WordOfficeChrome from './WordOfficeChrome'
import ExcelOfficeChrome from './ExcelOfficeChrome'
import FolderExplorerChrome from '../apps/folder/FolderExplorerChrome'
import {
  XP_STANDARD_FRAME_CLASS,
  XP_STANDARD_FRAME_HEIGHT_ONLY_CLASS,
} from '../../constants/xpWindow'

/**
 * @param {'xp' | 'none'} [chrome]
 *   `none`: no XP title bar or menu; embed custom chrome and use `useFramelessWindow()`.
 * @param {'default' | 'word' | 'excel' | 'pdf' | 'folder' | 'ie'} [shell]
 *   `word`: Word 2003–style workspace with centered A4 page (see registry `window.shell`).
 *   `excel`: Excel 2003–style grid workspace (toolbars, formula bar, sheets).
 *   `pdf`: Adobe Reader–style viewer (see `PdfReaderApp`).
 *   `folder`: Explorer-style host (tasks pane + main area for nested app shortcuts). Restored size uses the global standard frame (800×600); maximize fills the desktop as usual.
 *   `ie`: Internet Explorer 7–style chrome with embedded browsing area (see `InternetExplorerApp`).
 * @param {boolean} [allowMaximize]
 *   When false, maximize/restore is disabled (e.g. Calculator, Winamp). Full-screen maximize only applies to XP chrome.
 * @param {string} [explorerAddressPath]
 *   Address bar path when `shell === 'folder'` (defaults from `title` if omitted).
 * @param {boolean} [compactRestoredFrame]
 *   When true, restored window uses intrinsic height (no 600px shell); for small fixed-width apps like Calculator.
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
  explorerAddressPath,
  compactRestoredFrame = false,
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const programs = useShellStore((s) => s.runningPrograms)
  const upsertProgram = useShellStore((s) => s.upsertProgram)
  const removeProgram = useShellStore((s) => s.removeProgram)
  const setActiveProgram = useShellStore((s) => s.setActiveProgram)
  const setWindowFramePosition = useShellStore((s) => s.setWindowFramePosition)
  const removeWindowFramePosition = useShellStore((s) => s.removeWindowFramePosition)

  const pid = programId ?? title

  const storedPosition = useShellStore((s) => s.windowFramePositions[pid])
  const defaultPosition = useMemo(
    () => ({
      x: 28 + stackIndex * 28,
      y: 24 + stackIndex * 28,
    }),
    [stackIndex],
  )

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

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: 'WINDOW_FRAME',
      canDrag: isFrameless ? !isMaximized : !(isMaximized && allowMaximize),
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
    [allowMaximize, baseX, baseY, isFrameless, isMaximized, pid, setWindowFramePosition, title],
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
    return () => removeProgram(pid)
  }, [pid, title, iconSrc, isActive, upsertProgram, removeProgram])

  useEffect(() => {
    if (!program) return
    setIsMinimized(Boolean(program.minimized))
  }, [program])

  useEffect(() => {
    if (!allowMaximize && isMaximized) setIsMaximized(false)
  }, [allowMaximize, isMaximized])

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

  const framelessValue = isFrameless
    ? {
        attachDragRef: dragRef,
        onMinimize: handleMinimize,
        onClose: handleClose,
      }
    : null

  /** Matches `.xp-taskbar { height: 34px }` in `index.css` — fill viewport above taskbar. */
  const maximizedXpClasses =
    'fixed left-0 right-0 top-0 z-[45] m-0 flex h-[calc(100svh-34px)] max-h-[calc(100svh-34px)] w-full max-w-none flex-col rounded-none border-x-0 border-t-0 shadow-[0_1px_0_rgba(0,0,0,0.25)]'

  const hasExplicitWidthClass =
    /\bw-/.test(className) || /\bmax-w-/.test(className) || /\bmin-w-/.test(className)

  /** Restored XP windows share an 800×600 outer frame unless `className` sets width (e.g. Calculator). */
  const useStandardRestoredFrame =
    chrome === 'xp' && !isFrameless && !(isMaximized && allowMaximize)
  const standardRestoredFrameClasses = useStandardRestoredFrame
    ? compactRestoredFrame
      ? 'flex flex-col'
      : hasExplicitWidthClass
        ? XP_STANDARD_FRAME_HEIGHT_ONLY_CLASS
        : XP_STANDARD_FRAME_CLASS
    : ''

  return (
    <FramelessWindowContext.Provider value={framelessValue}>
      <section
        className={[
          'pointer-events-auto will-change-transform',
          isMaximized && !isFrameless && allowMaximize ? 'max-w-none' : 'absolute',
          isFrameless
            ? 'rounded-sm border-0 bg-transparent shadow-[0_14px_42px_rgba(0,0,0,0.55)]'
            : 'xp-window',
          isMaximized && !isFrameless && allowMaximize ? maximizedXpClasses : '',
          !isMaximized || isFrameless || !allowMaximize ? (isActive ? 'z-50' : 'z-[38]') : '',
          !isActive ? 'opacity-[0.98]' : '',
          isMaximized && isFrameless ? 'inset-2' : '',
          !isMaximized || isFrameless
            ? ['left-0 top-0', standardRestoredFrameClasses].filter(Boolean).join(' ')
            : '',
          isDragging && !isMaximized ? 'opacity-90' : '',
          className,
          isMaximized && !isFrameless && allowMaximize ? '!w-full !max-w-none' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          isMaximized && !isFrameless && allowMaximize
            ? undefined
            : { transform: `translate(${liveX}px, ${liveY}px)` }
        }
        role="dialog"
        aria-label={title}
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
            ref={isMaximized && allowMaximize ? null : dragRef}
            className={`xp-titlebar flex h-8 shrink-0 items-center justify-between border-b border-xp-window-frame px-2 shadow-xp-window-title ${isMaximized && !isFrameless && allowMaximize ? 'rounded-none' : 'rounded-t-[2px]'} ${isMaximized && allowMaximize ? 'cursor-default' : 'cursor-move'}`}
          >
            <div
              className="flex h-full min-w-0 flex-1 items-center gap-2 truncate pr-3 text-[11px] font-bold"
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
                ? 'max-h-[85svh] overflow-visible p-0'
                : shell === 'word' || shell === 'excel' || shell === 'pdf' || shell === 'folder' || shell === 'ie'
                  ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-0'
                  : compactRestoredFrame
                    ? 'xp-client shrink-0 overflow-visible p-4'
                    : 'xp-client flex min-h-0 flex-1 overflow-auto p-4'
            }
          >
            {!isFrameless && shell === 'word' ? <WordOfficeChrome>{children}</WordOfficeChrome> : null}
            {!isFrameless && shell === 'excel' ? <ExcelOfficeChrome /> : null}
            {!isFrameless && shell === 'pdf' ? children : null}
            {!isFrameless && shell === 'ie' ? children : null}
            {!isFrameless && shell === 'folder' ? (
              <FolderExplorerChrome
                addressPath={explorerAddressPath ?? `C:\\Documents and Settings\\${title}`}
              >
                {children}
              </FolderExplorerChrome>
            ) : null}
            {shell !== 'word' && shell !== 'excel' && shell !== 'pdf' && shell !== 'folder' && shell !== 'ie'
              ? children
              : null}
          </div>
        </>
      </section>
    </FramelessWindowContext.Provider>
  )
}

