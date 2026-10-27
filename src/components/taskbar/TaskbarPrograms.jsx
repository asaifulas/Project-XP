import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TaskbarProgramButton from './TaskbarProgramButton'
import WindowTitleContextMenu from '../window/WindowTitleContextMenu'
import { getAppById } from '../../registry/apps'
import { useShellStore } from '../../stores/useShellStore'
import { findStackKeyForProgramId } from '../window/windowRegistry'
import {
  activateBackgroundWindow,
  closeWindowAtPath,
  getOtherUrls,
  stackKeyFromLocation,
} from '../../utils/windowStackUrl'

export default function TaskbarPrograms() {
  const navigate = useNavigate()
  const location = useLocation()
  const programs = useShellStore((s) => s.runningPrograms)
  const setActiveProgram = useShellStore((s) => s.setActiveProgram)
  const toggleProgramMinimize = useShellStore((s) => s.toggleProgramMinimize)
  const setProgramMinimized = useShellStore((s) => s.setProgramMinimized)
  const toggleProgramMaximize = useShellStore((s) => s.toggleProgramMaximize)
  const removeProgram = useShellStore((s) => s.removeProgram)
  const removeWindowFramePosition = useShellStore((s) => s.removeWindowFramePosition)

  const [menu, setMenu] = useState(
    /** @type {null | { x: number, y: number, programId: string }} */ (null),
  )

  useEffect(() => {
    if (!menu) return undefined
    const dismiss = () => setMenu(null)
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
  }, [menu])

  const handleActivate = (program) => {
    const foreKey = stackKeyFromLocation(location)
    const others = getOtherUrls(location.search)
    const targetKey = findStackKeyForProgramId(program.id, location)
    const isForeground = Boolean(targetKey && targetKey === foreKey)
    const isBackground = Boolean(targetKey && others.includes(targetKey))

    if (isBackground && targetKey) {
      activateBackgroundWindow(navigate, location, targetKey)
      setActiveProgram(program.id)
      return
    }

    if (isForeground && program.active && !program.minimized) {
      toggleProgramMinimize(program.id)
      return
    }

    setActiveProgram(program.id)
  }

  const openContextMenu = (event, program) => {
    event.preventDefault()
    event.stopPropagation()
    const menuWidth = 160
    const menuHeight = 96
    const x = Math.max(4, Math.min(event.clientX, window.innerWidth - menuWidth))
    const y = Math.max(4, Math.min(event.clientY, window.innerHeight - menuHeight))
    setMenu({ x, y, programId: program.id })
  }

  const menuProgram = menu ? programs.find((p) => p.id === menu.programId) : null
  const menuAppId = menuProgram?.id?.startsWith('win-') ? menuProgram.id.slice(4) : menuProgram?.id
  const menuApp = menuAppId ? getAppById(menuAppId) : null
  const allowMaximize = menuApp?.window?.allowMaximize !== false

  return (
    <div className="flex min-w-0 flex-1 items-center gap-[2px] overflow-x-auto overflow-y-hidden px-1">
      {programs.map((p) => (
        <TaskbarProgramButton
          key={p.id}
          title={p.title}
          iconSrc={p.iconSrc ?? null}
          active={p.active}
          minimized={p.minimized}
          onActivate={() => handleActivate(p)}
          onContextMenu={(event) => openContextMenu(event, p)}
        />
      ))}
      {menu && menuProgram ? (
        <WindowTitleContextMenu
          x={menu.x}
          y={menu.y}
          isMaximized={Boolean(menuProgram.maximized)}
          allowMaximize={allowMaximize}
          allowMinimize
          onDismiss={() => setMenu(null)}
          onMinimize={() => {
            setProgramMinimized(menuProgram.id, true)
          }}
          onToggleMaximize={() => {
            if (!allowMaximize) return
            setProgramMinimized(menuProgram.id, false)
            toggleProgramMaximize(menuProgram.id)
          }}
          onClose={() => {
            const key = findStackKeyForProgramId(menuProgram.id, location)
            if (key) closeWindowAtPath(navigate, location, key)
            removeWindowFramePosition(menuProgram.id)
            removeProgram(menuProgram.id)
          }}
        />
      ) : null}
    </div>
  )
}
