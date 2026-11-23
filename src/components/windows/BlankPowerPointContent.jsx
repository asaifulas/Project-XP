/**
 * PowerPoint 2003 "Title Slide" layout: dashed placeholders as in a new presentation.
 * Fills the 4:3 slide inside `PowerPointOfficeChrome`; text scales with the slide width.
 *
 * @param {{ title?: string, subtitle?: string }} props  Filled text replaces the "Click to add" prompt.
 */
export default function BlankPowerPointContent({ title, subtitle }) {
  const box = 'absolute left-[8%] right-[8%] flex items-center justify-center text-center font-[Arial,sans-serif]'
  return (
    <div className="relative size-full bg-white" style={{ containerType: 'inline-size' }} aria-label="Title slide">
      <div
        className={`${box} top-[28%] h-[22%] ${title ? 'text-black' : 'border border-dashed border-[#8a8a8a] text-[#8a8a8a]'}`}
        style={{ fontSize: '5.4cqw' }}
      >
        {title ?? 'Click to add title'}
      </div>
      <div
        className={`${box} top-[55%] h-[20%] ${subtitle ? 'text-[#333]' : 'border border-dashed border-[#8a8a8a] text-[#8a8a8a]'}`}
        style={{ fontSize: '3.4cqw' }}
      >
        {subtitle ?? 'Click to add subtitle'}
      </div>
    </div>
  )
}
