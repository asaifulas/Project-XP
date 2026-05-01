/**
 * Microsoft Word 2003–style document workspace: grey canvas, centered “A4” page,
 * optional task pane, rulers, toolbars, and status bar. Children render inside the page.
 */
export default function WordOfficeChrome({ children }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#d4d0c8] text-[11px] text-black">
      <div className="flex shrink-0 flex-col border-b border-black/20 bg-[#ece9d8]">
        <nav
          className="flex h-[22px] items-center gap-1 border-b border-white/60 px-1.5 text-[11px] leading-none"
          aria-label="Word menu"
        >
          {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Table', 'Window', 'Help'].map(
            (m) => (
              <button
                key={m}
                type="button"
                className="cursor-default rounded-sm px-1.5 py-0.5 hover:bg-[#316ac5] hover:text-white"
              >
                {m}
              </button>
            ),
          )}
        </nav>
        <div
          className="flex h-[26px] flex-wrap items-center gap-0.5 border-b border-black/15 px-1 py-0.5"
          aria-hidden
        >
          <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-sm border border-[#7a9edb] bg-gradient-to-b from-white to-[#d4e3fc] text-[9px] font-bold text-zinc-600">
            N
          </span>
          <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-sm border border-[#7a9edb] bg-gradient-to-b from-white to-[#d4e3fc] text-[9px] font-bold text-zinc-600">
            O
          </span>
          <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-sm border border-[#7a9edb] bg-gradient-to-b from-white to-[#d4e3fc] text-[9px] font-bold text-zinc-600">
            S
          </span>
          <span className="mx-0.5 h-4 w-px bg-black/20" />
          <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-sm border border-[#7a9edb] bg-gradient-to-b from-white to-[#d4e3fc] text-[9px] font-bold text-zinc-600">
            X
          </span>
          <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-sm border border-[#7a9edb] bg-gradient-to-b from-white to-[#d4e3fc] text-[9px] font-bold text-zinc-600">
            C
          </span>
        </div>
        <div className="flex h-[26px] flex-wrap items-center gap-1 border-b border-black/20 px-1 py-0.5">
          <select
            className="h-[20px] max-w-[88px] rounded-sm border border-[#7f9db9] bg-white px-1 text-[11px]"
            aria-label="Style"
            defaultValue="normal"
          >
            <option value="normal">Normal</option>
          </select>
          <select
            className="h-[20px] max-w-[120px] rounded-sm border border-[#7f9db9] bg-white px-1 text-[11px]"
            aria-label="Font"
            defaultValue="tnr"
          >
            <option value="tnr">Times New Roman</option>
          </select>
          <select
            className="h-[20px] w-14 rounded-sm border border-[#7f9db9] bg-white px-1 text-[11px]"
            aria-label="Font size"
            defaultValue="12"
          >
            <option value="12">12</option>
            <option value="26">26</option>
          </select>
          <span className="inline-flex h-[20px] w-[22px] items-center justify-center rounded-sm border border-[#7a9edb] bg-gradient-to-b from-white to-[#d4e3fc] font-bold">
            B
          </span>
          <span className="inline-flex h-[20px] w-[22px] items-center justify-center rounded-sm border border-[#7a9edb] bg-gradient-to-b from-white to-[#d4e3fc] italic">
            I
          </span>
          <span className="inline-flex h-[20px] w-[22px] items-center justify-center rounded-sm border border-[#7a9edb] bg-gradient-to-b from-white to-[#d4e3fc] underline">
            U
          </span>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#808080]">
          <div className="flex min-h-0 min-w-0 flex-1 overflow-auto">
            <div
              className="sticky left-0 top-0 z-[1] flex w-5 shrink-0 flex-col border-r border-black/25 bg-[#ece9d8]"
              aria-hidden
            >
              <div className="h-5 border-b border-black/20" />
              <div className="flex-1 bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_0px,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[length:8px_100%]" />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                className="sticky top-0 z-[1] h-5 shrink-0 border-b border-black/25 bg-[#ece9d8]"
                aria-hidden
              />
              <div className="flex flex-1 justify-center px-4 pb-6 pt-3">
                <div
                  className="shadow-[1px_1px_0_#000,2px_2px_6px_rgba(0,0,0,0.35)]"
                  role="document"
                >
                  <div className="box-border min-h-[60svh] w-[min(100%,420px)] max-w-[420px] bg-white p-[14mm] text-[13px] leading-normal text-zinc-900">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside
          className="flex w-[180px] shrink-0 flex-col border-l border-black/25 bg-white text-[11px]"
          aria-label="Task pane"
        >
          <div className="border-b border-[#aca899] bg-gradient-to-r from-[#6b8ccb] to-[#3d6db5] px-2 py-1 font-bold text-white">
            Getting Started
          </div>
          <div className="flex flex-col gap-2 p-2 text-[#003399]">
            <span className="cursor-default underline">Microsoft Office Online</span>
            <label className="text-black">
              <span className="mb-0.5 block text-[10px] font-bold text-zinc-700">Search for</span>
              <input
                type="search"
                className="w-full rounded-sm border border-[#7f9db9] px-1 py-0.5 text-[11px]"
                placeholder=""
              />
            </label>
          </div>
        </aside>
      </div>

      <footer className="flex h-[22px] shrink-0 items-center gap-2 border-t border-white/40 bg-gradient-to-b from-[#d6dff7] to-[#aec0e8] px-2 text-[10px] text-zinc-900">
        <span>Page 1</span>
        <span className="text-zinc-500">|</span>
        <span>Sec 1</span>
        <span className="text-zinc-500">|</span>
        <span>1/1</span>
        <span className="ml-auto">Ln 1, Col 1</span>
      </footer>
    </div>
  )
}
