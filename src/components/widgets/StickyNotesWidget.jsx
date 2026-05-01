const READONLY_NOTES = [
  {
    id: 'welcome',
    title: 'Note 1',
    body: 'Behold: my portfolio, unleashed in full technicolor glory. Step inside—curiosity rewarded, mediocrity strictly forbidden.',
  },
  {
    id: 'interact',
    title: 'Note 2',
    body: 'This is no mere webpage—it is a Windows XP–styled command deck. Click, drag, explore: nostalgia meets muscle, and the OS of yore bows to your every whim.',
  },
]

export default function StickyNotesWidget() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 shrink-0 text-[11px] font-bold text-white/90">Sticky notes</div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        {READONLY_NOTES.map((note) => (
          <div
            key={note.id}
            className="shrink-0 rounded border border-black/30 bg-[#fff6a8] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          >
            <div className="border-b border-black/15 bg-[#ffe86a] px-2 py-1 text-[11px] font-semibold text-black/80">
              {note.title}
            </div>
            <p className="min-h-[5.5rem] whitespace-pre-wrap px-2 py-2 text-[11px] leading-snug text-black">
              {note.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
