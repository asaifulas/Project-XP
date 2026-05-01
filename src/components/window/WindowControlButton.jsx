export default function WindowControlButton({
  label,
  symbol,
  onClick,
  variant = 'default',
}) {
  const variantClass =
    variant === 'close'
      ? 'bg-gradient-to-b from-red-500 to-red-700 hover:brightness-105'
      : 'bg-gradient-to-b from-[#f6f6f6] to-[#cfcfcf] hover:brightness-105'

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-black/60 text-[11px] font-bold leading-none text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${variantClass} ${variant === 'close' ? 'text-white' : ''}`}
    >
      {symbol}
    </button>
  )
}

