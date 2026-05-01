import { useEffect, useMemo, useState } from 'react'
import { useDrag, useDragLayer } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useShellStore } from '../../stores/useShellStore'
import { FramelessWindowContext } from './FramelessWindowContext'
import WindowControls from './WindowControls'
import WindowMenuBar from './WindowMenuBar'
import WordOfficeChrome from './WordOfficeChrome'

/**
 * @param {'xp' | 'none'} [chrome]
 *   `none`: no XP title bar or menu; embed custom chrome and use `useFramelessWindow()`.
 * @param {'default' | 'word'} [shell]
 *   `word`: Word 2003–style workspace with centered A4 page (see registry `window.shell`).
 */
export default function WindowFrame({
  programId,
  title,
  children,
  onClose,
  onActivate,
  showMenuBar = true,
  className = '',
  isActive = true,
  stackIndex = 0,
  chrome = 'xp',
  shell = 'default',
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
      canDrag: !isMaximized,
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
    [baseX, baseY, isMaximized, pid, setWindowFramePosition, title],
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
      active: isActive,
      minimized: false,
    })
    return () => removeProgram(pid)
  }, [pid, title, isActive, upsertProgram, removeProgram])

  useEffect(() => {
    if (!program) return
    setIsMinimized(Boolean(program.minimized))
  }, [program])

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

  const framelessValue = isFrameless
    ? {
        attachDragRef: dragRef,
        onMinimize: handleMinimize,
        onClose: handleClose,
      }
    : null

  return (
    <FramelessWindowContext.Provider value={framelessValue}>
      <section
        className={[
          'pointer-events-auto absolute will-change-transform',
          isFrameless
            ? 'rounded-sm border-0 bg-transparent shadow-[0_14px_42px_rgba(0,0,0,0.55)]'
            : 'xp-window',
          isActive ? 'z-50' : 'z-[38]',
          !isActive ? 'opacity-[0.98]' : '',
          isMaximized
            ? 'inset-2'
            : 'left-0 top-0 w-[min(900px,calc(100%-24px))]',
          isDragging ? 'opacity-90' : '',
          className,
        ].join(' ')}
        style={
          isMaximized
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
            ref={isMaximized ? null : dragRef}
            className={`xp-titlebar flex h-8 items-center justify-between rounded-t-[2px] border-b border-xp-window-frame px-2 shadow-xp-window-title ${isMaximized ? 'cursor-default' : 'cursor-move'}`}
          >
            <div className="flex h-full flex-1 items-center truncate pr-3 text-[11px] font-bold">
              {title}
            </div>
            <WindowControls
              isMaximized={isMaximized}
              onMinimize={handleMinimize}
              onToggleMaximize={() => {
                setIsMaximized((v) => !v)
                setIsMinimized(false)
                upsertProgram({
                  id: pid,
                  title,
                  active: true,
                  minimized: false,
                })
              }}
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
                : shell === 'word'
                  ? 'flex max-h-[min(78svh,820px)] min-h-0 flex-col overflow-hidden p-0'
                  : 'xp-client max-h-[70svh] overflow-auto p-4'
            }
          >
            {!isFrameless && shell === 'word' ? (
              <WordOfficeChrome>{children}</WordOfficeChrome>
            ) : (
              children
            )}
          </div>
        </>
      </section>
    </FramelessWindowContext.Provider>
  )
}

