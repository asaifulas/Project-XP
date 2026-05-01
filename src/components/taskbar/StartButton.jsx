import windowsLogo from '../../assets/logo/windows.svg'

export default function StartButton({ open, onClick }) {
  return (
    <button
      type="button"
      className={[
        'xp-start-button inline-flex cursor-default select-none items-center gap-1 px-2.5 pl-1.5 font-xp text-[11px] font-bold lowercase tracking-wide',
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
      <span
        className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-sm bg-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_0_1px_rgba(0,0,0,0.35)]"
        aria-hidden
      >
        <img src={windowsLogo} alt="" className="h-[12px] w-[12px]" />
      </span>
      <span>Start</span>
    </button>
  )
}
