/** @typedef {{ pathname: string, search: string }} LocationLike */

/** Routes that may appear in the window stack (not the bare desktop). */
const STACK = new Set(['/about', '/biodata', '/calculator', '/winamp'])

export function isStackablePath(pathname) {
  return STACK.has(pathname)
}

/**
 * @param {string} key Stack entry: `/biodata` or `/about?app=my_computer`
 * @returns {{ pathname: string, appId: string | null }}
 */
export function parseStackKey(key) {
  const trimmed = (key || '').trim()
  if (!trimmed) return { pathname: '', appId: null }
  const q = trimmed.indexOf('?')
  if (q === -1) return { pathname: trimmed, appId: null }
  const pathname = trimmed.slice(0, q)
  const sp = new URLSearchParams(trimmed.slice(q + 1))
  return { pathname, appId: sp.get('app') }
}

export function isStackableKey(key) {
  const { pathname } = parseStackKey(key)
  return STACK.has(pathname)
}

/**
 * Foreground stack identity (pathname + optional `app` query only).
 *
 * @param {LocationLike} location
 * @returns {string}
 */
export function stackKeyFromLocation(location) {
  const { pathname, search } = location
  const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const appId = sp.get('app')
  if (appId) return `${pathname}?app=${encodeURIComponent(appId)}`
  return pathname
}

export function buildStackKey(pathname, appId) {
  if (!appId) return pathname
  return `${pathname}?app=${encodeURIComponent(appId)}`
}

/**
 * @param {{ appId?: string | null, otherKeys: string[] }} opts
 */
export function buildStackSearch({ appId, otherKeys }) {
  const sp = new URLSearchParams()
  if (appId) sp.set('app', appId)
  for (const k of otherKeys) {
    if (isStackableKey(k)) sp.append('otherurl', k)
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/**
 * Background / inactive windows: repeated `otherurl` (pathname or pathname?app=id).
 *
 * @param {string} search
 * @returns {string[]}
 */
export function getOtherUrls(search) {
  const qs = search.startsWith('?') ? search.slice(1) : search
  const sp = new URLSearchParams(qs)
  const out = []
  for (const raw of sp.getAll('otherurl')) {
    let v = raw.trim()
    if (!v) continue
    try {
      v = decodeURIComponent(v)
    } catch {
      // keep raw
    }
    if (!isStackableKey(v) || out.includes(v)) continue
    out.push(v)
  }
  return out
}

/**
 * @deprecated Use buildStackSearch — kept for any external string builders.
 */
export function toSearchWithOthers(others) {
  return buildStackSearch({ appId: null, otherKeys: others })
}

/**
 * Open `targetPath` in the foreground while stacking the current window.
 *
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {LocationLike} location
 * @param {string} targetPath
 * @param {string | null} [targetAppId] Registry `app.id` for disambiguation (desktop icons).
 */
export function openForegroundPreserveStack(
  navigate,
  location,
  targetPath,
  targetAppId = null,
) {
  const { pathname, search } = location
  // Treat the desktop route as "stack-free" even if stale `otherurl`s exist in the URL.
  // This prevents surprises like closing a freshly opened app and suddenly promoting an old background window.
  const others = pathname === '/' ? [] : getOtherUrls(search)
  const nextOthers = [...others]
  const currentKey = stackKeyFromLocation(location)
  const targetKey = buildStackKey(targetPath, targetAppId)
  if (pathname !== '/' && isStackableKey(currentKey) && currentKey !== targetKey) {
    nextOthers.push(currentKey)
  }
  const dedup = [...new Set(nextOthers.filter((k) => k !== targetKey && isStackableKey(k)))]
  navigate({
    pathname: targetPath,
    search: buildStackSearch({ appId: targetAppId, otherKeys: dedup }),
  })
}

/**
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {LocationLike} location
 * @param {string} targetKey Full stack key for the background window to activate.
 */
export function activateBackgroundWindow(navigate, location, targetKey) {
  const { pathname, search } = location
  const foreKey = stackKeyFromLocation(location)
  if (foreKey === targetKey) return
  let others = getOtherUrls(search)
  if (!others.includes(targetKey)) return
  others = others.filter((o) => o !== targetKey)
  if (pathname !== '/' && isStackableKey(foreKey)) others.push(foreKey)
  const dedup = [...new Set(others.filter(isStackableKey))]
  const { pathname: tp, appId } = parseStackKey(targetKey)
  navigate({
    pathname: tp,
    search: buildStackSearch({ appId, otherKeys: dedup }),
  })
}

/**
 * Close a window: pass foreground `stackKeyFromLocation(location)` or a background stack key.
 *
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {LocationLike} location
 * @param {string} keyToClose
 */
export function closeWindowAtPath(navigate, location, keyToClose) {
  const { pathname, search } = location
  const foreKey = stackKeyFromLocation(location)
  let others = getOtherUrls(search)

  if (keyToClose === foreKey) {
    const nextKey = others[0] ?? '/'
    const rest = others.slice(1)
    if (nextKey === '/') {
      navigate({ pathname: '/', search: '' })
      return
    }
    const { pathname: np, appId } = parseStackKey(nextKey)
    navigate({
      pathname: np,
      search: buildStackSearch({ appId, otherKeys: rest }),
    })
    return
  }

  others = others.filter((o) => o !== keyToClose)
  const { appId } = parseStackKey(foreKey)
  // Desktop should never keep a background stack in the URL.
  if (pathname === '/') {
    navigate({ pathname: '/', search: '' })
    return
  }
  navigate({
    pathname,
    search: buildStackSearch({ appId, otherKeys: others }),
  })
}

export function programIdForPath(pathname) {
  if (pathname === '/about') return 'win-about'
  if (pathname === '/biodata') return 'win-biodata'
  if (pathname === '/calculator') return 'win-calculator'
  if (pathname === '/winamp') return 'win-winamp'
  return `win-${pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'app'}`
}
