import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  findFolderByAddressPath,
  getAppById,
  getFolderParentId,
  isFolderApp,
} from '../../../registry/apps'
import { openExternalUrl } from '../../../utils/openExternalUrl'
import {
  navigateFolderInPlace,
  openForegroundPreserveStack,
} from '../../../utils/windowStackUrl'

const FolderNavigationContext = createContext(null)

function folderAddress(app) {
  if (!app) return ''
  return (
    app.window?.explorerAddressPath ??
    `C:\\Documents and Settings\\${app.folderLabel ?? app.title ?? app.id}`
  )
}

/**
 * @param {{ children: import('react').ReactNode, currentApp: object | null | undefined, active?: boolean }} props
 */
export function FolderNavigationProvider({ children, currentApp, active = true }) {
  const navigate = useNavigate()
  const location = useLocation()

  /** Host route for this Explorer window — keep stable so the page does not remount mid-browse. */
  const hostPathRef = useRef(location.pathname)
  const explorerProgramIdRef = useRef(
    location.state?.explorerProgramId ?? (currentApp ? `win-${currentApp.id}` : 'win-folder'),
  )

  const [history, setHistory] = useState(() => {
    const fromState = location.state?.folderHistory
    if (Array.isArray(fromState) && fromState.length > 0) return fromState
    return currentApp?.id ? [currentApp.id] : []
  })
  const [historyIndex, setHistoryIndex] = useState(() => {
    if (typeof location.state?.folderHistoryIndex === 'number') {
      return location.state.folderHistoryIndex
    }
    return Math.max(0, (location.state?.folderHistory?.length ?? 1) - 1)
  })

  const canBack = active && historyIndex > 0
  const canForward = active && historyIndex < history.length - 1
  const parentId = currentApp ? getFolderParentId(currentApp.id) : null
  const canUp = active && Boolean(parentId && getAppById(parentId))
  const addressPath = folderAddress(currentApp)

  const browseTo = useCallback(
    (folderApp, { history: nextHistory, index } = {}) => {
      if (!active || !folderApp || !isFolderApp(folderApp)) return

      const hist = nextHistory ?? history
      const idx = typeof index === 'number' ? index : historyIndex
      if (nextHistory) setHistory(nextHistory)
      if (typeof index === 'number') setHistoryIndex(index)

      navigateFolderInPlace(
        navigate,
        location,
        hostPathRef.current,
        folderApp.id,
        {
          explorerProgramId: explorerProgramIdRef.current,
          folderHistory: hist,
          folderHistoryIndex: idx,
        },
      )
    },
    [active, navigate, location, history, historyIndex],
  )

  const openFolder = useCallback(
    (folderApp) => {
      if (!active || !folderApp || !isFolderApp(folderApp)) return
      if (folderApp.id === currentApp?.id) return
      const nextHistory = [...history.slice(0, historyIndex + 1), folderApp.id]
      browseTo(folderApp, {
        history: nextHistory,
        index: nextHistory.length - 1,
      })
    },
    [active, currentApp?.id, history, historyIndex, browseTo],
  )

  const goBack = useCallback(() => {
    if (!canBack) return
    const nextIdx = historyIndex - 1
    const target = getAppById(history[nextIdx])
    if (!target || !isFolderApp(target)) return
    browseTo(target, { history, index: nextIdx })
  }, [canBack, history, historyIndex, browseTo])

  const goForward = useCallback(() => {
    if (!canForward) return
    const nextIdx = historyIndex + 1
    const target = getAppById(history[nextIdx])
    if (!target || !isFolderApp(target)) return
    browseTo(target, { history, index: nextIdx })
  }, [canForward, history, historyIndex, browseTo])

  const goUp = useCallback(() => {
    if (!canUp || !parentId) return
    const parent = getAppById(parentId)
    if (parent) openFolder(parent)
  }, [canUp, parentId, openFolder])

  const goToAddress = useCallback(
    (raw) => {
      if (!active) return false
      const match = findFolderByAddressPath(raw)
      if (!match) return false
      if (match.id === currentApp?.id) return true
      openFolder(match)
      return true
    },
    [active, currentApp?.id, openFolder],
  )

  const openItem = useCallback(
    (app) => {
      if (!app) return
      if (isFolderApp(app)) {
        openFolder(app)
        return
      }
      if (app.externalUrl) {
        openExternalUrl(app.externalUrl)
        return
      }
      if (!app.path) return
      openForegroundPreserveStack(navigate, location, app.path, app.id)
    },
    [openFolder, navigate, location],
  )

  const addressHistory = useMemo(
    () =>
      history
        .map((id) => getAppById(id))
        .filter(Boolean)
        .map((app) => folderAddress(app)),
    [history],
  )

  const value = useMemo(
    () => ({
      currentApp,
      explorerProgramId: explorerProgramIdRef.current,
      active,
      addressPath,
      addressHistory,
      canBack,
      canForward,
      canUp,
      goBack,
      goForward,
      goUp,
      goToAddress,
      openFolder,
      openItem,
    }),
    [
      currentApp,
      active,
      addressPath,
      addressHistory,
      canBack,
      canForward,
      canUp,
      goBack,
      goForward,
      goUp,
      goToAddress,
      openFolder,
      openItem,
    ],
  )

  return (
    <FolderNavigationContext.Provider value={value}>{children}</FolderNavigationContext.Provider>
  )
}

export function useFolderNavigation() {
  const ctx = useContext(FolderNavigationContext)
  if (!ctx) {
    return {
      currentApp: null,
      explorerProgramId: 'win-folder',
      active: false,
      addressPath: '',
      addressHistory: [],
      canBack: false,
      canForward: false,
      canUp: false,
      goBack: () => {},
      goForward: () => {},
      goUp: () => {},
      goToAddress: () => false,
      openFolder: () => {},
      openItem: () => {},
    }
  }
  return ctx
}
