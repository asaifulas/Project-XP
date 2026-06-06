import MultiSlidePowerPointDeck from '../window/MultiSlidePowerPointDeck'

const SLIDE_CLASS = 'relative flex size-full min-h-0 min-w-0 flex-col overflow-hidden'

/** @typedef {{ year: string, title: string, org?: string, detail: string, color: string }} TimelineEntry */

/**
 * @param {{
 *   title: string
 *   subtitle: string
 *   era: string
 *   period: string
 *   theme: { gradient: string, accent: string, glow: string, rail: string }
 *   lines?: string[]
 *   variant?: 'intro' | 'closing'
 * }} props
 */
function TitleSlide({ title, subtitle, era, period, theme, lines = [], variant = 'intro' }) {
  const isClosing = variant === 'closing'

  return (
    <div className={[SLIDE_CLASS, 'justify-between p-[6%] text-white', theme.gradient].join(' ')}>
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: theme.glow }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: theme.accent }}
        aria-hidden
      />

      <div className="relative z-[1]">
        <div className="flex flex-wrap items-center gap-2">
          <span
            data-pp="badge"
            className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white shadow-sm"
            style={{ backgroundColor: theme.accent }}
          >
            {era}
          </span>
          <span data-pp="era" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
            {period}
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Experience.ppt</p>
        <h2 data-pp="title" className="mt-2 text-[clamp(24px,3.8vw,38px)] font-bold leading-tight tracking-tight">
          {title}
        </h2>
        {subtitle ? (
          <p
            data-pp="subtitle"
            className="mt-3 max-w-2xl text-[clamp(13px,1.8vw,18px)] font-medium leading-snug text-white/90"
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {lines.length > 0 ? (
        <ul className="relative z-[1] m-0 w-full max-w-3xl list-none space-y-3 p-0">
          {lines.map((line, index) => (
            <li
              key={line}
              data-pp="item"
              className="flex items-start gap-3 rounded-sm border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
            >
              <span
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: theme.accent }}
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="text-[clamp(12px,1.45vw,15px)] leading-snug text-white/95">{line}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <p data-pp="byline" className="relative z-[1] text-[9px] uppercase tracking-[0.18em] text-white/55">
        Ahmad Saifullah Arifin
      </p>
    </div>
  )
}

/**
 * @param {{
 *   title: string
 *   subtitle: string
 *   era: string
 *   period: string
 *   theme: { header: string, accent: string, rail: string, bg: string, node: string }
 *   entries: TimelineEntry[]
 *   footerNote?: string
 * }} props
 */
function TimelineSlide({ title, subtitle, era, period, theme, entries, footerNote }) {
  return (
    <div className={[SLIDE_CLASS, theme.bg].join(' ')}>
      <div data-pp="header" className={['shrink-0 px-[6%] py-[4.5%] text-white', theme.header].join(' ')}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            data-pp="badge"
            className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white"
            style={{ backgroundColor: theme.accent }}
          >
            {era}
          </span>
          <span data-pp="era" className="text-[10px] font-semibold uppercase tracking-wide text-white/75">
            {period}
          </span>
        </div>
        <h2 data-pp="title" className="mt-3 text-[clamp(20px,2.8vw,32px)] font-bold leading-tight">
          {title}
        </h2>
        {subtitle ? (
          <p
            data-pp="subtitle"
            className="mt-1.5 text-[clamp(11px,1.4vw,14px)] font-medium leading-snug text-white/90"
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="relative flex min-h-0 flex-1 px-[5%] py-[4%]">
        <div
          data-pp="rail"
          className="absolute bottom-[8%] left-[calc(5%+11px)] top-[6%] w-0.5 rounded-full opacity-80"
          style={{ backgroundColor: theme.rail }}
          aria-hidden
        />

        <ol className="relative m-0 flex w-full list-none flex-col justify-center gap-3 p-0">
          {entries.map((entry, index) => (
            <li key={`${entry.year}-${entry.title}`} data-pp="timeline-entry" className="relative pl-9">
              <span
                className="absolute left-0 top-3 z-[1] h-6 w-6 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.06)]"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              <div className="rounded-sm border border-zinc-200/90 bg-white/95 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: entry.color }}
                  >
                    {entry.year}
                  </span>
                  <span className="text-[clamp(12px,1.35vw,14px)] font-bold text-zinc-900">{entry.title}</span>
                  {entry.org ? (
                    <span className="text-[10px] font-semibold text-zinc-500">· {entry.org}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-[clamp(11px,1.25vw,13px)] leading-snug text-zinc-700">{entry.detail}</p>
              </div>
              {index < entries.length - 1 ? (
                <span
                  className="absolute left-[11px] top-[2.1rem] h-[calc(100%+0.35rem)] w-px -translate-x-1/2 opacity-30"
                  style={{ backgroundColor: theme.rail }}
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {footerNote ? (
        <p
          data-pp="footer"
          className="shrink-0 border-t border-zinc-200/80 bg-white/60 px-[6%] py-2 text-[10px] italic text-zinc-600"
        >
          {footerNote}
        </p>
      ) : null}
    </div>
  )
}

/** @param {{ theme: { gradient: string, accent: string }, groups: { label: string, color: string, items: string[] }[] }} props */
function SkillsSlide({ theme, groups }) {
  return (
    <div className={[SLIDE_CLASS, 'bg-gradient-to-br from-slate-50 via-white to-violet-50 p-[6%]'].join(' ')}>
      <div className="shrink-0">
        <span
          data-pp="badge"
          className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white"
          style={{ backgroundColor: theme.accent }}
        >
          Today
        </span>
        <h2 data-pp="title" className="mt-3 text-[clamp(20px,2.8vw,32px)] font-bold leading-tight text-zinc-900">
          Skills & Direction
        </h2>
        <p data-pp="subtitle" className="mt-1.5 text-[clamp(11px,1.4vw,14px)] text-zinc-600">
          What I bring today — and where I&apos;m heading
        </p>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-3 sm:grid-cols-1">
        {groups.map((group) => (
          <div
            key={group.label}
            data-pp="panel"
            className="rounded-sm border border-zinc-200/90 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: group.color }} aria-hidden />
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-800">{group.label}</h3>
            </div>
            <ul className="m-0 mt-2 list-none space-y-1.5 p-0">
              {group.items.map((item) => (
                <li key={item} className="text-[clamp(11px,1.25vw,13px)] leading-snug text-zinc-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        data-pp="footer"
        className={['mt-3 shrink-0 rounded-sm px-4 py-3 text-center text-[clamp(11px,1.3vw,13px)] font-medium italic text-white', theme.gradient].join(' ')}
      >
        Growing toward stronger systems thinking, architecture, and technical direction
      </div>
    </div>
  )
}

/** Career arc preview on intro slide */
function CareerArcStrip() {
  const phases = [
    { label: 'Education', color: '#0284c7', year: '2013' },
    { label: 'Operations', color: '#65a30d', year: '2016' },
    { label: 'Software', color: '#0891b2', year: '2020' },
    { label: 'Full-stack', color: '#7c3aed', year: '2023' },
    { label: 'Next', color: '#ea580c', year: '→' },
  ]

  return (
    <div
      data-pp="panel"
      className="relative z-[1] w-full max-w-3xl rounded-sm border border-white/20 bg-black/20 px-4 py-3 backdrop-blur-sm"
    >
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">Career arc</p>
      <div className="flex items-center justify-between gap-1">
        {phases.map((phase, index) => (
          <div key={phase.label} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {index > 0 ? <span className="h-0.5 flex-1 bg-white/30" aria-hidden /> : <span className="flex-1" />}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white/80 text-[9px] font-bold text-white shadow-sm"
                style={{ backgroundColor: phase.color }}
              >
                {phase.year}
              </span>
              {index < phases.length - 1 ? (
                <span className="h-0.5 flex-1 bg-white/30" aria-hidden />
              ) : (
                <span className="flex-1" />
              )}
            </div>
            <span className="mt-1.5 truncate text-center text-[8px] font-semibold uppercase tracking-wide text-white/80">
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


const SLIDE_DATA = [
  {
    id: 'career-journey',
    title: 'Career Journey',
    render: () => (
      <div className={[SLIDE_CLASS, 'justify-between bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-950 p-[6%] text-white'].join(' ')}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-500 opacity-35 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-amber-400 opacity-25 blur-3xl" aria-hidden />
        <div className="relative z-[1]">
          <span
            data-pp="badge"
            className="rounded-sm bg-amber-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-950"
          >
            Overview
          </span>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200/70">Experience.ppt</p>
          <h2 data-pp="title" className="mt-2 text-[clamp(24px,3.8vw,38px)] font-bold leading-tight">
            Career Journey
          </h2>
          <p
            data-pp="subtitle"
            className="mt-3 max-w-2xl text-[clamp(13px,1.8vw,18px)] font-medium leading-snug text-violet-100/90"
          >
            From engineering discipline to full-stack software
          </p>
        </div>
        <CareerArcStrip />
        <ul className="relative z-[1] m-0 w-full max-w-3xl list-none space-y-2.5 p-0">
          {[
            'Full-stack engineer with an aerospace engineering foundation',
            'Progression through operations, systems work, and hands-on software delivery',
            'Focused on practical software that supports real workflows',
          ].map((line, index) => (
            <li
              key={line}
              data-pp="item"
              className="flex items-start gap-3 rounded-sm border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-indigo-950">
                {index + 1}
              </span>
              <span className="text-[clamp(12px,1.45vw,15px)] leading-snug text-white/95">{line}</span>
            </li>
          ))}
        </ul>
        <p data-pp="byline" className="relative z-[1] text-[9px] uppercase tracking-[0.18em] text-white/55">
          Ahmad Saifullah Arifin
        </p>
      </div>
    ),
  },
  {
    id: 'engineering-foundation',
    title: 'Engineering Foundation',
    render: () => (
      <TimelineSlide
        title="Engineering Foundation"
        subtitle="Structured thinking before software became the main craft"
        era="Education"
        period="2013 – 2018"
        theme={{
          header: 'bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900',
          accent: '#f59e0b',
          rail: '#38bdf8',
          bg: 'bg-gradient-to-b from-sky-50 to-white',
          node: '#0284c7',
        }}
        entries={[
          {
            year: '2013–2018',
            title: 'Aerospace Engineering',
            org: 'Universitas Nurtanio Bandung',
            detail: 'CGPA 3.61 — aircraft design, aerodynamics, flight dynamics, control, structures, and turbine engines.',
            color: '#0284c7',
          },
          {
            year: 'Studies',
            title: 'Systems & precision',
            detail: 'Inspection technique, human factors, ground support, airframe maintenance, and aircraft maintenance management.',
            color: '#f59e0b',
          },
          {
            year: 'Early code',
            title: 'Programming exposure',
            detail: 'Basic programming alongside engineering coursework — first taste of turning theory into usable tools.',
            color: '#6366f1',
          },
        ]}
        footerNote="The engineering mindset — constraints, reliability, and clarity — still shapes how I build software."
      />
    ),
  },
  {
    id: 'early-operations',
    title: 'Early Operations Experience',
    render: () => (
      <TimelineSlide
        title="Early Operations Experience"
        subtitle="Learning how real work actually runs on the ground"
        era="Operations"
        period="2016 – 2020"
        theme={{
          header: 'bg-gradient-to-r from-lime-700 via-emerald-800 to-teal-900',
          accent: '#a3e635',
          rail: '#84cc16',
          bg: 'bg-gradient-to-b from-lime-50 to-emerald-50/30',
          node: '#65a30d',
        }}
        entries={[
          {
            year: '2016',
            title: 'Trainee Engineer',
            org: 'Indonesian Aerospace',
            detail: 'Parts delivery across departments, quality checks, documentation, approvals, and operational support.',
            color: '#0ea5e9',
          },
          {
            year: '2018–2020',
            title: 'Farm Manager',
            org: 'Fatihin KC Farm',
            detail: 'Procurement, land inspection, maintenance, certificates, clearances, and compliance-related work.',
            color: '#65a30d',
          },
          {
            year: 'Lesson',
            title: 'Accountability & process',
            detail: 'First real experience making things work when the outcome had visible consequences for people and operations.',
            color: '#ca8a04',
          },
        ]}
      />
    ),
  },
  {
    id: 'transition-software',
    title: 'Transition Into Software',
    render: () => (
      <TimelineSlide
        title="Transition Into Software"
        subtitle="When building systems became the core craft"
        era="Pivot"
        period="2020 – 2023"
        theme={{
          header: 'bg-gradient-to-r from-cyan-700 via-teal-800 to-slate-900',
          accent: '#22d3ee',
          rail: '#06b6d4',
          bg: 'bg-gradient-to-b from-cyan-50 to-slate-50',
          node: '#0891b2',
        }}
        entries={[
          {
            year: '2020–2023',
            title: 'IT Engineer',
            org: 'Avialite Sdn. Bhd.',
            detail: 'Wireless Alarm Monitoring and Remote WorkStation platforms — software tied directly to live operations.',
            color: '#0891b2',
          },
          {
            year: 'Build',
            title: 'Apps, automation & IoT',
            detail: 'Gateway GSM Android app, Python automation into Odoo ERP, Arduino monitoring systems.',
            color: '#8b5cf6',
          },
          {
            year: 'Infra',
            title: 'Deploy & maintain',
            detail: 'Odoo Community Edition on AWS EC2 — owning delivery beyond the codebase.',
            color: '#f97316',
          },
        ]}
        footerNote="Software stopped being a side skill; it became the work I wanted to keep doing."
      />
    ),
  },
  {
    id: 'full-stack-growth',
    title: 'Full-Stack Growth',
    render: () => (
      <TimelineSlide
        title="Full-Stack Growth"
        subtitle="Production systems, agile delivery, and AI in the loop"
        era="Engineering"
        period="2023 – Present"
        theme={{
          header: 'bg-gradient-to-r from-violet-700 via-purple-800 to-fuchsia-900',
          accent: '#c084fc',
          rail: '#a855f7',
          bg: 'bg-gradient-to-b from-violet-50 to-fuchsia-50/40',
          node: '#7c3aed',
        }}
        entries={[
          {
            year: '2023–now',
            title: 'Full Stack Engineer',
            org: 'Technerve Technology Solutions',
            detail: 'Software Design Documents, agile workflows, UAT-driven fixes, and continuous system improvement.',
            color: '#7c3aed',
          },
          {
            year: 'Ship',
            title: 'TerraAgra & Inerva suite',
            detail: 'Crop analysis and field monitoring; Manpower, CCU, Inspect, and related operational tools.',
            color: '#db2777',
          },
          {
            year: 'AI',
            title: 'Production integrations',
            detail: 'Vertex AI, Google Cloud Vision, and Document AI embedded in real business workflows.',
            color: '#2563eb',
          },
        ]}
      />
    ),
  },
  {
    id: 'skills-direction',
    title: 'Skills & Direction',
    render: () => (
      <SkillsSlide
        theme={{ gradient: 'bg-gradient-to-r from-indigo-600 to-violet-700', accent: '#6366f1' }}
        groups={[
          {
            label: 'Full-stack delivery',
            color: '#7c3aed',
            items: ['Laravel, React/Vue, Node.js', 'Workflow-heavy web systems and internal platforms'],
          },
          {
            label: 'Data & integration',
            color: '#0891b2',
            items: ['MySQL, MongoDB, Odoo, AWS', 'Python tooling and device-level work when needed'],
          },
          {
            label: 'Direction',
            color: '#ea580c',
            items: ['Systems thinking and architecture', 'Technical direction on complex, multi-user products'],
          },
        ]}
      />
    ),
  },
  {
    id: 'closing',
    title: 'Still Building',
    render: () => (
      <TitleSlide
        variant="closing"
        title="Still Building"
        subtitle="Practical software for real operations"
        era="Next"
        period="Malaysia · Ongoing"
        theme={{
          gradient: 'bg-gradient-to-br from-orange-600 via-rose-700 to-indigo-950',
          accent: '#fbbf24',
          glow: '#fb923c',
          rail: '#f97316',
        }}
        lines={[
          'Curious first. Structured always. Interested in hard problems worth solving.',
          'Based in Malaysia — still learning, still building.',
          'Thank you.',
        ]}
      />
    ),
  },
]

/** Full PowerPoint deck for Experience.ppt — self-contained, no chrome context sync. */
export default function ExperiencePowerPointContent() {
  return <MultiSlidePowerPointDeck slides={SLIDE_DATA} deckLabel="Experience.ppt" />
}
