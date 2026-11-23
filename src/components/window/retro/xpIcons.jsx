/**
 * Hand-drawn SVG glyphs for the IE6 / Windows XP toolbar.
 * 24px icons for the Standard Buttons band, 16px for the address and status bars.
 */

/** Green XP orb with a white arrow; grey when disabled. */
export function NavArrowIcon({ dir = 'back', disabled = false, size = 24 }) {
  const id = `ie-orb-${dir}-${disabled ? 'off' : 'on'}`
  const arrow = dir === 'back' ? 'M13.6 7.2 8.8 12l4.8 4.8M9.4 12h7' : 'M10.4 7.2 15.2 12l-4.8 4.8M14.6 12h-7'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <radialGradient id={id} cx="38%" cy="30%" r="75%">
          {disabled ? (
            <>
              <stop offset="0" stopColor="#f4f4ee" />
              <stop offset="0.55" stopColor="#c9c8bd" />
              <stop offset="1" stopColor="#a3a296" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#b9f5a6" />
              <stop offset="0.45" stopColor="#4cbb3f" />
              <stop offset="1" stopColor="#1c7a1a" />
            </>
          )}
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill={`url(#${id})`} stroke={disabled ? '#9c9b90' : '#17641a'} />
      <ellipse cx="12" cy="7.2" rx="6.4" ry="3.2" fill="#fff" opacity={disabled ? 0.35 : 0.3} />
      <path
        d={arrow}
        fill="none"
        stroke={disabled ? '#f6f6f2' : '#fff'}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Plain document with a folded corner, the base for Stop and Refresh. */
function Page({ children }) {
  return (
    <>
      <path d="M5 2.5h9.5L19 7v14.5H5z" fill="#fff" stroke="#6f7f96" />
      <path d="M14.5 2.5V7H19" fill="#e4eaf3" stroke="#6f7f96" strokeLinejoin="round" />
      <path d="M7.5 10h8M7.5 12.5h8M7.5 15h5" stroke="#b9c6d8" />
      {children}
    </>
  )
}

export function StopIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <Page>
        <circle cx="16" cy="16.5" r="6" fill="#d6261c" stroke="#8a130d" />
        <circle cx="15" cy="14.6" r="3" fill="#fff" opacity="0.25" />
        <path d="m13.6 14.1 4.8 4.8m0-4.8-4.8 4.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </Page>
    </svg>
  )
}

export function RefreshIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <Page>
        <path d="M11.2 18.3a4.6 4.6 0 0 1 7.6-5.2" fill="none" stroke="#1e8a1e" strokeWidth="2" strokeLinecap="round" />
        <path d="m19.9 10.6-.4 3.6-3.4-1.3z" fill="#1e8a1e" />
        <path d="M20.6 14.6a4.6 4.6 0 0 1-7.6 5.2" fill="none" stroke="#2fa52f" strokeWidth="2" strokeLinecap="round" />
        <path d="m11.9 22.3.4-3.6 3.4 1.3z" fill="#2fa52f" />
      </Page>
    </svg>
  )
}

