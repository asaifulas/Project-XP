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

const MinesweeperApp = lazy(() => import('../components/games/minesweeper/MinesweeperApp'))

function MinesweeperBusy() {
  return (
    <div className="flex min-h-[280px] flex-1 items-center justify-center bg-[#c0c0c0] font-xp text-[11px] text-black">
      Loading Minesweeper…
    </div>
  )
}

export default function MinesweeperPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const others = getOtherUrls(location.search)
  const stackKey = stackKeyFromLocation(location)
  const app = getAppFromLocation(location.pathname, location.search)
  const win = app?.window ?? {}

  return (
    <div className="flex h-full items-start justify-center p-3 pt-8 text-left">
      <WindowFrame
        programId={programIdForPath('/minesweeper')}
        title={app?.title ?? 'Minesweeper'}
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
        <Suspense fallback={<MinesweeperBusy />}>
          <MinesweeperApp keyboardActive />
        </Suspense>
      </WindowFrame>
    </div>
  )
}
