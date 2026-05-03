import WordA4Page from '../window/WordA4Page'

/** Empty Word document (blank first page). */
export default function BlankWordContent() {
  return (
    <WordA4Page>
      <p className="min-h-[1em]">&nbsp;</p>
    </WordA4Page>
  )
}