export function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M15.5 4h2.5v4.5l-2.5-2z" fill="#a24a2a" stroke="#6b2c16" strokeLinejoin="round" />
      <path d="M5 11.5V21h14v-9.5L12 5.5z" fill="#fbf4dc" stroke="#8a7a52" strokeLinejoin="round" />
      <path d="M2.5 12.5 12 4l9.5 8.5" fill="none" stroke="#b5402a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21v-5.5h4V21" fill="#5b7fb8" stroke="#34507e" />
      <rect x="14.8" y="12.6" width="2.6" height="2.4" fill="#9fc3ef" stroke="#4f6f9c" strokeWidth="0.8" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="m14.6 14.6 6.2 6.2" stroke="#4a3a22" strokeWidth="3.4" strokeLinecap="round" />
      <path d="m14.6 14.6 6.2 6.2" stroke="#8a6c3e" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9.8" cy="9.8" r="6.6" fill="#d4ecff" stroke="#3a4f6b" strokeWidth="1.8" />
      <path d="M6.6 8.6a3.6 3.6 0 0 1 3-2.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function FavoritesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="ie-star" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6a8" />
          <stop offset="0.5" stopColor="#ffd21f" />
          <stop offset="1" stopColor="#f0a400" />
        </linearGradient>
      </defs>
      <path
        d="m12 2.6 2.8 6 6.5.7-4.9 4.4 1.4 6.5L12 16.9l-5.8 3.3 1.4-6.5-4.9-4.4 6.5-.7z"
        fill="url(#ie-star)"
        stroke="#b36b00"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HistoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12.5" cy="12.5" r="8.6" fill="#fff" stroke="#3a64a8" strokeWidth="1.6" />
      <path d="M12.5 7.5v5l3.4 2.2" fill="none" stroke="#1d2d4a" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.4 9.2A9.4 9.4 0 0 1 9 3.6" fill="none" stroke="#2fa52f" strokeWidth="2.2" strokeLinecap="round" />
      <path d="m1.6 6.4 1.8 4.2 3.8-2.4z" fill="#2fa52f" />
    </svg>
  )
}

export function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <rect x="2.5" y="6" width="19" height="13" rx="1" fill="#fdf6dc" stroke="#8a7440" />
      <path d="m2.8 6.5 9.2 7 9.2-7" fill="none" stroke="#8a7440" strokeLinejoin="round" />
      <path d="m2.8 18.6 6.6-6.4m11.8 6.4-6.6-6.4" stroke="#c4b07a" />
    </svg>
  )
}

export function PrintIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M7 3h10v6H7z" fill="#fff" stroke="#6f7f96" />
      <rect x="2.5" y="9" width="19" height="8.5" rx="1.5" fill="#c9cdd6" stroke="#5a6272" />
      <path d="M3 11h18" stroke="#eef0f4" />
      <circle cx="18" cy="12.6" r="0.9" fill="#2fa52f" />
      <path d="M6.5 15h11v6h-11z" fill="#fff" stroke="#6f7f96" />
      <path d="M8.5 17.2h7M8.5 19h5" stroke="#b9c6d8" />
    </svg>
  )
}

/** Small green Go arrow used next to the address box. */
export function GoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <defs>
        <linearGradient id="ie-go" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fe58a" />
          <stop offset="0.5" stopColor="#3cad34" />
          <stop offset="1" stopColor="#1f7d1c" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="16" height="16" rx="3" fill="url(#ie-go)" stroke="#1a611a" />
      <path d="M4.5 9h8M9 5.2 12.8 9 9 12.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6.8" fill="#4a8fe0" stroke="#1f4f96" />
      <path d="M3.4 5.2c1.6-.6 2.6.4 2.4 1.6-.2 1.3 1.6 1.4 1.4 3-.1 1-1 1.6-.8 3M9.4 1.6c-.2 1.2.8 1.8 2 1.6 1.4-.2 1.6 1 2.6 1.4M10.2 9.4c.6-.8 2-.6 2.4.4.3.9-.3 2-1.3 2.4" fill="none" stroke="#7ad06a" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="6" cy="4.6" rx="3" ry="1.6" fill="#fff" opacity="0.3" />
    </svg>
  )
}

/** Blank page with a blue "e", the default page icon in the status bar. */
export function PageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M3 1.5h6.5L13 5v9.5H3z" fill="#fff" stroke="#6f7f96" />
      <path d="M9.5 1.5V5H13" fill="#e4eaf3" stroke="#6f7f96" strokeLinejoin="round" />
      <path d="M5.3 10.2h4.6a2.4 2.4 0 1 0-.5 1.8" fill="none" stroke="#2a6fd6" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Four-colour Windows flag shown at the right end of the menu bar. */
