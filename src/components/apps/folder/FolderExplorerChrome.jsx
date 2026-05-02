import { useState } from 'react'

/** Small yellow folder glyph (XP-style) */
function MiniFolder({ className = 'h-3.5 w-4' }) {
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      aria-hidden
      style={{
        background:
          'linear-gradient(180deg,#fffef0 0%,#ffe98a 35%,#e8c020 70%,#c9a010 100%)',
        borderRadius: '1px 2px 2px 1px',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.75), 0 1px 0 rgba(0,0,0,0.2), 1px 0 0 rgba(0,0,0,0.08)',
        border: '1px solid #a08010',
      }}
    />
  )
}

function MiniComputer({ className = 'h-3.5 w-4' }) {
  return (
    <span
      className={`relative inline-block shrink-0 rounded-sm border border-[#4a6fa8] ${className}`}
      aria-hidden
      style={{
        background: 'linear-gradient(180deg,#8eb8e8 0%,#5a8fd0 45%,#3d6fa8 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
      }}
    />
  )
}

function MiniNetwork({ className = 'h-3.5 w-4' }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-sm border border-[#6a8a50] ${className}`}
      aria-hidden
      style={{
        background: 'linear-gradient(180deg,#c8e8a8 0%,#8fc060 50%,#5a9038 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
      }}
    />
  )
}

/**
 * Collapsible task-pane block (Luna-style blue band + white title + chevron).
 */
