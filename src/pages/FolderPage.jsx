import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from '../components/window/WindowFrame'
import FolderApp from '../components/apps/folder/FolderApp'
import { getAppFromLocation } from '../registry/apps'
import {
  closeWindowAtPath,
  getOtherUrls,
  stackKeyFromLocation,
} from '../utils/windowStackUrl'

export default function FolderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const others = getOtherUrls(location.search)
  const app = getAppFromLocation(location.pathname, location.search)
  const stackKey = stackKeyFromLocation(location)
  const win = app?.window ?? {}
  const shell = win.shell ?? 'default'
  const title = app?.title ?? 'Folder'
  const addressPath = win.explorerAddressPath ?? `C:\\Documents and Settings\\${title}`

  return (
    <div className="flex h-full items-start justify-center p-3 pt-10 text-left">
      <WindowFrame
        programId={app ? `win-${app.id}` : 'win-folder'}
        title={title}
        iconSrc={app?.icon ?? null}
        isActive
        stackIndex={others.length}
        showMenuBar={Boolean(win.showMenuBar ?? true)}
        className={win.className ?? ''}
        chrome={win.chrome ?? 'xp'}
        shell={shell}
        allowMaximize={win.allowMaximize ?? true}
        onClose={() => closeWindowAtPath(navigate, location, stackKey)}
        explorerAddressPath={shell === 'folder' ? addressPath : undefined}
      >
        <FolderApp childAppIds={app?.children ?? []} />
      </WindowFrame>
    </div>
  )
}
