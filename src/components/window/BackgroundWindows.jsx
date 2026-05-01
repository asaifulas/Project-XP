import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from './WindowFrame'
import {
  activateBackgroundWindow,
  closeWindowAtPath,
  getOtherUrls,
} from '../../utils/windowStackUrl'
import {
  getWindowFrameOptions,
  getWindowTitle,
  programIdForStackKey,
  renderStackWindowBody,
} from './windowRegistry'

/**
 * Renders inactive windows encoded as repeated `otherurl` search params.
 * The active (foreground) window is rendered by the matched route `<Outlet />`.
 */
export default function BackgroundWindows() {
  const location = useLocation()
  const navigate = useNavigate()
  const others = getOtherUrls(location.search)

  return (
    <>
      {others.map((stackKey, idx) => {
        const body = renderStackWindowBody(stackKey, { keyboardActive: false })
        if (!body) return null
        const { showMenuBar, className, chrome, shell } = getWindowFrameOptions(stackKey)
        const title = getWindowTitle(stackKey)

        return (
          <WindowFrame
            key={stackKey}
            programId={programIdForStackKey(stackKey)}
            title={title}
            isActive={false}
            stackIndex={idx}
            showMenuBar={showMenuBar}
            className={className}
            chrome={chrome ?? 'xp'}
            shell={shell ?? 'default'}
            onClose={() => closeWindowAtPath(navigate, location, stackKey)}
            onActivate={() => activateBackgroundWindow(navigate, location, stackKey)}
          >
            {body}
          </WindowFrame>
        )
      })}
    </>
  )
}
