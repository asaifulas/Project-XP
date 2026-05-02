import TaskbarProgramButton from './TaskbarProgramButton'
import { useShellStore } from '../../stores/useShellStore'

export default function TaskbarPrograms() {
  const programs = useShellStore((s) => s.runningPrograms)
  const setActiveProgram = useShellStore((s) => s.setActiveProgram)
  const toggleProgramMinimize = useShellStore((s) => s.toggleProgramMinimize)

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
      {programs.map((p) => (
        <TaskbarProgramButton
          key={p.id}
          title={p.title}
          iconSrc={p.iconSrc ?? null}
          active={p.active}
          minimized={p.minimized}
          onActivate={() =>
            p.active ? toggleProgramMinimize(p.id) : setActiveProgram(p.id)
          }
        />
      ))}
    </div>
  )
}
