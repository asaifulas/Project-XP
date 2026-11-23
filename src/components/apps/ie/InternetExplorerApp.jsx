import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ieTabIcon from '../../../assets/icons/ie.png'
import {
  Caret,
  FavoritesIcon,
  GlobeIcon,
  GoIcon,
  HistoryIcon,
  HomeIcon,
  MailIcon,
  NavArrowIcon,
  PageIcon,
  PrintIcon,
  RefreshIcon,
  SearchIcon,
  StopIcon,
  WindowsFlag,
} from '../../window/retro/xpIcons'

/** Luna rebar band, shared with the XP Explorer windows. */
const rebar =
  'border-b border-[#aca899] bg-[linear-gradient(180deg,#fffcf8_0%,#f0ebe0_40%,#e4dfd4_100%)] shadow-[inset_0_1px_0_#fff]'

/** Flat XP toolbar button: border and gradient only on hover, sunken when pressed. */
const toolBtn =
  'flex h-[30px] shrink-0 cursor-default items-center gap-1 rounded-[3px] border border-transparent px-1 text-[11px] text-black enabled:hover:border-[#c2bba6] enabled:hover:bg-[linear-gradient(180deg,#ffffff_0%,#f6f4ee_55%,#e8e4d6_100%)] enabled:active:border-[#a8a08a] enabled:active:bg-[#e3dfd0] enabled:active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.18)] disabled:text-[#aca899]'

const toolSep = <span className="mx-0.5 h-[26px] w-px shrink-0 bg-[#c5c2b2] shadow-[1px_0_0_#fff]" aria-hidden />

const statusCell =
  'flex h-full items-center border-l border-t border-l-[#aca899] border-t-[#aca899] border-r border-b border-r-white border-b-white'

function normalizeUrl(raw) {
  const t = raw.trim()
  if (!t) return null
  if (/^javascript:/i.test(t) || /^data:/i.test(t)) return null
  // site-relative paths (e.g. files in public/) resolve against this site
  if (t.startsWith('/') && !t.startsWith('//')) return new URL(t, window.location.origin).href
  let u = t
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) {
    u = `https://${u}`
  }
  try {
    const parsed = new URL(u)
    if (!['http:', 'https:', 'about:'].includes(parsed.protocol)) return null
    return parsed.href
  } catch {
    return null
  }
}

/**
 * Internet Explorer 6 on Windows XP: menu bar with the Windows flag, Standard Buttons,
 * Address bar with Go and Links, a sunken page area (iframe) and the segmented status bar.
 *
 * @param {{ initialUrl?: string, onCaptionChange?: (urlDisplay: string) => void }} props
 */
