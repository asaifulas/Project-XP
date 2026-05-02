import WordA4Page from '../window/WordA4Page'

/**
 * “My Journey” — split across real A4 sheets (Word-style pagination by section).
 */
const milestones = [
  {
    label: 'Where it began',
    hint: 'Primary school',
    body:
      'I did not land in software because of a job title first — I landed there because old machines, slow boot screens, and “what does this button do?” were irresistible. My curiosity about computers started in primary school. From Windows 98 and ME through XP and beyond, I kept asking how the pieces fit together, not only how to use them.',
  },
  {
    label: 'The web clicked',
    hint: 'Secondary school',
    body:
      'In secondary school I helped run the school site on Joomla. Outside that, I taught myself minisites, WordPress installs, and day-to-day maintenance — broken plugins, backups, themes, and the small dramas that teach you how sites really behave in the wild. That work turned fascination into habit: I wanted to understand how sites are built, not only how to keep them online.',
  },
  {
    label: 'Hands on circuits',
    hint: 'Hobby years',
    body:
      'In parallel I played with Arduino — azan clocks, line followers, and other small builds where the feedback loop is physical. Those projects trained patience, debugging when nothing smokes but nothing works, and thinking in states and conditions long before I called any of that “engineering.”',
  },
  {
    label: 'Systems without the major',
    hint: 'Aerospace studies',
    body:
      'Even without a programming degree, I was comfortable with structured thinking and how systems behave. That showed up when I built aircraft preliminary calculation software in C#, following Dr. Jan Roskam’s methods — less about syntax flex, more about turning theory into something a user could trust.',
  },
  {
    label: 'A deliberate turn',
    hint: 'After Covid',
    body:
      'When Covid rerouted plans, I chose software engineering as the next chapter. I joined Avialite as an IT Engineer; the entry test was a simple HTML page, and from there the work widened — PHP and Laravel web apps, microcontrollers for IoT, firewall-related tasks, and whatever technical fire needed putting out. It was a turning point: from solving what breaks today to building what should work tomorrow.',
  },
  {
    label: 'Levelling up',
    hint: 'AirAsia Academy',
    body:
      'I strengthened that path through the AirAsia Academy Software Engineer Reskilling Programme — React, Node.js, MongoDB, and Go — so the toolkit matched the ambition: full-stack delivery, not only patches and scripts.',
  },
  {
    label: 'Still the same thread',
    hint: 'Today',
    body:
      'The through-line never changed: curiosity first, persistence when it gets boring, and the satisfaction of shipping something that works for someone else. The tools change; the mindset does not.',
  },
]

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