export function WindowsFlag({ className = '' }) {
  return (
    <svg className={className} width="26" height="20" viewBox="0 0 26 20" aria-hidden>
      <path d="M5 3.4c2.4-1 4.6-.9 7 .2l-1.4 5.6c-2.3-1-4.5-1.1-6.9-.2z" fill="#f25a24" />
      <path d="M13 3.9c2.4 1 4.6 1.1 7 .1l-1.5 5.6c-2.3.9-4.5.9-6.9-.1z" fill="#7cbb2a" />
      <path d="M4.4 10c2.4-.9 4.6-.8 6.9.2L9.9 15.8c-2.3-1-4.5-1.1-6.9-.2z" fill="#1d9be0" />
      <path d="M12.4 10.6c2.4 1 4.6 1.1 6.9.1l-1.5 5.6c-2.3.9-4.5.9-6.9-.1z" fill="#ffc20e" />
    </svg>
  )
}

/** Small dropdown caret placed after toolbar buttons that have menus. */
export function Caret() {
  return (
    <svg width="7" height="4" viewBox="0 0 7 4" aria-hidden className="shrink-0">
      <path d="M0 0h7L3.5 4z" fill="#1a1a1a" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Explorer (folder window) glyphs                                     */
/* ------------------------------------------------------------------ */

/** Yellow XP folder; `size` 16 for task pane / address bar, 24 for toolbars. */
export function FolderIcon({ size = 16, open = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path d="M1.5 3.5h4.2l1.3 1.4h7.5v8.6h-13z" fill="#e8b830" stroke="#a07812" strokeLinejoin="round" />
      {open ? (
        <path d="M1.5 13.5 3.8 7.5h11.2l-2.3 6z" fill="#ffe28a" stroke="#a07812" strokeLinejoin="round" />
      ) : (
        <path d="M1.5 6.5h13v7h-13z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
      )}
    </svg>
  )
}

/** "Up" button: folder with a green up arrow. */
export function UpFolderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M2.5 7.5h6l2 2h11v11h-19z" fill="#e8b830" stroke="#a07812" strokeLinejoin="round" />
      <path d="M2.5 11.5h19v9h-19z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
      <path d="M12 9.5v9" stroke="#1c7a1a" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M12 9.5v9" stroke="#4cbb3f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m7.6 13.2 4.4-5 4.4 5" fill="none" stroke="#1c7a1a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m7.6 13.2 4.4-5 4.4 5" fill="none" stroke="#4cbb3f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** "Folders" button: folder tree. */
export function FoldersTreeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M5.5 8v11.5h4M5.5 14h4" fill="none" stroke="#6d6d6d" strokeDasharray="1 1" />
      <path d="M1.5 2.5h4l1 1h5v5h-10z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
      <path d="M9.5 11.5h4l1 1h6v4h-11z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
      <path d="M9.5 17.5h4l1 1h6v4h-11z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
    </svg>
  )
}

/** "Views" button: small icon grid. */
export function ViewsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <rect x="2.5" y="3.5" width="19" height="17" fill="#fff" stroke="#5a6f96" />
      <rect x="5" y="6" width="5" height="4.5" fill="#6fa0e8" stroke="#2f5fa6" strokeWidth="0.8" />
      <rect x="14" y="6" width="5" height="4.5" fill="#f2c94c" stroke="#a07812" strokeWidth="0.8" />
      <rect x="5" y="13.5" width="5" height="4.5" fill="#86c46e" stroke="#3d7a2a" strokeWidth="0.8" />
      <rect x="14" y="13.5" width="5" height="4.5" fill="#e88a6f" stroke="#a6452f" strokeWidth="0.8" />
    </svg>
  )
}

/** Task-pane glyphs (16px). */
export function NewFolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path d="M1.5 4.5h4l1 1h7.5v8h-12.5z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
      <path d="M12 0.8v4.4M9.8 3h4.4M10.4 1.4l3.2 3.2M13.6 1.4l-3.2 3.2" stroke="#f0a000" strokeWidth="1.1" />
    </svg>
  )
}

