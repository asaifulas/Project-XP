import XpIconImage from '../desktop/XpIconImage'

export default function TaskbarProgramButton({
  title,
  iconSrc,
  active,
  minimized,
  onActivate,
  onContextMenu,
}) {
  return (
    <button
      type="button"
      className={[
        'xp-taskbtn inline-flex max-w-[160px] min-w-0 shrink-0 cursor-default select-none items-center gap-1 px-2 font-xp text-[11px]',
        active ? 'xp-taskbtn-active' : '',
        minimized ? 'opacity-70' : '',
      ].join(' ')}
      onClick={onActivate}
      onContextMenu={onContextMenu}
      title={title}
    >
      {iconSrc ? (
        <XpIconImage src={iconSrc} className="h-4 w-4 shrink-0 select-none object-contain" />
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
