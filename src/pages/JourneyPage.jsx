import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from '../components/window/WindowFrame'
import JourneyWindowContent from '../components/windows/JourneyWindowContent'
import { getAppFromLocation } from '../registry/apps'
import {
  closeWindowAtPath,
  getOtherUrls,
  stackKeyFromLocation,
} from '../utils/windowStackUrl'

export default function JourneyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const others = getOtherUrls(location.search)
  const app = getAppFromLocation(location.pathname, location.search)
  const stackKey = stackKeyFromLocation(location)
  const win = app?.window ?? {}
  const shell = win.shell ?? 'default'

  return (
    <div className="flex h-full items-start justify-center p-3 pt-10 text-left">
      <WindowFrame
        programId={app ? `win-${app.id}` : 'win-journey'}
        title={app?.title ?? 'My Journey'}
        iconSrc={app?.icon ?? null}
        isActive
        stackIndex={others.length}
        showMenuBar={Boolean(win.showMenuBar ?? true)}
        className={win.className ?? ''}
        chrome={win.chrome ?? 'xp'}
        shell={shell}
        allowMaximize={win.allowMaximize ?? true}
        onClose={() => closeWindowAtPath(navigate, location, stackKey)}
      >
        <JourneyWindowContent />
      </WindowFrame>
    </div>
  )
}
