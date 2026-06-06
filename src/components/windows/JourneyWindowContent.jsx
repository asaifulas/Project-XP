import WordA4Page from '../window/WordA4Page'

/**
 * “My Journey” — split across real A4 sheets (Word-style pagination by section).
 */
const milestones = [
  {
    label: 'Where it began',
    hint: 'Primary school',
    body:
      'My journey into technology did not begin with a title — it began with curiosity. In primary school, I was fascinated by old computers, slow boot screens, and the simple question of how things actually worked beneath the surface. From Windows 98 and ME to XP and beyond, I kept exploring not just how to use technology, but how to understand it.',
  },
  {
    label: 'The web clicked',
    hint: 'Secondary school',
    body:
      'In secondary school, that curiosity found its first real direction. I helped manage the school website on Joomla, and outside of that I taught myself how to build and maintain minisites, WordPress installations, and everyday web systems. Broken plugins, backup issues, theme adjustments, and small fixes became valuable lessons — and little by little, the web stopped being mysterious and started feeling like a craft I wanted to master.',
  },
  {
    label: 'Hands on learning',
    hint: 'Hobby years',
    body:
      'Alongside web development, I spent time experimenting with Arduino and small hardware projects. From azan clocks to line followers and other simple builds, I learned the discipline of testing, debugging, and patiently solving problems when the result was not immediately visible. Those projects shaped the way I think: practical, structured, and always driven by curiosity.',
  },
  {
    label: 'Systems thinking',
    hint: 'Aerospace studies',
    body:
      'My aerospace background gave me a strong foundation in structured thinking and engineering discipline. During my studies, I built aircraft preliminary calculation software in C# using Dr. Jan Roskam’s methods, turning theory into something usable and trustworthy. It was an early reminder that good software is not just about code — it is about clarity, reliability, and solving real problems well.',
  },
  {
    label: 'A deliberate shift',
    hint: 'After Covid',
    body:
      'When Covid changed the direction of my plans, I made a conscious decision to move deeper into software engineering. At Avialite, I joined as an IT Engineer and quickly found myself working across PHP, Laravel, IoT devices, Android apps, Python automation, and ERP deployment. That role broadened my perspective — from fixing what was broken to designing systems that could support real operations and scale with confidence.',
  },
  {
    label: 'Growing the toolkit',
    hint: 'AirAsia Academy',
    body:
      'To strengthen that path, I completed the AirAsia Academy Software Engineer Reskilling Programme, covering React, Node.js, MongoDB, and Go. It sharpened my full-stack capabilities and gave me a more modern engineering toolkit, matching the kind of solutions I wanted to build: practical, scalable, and ready for production.',
  },
  {
    label: 'What drives me now',
    hint: 'Today',
    body:
      'Today, I work as a full-stack engineer building systems that solve real business needs — from agricultural platforms and manpower management tools to certificate generation and AI-integrated workflows. The technologies continue to evolve, but my approach stays the same: stay curious, build with intention, and create software that genuinely helps people.',
  },
];

function MilestoneList({ items, isContinuation = false }) {
  return (
    <section className={isContinuation ? 'mt-0' : 'mt-6'} aria-label={isContinuation ? 'Timeline continued' : 'Timeline'}>
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {isContinuation ? 'Timeline (continued)' : 'Timeline'}
      </h2>
      <ol className="relative m-0 list-none p-0">
        <span className="absolute bottom-2 left-[7px] top-2 w-px bg-zinc-300" aria-hidden />
        {items.map((m) => (
          <li key={m.label} className="relative pb-7 pl-8 last:pb-0">
            <span
              className="absolute left-0 top-[6px] z-[1] h-3.5 w-3.5 rounded-full border-2 border-white bg-[#316ac5] shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
              aria-hidden
            />
            <div className="rounded-sm border border-zinc-200 bg-zinc-50/80 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                <span className="text-[12px] font-bold text-zinc-900">{m.label}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {m.hint}
                </span>
              </div>
              <p className="mt-1.5 text-justify text-[12.5px] leading-[1.6] text-zinc-800">{m.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

const bodyClass =
  "font-[Georgia,'Times_New_Roman',Times,serif] text-[13px] leading-[1.55] text-zinc-900"

export default function JourneyWindowContent() {
  const page1Milestones = milestones.slice(0, 3)
  const page2Milestones = milestones.slice(3)

  return (
    <>
      <WordA4Page>
        <article className={bodyClass}>
          <header className="border-b border-zinc-300 pb-3">
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-950">My Journey</h1>
            <p className="mt-2 text-[12px] italic text-zinc-600">
              From curiosity and old PCs to building software — one thread, many chapters.
            </p>
          </header>

          <p className="mt-4 text-justify first-letter:float-left first-letter:-mt-0.5 first-letter:mr-1 first-letter:text-[2.4rem] first-letter:font-bold first-letter:leading-none first-letter:text-zinc-800">
            I did not start in software because someone handed me the title — I started because broken installs,
            humming fans, and the quiet joy of figuring things out were enough to keep me up late. This page is a
            short map of how that curiosity turned into a career.
          </p>

          <MilestoneList items={page1Milestones} />
        </article>
      </WordA4Page>

      <WordA4Page>
        <article className={bodyClass}>
          <header className="border-b border-zinc-300 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">My Journey</p>
            <p className="mt-1 text-[12px] text-zinc-600">Page 2</p>
          </header>
          <MilestoneList items={page2Milestones} isContinuation />
        </article>
      </WordA4Page>
    </>
  )
}
