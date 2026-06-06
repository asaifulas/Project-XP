import profileImage from '../../assets/mine/profile.png'
import WordA4Page from '../window/WordA4Page'

const STRENGTHS = [
  'Build full-stack applications with strong business logic',
  'Design systems around real operational needs',
  'Connect backend workflows with clean, usable interfaces',
  'Work comfortably across software, data, devices, and integrations',
  'Turn complexity into something people can actually use',
]

const DOMAINS = [
  'Approval flows & multi-step workflows',
  'Operational dashboards & internal tools',
  'AI-integrated products & document automation',
  'Asset tracking & field-oriented platforms',
  'Monitoring, inspection, and agritech systems',
]

const TECH_STACK = [
  { label: 'Laravel', tone: 'bg-[#ff2d20]/10 text-[#c41e12] border-[#ff2d20]/25' },
  { label: 'PHP', tone: 'bg-[#777bb4]/12 text-[#4f5b93] border-[#777bb4]/30' },
  { label: 'React', tone: 'bg-[#61dafb]/15 text-[#0e7490] border-[#61dafb]/35' },
  { label: 'Vue', tone: 'bg-[#42b883]/12 text-[#166534] border-[#42b883]/30' },
  { label: 'JavaScript', tone: 'bg-[#f7df1e]/20 text-[#854d0e] border-[#f7df1e]/40' },
  { label: 'Tailwind CSS', tone: 'bg-[#38bdf8]/12 text-[#0369a1] border-[#38bdf8]/30' },
  { label: 'Node.js', tone: 'bg-[#339933]/12 text-[#166534] border-[#339933]/30' },
  { label: 'Spring Boot', tone: 'bg-[#6db33f]/12 text-[#3f6212] border-[#6db33f]/30' },
  { label: 'MySQL', tone: 'bg-[#00758f]/10 text-[#0c4a6e] border-[#00758f]/25' },
  { label: 'MongoDB', tone: 'bg-[#47a248]/12 text-[#166534] border-[#47a248]/30' },
  { label: 'AWS EC2', tone: 'bg-[#ff9900]/12 text-[#9a3412] border-[#ff9900]/30' },
  { label: 'Odoo', tone: 'bg-[#714b67]/10 text-[#581c87] border-[#714b67]/25' },
  { label: 'Python', tone: 'bg-[#3776ab]/10 text-[#1e3a8a] border-[#3776ab]/25' },
  { label: 'Arduino', tone: 'bg-[#00979d]/10 text-[#115e59] border-[#00979d]/25' },
  { label: 'Vertex AI', tone: 'bg-[#4285f4]/10 text-[#1d4ed8] border-[#4285f4]/25' },
  { label: 'Cloud Vision', tone: 'bg-[#4285f4]/10 text-[#1d4ed8] border-[#4285f4]/25' },
  { label: 'Document AI', tone: 'bg-[#4285f4]/10 text-[#1d4ed8] border-[#4285f4]/25' },
]

const bodyClass =
  "font-[Georgia,'Times_New_Roman',Times,serif] text-[13px] leading-[1.55] text-zinc-900"

function XpPanel({ title, children, className = '' }) {
  return (
    <section
      className={[
        'overflow-hidden rounded-sm border border-zinc-300 bg-[#ece9d8] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899,1px_2px_6px_rgba(0,0,0,0.1)]',
        className,
      ].join(' ')}
    >
      <div className="border-b border-[#0a246a]/30 bg-gradient-to-r from-[#0a246a] via-[#3a6ea5] to-[#0a246a] px-3 py-1.5">
        <h2 className="text-[11px] font-bold tracking-wide text-white shadow-[0_1px_0_rgba(0,0,0,0.35)]">
          {title}
        </h2>
      </div>
      <div className="bg-[#f5f3eb] p-2.5">{children}</div>
    </section>
  )
}

