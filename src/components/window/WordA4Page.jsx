/**
 * One Word sheet: 794px at 96dpi, Times 12pt, about 2cm margins.
 * Stack multiple instances for multi-page documents inside WordOfficeChrome.
 */
export default function WordA4Page({ children }) {
  return (
    <section
      data-word-a4-page
      className="word-page shrink-0 shadow-[1px_1px_0_#808080]"
      aria-label="Document page"
    >
      {children}
    </section>
  )
}
