import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from './WindowFrame'
import {
  activateBackgroundWindow,
  closeWindowAtPath,
  getOtherUrls,
} from '../../utils/windowStackUrl'
import {
  getWindowFrameOptions,
  getWindowIconSrc,
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
        const {
          showMenuBar,
          className,
          chrome,
          shell,
          allowMaximize,
          explorerAddressPath: registryExplorerPath,
          compactFrame,
        } = getWindowFrameOptions(stackKey)
        const title = getWindowTitle(stackKey)
        const iconSrc = getWindowIconSrc(stackKey)
        const resolvedShell = shell ?? 'default'

        return (
          <WindowFrame
            key={stackKey}
            programId={programIdForStackKey(stackKey)}
            title={title}
            iconSrc={iconSrc}
            isActive={false}
            stackIndex={idx}
            showMenuBar={showMenuBar}
            className={className}
            chrome={chrome ?? 'xp'}
            shell={resolvedShell}
            allowMaximize={Boolean(allowMaximize)}
            compactRestoredFrame={Boolean(compactFrame)}
            explorerAddressPath={
              resolvedShell === 'folder'
                ? (registryExplorerPath ?? `C:\\Documents and Settings\\${title}`)
                : undefined
            }
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
