/**
 * XP's Start button: the four-colour waving flag sits directly on the green
 * button — no inset box behind it (the box made it read as a modern app tile).
 */
function XpFlag() {
  return (
    <svg
      viewBox="0 0 16 14"
      className="h-[13px] w-[15px] shrink-0"
      aria-hidden
      shapeRendering="crispEdges"
    >
      <path fill="#f65314" d="M.4 3.1 6.7 1.9v4.5H.4z" />
      <path fill="#7cbb00" d="M7.4 1.8 15.9.1v6.3H7.4z" />
      <path fill="#00a1f1" d="M.4 6.9h6.3v4.5L.4 10.2z" />
      <path fill="#ffbb00" d="M7.4 6.9h8.5v6.3l-8.5-1.7z" />
    </svg>
  )
}

export default function StartButton({ open, onClick }) {
  return (
    <button
      type="button"
      className={[
        'xp-start-button inline-flex cursor-default select-none items-center gap-1.5 pl-2 pr-3 font-xp text-[11px] font-bold lowercase',
        'hover:brightness-105',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      data-open={open ? 'true' : 'false'}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls="xp-start-menu"
    >
      <XpFlag />
      <span>Start</span>
    </button>
  )
}
