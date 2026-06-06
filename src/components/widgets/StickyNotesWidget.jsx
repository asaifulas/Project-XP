import whatsappIcon from '../../assets/icons/whatsapp.svg'
import { EXTERNAL_URLS } from '../../registry/apps'
import { openExternalUrl } from '../../utils/openExternalUrl'

const READONLY_NOTES = [
  {
    id: 'interact',
    title: 'Note 1',
    body: 'This is no mere webpage—it is a Windows XP–styled command deck. Click, drag, explore: nostalgia meets muscle, and the OS of yore bows to your every whim.',
  },
  {
    id: 'hire',
    title: 'Note 2',
    body: 'Bold ideas. Thorny problems. World-class builds waiting to happen. Don’t let brilliance idle in the margins—summon me on WhatsApp and let’s turn your vision into shipped reality.',
    cta: {
      label: 'Message me on WhatsApp',
      url: EXTERNAL_URLS.whatsapp,
    },
  },
]

export default function StickyNotesWidget() {
  return (
    <div className="flex flex-col">
      <div className="mb-2 shrink-0 text-[11px] font-bold text-white/90">Sticky notes</div>

      <div className="flex flex-col gap-2">
        {READONLY_NOTES.map((note) => (
          <div
            key={note.id}
            className="shrink-0 rounded border border-black/30 bg-[#fff6a8] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          >
            <div className="border-b border-black/15 bg-[#ffe86a] px-2 py-1 text-[11px] font-semibold text-black/80">
              {note.title}
            </div>
            <div className="px-2 py-2">
              <p className="whitespace-pre-wrap text-[11px] leading-snug text-black">
                {note.body}
              </p>
              {note.cta ? (
                <button
                  type="button"
                  onClick={() => openExternalUrl(note.cta.url)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-2 py-2 text-[11px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#20ba5a] active:bg-[#1aad52]"
                >
                  <img
                    src={whatsappIcon}
                    alt=""
                    className="h-4 w-4 shrink-0 select-none"
                    draggable="false"
                  />
                  {note.cta.label}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
