import { useCallback, useEffect, useMemo, useState } from 'react'
import ieTabIcon from '../../../assets/icons/ie.png'

const ieToolbarBg =
  'border-b border-[#7a99c8] bg-[linear-gradient(180deg,#e8f1fc_0%,#d0e4f8_45%,#b8d2f0_100%)]'

function normalizeUrl(raw) {
  const t = raw.trim()
  if (!t) return null
  if (/^javascript:/i.test(t) || /^data:/i.test(t)) return null
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
 * Windows IE7-era browser workspace: command bars, address bar, Go, Refresh, iframe.
 *
 * @param {{ initialUrl?: string, onCaptionChange?: (urlDisplay: string) => void }} props
 */
export default function InternetExplorerApp({
  initialUrl = 'https://app.inerva.my',
  onCaptionChange,
}) {
  const start = useMemo(() => normalizeUrl(initialUrl) ?? 'https://app.inerva.my', [initialUrl])

  const [{ stack: history, idx: histIdx }, setNav] = useState(() => ({
    stack: [start],
    idx: 0,
  }))
  const [addressInput, setAddressInput] = useState(start)
  const [iframeKey, setIframeKey] = useState(0)

  const loadedUrl = history[histIdx]

  const syncCaption = useCallback(
    (href) => {
      onCaptionChange?.(href)
    },
    [onCaptionChange],
  )

  useEffect(() => {
    syncCaption(loadedUrl)
  }, [loadedUrl, syncCaption])

  useEffect(() => {
    setAddressInput(history[histIdx])
  }, [history, histIdx])

  const navigateTo = useCallback((href) => {
    setNav((n) => {
      const nextStack = n.stack.slice(0, n.idx + 1)
      nextStack.push(href)
      return { stack: nextStack, idx: nextStack.length - 1 }
    })
  }, [])

  const applyNavigate = useCallback(() => {
    const href = normalizeUrl(addressInput)
    if (!href) return
    navigateTo(href)
  }, [addressInput, navigateTo])

  const goBack = useCallback(() => {
    setNav((n) => {
      if (n.idx <= 0) return n
      const idx = n.idx - 1
      setAddressInput(n.stack[idx])
      return { stack: n.stack, idx }
    })
  }, [])

  const goForward = useCallback(() => {
    setNav((n) => {
      if (n.idx >= n.stack.length - 1) return n
      const idx = n.idx + 1
      setAddressInput(n.stack[idx])
      return { stack: n.stack, idx }
    })
  }, [])

  const refresh = useCallback(() => {
    setIframeKey((k) => k + 1)
  }, [])

  const canBack = histIdx > 0
  const canForward = histIdx < history.length - 1

  const menuItems = ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#ece9d8] text-[11px] text-[#000]">
      <nav
        className="flex shrink-0 flex-wrap gap-x-3 border-b border-[#aca899] bg-[linear-gradient(180deg,#fefdfb_0%,#ece9d8_100%)] px-2 py-0.5"
        aria-label="Menu"
      >
        {menuItems.map((m) => (
          <span key={m} className="cursor-default font-normal text-[#000]">
            {m}
          </span>
        ))}
      </nav>

      <div className={`flex shrink-0 flex-wrap items-center gap-1 px-1.5 py-1 ${ieToolbarBg}`}>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Back"
            disabled={!canBack}
            onClick={goBack}
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-[#2a6aa8]/70 bg-[linear-gradient(180deg,#9ec8f8_0%,#5a9ae8_40%,#3d7ec8_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Back"
          >
            <span className="text-[12px] leading-none">◀</span>
          </button>
          <button
            type="button"
            title="Forward"
            disabled={!canForward}
            onClick={goForward}
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-[#2a6aa8]/70 bg-[linear-gradient(180deg,#9ec8f8_0%,#5a9ae8_40%,#3d7ec8_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Forward"
          >
            <span className="text-[12px] leading-none">▶</span>
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <label htmlFor="ie-address" className="sr-only">
            Address
          </label>
          <span className="shrink-0 text-[11px] text-[#333]">Address</span>
          <div className="flex min-w-0 flex-1 items-stretch rounded-sm border border-[#7f9db9] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
            <input
              id="ie-address"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyNavigate()
                }
              }}
              className="min-w-0 flex-1 border-0 bg-transparent px-1.5 py-0.5 text-[11px] text-[#000] outline-none"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              title="History"
              className="shrink-0 border-l border-[#b8c8e0] bg-[linear-gradient(180deg,#f2f6fc_0%,#dce8f8_100%)] px-1 text-[9px] text-[#345]"
              aria-label="Show history"
            >
              ▾
            </button>
          </div>
          <button
            type="button"
            title="Go"
            onClick={applyNavigate}
            className="flex h-[22px] w-[26px] shrink-0 items-center justify-center rounded-sm border border-[#2a7a2a] bg-[linear-gradient(180deg,#b8e8a8_0%,#48b848_45%,#2a902a_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
            aria-label="Go"
          >
            <span className="text-[11px]">➤</span>
          </button>
          <button
            type="button"
            title="Refresh"
            onClick={refresh}
            className="flex h-[22px] w-[28px] shrink-0 items-center justify-center rounded-sm border border-[#6a8ec8] bg-[linear-gradient(180deg,#d8e8fc_0%,#88b8f0_50%,#5890d8_100%)] text-[#1a4488] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
            aria-label="Refresh"
          >
            <span className="text-[13px] leading-none" aria-hidden>
              ⟳
            </span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 border-l border-[#9bb8d8] pl-2">
          <span className="text-[10px] text-[#345]">Search</span>
          <div className="flex h-[22px] w-[120px] items-center rounded-sm border border-[#7f9db9] bg-white px-1 text-[10px] text-[#888] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            Live Search
          </div>
        </div>
      </div>

      <div
        className={`flex shrink-0 items-center gap-2 border-b border-[#8fa8d0] px-2 py-1 ${ieToolbarBg}`}
      >
        <button
          type="button"
          className="flex items-center gap-0.5 rounded-sm border border-[#b8c8e0] bg-[linear-gradient(180deg,#f8fafc_0%,#e0e8f4_100%)] px-2 py-0.5 text-[10px]"
        >
          <span className="text-[12px] text-amber-600">★</span> Favorites
        </button>
        <div className="flex min-h-[26px] min-w-0 flex-1 items-center gap-1 overflow-hidden border border-[#7f9db9] bg-[linear-gradient(180deg,#f4f8fc_0%,#d8e8f8_100%)] px-1">
          <img src={ieTabIcon} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
          <span className="truncate text-[10px] text-[#123]">{loadedUrl}</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-[10px] text-[#234]">
          <span title="Home">⌂</span>
          <span title="RSS">📡</span>
          <span title="Print">🖶</span>
          <span>Page ▾</span>
          <span>Safety ▾</span>
          <span>Tools ▾</span>
          <span title="Help" className="text-[#2563eb]">
            ?
          </span>
        </div>
      </div>

      <div className="relative min-h-0 min-w-0 flex-1 bg-white">
        <iframe
          key={`${loadedUrl}-${iframeKey}`}
          title="Web page"
          src={loadedUrl}
          className="h-full w-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <footer className="flex h-5 shrink-0 items-center justify-between border-t border-[#aca899] bg-[linear-gradient(180deg,#ece9d8_0%,#dcd8c8_100%)] px-2 text-[10px] text-[#333]">
        <div className="flex items-center gap-1">
          <span className="text-[11px]" aria-hidden>
            🌐
          </span>
          <span>Internet</span>
        </div>
        <div className="flex items-center gap-2">
          <span title="Security">🔒</span>
          <span>100%</span>
          <span className="text-[8px]">▾</span>
        </div>
      </footer>
    </div>
  )
}
