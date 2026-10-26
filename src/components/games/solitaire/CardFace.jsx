import { isRed, rankLabel, suitSymbol } from './deck.js'

/**
 * XP-ish playing card (CSS face — no Microsoft bitmaps).
 * @param {{
 *   card: { suit: string, rank: number, faceUp: boolean, id: string } | null,
 *   selected?: boolean,
 *   dimmed?: boolean,
 *   placeholder?: boolean,
 *   onClick?: () => void,
 *   className?: string,
 *   style?: object,
 *   'aria-label'?: string,
 * }} props
 */
export default function CardFace({
  card,
  selected = false,
  dimmed = false,
  placeholder = false,
  onClick,
  className = '',
  style,
  'aria-label': ariaLabel,
}) {
  if (placeholder || !card) {
    return (
      <button
        type="button"
        aria-label={ariaLabel ?? 'Empty pile'}
        onClick={onClick}
        className={`relative box-border flex h-[72px] w-[52px] shrink-0 items-center justify-center rounded-[4px] border border-dashed border-white/35 bg-black/10 sm:h-[84px] sm:w-[60px] ${className}`}
        style={style}
      />
    )
  }

  if (!card.faceUp) {
    return (
      <button
        type="button"
        aria-label={ariaLabel ?? 'Face-down card'}
        onClick={onClick}
        className={`relative box-border h-[72px] w-[52px] shrink-0 touch-manipulation rounded-[4px] border border-[#1a3a6e] bg-[linear-gradient(145deg,#2a5aaa_0%,#1a3a7e_45%,#0e2860_100%)] shadow-[inset_0_0_0_2px_#7eb6ff55] sm:h-[84px] sm:w-[60px] ${selected ? 'ring-2 ring-yellow-300' : ''} ${className}`}
        style={style}
      >
        <span
          className="pointer-events-none absolute inset-[6px] rounded-[2px] border border-[#9ec4ff]/40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.08) 3px, rgba(255,255,255,0.08) 4px)',
          }}
        />
      </button>
    )
  }

  const red = isRed(card.suit)
  const color = red ? '#c02828' : '#1a1a1a'
  const label = `${rankLabel(card.rank)}${suitSymbol(card.suit)}`

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      onClick={onClick}
      className={`relative box-border flex h-[72px] w-[52px] shrink-0 touch-manipulation flex-col justify-between rounded-[4px] border border-black/50 bg-[#f8f6f0] px-1 py-0.5 text-left shadow-sm sm:h-[84px] sm:w-[60px] ${selected ? 'ring-2 ring-yellow-300 brightness-105' : ''} ${dimmed ? 'opacity-50' : ''} ${className}`}
      style={{ color, ...style }}
    >
      <span className="font-xp text-[11px] font-bold leading-none sm:text-[12px]">
        {rankLabel(card.rank)}
        <span className="ml-0.5">{suitSymbol(card.suit)}</span>
      </span>
      <span className="self-center text-[18px] leading-none sm:text-[22px]">{suitSymbol(card.suit)}</span>
      <span className="self-end rotate-180 font-xp text-[11px] font-bold leading-none sm:text-[12px]">
        {rankLabel(card.rank)}
        <span className="ml-0.5">{suitSymbol(card.suit)}</span>
      </span>
    </button>
  )
}
