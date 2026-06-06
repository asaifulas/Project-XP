import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from '../components/window/WindowFrame'
import ExperiencePowerPointContent from '../components/windows/ExperiencePowerPointContent'
import { getAppFromLocation } from '../registry/apps'
import {
  closeWindowAtPath,
  getOtherUrls,
  stackKeyFromLocation,
} from '../utils/windowStackUrl'

export default function ExperiencePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const others = getOtherUrls(location.search)
  const app = getAppFromLocation(location.pathname, location.search)
  const stackKey = stackKeyFromLocation(location)
  const win = app?.window ?? {}
  const shell = win.shell ?? 'default'

  return (
    <div className="flex h-full min-h-0 w-full flex-col p-3 pt-10">
      <WindowFrame
        programId={app ? `win-${app.id}` : 'win-experience'}
        title={app?.title ?? 'Experience.ppt'}
        iconSrc={app?.icon ?? null}
        isActive
        stackIndex={others.length}
        showMenuBar={Boolean(win.showMenuBar ?? true)}
        className={`flex min-h-0 flex-1 flex-col ${win.className ?? ''}`}
        chrome={win.chrome ?? 'xp'}
        shell={shell}
        allowMaximize={win.allowMaximize ?? true}
        onClose={() => closeWindowAtPath(navigate, location, stackKey)}
      >
        <ExperiencePowerPointContent />
      </WindowFrame>
    </div>
  )
}
