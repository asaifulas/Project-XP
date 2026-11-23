/**
 * Office 2003 (Windows XP Luna blue) command bars: dock, menu bar, toolbars,
 * flat buttons with the orange hover, combo boxes and the status bar.
 * Shared by the Word, Excel and PowerPoint shells.
 */

/** Light-blue docking area that holds the menu bar and toolbars. */
export const dockBg = 'bg-[linear-gradient(90deg,#c4daf9_0%,#b5cef6_45%,#9ebef5_100%)]'

/** Status bar strip used by all Office shells. */
export const statusBg = 'bg-[linear-gradient(180deg,#dbe7f9_0%,#c7daf7_100%)]'

export function CommandDock({ children, className = '' }) {
  return (
    <div className={`flex shrink-0 flex-col gap-[2px] border-b border-[#6f93cf] pb-[2px] font-xp ${dockBg} ${className}`}>
      {children}
    </div>
  )
}

/** Vertical dotted grip at the start of every menu bar and toolbar. */
function Gripper() {
  return (
    <span className="mx-[3px] flex h-[16px] shrink-0 flex-col justify-between py-[1px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-[2px] w-[2px] bg-[#27416b] shadow-[1px_1px_0_#fff]" />
      ))}
    </span>
  )
}

const hoverFace =
  'hover:border-[#000080] hover:bg-[linear-gradient(180deg,#fff5cc_0%,#ffdb75_100%)] active:border-[#000080] active:bg-[linear-gradient(180deg,#fe9e5a_0%,#ffd39a_100%)]'

/**
 * Menu bar: a full-width band with grip, plain items, the help question box and
 * (optionally) the document Close button at the far right.
 */
export function OfficeMenuBar({ items, help = true, docClose = true, label = 'Menu' }) {
  return (
    <div className="flex h-[23px] min-w-0 items-center pr-1">
      <Gripper />
      <nav className="flex min-w-0 flex-1 items-center overflow-hidden" aria-label={label}>
        {items.map((m) => (
          <span
            key={m}
            className={`cursor-default select-none whitespace-nowrap border border-transparent px-[6px] py-[1px] text-[11px] text-black ${hoverFace}`}
          >
            {m}
          </span>
        ))}
      </nav>
      {help ? (
        <div
          className="ml-2 hidden h-[18px] w-[150px] shrink-0 items-center border border-[#7f9db9] bg-white pl-1 text-[11px] text-[#6d6d6d] md:flex"
          aria-hidden
        >
          <span className="min-w-0 flex-1 truncate">Type a question for help</span>
          <span className="flex h-full w-[13px] items-center justify-center border-l border-[#c3d3f0] bg-[linear-gradient(180deg,#e9f0fd_0%,#c6d8f7_100%)]">
            <TinyCaret />
          </span>
        </div>
      ) : null}
      {docClose ? (
        <span className="ml-1.5 hidden h-[16px] w-[16px] shrink-0 items-center justify-center text-[13px] leading-none text-[#1a1a1a] sm:flex" aria-hidden title="Close Window">
          ×
        </span>
      ) : null}
    </div>
  )
}

/** One rounded toolbar band. Toolbars in a row sit side by side like a real dock. */
export function OfficeToolbar({ children, className = '' }) {
  return (
    <div
      className={`flex h-[26px] shrink-0 items-center overflow-hidden rounded-[3px] bg-[linear-gradient(180deg,#e3efff_0%,#cbdef9_40%,#a7c5f2_80%,#8cb2ea_100%)] shadow-[1px_1px_0_#3b619c,inset_0_1px_0_#fff] ${className}`}
      role="toolbar"
    >
      <Gripper />
      <div className="flex min-w-0 items-center gap-0 overflow-hidden pr-[2px]">{children}</div>
      <span
        className="ml-auto flex h-full w-[11px] shrink-0 items-end justify-center rounded-r-[3px] bg-[linear-gradient(180deg,#8fb4ee_0%,#3d6dbc_100%)] pb-[5px]"
        aria-hidden
      >
        <svg width="5" height="3" viewBox="0 0 5 3">
          <path d="M0 0h5L2.5 3z" fill="#fff" />
        </svg>
      </span>
    </div>
  )
}

/** A row of toolbars (wraps by clipping, never by growing). */
export function ToolbarRow({ children }) {
  return <div className="flex min-w-0 items-center gap-[3px] overflow-hidden px-[2px]">{children}</div>
}

export function TbButton({ icon, label, title, onClick, disabled = false, checked = false, caret = false, className = '' }) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label ? undefined : title}
      onClick={onClick}
      disabled={disabled}
      tabIndex={onClick ? 0 : -1}
      className={[
        'flex h-[22px] min-w-[23px] shrink-0 cursor-default items-center justify-center gap-[3px] border px-[3px] text-[11px] text-black',
        checked ? 'border-[#000080] bg-[linear-gradient(180deg,#ffd599_0%,#ffe7a2_100%)]' : 'border-transparent',
        disabled ? 'opacity-50' : hoverFace,
        className,
      ].join(' ')}
    >
      {icon}
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
      {caret ? <TinyCaret /> : null}
    </button>
  )
}

export function TbSep() {
  return <span className="mx-[2px] h-[18px] w-px shrink-0 bg-[#6a8ccb] shadow-[1px_0_0_#fff]" aria-hidden />
}

export function TinyCaret({ color = '#1a1a1a' }) {
  return (
    <svg width="5" height="3" viewBox="0 0 5 3" aria-hidden className="shrink-0">
      <path d="M0 0h5L2.5 3z" fill={color} />
    </svg>
  )
}

/** Flat white combo box with the blue drop-down button (display only). */
export function TbCombo({ value, width = 90, label, className = '' }) {
  return (
    <div
      className={`mx-[2px] flex h-[19px] shrink-0 items-center border border-[#7f9db9] bg-white text-[11px] text-black ${className}`}
      style={{ width }}
      aria-label={label}
      role="img"
    >
      <span className="min-w-0 flex-1 truncate px-[3px]">{value}</span>
      <span className="flex h-full w-[13px] shrink-0 items-center justify-center border-l border-[#c3d3f0] bg-[linear-gradient(180deg,#e9f0fd_0%,#c6d8f7_100%)]">
        <TinyCaret />
      </span>
    </div>
  )
}

/** Status bar with etched panels. */
export function OfficeStatusBar({ children, className = '' }) {
  return (
    <footer
      className={`flex h-[21px] shrink-0 items-center gap-[2px] border-t border-[#8fb1e6] px-[2px] font-xp text-[11px] text-black ${statusBg} ${className}`}
    >
      {children}
    </footer>
  )
}

export function StatusPanel({ children, dim = false, grow = false, className = '' }) {
  return (
    <div
      className={[
        'flex h-[17px] items-center whitespace-nowrap border-r border-[#8fb1e6] px-[6px] shadow-[1px_0_0_#fff]',
        dim ? 'text-[#8e9cb6]' : '',
        grow ? 'min-w-0 flex-1 overflow-hidden' : 'shrink-0',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

/** Size grip in the bottom-right corner of status bars. */
export function SizeGrip() {
  return (
    <span
      className="ml-auto h-[12px] w-[12px] shrink-0 self-end"
      style={{
        background:
          'linear-gradient(135deg, transparent 0 45%, #fff 45% 52%, #7f9db9 52% 60%, transparent 60% 70%, #fff 70% 76%, #7f9db9 76% 84%, transparent 84%)',
      }}
      aria-hidden
    />
  )
}
