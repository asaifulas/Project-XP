import StartButton from './StartButton'
import StartMenu from './StartMenu'
import TaskbarDivider from './TaskbarDivider'
import TaskbarPrograms from './TaskbarPrograms'
import SystemTray from './SystemTray'
import { useShellStore } from '../../stores/useShellStore'

export default function Taskbar() {
  const startMenuOpen = useShellStore((s) => s.startMenuOpen)
  const toggleStartMenu = useShellStore((s) => s.toggleStartMenu)
  const closeStartMenu = useShellStore((s) => s.closeStartMenu)

  return (
    <footer
      className="xp-taskbar flex flex-none items-stretch gap-1 px-1 py-0.5 pl-0.5"
      role="contentinfo"
      aria-label="Taskbar"
    >
      <div className="relative flex shrink-0 items-center">
        <StartButton open={startMenuOpen} onClick={toggleStartMenu} />
        <StartMenu open={startMenuOpen} onRequestClose={closeStartMenu} />
        <TaskbarDivider />
        <div
          className="flex h-[28px] items-center gap-0.5 px-1 opacity-95"
          aria-hidden
          title="Quick Launch"
        >
          <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded border border-black/35 bg-white/10 text-[10px] text-white">
            ⬛
          </span>
          <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded border border-black/35 bg-white/10 text-[10px] text-white">
            ▶
          </span>
        </div>
      </div>

      <TaskbarPrograms />
      <SystemTray />
    </footer>
  )
}
