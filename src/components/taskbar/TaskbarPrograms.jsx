import { useLocation, useNavigate } from 'react-router-dom'
import TaskbarProgramButton from './TaskbarProgramButton'
import { useShellStore } from '../../stores/useShellStore'
import { findStackKeyForProgramId } from '../window/windowRegistry'
import {
  activateBackgroundWindow,
  getOtherUrls,
  stackKeyFromLocation,
} from '../../utils/windowStackUrl'

export default function TaskbarPrograms() {
  const navigate = useNavigate()
  const location = useLocation()
  const programs = useShellStore((s) => s.runningPrograms)
  const setActiveProgram = useShellStore((s) => s.setActiveProgram)
  const toggleProgramMinimize = useShellStore((s) => s.toggleProgramMinimize)

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

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
      {programs.map((p) => (
        <TaskbarProgramButton
          key={p.id}
          title={p.title}
          iconSrc={p.iconSrc ?? null}
          active={p.active}
          minimized={p.minimized}
          onActivate={() => handleActivate(p)}
        />
      ))}
    </div>
  )
}
