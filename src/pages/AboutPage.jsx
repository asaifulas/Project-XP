import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from '../components/window/WindowFrame'
import InternetExplorerApp from '../components/apps/ie/InternetExplorerApp'
import AboutWindowContent from '../components/windows/AboutWindowContent'
import { getAppFromLocation } from '../registry/apps'
import {
  closeWindowAtPath,
  getOtherUrls,
  stackKeyFromLocation,
} from '../utils/windowStackUrl'

export default function AboutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const others = getOtherUrls(location.search)
  const app = getAppFromLocation(location.pathname, location.search)
  const stackKey = stackKeyFromLocation(location)
  const win = app?.window ?? {}
  const shell = win.shell ?? 'default'

  const ieInitial = win.initialUrl ?? 'https://app.inerva.my'
  const [ieCaption, setIeCaption] = useState(() =>
    app?.id === 'ie' ? ieInitial : '',
  )

  useEffect(() => {
    if (app?.id === 'ie') {
      setIeCaption(ieInitial)
    }
  }, [app?.id, ieInitial])

  const frameTitle = useMemo(() => {
    if (app?.id === 'ie') {
      return ieCaption ? `${ieCaption} - Windows Internet Explorer` : 'Windows Internet Explorer'
    }
    return app?.title ?? 'About'
  }, [app?.id, app?.title, ieCaption])

  return (
    <div className="flex h-full items-start justify-center p-3 pt-10 text-left">
      <WindowFrame
        programId={app ? `win-${app.id}` : 'win-about'}
        title={frameTitle}
        iconSrc={app?.icon ?? null}
        isActive
        stackIndex={others.length}
        showMenuBar={Boolean(win.showMenuBar ?? true)}
        className={win.className ?? ''}
        chrome={win.chrome ?? 'xp'}
        shell={shell}
        allowMaximize={win.allowMaximize ?? true}
        explorerAddressPath={win.explorerAddressPath}
        onClose={() => closeWindowAtPath(navigate, location, stackKey)}
      >
        {app?.id === 'ie' ? (
          <InternetExplorerApp initialUrl={ieInitial} onCaptionChange={setIeCaption} />
        ) : (
          <AboutWindowContent />
        )}
      </WindowFrame>
    </div>
  )
}