export default function ProfileWindowContent() {
  return (
    <>
      <WordA4Page>
        <article className={bodyClass}>
          <header className="overflow-hidden rounded-sm border border-zinc-300 shadow-[inset_1px_1px_0_#fff,1px_2px_8px_rgba(0,0,0,0.12)]">
            <div className="border-b border-[#0a246a]/30 bg-gradient-to-r from-[#0a246a] via-[#3a6ea5] to-[#0a246a] px-4 py-3">
              <h1 className="text-[24px] font-bold tracking-tight text-white shadow-[0_1px_0_rgba(0,0,0,0.35)]">
                Profile
              </h1>
              <p className="mt-1.5 text-[13px] font-medium leading-snug text-blue-100/95">
                Full-stack engineer. Systems thinker. Builder of useful things.
              </p>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 bg-gradient-to-b from-[#faf9f6] to-white p-4">
              <div className="min-w-0 space-y-3">
                <p className="text-justify leading-[1.62] text-zinc-800">
                  I&apos;m <span className="font-semibold text-zinc-950">Ahmad Saifullah Arifin</span>, a
                  full-stack engineer focused on building practical software for real operations. My work spans
                  Laravel and modern frontend development, but it often extends further — into workflow design,
                  mapping interfaces, AI-assisted features, automation, and connected-device systems.
                </p>
                <p className="text-justify leading-[1.62] text-zinc-800">
                  I enjoy projects where software has to do more than look good; it has to make someone&apos;s
                  work clearer, faster, and more reliable.
                </p>
              </div>

              <figure className="m-0 shrink-0 text-center">
                <div className="rounded-sm border border-zinc-400 bg-[#ece9d8] p-1.5 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899]">
                  <img
                    src={profileImage}
                    alt="Ahmad Saifullah Arifin"
                    width={112}
                    height={112}
                    className="block h-[112px] w-[112px] rounded-sm border border-zinc-300/80 object-cover object-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
                  />
                </div>
                <figcaption className="mt-2 max-w-[8.5rem] text-[10px] leading-tight text-zinc-600">
                  <span className="block font-bold text-zinc-900">Ahmad Saifullah Arifin</span>
                  Full-stack engineer · Malaysia
                </figcaption>
              </figure>
            </div>
          </header>

          <p className="mt-5 text-justify leading-[1.62] text-zinc-800">
            My path into software was shaped by curiosity and structured thinking. An aerospace engineering
            background taught me to respect systems, constraints, and precision — and that mindset has stayed
            with me as I moved into full-stack development. Today, I bring that same approach to platforms for
            monitoring, approvals, inspection, operations, agritech, and internal business workflows.
          </p>

          <XpPanel title="What I do best" className="mt-5">
            <ul className="m-0 list-none space-y-2 p-0">
              {STRENGTHS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    className="mt-[7px] h-2 w-2 shrink-0 rotate-45 bg-[#316ac5] shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                    aria-hidden
                  />
                  <span className="text-[12.5px] leading-snug text-zinc-800">{item}</span>
                </li>
              ))}
            </ul>
          </XpPanel>

          <XpPanel title="Where I work best" className="mt-4">
            <p className="mb-2.5 text-[12.5px] leading-snug text-zinc-700">
              Projects that need both technical depth and practical judgment — systems with moving parts,
              multiple users, and real consequences.
            </p>
            <ul className="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-1">
              {DOMAINS.map((item) => (
                <li
                  key={item}
                  className="rounded-sm border border-zinc-300/90 bg-white px-2.5 py-1.5 text-[11.5px] leading-snug text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </XpPanel>
        </article>
      </WordA4Page>

      <WordA4Page>
        <article className={bodyClass}>
          <header className="border-b border-zinc-300 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Profile</p>
            <p className="mt-1 text-[12px] text-zinc-600">Page 2</p>
          </header>

          <XpPanel title="Technical toolkit" className="mt-5">
            <div className="flex flex-wrap gap-1.5">
              {TECH_STACK.map(({ label, tone }) => (
                <span
                  key={label}
                  className={[
                    'rounded-sm border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
                    tone,
                  ].join(' ')}
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-[10.5px] leading-snug text-zinc-500">
              Plus Bootstrap, Vuetify, MSSQL, and related integration work across ERP, cloud, and device stacks.
            </p>
          </XpPanel>

          <section
            className="mt-5 rounded-sm border border-dashed border-[#316ac5]/35 bg-gradient-to-br from-[#eef3fc] via-white to-[#f5f3eb] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
            aria-label="Working style"
          >
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0a246a]">Working style</h2>
            <p className="mt-2 text-[13.5px] italic leading-[1.65] text-zinc-800">
              Curious first. Structured always.
            </p>
            <p className="mt-2 text-justify text-[12.5px] leading-[1.62] text-zinc-700">
              I like understanding how the whole system behaves, not only the part directly in front of me. My
              goal is usually the same: build something solid, make it understandable, and leave it better than
              I found it.
            </p>
          </section>

          <footer className="mt-6 border-t border-zinc-300 pt-4">
            <p className="text-center text-[12.5px] leading-relaxed text-zinc-700">
              <span className="font-semibold text-zinc-900">Based in Malaysia.</span>
              <br />
              Still learning, still building, still interested in hard problems worth solving.
            </p>
          </footer>
        </article>
      </WordA4Page>
    </>
  )
}