export function PublishWebIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path d="M1.5 5.5h4l1 1h6v7h-11z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
      <circle cx="11" cy="5" r="4" fill="#4a8fe0" stroke="#1f4f96" />
      <path d="M8.5 4c.9-.4 1.6.3 1.4 1-.2.8.9.8.8 1.8M11.5 1.4c-.1.7.5 1 1.2 1" fill="none" stroke="#7ad06a" strokeWidth="1" />
    </svg>
  )
}

export function ShareFolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path d="M1.5 3.5h4l1 1h7.5v7h-12.5z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
      <path d="M2 15.5c1.5-2.6 3.4-3 5.4-2.6l3.6.7c.8.2.8 1.3-.1 1.4l-2.4.1M7 13.2l4.6-.6c1.1-.1 2-.6 2.9-1.4" fill="#fbd3b0" stroke="#8a5a3a" strokeLinejoin="round" />
    </svg>
  )
}

export function ComputerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <rect x="1.5" y="1.5" width="13" height="9.5" rx="1" fill="#d9dee7" stroke="#4d5b74" />
      <rect x="3" y="3" width="10" height="6.5" fill="#3a7bd5" />
      <path d="M3 9.5 13 3v6.5z" fill="#5f97e3" />
      <path d="M5 14.5h6l-1-3.5H6z" fill="#c4cad5" stroke="#4d5b74" strokeLinejoin="round" />
    </svg>
  )
}

export function NetworkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <circle cx="8" cy="9" r="6.2" fill="#4a8fe0" stroke="#1f4f96" />
      <path d="M4 7.2c1.3-.5 2.2.4 2 1.3-.2 1.1 1.3 1.1 1.1 2.4M8.8 3.4c-.1 1 .7 1.5 1.7 1.4 1.2-.1 1.4.9 2.2 1.2" fill="none" stroke="#7ad06a" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="0.5" y="0.5" width="6" height="4.5" fill="#d9dee7" stroke="#4d5b74" />
      <rect x="1.5" y="1.5" width="4" height="2.5" fill="#3a7bd5" />
    </svg>
  )
}

export function DocumentsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path d="M1.5 3.5h4l1 1h7.5v9h-12.5z" fill="#e8b830" stroke="#a07812" strokeLinejoin="round" />
      <path d="M4.5 2.5h6l1.5 1.5v6h-7.5z" fill="#fff" stroke="#6d7c95" />
      <path d="M1.5 7.5h12.5v6h-12.5z" fill="#ffd95a" stroke="#a07812" strokeLinejoin="round" />
    </svg>
  )
}

export function PicturesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <rect x="1.5" y="2.5" width="13" height="11" fill="#cfe6ff" stroke="#5d6f8c" />
      <path d="m2 13 4-5 3 3.5 2-2 3.5 3.5z" fill="#5a9a42" />
      <circle cx="11" cy="5.5" r="1.4" fill="#f2c94c" />
    </svg>
  )
}

export function SlideShowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <rect x="1.5" y="2.5" width="13" height="9.5" fill="#fff" stroke="#3a5a90" />
      <path d="M6.5 4.8v5l4-2.5z" fill="#2fa52f" />
      <path d="M8 12v3M5.5 15h5" stroke="#3a5a90" />
    </svg>
  )
}

export function DesktopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <rect x="1.5" y="1.5" width="13" height="10" rx="1" fill="#d9dee7" stroke="#4d5b74" />
      <rect x="3" y="3" width="10" height="7" fill="#58a64a" />
      <path d="M3 7.5c2-1.5 4-1.6 10 .5V10H3z" fill="#3b8a34" />
      <path d="M3 3h10v3c-3-1-6-1-10 0z" fill="#6ea7e8" />
      <path d="M5.5 14.5h5" stroke="#4d5b74" strokeWidth="1.5" />
    </svg>
  )
}
