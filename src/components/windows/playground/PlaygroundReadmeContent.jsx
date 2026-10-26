import WordA4Page from '../../window/WordA4Page'
import { PLAYGROUND_READMES } from './playgroundReadmes'

const bodyClass =
  "font-[Georgia,'Times_New_Roman',Times,serif] text-[13px] leading-[1.55] text-zinc-900"

/**
 * @param {{ docId: string }} props
 */
export default function PlaygroundReadmeContent({ docId }) {
  const doc = PLAYGROUND_READMES[docId]

  if (!doc) {
    return (
      <WordA4Page>
        <p className="text-sm text-zinc-600">README not found.</p>
      </WordA4Page>
    )
  }

  return (
    <WordA4Page>
      <article className={bodyClass}>
        <header className="border-b border-zinc-300 pb-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            README.md · Microsoft Word
          </p>
          <h1 className="mt-1 text-[22px] font-bold tracking-tight text-zinc-950">{doc.title}</h1>
          <p className="mt-1.5 text-[12px] italic text-zinc-600">{doc.subtitle}</p>
        </header>

        <section className="mt-4">
          <h2 className="text-[14px] font-bold text-[#2b579a]">Idea</h2>
          <p className="mt-1.5 text-justify">{doc.idea}</p>
        </section>

        <section className="mt-4">
          <h2 className="text-[14px] font-bold text-[#2b579a]">Tech</h2>
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {doc.tech.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="mt-4">
          <h2 className="text-[14px] font-bold text-[#2b579a]">How it works</h2>
          <ol className="mt-1.5 list-decimal space-y-1.5 pl-5">
            {doc.howItWorks.map((line) => (
              <li key={line} className="text-justify">
                {line}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-4">
          <h2 className="text-[14px] font-bold text-[#2b579a]">Notes for fellow builders</h2>
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {doc.notes.map((line) => (
              <li key={line} className="text-justify">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 border-t border-zinc-200 pt-3 font-mono text-[10px] text-zinc-500">
          Path: Playground \\ … \\ README.md — opened via Word shell in the XP window stack.
        </p>
      </article>
    </WordA4Page>
  )
}
