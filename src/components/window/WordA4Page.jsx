/**
 * One physical A4 sheet (210 × 297 mm) with typical Word default margins (~1 in).
 * Stack multiple instances for multi-page documents inside WordOfficeChrome.
 */
export default function WordA4Page({ children }) {
  return (
    <section
      data-word-a4-page
      className="box-border w-[210mm] min-h-[297mm] max-w-[210mm] shrink-0 bg-white p-[25.4mm] text-[13px] leading-normal text-zinc-900 shadow-[1px_1px_0_#000,2px_2px_10px_rgba(0,0,0,0.22)]"
      aria-label="Document page"
    >
      {children}
    </section>
  )
}
