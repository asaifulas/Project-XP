export default function TaskbarProgramButton({
  title,
  iconSrc,
  active,
  minimized,
  onActivate,
}) {
  return (
    <button
      type="button"
      className={[
        'xp-taskbtn inline-flex max-w-[220px] min-w-0 shrink-0 cursor-default select-none items-center gap-1.5 px-2.5 pl-2 font-xp text-[11px] hover:brightness-105',
        active ? 'xp-taskbtn-active' : '',
        minimized ? 'opacity-70' : '',
      ].join(' ')}
      onClick={onActivate}
      title={title}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          className="h-4 w-4 shrink-0 select-none object-contain"
          draggable="false"
        />
      ) : (
        <span
          className="h-4 w-4 shrink-0 rounded-sm bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
          aria-hidden
        />
      )}
      <span className="truncate">{title}</span>
    </button>
  )
}
