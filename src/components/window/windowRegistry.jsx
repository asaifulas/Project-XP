import { APPS, getAppFromLocation, getAppById } from '../../registry/apps'
import { buildStackKey, getOtherUrls, parseStackKey, programIdForPath, stackKeyFromLocation } from '../../utils/windowStackUrl'

/**
 * @param {string} key Stack key: `/calculator` or `/about?app=my_computer`
 */
export function getAppFromStackKey(key) {
  const { pathname, appId } = parseStackKey(key)
  const search = appId ? `?app=${encodeURIComponent(appId)}` : ''
  return getAppFromLocation(pathname, search)
}

export function programIdForStackKey(key) {
  const app = getAppFromStackKey(key)
  if (app) return `win-${app.id}`
  const { pathname } = parseStackKey(key)
  return programIdForPath(pathname)
}

/**
 * Resolve a taskbar `programId` back to a URL stack key (null for non-route overlays).
 *
 * @param {string} programId
 * @returns {string | null}
 */
export function stackKeyForProgramId(programId) {
  if (!programId || programId === 'display-properties') return null
  const appId = programId.startsWith('win-') ? programId.slice(4) : programId
  const app = getAppById(appId)
  if (!app?.path || !app.stackable) return null
  const peers = APPS.filter((a) => a.path === app.path && a.stackable)
  return buildStackKey(app.path, peers.length > 1 ? app.id : null)
}

/**
 * Find the stack key currently used in the URL for a taskbar program id.
 * Falls back to `stackKeyForProgramId` when the window is not mounted in the stack.
 *
 * @param {string} programId
 * @param {{ pathname: string, search: string }} location
 * @returns {string | null}
 */
export function findStackKeyForProgramId(programId, location) {
  const foreKey = stackKeyFromLocation(location)
  if (programIdForStackKey(foreKey) === programId) return foreKey
  for (const key of getOtherUrls(location.search)) {
    if (programIdForStackKey(key) === programId) return key
  }
  return stackKeyForProgramId(programId)
}

/**
 * @param {string} key
 * @param {{ keyboardActive?: boolean }} [opts]
 */
export function renderStackWindowBody(key, opts = {}) {
  const app = getAppFromStackKey(key)
  if (!app?.renderStack) return null
  return app.renderStack({
    keyboardActive: Boolean(opts.keyboardActive),
    app,
  })
}

export function getWindowTitle(key) {
  return getAppFromStackKey(key)?.title ?? 'Window'
}

export function getWindowFrameOptions(key) {
  const win = getAppFromStackKey(key)?.window
  return {
    showMenuBar: true,
    className: '',
    chrome: 'xp',
    shell: 'default',
    allowMaximize: true,
    explorerAddressPath: undefined,
    compactFrame: false,
    ...win,
  }
}

export function getWindowIconSrc(key) {
  return getAppFromStackKey(key)?.icon ?? null
}
