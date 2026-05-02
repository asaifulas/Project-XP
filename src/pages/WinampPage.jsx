import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from '../components/window/WindowFrame'
import WinampApp from '../components/apps/winamp/WinampApp'
import { getAppFromLocation } from '../registry/apps'
import {
  closeWindowAtPath,
  getOtherUrls,
  programIdForPath,
  stackKeyFromLocation,
} from '../utils/windowStackUrl'

export default function WinampPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const others = getOtherUrls(location.search)
  const stackKey = stackKeyFromLocation(location)
  const app = getAppFromLocation(location.pathname, location.search)
  const win = app?.window ?? {}

  return (
    <div className="flex h-full items-start justify-center p-3 pt-10 text-left">
      <WindowFrame
        programId={programIdForPath('/winamp')}
        title="Winamp"
        iconSrc={app?.icon ?? null}
        isActive
        stackIndex={others.length}
        showMenuBar={Boolean(win.showMenuBar ?? true)}
        className={win.className ?? ''}
        chrome={win.chrome ?? 'xp'}
        shell={win.shell ?? 'default'}
        allowMaximize={win.allowMaximize ?? true}
        onClose={() => closeWindowAtPath(navigate, location, stackKey)}
      >
        <WinampApp />
      </WindowFrame>
    </div>
  )
}
