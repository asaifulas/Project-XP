export function XpTab({ label, active = false }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      aria-current={active ? 'page' : undefined}
      className={[
        'relative -mb-px min-w-0 flex-1 rounded-t-[3px] border border-b-0 px-2 py-[4px] text-center text-[11px] leading-none',
        active
          ? 'z-[1] cursor-default border-[#919b9c] border-b-[#ece9d8] bg-[#ece9d8] font-normal text-black before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[#f09821]'
          : 'cursor-not-allowed border-[#b8b4ac] border-b-[#919b9c] bg-[#ddd9ce] text-[#808080] shadow-none',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export function XpDialogButton({ children, onClick, variant = 'default', disabled = false }) {
  const variants = {
    ok: 'border-2 border-[#0054e3] bg-[linear-gradient(180deg,#ffffff_0%,#ece9d8_52%,#d4d0c8_100%)] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899] [outline:1px_dotted_#000] [outline-offset:-5px]',
    default:
      'border border-[#003c74] bg-[linear-gradient(180deg,#ffffff_0%,#ece9d8_52%,#d4d0c8_100%)] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899] hover:bg-[linear-gradient(180deg,#ffffff_0%,#f2efe8_52%,#ddd9ce_100%)]',
    disabled:
      'cursor-not-allowed border border-[#c8c4bb] bg-[#ece9d8] text-[#a3a3a3] shadow-none',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={[
        'h-[23px] min-w-[75px] rounded-[3px] px-5 text-[11px] leading-none text-black',
        disabled ? variants.disabled : variants[variant],
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/**
 * @param {{ tabs: string[], activeTab: string }} props
 */
export function XpDialogTabRow({ tabs, activeTab }) {
  return (
    <div className="flex w-full gap-px border-b border-[#919b9c]">
      {tabs.map((tab) => (
        <XpTab key={tab} label={tab} active={tab === activeTab} />
      ))}
    </div>
  )
}

export function XpDialogActions({ onClose, showApply = true }) {
  return (
    <div className="flex justify-end gap-2 bg-[#ece9d8] px-4 py-3">
      <XpDialogButton variant="ok" onClick={onClose}>
        OK
      </XpDialogButton>
      <XpDialogButton onClick={onClose}>Cancel</XpDialogButton>
      {showApply ? <XpDialogButton disabled>Apply</XpDialogButton> : null}
    </div>
  )
}