export default function InternetExplorerApp({
  initialUrl = 'https://penyulabs.com',
  onCaptionChange,
}) {
  const start = useMemo(() => normalizeUrl(initialUrl) ?? 'https://penyulabs.com', [initialUrl])

  const [{ stack: history, idx: histIdx }, setNav] = useState(() => ({
    stack: [start],
    idx: 0,
  }))
  const [addressInput, setAddressInput] = useState(start)
  const [iframeKey, setIframeKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const iframeRef = useRef(null)
  const addressWrapRef = useRef(null)

  const loadedUrl = history[histIdx]

  useEffect(() => {
    onCaptionChange?.(loadedUrl)
  }, [loadedUrl, onCaptionChange])

  useEffect(() => {
    setAddressInput(loadedUrl)
    setLoading(true)
  }, [loadedUrl, iframeKey])

  useEffect(() => {
    if (!historyOpen) return undefined
    const onDoc = (event) => {
      if (!addressWrapRef.current?.contains(event.target)) setHistoryOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [historyOpen])

  const navigateTo = useCallback((href) => {
    setHistoryOpen(false)
    setNav((n) => {
      if (n.stack[n.idx] === href) return n
      const nextStack = n.stack.slice(0, n.idx + 1)
      nextStack.push(href)
      return { stack: nextStack, idx: nextStack.length - 1 }
    })
  }, [])

  const applyNavigate = useCallback(() => {
    const href = normalizeUrl(addressInput)
    if (href) navigateTo(href)
  }, [addressInput, navigateTo])

  const goBack = useCallback(() => setNav((n) => (n.idx > 0 ? { ...n, idx: n.idx - 1 } : n)), [])
  const goForward = useCallback(
    () => setNav((n) => (n.idx < n.stack.length - 1 ? { ...n, idx: n.idx + 1 } : n)),
    [],
  )
  const refresh = useCallback(() => setIframeKey((k) => k + 1), [])
  const goHome = useCallback(() => navigateTo(start), [navigateTo, start])

  const stop = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.stop()
    } catch {
      // cross-origin pages cannot be stopped from here
    }
    setLoading(false)
  }, [])

  const print = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.print()
    } catch {
      // cross-origin pages cannot be printed from here
    }
  }, [])

  const canBack = histIdx > 0
  const canForward = histIdx < history.length - 1
  const menuItems = ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']
  const pastUrls = [...new Set(history)].reverse()

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#ece9d8] font-xp text-[11px] text-black">
      {/* Menu bar + throbber */}
      <div className={`flex h-[24px] shrink-0 items-stretch justify-between ${rebar}`}>
        <nav className="flex min-w-0 items-center overflow-hidden px-1" aria-label="Menu">
          {menuItems.map((label) => (
            <span
              key={label}
              className="cursor-default select-none whitespace-nowrap rounded-[2px] px-[7px] py-[2px] text-[11px] hover:bg-[#316ac5] hover:text-white"
            >
              {label}
            </span>
          ))}
        </nav>
        <div
          className="flex w-[42px] shrink-0 items-center justify-center border-l border-[#aca899] bg-white"
          title={loading ? 'Loading…' : 'Done'}
        >
          <WindowsFlag className={loading ? 'animate-pulse' : ''} />
        </div>
      </div>

      {/* Standard Buttons */}
      <div className={`flex h-[38px] shrink-0 items-center overflow-hidden whitespace-nowrap px-1 ${rebar}`}>
        <button type="button" className={toolBtn} disabled={!canBack} onClick={goBack} title="Back" aria-label="Back">
          <span className={canBack ? '' : 'opacity-80'}>
            <NavArrowIcon dir="back" disabled={!canBack} />
          </span>
          <span className="hidden sm:inline">Back</span>
          <Caret />
        </button>
        <button
          type="button"
          className={toolBtn}
          disabled={!canForward}
          onClick={goForward}
          title="Forward"
          aria-label="Forward"
        >
          <NavArrowIcon dir="forward" disabled={!canForward} />
          <Caret />
        </button>
        <button type="button" className={toolBtn} onClick={stop} title="Stop" aria-label="Stop">
          <StopIcon />
        </button>
        <button type="button" className={toolBtn} onClick={refresh} title="Refresh" aria-label="Refresh">
          <RefreshIcon />
        </button>
        <button type="button" className={toolBtn} onClick={goHome} title="Home" aria-label="Home">
          <HomeIcon />
        </button>
        {toolSep}
        <button type="button" className={toolBtn} title="Search">
          <SearchIcon />
          <span className="hidden md:inline">Search</span>
        </button>
        <button type="button" className={toolBtn} title="Favorites">
          <FavoritesIcon />
          <span className="hidden md:inline">Favorites</span>
        </button>
        <button type="button" className={`${toolBtn} hidden sm:flex`} title="History" aria-label="History">
          <HistoryIcon />
        </button>
        <span className="hidden sm:contents">{toolSep}</span>
        <button type="button" className={`${toolBtn} hidden sm:flex`} title="Mail" aria-label="Mail">
          <MailIcon />
          <Caret />
        </button>
        <button type="button" className={`${toolBtn} hidden sm:flex`} onClick={print} title="Print" aria-label="Print">
          <PrintIcon />
        </button>
      </div>

      {/* Address bar */}
      <div className={`flex h-[28px] shrink-0 items-center gap-1 px-1.5 ${rebar}`}>
        <label htmlFor="ie-address" className="shrink-0 px-0.5 text-[11px] text-[#5c5346]">
          Address
        </label>
        <div className="relative min-w-0 flex-1" ref={addressWrapRef}>
          <div className="flex h-[21px] min-w-0 items-stretch border border-[#7f9db9] bg-white">
            <img src={ieTabIcon} alt="" className="my-auto ml-1 h-4 w-4 shrink-0 object-contain" />
            <input
              id="ie-address"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyNavigate()
                }
              }}
              className="min-w-0 flex-1 border-0 bg-transparent px-1 font-xp text-[11px] text-black outline-none"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              aria-label="Show address history"
              aria-expanded={historyOpen}
              className="my-px mr-px flex w-[17px] shrink-0 cursor-default items-center justify-center rounded-[2px] border border-[#b9cdf3] bg-[linear-gradient(180deg,#e6eefc_0%,#c4d6f8_50%,#b2c8f4_100%)] hover:brightness-105 active:brightness-95"
            >
              <svg width="7" height="4" viewBox="0 0 7 4" aria-hidden>
                <path d="M0 0h7L3.5 4z" fill="#4d6185" />
              </svg>
            </button>
          </div>
          {historyOpen ? (
            <ul
              className="absolute left-0 right-0 top-full z-20 m-0 max-h-40 list-none overflow-auto border border-black bg-white p-0 shadow-[2px_2px_3px_rgba(0,0,0,0.25)]"
              role="listbox"
            >
              {pastUrls.map((href) => (
                <li key={href} className="m-0 p-0">
                  <button
                    type="button"
                    className="flex w-full cursor-default items-center gap-1 px-1 py-[3px] text-left font-xp text-[11px] hover:bg-[#316ac5] hover:text-white"
                    onClick={() => navigateTo(href)}
                  >
                    <img src={ieTabIcon} alt="" className="h-4 w-4 shrink-0 object-contain" />
                    <span className="truncate">{href}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button type="button" onClick={applyNavigate} className={`${toolBtn} h-[24px] pr-1.5`} title="Go to the address">
          <GoIcon />
          <span>Go</span>
        </button>
        <span className="hidden h-[20px] w-px shrink-0 bg-[#c5c2b2] shadow-[1px_0_0_#fff] sm:block" aria-hidden />
        <span className="hidden shrink-0 cursor-default items-center gap-1 px-1 text-[11px] text-[#5c5346] sm:flex">
          Links <span className="text-[13px] leading-none text-black">»</span>
        </span>
      </div>

      {/* Page area: classic sunken edge */}
      <div className="flex min-h-0 min-w-0 flex-1 border-l border-t border-l-[#aca899] border-t-[#aca899] border-r border-b border-r-white border-b-white">
        <div className="relative flex min-h-0 min-w-0 flex-1 border-l border-t border-l-[#716f64] border-t-[#716f64] border-r border-b border-r-[#f1efe2] border-b-[#f1efe2] bg-white">
          <iframe
            ref={iframeRef}
            key={`${loadedUrl}-${iframeKey}`}
            title="Web page"
            src={loadedUrl}
            onLoad={() => setLoading(false)}
            className="h-full w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Status bar */}
      <footer className="flex h-[22px] shrink-0 items-stretch gap-[2px] bg-[#ece9d8] px-[2px] py-[2px] text-[11px] text-black">
        <div className={`${statusCell} min-w-0 flex-1 gap-1 px-1`}>
          <PageIcon />
          <span className="truncate">{loading ? `Opening page ${loadedUrl}...` : 'Done'}</span>
        </div>
        <div className={`${statusCell} hidden w-[110px] px-[2px] sm:flex`} aria-hidden>
          {loading ? (
            <div className="flex h-[12px] w-full gap-[2px] overflow-hidden">
              {Array.from({ length: 9 }, (_, i) => (
                <span
                  key={i}
                  className="h-full w-[8px] shrink-0 bg-[linear-gradient(180deg,#a6e89a_0%,#3cb43c_50%,#2a922a_100%)] animate-pulse"
                  style={{ animationDelay: `${i * 90}ms` }}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className={`${statusCell} hidden w-[22px] sm:flex`} aria-hidden />
        <div className={`${statusCell} hidden w-[22px] sm:flex`} aria-hidden />
        <div className={`${statusCell} w-[118px] shrink-0 gap-1 px-1`}>
          <GlobeIcon />
          <span>Internet</span>
        </div>
        <div
          className="w-[12px] shrink-0 self-end"
          style={{
            height: 12,
            background:
              'linear-gradient(135deg, transparent 0 45%, #fff 45% 52%, #aca899 52% 60%, transparent 60% 70%, #fff 70% 76%, #aca899 76% 84%, transparent 84%)',
          }}
          aria-hidden
        />
      </footer>
    </div>
  )
}
