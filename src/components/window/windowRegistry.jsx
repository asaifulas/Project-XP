import { getAppFromLocation } from '../../registry/apps'
import { parseStackKey, programIdForPath } from '../../utils/windowStackUrl'

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
