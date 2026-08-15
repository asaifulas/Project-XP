import { FONT_FAMILIES, PRESET_COLORS } from './fieldStyle.js'

const xpBtn =
  'rounded-sm border border-black/30 bg-[linear-gradient(180deg,#f8f8f8_0%,#dfdfdf_100%)] px-2 py-0.5 text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
const xpBtnOn = `${xpBtn} bg-[#cfd8ea] font-bold`

export default function FieldStylePanel({ field, onStyle, onRemove }) {
  if (!field) {
    return <p className="mt-auto text-[10px] text-black/60">Select a field on the certificate.</p>
  }

  const style = field

  return (
    <div className="mt-auto max-h-[55%] overflow-auto border-t border-black/20 pt-2 text-[10px]">
      <div className="mb-1 font-semibold text-[11px] text-[#083a8b]">{field.column}</div>

      <label className="mb-2 block">
        <span className="mb-0.5 block font-semibold">Font</span>
        <select
          value={style.fontFamily || 'Arial'}
          onChange={(e) => onStyle({ fontFamily: e.target.value })}
          className="w-full border border-black/30 bg-white px-1 py-0.5 text-[11px]"
          style={{ fontFamily: style.fontFamily || 'Arial' }}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-2 flex flex-wrap gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onStyle({ color })}
            className="h-4 w-4 rounded-full border border-black/30"
            style={{ backgroundColor: color, boxShadow: style.color === color ? '0 0 0 2px #fff, 0 0 0 3px #000' : undefined }}
          />
        ))}
        <input
          type="color"
          value={style.color || '#000000'}
          onChange={(e) => onStyle({ color: e.target.value })}
          className="h-5 w-5 cursor-pointer border border-black/30 bg-white p-0"
          title="Custom color"
        />
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        <button type="button" className={style.bold ? xpBtnOn : xpBtn} onClick={() => onStyle({ bold: !style.bold })}>
          B
        </button>
        <button type="button" className={style.italic ? xpBtnOn : xpBtn} onClick={() => onStyle({ italic: !style.italic })}>
          I
        </button>
        <button type="button" className={xpBtn} onClick={() => onStyle({ fontSize: Math.max(8, (style.fontSize || 14) - 2) })}>
          A-
        </button>
        <button type="button" className={xpBtn} onClick={() => onStyle({ fontSize: (style.fontSize || 14) + 2 })}>
          A+
        </button>
      </div>

      <div className="mb-2 flex gap-1">
        {['left', 'center', 'right'].map((align) => (
          <button
            key={align}
            type="button"
            className={style.textAlign === align ? xpBtnOn : xpBtn}
            onClick={() => onStyle({ textAlign: align })}
          >
            {align === 'left' ? 'L' : align === 'center' ? 'C' : 'R'}
          </button>
        ))}
      </div>

      <div className="mb-2 flex gap-1">
        <button
          type="button"
          className={xpBtn}
          onClick={() => onStyle({ letterSpacing: (style.letterSpacing || 0) - 0.5 })}
        >
          - Spacing
        </button>
        <button
          type="button"
          className={xpBtn}
          onClick={() => onStyle({ letterSpacing: (style.letterSpacing || 0) + 0.5 })}
        >
          + Spacing
        </button>
      </div>
      <div className="mb-2 text-black/70">Size {style.fontSize}px · Track {style.letterSpacing}</div>

      <div className="mb-1 font-semibold">Position</div>
      <label className="mb-1 flex items-center gap-1">
        <span className="w-4">X</span>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={(style.x ?? 0) * 100}
          onChange={(e) => onStyle({ x: Number(e.target.value) / 100 })}
          className="min-w-0 flex-1"
        />
      </label>
      <label className="mb-2 flex items-center gap-1">
        <span className="w-4">Y</span>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={(style.y ?? 0) * 100}
          onChange={(e) => onStyle({ y: Number(e.target.value) / 100 })}
          className="min-w-0 flex-1"
        />
      </label>

      <div className="mb-1 font-semibold">Rotation</div>
      <label className="mb-2 flex items-center gap-1">
        <span className="w-10">Rotate</span>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={style.rotate || 0}
          onChange={(e) => onStyle({ rotate: Number(e.target.value) })}
          className="min-w-0 flex-1"
        />
      </label>

      <button type="button" className={`w-full bg-red-500 text-white`} onClick={onRemove}>
        Delete
      </button>
    </div>
  )
}