function TaskPaneSection({ title, children: sectionChildren }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-2 overflow-hidden rounded-t-[5px] border border-[#7aa6d8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-default items-center justify-between gap-1 border-b border-[#2a6aa8] bg-[linear-gradient(180deg,#8fc4f0_0%,#5a9ad8_42%,#3d7ec4_100%)] px-2 py-[5px] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
      >
        <span className="text-[11px] font-bold leading-none tracking-tight text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]">
          {title}
        </span>
        <span
          className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border border-[#2a5a8e]/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_100%)] text-[8px] font-bold leading-none text-white"
          aria-hidden
        >
          {open ? '«' : '»'}
        </span>
      </button>
      {open ? (
        <div className="border-t border-[#d0e4f8] bg-[linear-gradient(180deg,#f5f9ff_0%,#eef6ff_100%)] px-2 py-1.5">{sectionChildren}</div>
      ) : null}
    </div>
  )
}

function TaskLink({ icon, label }) {
  return (
    <button
      type="button"
      className="flex w-full cursor-default items-start gap-2 rounded-sm py-0.5 pl-0.5 pr-1 text-left hover:bg-[#d6e8ff]"
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-[11px] leading-snug text-[#215dc6] underline-offset-1 hover:underline">{label}</span>
    </button>
  )
}

/** Large green circular nav (XP Standard Buttons). */
function NavOrb({ dir, disabled }) {
  const arrow = dir === 'back' ? '◀' : '▶'
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={dir === 'back' ? 'Back' : 'Forward'}
      className={[
        'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]',
        disabled
          ? 'border-[#9aa899] bg-[linear-gradient(180deg,#c8d4c0_0%,#a8b4a0_55%,#909888_100%)] text-[#f0f4f0]'
          : 'border-[#1a5a1a] bg-[radial-gradient(circle_at_35%_30%,#8fdf8f_0%,#3cb043_35%,#228b22_70%,#1a6a1a_100%)] text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.45)]',
      ].join(' ')}
    >
      <span className="text-[11px] font-bold leading-none">{arrow}</span>
    </button>
  )
}

/**
 * Windows XP Explorer–style host: menu, standard-buttons toolbar, address bar, task pane, main pane.
 */
export default function FolderExplorerChrome({ addressPath, children }) {
  const menuItems = ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']

  const rebarStrip =
    'border-b border-[#aca899] bg-[linear-gradient(180deg,#fffcf8_0%,#f0ebe0_40%,#e4dfd4_100%)] shadow-[inset_0_1px_0_#fff]'

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#ece9d8] font-xp text-[11px] text-black">
      {/* Menu — Luna beige strip */}
      <nav
        className={`flex shrink-0 items-center justify-between gap-2 border-b border-[#aca899] px-1.5 py-0.5 ${rebarStrip}`}
        aria-label="Menu"
      >
        <div className="flex flex-wrap items-center gap-0.5">
          {menuItems.map((label) => (
            <button
              key={label}
              type="button"
              className="cursor-default select-none rounded-sm px-1.5 py-0.5 text-[11px] text-[#1a1a1a] hover:bg-[#316ac5] hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>
        <div
          className="hidden h-4 w-4 shrink-0 rounded-sm border border-[#9aa4b0] sm:block"
          style={{
            background: 'linear-gradient(135deg,#e8ecf4 0%,#b8c4d8 40%,#6a7a98 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
          title=""
          aria-hidden
        />
      </nav>

      {/* Standard Buttons toolbar */}
      <div className={`flex shrink-0 flex-wrap items-center gap-2 px-2 py-1.5 ${rebarStrip}`}>
        <div className="flex items-center gap-1">
          <NavOrb dir="back" disabled={false} />
          <NavOrb dir="forward" disabled />
        </div>
        <span className="h-6 w-px shrink-0 bg-[#aca899] shadow-[1px_0_0_#fff]" />
        <button
          type="button"
          disabled
          className="flex h-7 cursor-default items-center gap-0.5 rounded-sm border border-[#a89878] bg-[linear-gradient(180deg,#fffef8_0%,#ece4c8_100%)] px-1 shadow-[inset_0_1px_0_#fff] disabled:opacity-70"
          aria-label="Up"
        >
          <MiniFolder className="h-4 w-[18px]" />
          <span className="text-[10px] font-bold leading-none text-[#228b22]">▲</span>
        </button>
        <span className="h-6 w-px shrink-0 bg-[#aca899] shadow-[1px_0_0_#fff]" />
        <button
          type="button"
          disabled
          className="flex h-7 cursor-default items-center gap-1 rounded-sm border border-[#a89878] bg-[linear-gradient(180deg,#fffef8_0%,#ece4c8_100%)] px-2 shadow-[inset_0_1px_0_#fff] disabled:opacity-70"
        >
          <span
            className="relative flex h-4 w-4 items-center justify-center rounded-full border border-[#6a6a6a] bg-[linear-gradient(180deg,#f0f0f0_0%,#c8c8c8_100%)]"
            aria-hidden
          >
            <span className="text-[9px] font-bold text-[#333]">⌕</span>
          </span>
          <span className="hidden text-[11px] sm:inline">Search</span>
        </button>
        <button
          type="button"
          disabled
          className="flex h-7 cursor-default items-center gap-1 rounded-sm border border-[#a89878] bg-[linear-gradient(180deg,#fffef8_0%,#ece4c8_100%)] px-2 shadow-[inset_0_1px_0_#fff] disabled:opacity-70"
        >
          <MiniFolder className="h-4 w-[18px]" />
          <span className="hidden text-[11px] sm:inline">Folders</span>
        </button>
        <button
          type="button"
          disabled
          className="ml-auto flex h-7 cursor-default items-center gap-0.5 rounded-sm border border-[#a89878] bg-[linear-gradient(180deg,#fffef8_0%,#ece4c8_100%)] px-1.5 shadow-[inset_0_1px_0_#fff] disabled:opacity-70"
          aria-label="Views"
        >
          <span className="grid h-3.5 w-3.5 grid-cols-2 gap-px p-px" aria-hidden>
            <span className="rounded-[1px] bg-[#5a7a98]" />
            <span className="rounded-[1px] bg-[#5a7a98]" />
            <span className="rounded-[1px] bg-[#5a7a98]" />
            <span className="rounded-[1px] bg-[#5a7a98]" />
          </span>
          <span className="text-[9px] text-[#444]">▼</span>
        </button>
      </div>

      {/* Address bar row */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[#aca899] bg-[#ece9d8] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
        <span className="shrink-0 pl-0.5 text-[11px] font-normal text-[#5c5346]">Address</span>
        <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-sm border border-[#7f9db9] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
          <div className="flex min-w-0 flex-1 items-center gap-1 px-1 py-0.5">
            <MiniFolder className="h-3.5 w-4 shrink-0" />
            <div className="min-w-0 flex-1 truncate font-xp text-[11px] leading-tight text-black">{addressPath}</div>
          </div>
          <button
            type="button"
            className="shrink-0 border-l border-[#7f9db9] bg-[linear-gradient(180deg,#f8f6f0_0%,#e8e4d8_100%)] px-1.5 text-[10px] text-[#333] hover:bg-[#d6e8ff]"
            aria-label="Address history"
          >
            ▼
          </button>
        </div>
        <button
          type="button"
          disabled
          className="flex shrink-0 cursor-default items-center gap-1 rounded-sm border border-[#2a7a2a] bg-[linear-gradient(180deg,#d8f8c8_0%,#7cd87c_35%,#38b038_70%,#2a902a_100%)] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] disabled:opacity-90"
        >
          <span className="text-[10px]" aria-hidden>
            ▶
          </span>
          Go
        </button>
      </div>

      {/* Task pane + content */}
      <div className="flex min-h-0 min-w-0 flex-1 border-t border-white/70">
        <aside
          className="w-[200px] shrink-0 overflow-y-auto border-r border-[#7aa6d8] p-1.5 sm:w-[210px]"
          style={{
            background: 'linear-gradient(180deg, #d6e8ff 0%, #b8d4f4 45%, #9bb8e8 100%)',
          }}
          aria-label="Tasks and other places"
        >
          <TaskPaneSection title="File and Folder Tasks">
            <ul className="space-y-0">
              <li>
                <TaskLink icon={<MiniFolder />} label="Make a new folder" />
              </li>
              <li>
                <TaskLink icon={<MiniFolder />} label="Publish this folder to the Web" />
              </li>
              <li>
                <TaskLink icon={<MiniFolder />} label="Share this folder" />
              </li>
            </ul>
          </TaskPaneSection>

          <TaskPaneSection title="Other Places">
            <ul className="space-y-0">
              <li>
                <TaskLink icon={<MiniFolder />} label="Documents and Settings" />
              </li>
              <li>
                <TaskLink icon={<MiniFolder />} label="My Documents" />
              </li>
              <li>
                <TaskLink icon={<MiniFolder />} label="Shared Documents" />
              </li>
              <li>
                <TaskLink icon={<MiniComputer />} label="My Computer" />
              </li>
              <li>
                <TaskLink icon={<MiniNetwork />} label="My Network Places" />
              </li>
            </ul>
          </TaskPaneSection>

          <TaskPaneSection title="Details">
            <p className="px-0.5 text-[10px] leading-snug text-[#4a5568]">
              Select an item in the view to read its description.
            </p>
          </TaskPaneSection>
        </aside>

        <div className="min-h-0 min-w-0 flex-1 overflow-auto bg-white">{children}</div>
      </div>
    </div>
  )
}
