/**
 * Minimal PowerPoint 2003–style workspace: menu strip, slide thumbnail pane,
 * and a grey “slide sort” stage for the active slide (`children`).
 */
export default function PowerPointOfficeChrome({ children }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#808080] text-[11px] text-black">
      <nav
        className="flex h-[22px] shrink-0 items-center gap-0.5 border-b border-black/25 bg-[linear-gradient(180deg,#ece9d8_0%,#d8d4ca_100%)] px-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
        aria-label="PowerPoint menu"
      >
        {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Slide Show', 'Window', 'Help'].map(
          (m) => (
            <button
              key={m}
              type="button"
              disabled
              aria-disabled="true"
              className="cursor-not-allowed px-1 py-0.5 text-zinc-700 opacity-90"
            >
              {m}
            </button>
          ),
        )}
      </nav>
      <div className="flex min-h-0 flex-1">
        <aside
          className="flex w-[112px] shrink-0 flex-col gap-1 border-r border-black/30 bg-[#5a5a5a] p-1"
          aria-label="Slides"
        >
          <div className="flex aspect-[4/3] w-full cursor-default items-center justify-center border-2 border-white bg-white text-[10px] font-semibold text-zinc-600 shadow-sm">
            1
          </div>
        </aside>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#7b7b7b] p-3">
          {children}
        </div>
      </div>
      <footer className="flex h-5 shrink-0 items-center border-t border-black/25 bg-[#ece9d8] px-2 text-[10px] text-zinc-700">
        Slide 1 of 1
      </footer>
    </div>
  )
}
