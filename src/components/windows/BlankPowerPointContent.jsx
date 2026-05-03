/** Single blank 4:3 slide (content area inside `PowerPointOfficeChrome`). */
export default function BlankPowerPointContent() {
  return (
    <div
      className="aspect-[4/3] w-[min(520px,calc(100%-16px))] max-w-full shrink-0 border border-black/35 bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.4)]"
      aria-label="Blank slide"
    />
  )
}
