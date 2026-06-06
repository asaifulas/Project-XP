import { useLocation, useNavigate } from 'react-router-dom'
import { getAppById } from '../../registry/apps'
import { openForegroundPreserveStack } from '../../utils/windowStackUrl'
import WordA4Page from '../window/WordA4Page'

const DESKTOP_GUIDE_ITEMS = [
  {
    name: 'My_Journey.doc',
    type: 'DOC',
    typeClass: 'bg-[#2b579a] text-white',
    description: 'A personal timeline — where the interest began, how it evolved, and how I found my way into software.',
    appId: 'journey',
  },
  {
    name: 'Profile.doc',
    type: 'DOC',
    typeClass: 'bg-[#2b579a] text-white',
    description: 'A quick introduction: who I am, what I work on, and the kind of problems I enjoy solving.',
    appId: 'profile',
  },
  {
    name: 'Experience.ppt',
    type: 'PPT',
    typeClass: 'bg-[#d24726] text-white',
    description: 'Work history, education, certifications, and technical stack — structured for recruiters.',
    appId: 'experience',
  },
  {
    name: 'Projects.xls',
    type: 'XLS',
    typeClass: 'bg-[#217346] text-white',
    description: 'Professional delivery: ops platforms, public-sector workflows, agritech, monitoring, and internal tools.',
    appId: 'project',
  },
  {
    name: 'Playground/',
    type: 'DIR',
    typeClass: 'bg-[#f4c542] text-zinc-900',
    description: 'Experiments, motion studies, small demos, and curiosity-driven builds.',
    appId: null,
  },
  {
    name: 'Articles/',
    type: 'DIR',
    typeClass: 'bg-[#f4c542] text-zinc-900',
    description: 'A growing archive of technical notes, reflections, and things worth documenting.',
    appId: null,
  },
  {
    name: 'Latest_Resume_Saiful.pdf',
    type: 'PDF',
    typeClass: 'bg-[#c0392b] text-white',
    description: 'The formal CV — if you prefer the traditional version.',
    appId: 'acrobat_resume',
  },
]

function DesktopGuideItem({ item, onOpen }) {
  const available = item.appId != null && getAppById(item.appId)?.path != null

  const body = (
    <div className="flex items-start gap-2">
      <span
        className={[
          'mt-0.5 shrink-0 rounded-[2px] px-1 py-px text-[8px] font-bold leading-none tracking-wide',
          item.typeClass,
        ].join(' ')}
      >
        {item.type}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p
            className={[
              'font-mono text-[11px] font-bold leading-tight',
              available ? 'text-[#0000ee] underline decoration-[#0000ee]/70 underline-offset-2' : 'text-zinc-900',
            ].join(' ')}
          >
            {item.name}
          </p>
          {!available ? (
            <span className="rounded-[2px] border border-zinc-300/90 bg-zinc-100 px-1 py-px text-[8px] font-semibold uppercase tracking-wide text-zinc-500">
              Coming soon
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[11px] leading-snug text-zinc-600">{item.description}</p>
      </div>
    </div>
  )

  if (!available) {
    return (
      <li
        aria-disabled="true"
        className="rounded-sm border border-zinc-300/90 bg-white/80 px-2.5 py-2 opacity-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(0,0,0,0.08)]"
      >
        {body}
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item.appId)}
        className="w-full rounded-sm border border-zinc-300/90 bg-white px-2.5 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:border-[#316ac5]/50 hover:bg-[#eef3fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#316ac5]"
      >
        {body}
      </button>
    </li>
  )
}

export default function WelcomeWindowContent() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleOpenApp = (appId) => {
    const app = getAppById(appId)
    if (!app?.path) return
    openForegroundPreserveStack(navigate, location, app.path, app.id)
  }
  return (
    <WordA4Page>
      <article className="text-[13px] leading-[1.55] text-zinc-900">
        <header className="border-b border-zinc-300 pb-3">
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-950">Welcome</h1>
          <p className="mt-2 text-[12px] italic text-zinc-600">Welcome to my portfolio.</p>
        </header>

        <p className="mt-4 text-justify">
          This space is built like a small Windows XP desktop — part portfolio, part playground, part archive.
          Instead of scrolling a conventional website, explore it like an old computer: open documents, browse
          folders, and click files that each tell a different part of the story.
        </p>

        <p className="mt-4 text-justify">
          My name is <span className="font-semibold">Ahmad Saifullah Arifin</span>. I’m a full‑stack engineer
          focused on building practical software for real operations — workflow-heavy web apps and internal
          platforms, agritech systems, AI-assisted tools, mapping interfaces, and connected-device solutions.
          My main stack includes Laravel, React, Vue, and Tailwind, with additional experience in IoT systems,
          Python-based tooling, Odoo integrations, and AI services such as Vertex AI, Google Cloud Vision, and
          Google Document AI.
        </p>

        <p className="mt-4 text-justify">
          The retro interface is the shell — the content inside is real: professional projects shipped in
          production settings, experiments built from curiosity, and writing that captures how I think about
          systems.
        </p>

        <section
          className="mt-5 overflow-hidden rounded-sm border border-zinc-300 bg-[#ece9d8] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899,2px_3px_8px_rgba(0,0,0,0.12)]"
          aria-label="Inside this desktop"
        >
          <div className="border-b border-[#0a246a]/30 bg-gradient-to-r from-[#0a246a] via-[#3a6ea5] to-[#0a246a] px-3 py-1.5">
            <h2 className="text-[11px] font-bold tracking-wide text-white shadow-[0_1px_0_rgba(0,0,0,0.35)]">
              Inside this desktop
            </h2>
          </div>
          <ul className="m-0 list-none space-y-2 bg-[#f5f3eb] p-2.5">
            {DESKTOP_GUIDE_ITEMS.map((item) => (
              <DesktopGuideItem key={item.name} item={item} onOpen={handleOpenApp} />
            ))}
          </ul>
        </section>

        <p className="mt-5 text-justify">
          If you’re not sure where to start, follow the simplest path: open{' '}
          <span className="font-semibold">My_Journey.doc</span>, then{' '}
          <span className="font-semibold">Experience.ppt</span>, and then{' '}
          <span className="font-semibold">Projects.xls</span>.
        </p>

        <p className="mt-4 text-justify">
          You’ll also notice a familiar little assistant nearby. Clippy is here as a lightweight guide — part
          nostalgia, part navigation helper — for first-time visitors.
        </p>

        {/* <div className="mt-5 rounded border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-[12px] text-zinc-700">
          <p className="font-semibold">Optional: add a picture</p>
          <p className="mt-1">
            You can place a small photo here later (e.g. a portrait, a workspace shot, or a “Windows XP badge”
            image) to make the welcome page feel more personal.
          </p>
        </div> */}

        <p className="mt-5 text-justify">
          Thanks for stopping by. Take your time, click around, and explore.
        </p>
      </article>
    </WordA4Page>
  )
}

