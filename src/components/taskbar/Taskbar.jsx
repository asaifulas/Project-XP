import { useNavigate } from 'react-router-dom'
import StartButton from './StartButton'
import StartMenu from './StartMenu'
import TaskbarPrograms from './TaskbarPrograms'
import SystemTray from './SystemTray'
import { useShellStore } from '../../stores/useShellStore'
import ieIcon from '../../assets/icons/ie.png'

/** XP's Show Desktop glyph: a tiny window, not an emoji. */
function ShowDesktopIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <rect x="1.5" y="3" width="13" height="10" rx="1" fill="#dbe8fb" stroke="#0b3f9e" />
      <rect x="1.5" y="3" width="13" height="3.2" fill="#3d8bfd" stroke="#0b3f9e" />
      <rect x="3" y="8" width="4" height="3" fill="#9fb8dd" />
      <rect x="8.5" y="8" width="4" height="3" fill="#9fb8dd" />
    </svg>
  )
}

export default function Taskbar() {
  const navigate = useNavigate()
  const startMenuOpen = useShellStore((s) => s.startMenuOpen)
  const toggleStartMenu = useShellStore((s) => s.toggleStartMenu)
  const closeStartMenu = useShellStore((s) => s.closeStartMenu)
  const minimizeAllPrograms = useShellStore((s) => s.minimizeAllPrograms)

  return (
    <footer
      className="xp-taskbar flex flex-none items-stretch"
      role="contentinfo"
      aria-label="Taskbar"
    >
      <div className="relative flex shrink-0 items-stretch">
        <StartButton open={startMenuOpen} onClick={toggleStartMenu} />
        <StartMenu open={startMenuOpen} onRequestClose={closeStartMenu} />
      </div>

      <span className="xp-grip" aria-hidden />

      <div className="xp-quicklaunch">
        <button
          type="button"
          className="xp-ql-btn"
          title="Show Desktop"
          aria-label="Show Desktop"
          onClick={minimizeAllPrograms}
        >
          <ShowDesktopIcon />
        </button>
        <button
          type="button"
          className="xp-ql-btn"
          title="Internet Explorer"
          aria-label="Internet Explorer"
          onClick={() => navigate('/internet_explorer')}
        >
          <img src={ieIcon} alt="" draggable="false" />
        </button>
      </div>

      <span className="xp-grip" aria-hidden />

      <TaskbarPrograms />
      <SystemTray />
    </footer>
  )
}
