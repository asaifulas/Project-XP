import { Suspense, lazy } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from '../components/window/WindowFrame'
import { getAppFromLocation } from '../registry/apps'
import {
  closeWindowAtPath,
  getOtherUrls,
  programIdForPath,
  stackKeyFromLocation,
} from '../utils/windowStackUrl'

const PaintApp = lazy(() => import('../components/games/paint/PaintApp'))

function PaintBusy() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-[#c0c0c0] font-xp text-[11px] text-black">
      Loading Paint…
    </div>
  )
}

export default function PaintPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const others = getOtherUrls(location.search)
  const stackKey = stackKeyFromLocation(location)
  const app = getAppFromLocation(location.pathname, location.search)
  const win = app?.window ?? {}

  return (
    <div className="flex h-full items-start justify-center p-3 pt-8 text-left">
      <WindowFrame
        programId={programIdForPath('/paint')}
        title={app?.title ?? 'Paint'}
        iconSrc={app?.icon ?? null}
        isActive
        stackIndex={others.length}
        onClose={() => closeWindowAtPath(navigate, location, stackKey)}
        showMenuBar={Boolean(win.showMenuBar ?? false)}
        className={win.className ?? ''}
        chrome={win.chrome ?? 'xp'}
        shell={win.shell ?? 'default'}
        allowMaximize={win.allowMaximize ?? true}
        compactRestoredFrame={Boolean(win.compactFrame)}
        noClientPadding={Boolean(win.noClientPadding ?? true)}
      >
        <Suspense fallback={<PaintBusy />}>
          <PaintApp keyboardActive />
        </Suspense>
      </WindowFrame>
    </div>
  )
}
