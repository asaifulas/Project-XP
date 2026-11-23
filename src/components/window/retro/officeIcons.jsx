/**
 * 16px toolbar glyphs in the Office 2003 / Adobe Reader 7 style.
 * Flat fills only (no gradient ids) so icons render correctly even when copies are hidden.
 */

const S = ({ children, w = 16, h = 16 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
    {children}
  </svg>
)

const page = (
  <>
    <path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#6d7c95" />
    <path d="M9.5 1.5v3h3" fill="#dfe6f1" stroke="#6d7c95" strokeLinejoin="round" />
  </>
)

export const IconNew = () => <S>{page}</S>

export const IconOpen = () => (
  <S>
    <path d="M1.5 3.5h4l1.2 1.3h6.8v8.7h-12z" fill="#f2c94c" stroke="#9a7413" strokeLinejoin="round" />
    <path d="M1.5 13.5 4 7.5h11l-2.5 6z" fill="#ffe28a" stroke="#9a7413" strokeLinejoin="round" />
  </S>
)

export const IconSave = () => (
  <S>
    <rect x="1.5" y="1.5" width="13" height="13" rx="1" fill="#3a63b8" stroke="#1d3a78" />
    <rect x="4" y="1.5" width="8" height="5" fill="#fff" stroke="#1d3a78" strokeWidth="0.8" />
    <rect x="9.5" y="2.5" width="1.5" height="3" fill="#3a63b8" />
    <rect x="3.5" y="9" width="9" height="5.5" fill="#d9dfe9" stroke="#1d3a78" strokeWidth="0.8" />
  </S>
)

export const IconPrint = () => (
  <S>
    <path d="M4.5 1.5h7v4h-7z" fill="#fff" stroke="#6d7c95" />
    <rect x="1.5" y="5.5" width="13" height="6" rx="1" fill="#c4c9d3" stroke="#555e70" />
    <path d="M2 7.5h12" stroke="#eef0f4" />
    <circle cx="12" cy="9" r="0.8" fill="#2fa52f" />
    <path d="M4 10h8v4.5H4z" fill="#fff" stroke="#6d7c95" />
  </S>
)

export const IconPreview = () => (
  <S>
    {page}
    <circle cx="9" cy="9.5" r="3" fill="#cfe7ff" stroke="#30486c" strokeWidth="1.2" />
    <path d="m11.2 11.7 3 3" stroke="#30486c" strokeWidth="1.8" strokeLinecap="round" />
  </S>
)

export const IconEmail = () => (
  <S>
    <rect x="1.5" y="4" width="13" height="9" fill="#fdf6dc" stroke="#8a7440" />
    <path d="m1.8 4.4 6.2 4.8 6.2-4.8" fill="none" stroke="#8a7440" />
  </S>
)

export const IconSpelling = () => (
  <S>
    <text x="0.5" y="7.5" fontSize="6.5" fontWeight="700" fontFamily="Tahoma, Verdana, sans-serif" fill="#1d3a78">
      ABC
    </text>
    <path d="m4 11.5 2.5 2.5 5.5-5.5" fill="none" stroke="#1f8a1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </S>
)

export const IconCut = () => (
  <S>
    <path d="m5 1.5 4.5 8M11 1.5l-4.5 8" stroke="#6b7486" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="4.8" cy="12" r="2.4" fill="none" stroke="#1d3a78" strokeWidth="1.4" />
    <circle cx="11.2" cy="12" r="2.4" fill="none" stroke="#1d3a78" strokeWidth="1.4" />
  </S>
)

export const IconCopy = () => (
  <S>
    <path d="M1.5 1.5h6l2 2v7h-8z" fill="#fff" stroke="#6d7c95" />
    <path d="M6.5 5.5h6l2 2v7h-8z" fill="#fff" stroke="#6d7c95" />
    <path d="M8.5 9h4M8.5 11h4" stroke="#9fb0c8" />
  </S>
)

export const IconPaste = () => (
  <S>
    <rect x="1.5" y="2.5" width="10" height="12" rx="1" fill="#c8954a" stroke="#7a5420" />
    <rect x="4" y="1.5" width="5" height="2.5" rx="0.5" fill="#d7dce4" stroke="#5f6878" />
    <path d="M6.5 6.5h6l2 2v6h-8z" fill="#fff" stroke="#6d7c95" />
  </S>
)

export const IconFormatPainter = () => (
  <S>
    <rect x="2" y="1.5" width="10" height="4.5" rx="1" fill="#f6d24a" stroke="#8a6d10" />
    <path d="M12 3.5h2v4H7.5v2" fill="none" stroke="#56617a" strokeWidth="1.2" />
    <rect x="6" y="9.5" width="3" height="5" rx="0.6" fill="#8a5a2b" stroke="#4e3216" />
  </S>
)

export const IconUndo = () => (
  <S>
    <path d="M4 7.5h6a3.5 3.5 0 0 1 0 7H7" fill="none" stroke="#1f4fa8" strokeWidth="2" strokeLinecap="round" />
    <path d="M1.5 7.5 5.5 4v7z" fill="#1f4fa8" />
  </S>
)

export const IconRedo = () => (
  <S>
    <path d="M12 7.5H6a3.5 3.5 0 0 0 0 7h3" fill="none" stroke="#1f4fa8" strokeWidth="2" strokeLinecap="round" />
    <path d="M14.5 7.5 10.5 4v7z" fill="#1f4fa8" />
  </S>
)

export const IconHyperlink = () => (
  <S>
    <circle cx="6" cy="6" r="4.6" fill="#4a8fe0" stroke="#1f4f96" />
    <path d="M2.8 4.5c1.2-.4 2 .4 1.8 1.2-.2 1 1.2 1 1 2.2M7 1.8c-.1.9.6 1.3 1.5 1.2" fill="none" stroke="#7ad06a" strokeWidth="1.2" />
    <path d="M8 12.2 9.6 10.6a1.6 1.6 0 0 1 2.3 0l.5.5a1.6 1.6 0 0 1 0 2.3L10.8 15M12.6 9.8l1.6-1.6" fill="none" stroke="#4b5568" strokeWidth="1.3" strokeLinecap="round" />
  </S>
)

export const IconTable = () => (
  <S>
    <rect x="1.5" y="2.5" width="13" height="11" fill="#fff" stroke="#3a5a90" />
    <path d="M1.5 5.5h13" stroke="#3a5a90" strokeWidth="2" />
    <path d="M1.5 9.5h13M5.8 4.5v9M10.2 4.5v9" stroke="#6f8ab8" />
  </S>
)

export const IconExcelSheet = () => (
  <S>
    <rect x="1.5" y="2.5" width="13" height="11" fill="#fff" stroke="#2e7d32" />
    <path d="M1.5 5.5h13M1.5 8.5h13M1.5 11h13M5.5 2.5v11M10 2.5v11" stroke="#7fb27f" />
    <rect x="1.5" y="2.5" width="13" height="3" fill="#2e7d32" opacity="0.85" />
  </S>
)

export const IconColumns = () => (
  <S>
    <rect x="1.5" y="1.5" width="13" height="13" fill="#fff" stroke="#6d7c95" />
    <path d="M3.5 4h3.5M3.5 6h3.5M3.5 8h3.5M3.5 10h3.5M3.5 12h3.5M9 4h3.5M9 6h3.5M9 8h3.5M9 10h3.5M9 12h3.5" stroke="#3a5a90" />
  </S>
)

export const IconDrawing = () => (
  <S>
    <rect x="1.5" y="6.5" width="7" height="7" fill="#9cc3ef" stroke="#2f5fa6" />
    <circle cx="10.5" cy="5.5" r="4" fill="#f7d24f" stroke="#a37b10" />
    <path d="m8.5 14.5 3-5 3 5z" fill="#86c46e" stroke="#3d7a2a" strokeLinejoin="round" />
  </S>
)

export const IconPilcrow = () => (
  <S>
    <path d="M9 2.5v12M12 2.5v12M13.5 2.5H7.5a3 3 0 0 0 0 6H9" fill="none" stroke="#1d3a78" strokeWidth="1.4" />
  </S>
)

export const IconHelp = () => (
  <S>
    <circle cx="8" cy="8" r="6.5" fill="#2f6fd0" stroke="#1a3f84" />
    <path d="M6 6.2a2 2 0 1 1 2.6 1.9c-.5.2-.6.5-.6 1.1v.4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11.6" r="0.9" fill="#fff" />
  </S>
)

export const IconRead = () => (
  <S>
    <path d="M1.5 3.5c2.2-.8 4.4-.6 6.5.8v9.2c-2.1-1.3-4.3-1.5-6.5-.8z" fill="#fff" stroke="#3a5a90" />
    <path d="M14.5 3.5c-2.2-.8-4.4-.6-6.5.8v9.2c2.1-1.3 4.3-1.5 6.5-.8z" fill="#e7eef9" stroke="#3a5a90" />
  </S>
)

/** Text-glyph button faces (Bold/Italic/Underline/Shadow) as in the real toolbar. */
export const Glyph = ({ children, style }) => (
  <span className="flex h-4 w-4 items-center justify-center font-[Tahoma,Verdana,sans-serif] text-[12px] leading-none text-[#1a1a1a]" style={style}>
    {children}
  </span>
)

const lines = (rows) => (
  <S>
    {rows.map(([x1, x2], i) => (
      <path key={i} d={`M${x1} ${3.5 + i * 2.5}H${x2}`} stroke="#1a1a1a" />
    ))}
  </S>
)

export const IconAlignLeft = () => lines([[2, 14], [2, 10], [2, 14], [2, 10], [2, 14]])
export const IconAlignCenter = () => lines([[2, 14], [4, 12], [2, 14], [4, 12], [2, 14]])
export const IconAlignRight = () => lines([[2, 14], [6, 14], [2, 14], [6, 14], [2, 14]])
export const IconJustify = () => lines([[2, 14], [2, 14], [2, 14], [2, 14], [2, 10]])

export const IconLineSpacing = () => (
  <S>
    <path d="M7 3.5h7M7 6.5h7M7 9.5h7M7 12.5h7" stroke="#1a1a1a" />
    <path d="M3 2v12" stroke="#1f4fa8" />
    <path d="M1 4.5 3 2l2 2.5M1 11.5 3 14l2-2.5" fill="none" stroke="#1f4fa8" />
  </S>
)

export const IconNumbering = () => (
  <S>
    <text x="1" y="6.5" fontSize="5" fontFamily="Tahoma, sans-serif" fill="#1f4fa8">1</text>
    <text x="1" y="11.5" fontSize="5" fontFamily="Tahoma, sans-serif" fill="#1f4fa8">2</text>
    <path d="M6 4.5h8M6 9.5h8M6 13.5h8" stroke="#1a1a1a" />
  </S>
)

export const IconBullets = () => (
  <S>
    <circle cx="3" cy="4.5" r="1.3" fill="#1f4fa8" />
    <circle cx="3" cy="9" r="1.3" fill="#1f4fa8" />
    <circle cx="3" cy="13.5" r="1.3" fill="#1f4fa8" />
    <path d="M6 4.5h8M6 9h8M6 13.5h8" stroke="#1a1a1a" />
  </S>
)

export const IconOutdent = () => (
  <S>
    <path d="M2 2.5h12M7 5.5h7M7 8.5h7M7 11.5h7M2 14.5h12" stroke="#1a1a1a" />
    <path d="M5.5 6 2 8.5 5.5 11z" fill="#1f4fa8" />
  </S>
)

export const IconIndent = () => (
  <S>
    <path d="M2 2.5h12M7 5.5h7M7 8.5h7M7 11.5h7M2 14.5h12" stroke="#1a1a1a" />
    <path d="M2 6 5.5 8.5 2 11z" fill="#1f4fa8" />
  </S>
)

export const IconBorders = () => (
  <S>
    <rect x="2.5" y="2.5" width="11" height="11" fill="none" stroke="#1a1a1a" strokeWidth="1.4" />
    <path d="M8 3v10M3 8h10" stroke="#9aa3b3" strokeDasharray="1 1" />
  </S>
)

/** Tool with a coloured bar underneath (highlight, font colour, fill colour). */
const withBar = (color, glyph) => (
  <S>
    {glyph}
    <rect x="1" y="12.5" width="14" height="3" fill={color} />
  </S>
)

export const IconHighlight = () =>
  withBar(
    '#ffff00',
    <>
      <path d="m4 10 6.5-6.5 2 2L6 12H4z" fill="#fff" stroke="#3b4458" />
      <path d="m10.5 3.5 1-1 2 2-1 1" fill="#6b7486" stroke="#3b4458" />
    </>,
  )

export const IconFontColor = () =>
  withBar(
    '#e01b1b',
    <text x="3.2" y="10.5" fontSize="10" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#1a1a1a">
      A
    </text>,
  )

export const IconFillColor = () =>
  withBar(
    '#ffff00',
    <>
      <path d="m3 6.5 4.5-4.5 4.5 4.5-4.5 4.5z" fill="#fff" stroke="#3b4458" />
      <path d="M12.3 7.5c.8 1.2 1.2 2 1.2 2.6a1.2 1.2 0 0 1-2.4 0c0-.6.4-1.4 1.2-2.6z" fill="#2f6fd0" />
    </>,
  )

export const IconAutoSum = () => (
  <S>
    <path d="M12.5 3.5v-1h-9l5 5.5-5 5.5h9v-1" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round" />
  </S>
)

export const IconSortAsc = () => (
  <S>
    <text x="1" y="6.5" fontSize="6" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#1f4fa8">A</text>
    <text x="1" y="14.5" fontSize="6" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#c0392b">Z</text>
    <path d="M11.5 2v11.5M9 11l2.5 3 2.5-3" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
  </S>
)

export const IconSortDesc = () => (
  <S>
    <text x="1" y="6.5" fontSize="6" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#c0392b">Z</text>
    <text x="1" y="14.5" fontSize="6" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#1f4fa8">A</text>
    <path d="M11.5 2v11.5M9 11l2.5 3 2.5-3" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
  </S>
)

export const IconChart = () => (
  <S>
    <path d="M1.5 14.5h13" stroke="#1a1a1a" />
    <rect x="2.5" y="8" width="3" height="6.5" fill="#3a63b8" />
    <rect x="6.5" y="4" width="3" height="10.5" fill="#d9442f" />
    <rect x="10.5" y="6" width="3" height="8.5" fill="#f2c94c" />
  </S>
)

export const IconMergeCenter = () => (
  <S>
    <rect x="1.5" y="3.5" width="13" height="9" fill="#fff" stroke="#3a5a90" />
    <text x="5.2" y="10.6" fontSize="7" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#1a1a1a">a</text>
    <path d="M2.5 8h2M11.5 8h2" stroke="#1f4fa8" />
    <path d="M4.5 6.5 6 8 4.5 9.5M11.5 6.5 10 8l1.5 1.5" fill="none" stroke="#1f4fa8" />
  </S>
)

export const IconCurrency = () => (
  <S>
    <ellipse cx="8" cy="11" rx="6" ry="2.5" fill="#e6b422" stroke="#8a6a10" />
    <ellipse cx="8" cy="8" rx="6" ry="2.5" fill="#f2c94c" stroke="#8a6a10" />
    <ellipse cx="8" cy="5" rx="6" ry="2.5" fill="#ffe17a" stroke="#8a6a10" />
  </S>
)

export const IconIncDecimal = () => (
  <S>
    <text x="0" y="7" fontSize="6" fontFamily="Tahoma, sans-serif" fill="#1a1a1a">.0</text>
    <text x="3" y="14.5" fontSize="6" fontFamily="Tahoma, sans-serif" fill="#1a1a1a">.00</text>
    <path d="M10 4.5h5M13 2.5l2 2-2 2" fill="none" stroke="#1f4fa8" />
  </S>
)

export const IconDecDecimal = () => (
  <S>
    <text x="0" y="7" fontSize="6" fontFamily="Tahoma, sans-serif" fill="#1a1a1a">.00</text>
    <text x="5" y="14.5" fontSize="6" fontFamily="Tahoma, sans-serif" fill="#1a1a1a">.0</text>
    <path d="M15 4.5h-4.5M12.5 2.5l-2 2 2 2" fill="none" stroke="#1f4fa8" />
  </S>
)

export const IconNewSlide = () => (
  <S>
    <rect x="1.5" y="3.5" width="11" height="9" fill="#fff" stroke="#6d7c95" />
    <path d="M3.5 6h7M3.5 8h5" stroke="#3a63b8" />
    <path d="M12.5 1v5M10 3.5h5" stroke="#e0a400" strokeWidth="1.6" />
  </S>
)

export const IconDesign = () => (
  <S>
    <rect x="1.5" y="2.5" width="13" height="10" fill="#2f5fa6" stroke="#1d3a78" />
    <path d="M1.5 9c4-2.5 8-2.5 13 0v3.5h-13z" fill="#7fb0ea" />
    <rect x="3.5" y="4.5" width="6" height="1.6" fill="#fff" />
  </S>
)

export const IconFontGrow = () => (
  <S>
    <text x="0.5" y="13.5" fontSize="12" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#1a1a1a">A</text>
    <path d="m10.5 6 2.5-3.5L15.5 6z" fill="#1f4fa8" />
  </S>
)

export const IconFontShrink = () => (
  <S>
    <text x="0.5" y="13.5" fontSize="9" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#1a1a1a">A</text>
    <path d="m9.5 3 2.5 3.5L14.5 3z" fill="#1f4fa8" />
  </S>
)

export const IconSelectArrow = () => (
  <S>
    <path d="M4 1.5v11l2.8-2.6 2 4.4 1.8-.8-2-4.3h3.9z" fill="#fff" stroke="#1a1a1a" strokeLinejoin="round" />
  </S>
)

export const IconLine = () => (
  <S>
    <path d="m2.5 13.5 11-11" stroke="#1a1a1a" strokeWidth="1.3" />
  </S>
)

export const IconArrow = () => (
  <S>
    <path d="m2.5 13.5 9.5-9.5" stroke="#1a1a1a" strokeWidth="1.3" />
    <path d="m13.5 2.5-1.2 5-3.8-3.8z" fill="#1a1a1a" />
  </S>
)

export const IconRect = () => (
  <S>
    <rect x="2.5" y="3.5" width="11" height="9" fill="#fff" stroke="#1a1a1a" />
  </S>
)

export const IconOval = () => (
  <S>
    <ellipse cx="8" cy="8" rx="6" ry="4.6" fill="#fff" stroke="#1a1a1a" />
  </S>
)

export const IconTextBox = () => (
  <S>
    <rect x="1.5" y="2.5" width="13" height="11" fill="#fff" stroke="#1a1a1a" strokeDasharray="1.5 1" />
    <text x="4" y="11" fontSize="8" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#1f4fa8">A</text>
  </S>
)

export const IconWordArt = () => (
  <S>
    <text
      x="1.5"
      y="13"
      fontSize="12"
      fontWeight="700"
      fontStyle="italic"
      fontFamily="Georgia, serif"
      fill="#2f6fd0"
      stroke="#123a7a"
      strokeWidth="0.5"
      transform="rotate(-12 8 8)"
    >
      A
    </text>
  </S>
)

export const IconClipArt = () => (
  <S>
    <circle cx="5" cy="5" r="3.3" fill="#f2c94c" stroke="#9a7413" />
    <path d="M7 14.5 10.5 6l4 8.5z" fill="#86c46e" stroke="#3d7a2a" strokeLinejoin="round" />
    <path d="M1.5 14.5 4.5 9l3 5.5z" fill="#6fa8e8" stroke="#2f5fa6" strokeLinejoin="round" />
  </S>
)

export const IconPicture = () => (
  <S>
    <rect x="1.5" y="2.5" width="13" height="11" fill="#cfe6ff" stroke="#5d6f8c" />
    <path d="m2 13 4-5 3 3.5 2-2 3.5 3.5z" fill="#5a9a42" />
    <circle cx="11" cy="5.5" r="1.4" fill="#f2c94c" />
  </S>
)

export const IconBinoculars = () => (
  <S>
    <path d="M3 4h3v3H3zM10 4h3v3h-3z" fill="#4b5568" />
    <circle cx="4.5" cy="10.5" r="3.5" fill="#26303f" stroke="#111" />
    <circle cx="11.5" cy="10.5" r="3.5" fill="#26303f" stroke="#111" />
    <circle cx="4" cy="10" r="1.3" fill="#8fb7ea" />
    <circle cx="11" cy="10" r="1.3" fill="#8fb7ea" />
    <path d="M6.5 8h3v2h-3z" fill="#4b5568" />
  </S>
)

export const IconHand = () => (
  <S>
    <path
      d="M5 14.5 2.4 10.6c-.6-.9.6-1.8 1.4-1L5 10.8V3.2a1 1 0 0 1 2 0V8V2.2a1 1 0 0 1 2 0V8V3a1 1 0 0 1 2 0v5.4-3.6a1 1 0 0 1 2 0v5.6c0 2.2-1 4.1-2.5 4.1z"
      fill="#fff"
      stroke="#1a1a1a"
      strokeLinejoin="round"
    />
  </S>
)

export const IconSelectText = () => (
  <S>
    <path d="M5.5 2.5h2M5.5 13.5h2M6.5 2.5v11" stroke="#1a1a1a" strokeWidth="1.2" />
    <path d="M9 5.5h6M9 8h6M9 10.5h4" stroke="#2f6fd0" strokeWidth="1.4" />
  </S>
)

export const IconSnapshot = () => (
  <S>
    <rect x="1.5" y="4.5" width="13" height="9" rx="1.5" fill="#6b7486" stroke="#2c3240" />
    <path d="M5 4.5 6 2.5h4l1 2" fill="#6b7486" stroke="#2c3240" />
    <circle cx="8" cy="9" r="2.8" fill="#9cc3ef" stroke="#2c3240" />
  </S>
)

export const IconZoomIn = () => (
  <S>
    <circle cx="6.5" cy="6.5" r="5" fill="#e6f2ff" stroke="#30486c" strokeWidth="1.3" />
    <path d="M4 6.5h5M6.5 4v5" stroke="#1a1a1a" strokeWidth="1.3" />
    <path d="m10.3 10.3 4 4" stroke="#30486c" strokeWidth="2" strokeLinecap="round" />
  </S>
)

export const IconZoomOut = () => (
  <S>
    <circle cx="6.5" cy="6.5" r="5" fill="#e6f2ff" stroke="#30486c" strokeWidth="1.3" />
    <path d="M4 6.5h5" stroke="#1a1a1a" strokeWidth="1.3" />
    <path d="m10.3 10.3 4 4" stroke="#30486c" strokeWidth="2" strokeLinecap="round" />
  </S>
)

export const IconActualSize = () => (
  <S>
    {page}
    <text x="4.6" y="12" fontSize="6.5" fontWeight="700" fontFamily="Tahoma, sans-serif" fill="#1f4fa8">1:1</text>
  </S>
)

export const IconFitPage = () => (
  <S>
    {page}
    <path d="M5.5 6.5V5h1.5M10.5 5H11v1.5M5.5 11v1.5H7M11 11v1.5H9.5" fill="none" stroke="#1f4fa8" />
  </S>
)

export const IconFitWidth = () => (
  <S>
    {page}
    <path d="M4.8 9h6.4M6.3 7.5 4.8 9l1.5 1.5M9.7 7.5 11.2 9l-1.5 1.5" fill="none" stroke="#1f4fa8" />
  </S>
)

export const IconRotate = () => (
  <S>
    <path d="M3.5 9a4.5 4.5 0 1 0 1.6-5.6" fill="none" stroke="#1f4fa8" strokeWidth="1.6" />
    <path d="m2.5 1.5.8 4.4 4-1.7z" fill="#1f4fa8" />
  </S>
)

/** Blue navigation triangles used by Reader's first/previous/next/last page buttons. */
export const IconPageNav = ({ dir }) => {
  const shapes = {
    first: (
      <>
        <rect x="3" y="3.5" width="1.8" height="9" fill="#1f4fa8" />
        <path d="M12.5 3.5v9L5.5 8z" fill="#1f4fa8" />
      </>
    ),
    prev: <path d="M11.5 3.5v9L4.5 8z" fill="#1f4fa8" />,
    next: <path d="M4.5 3.5v9l7-4.5z" fill="#1f4fa8" />,
    last: (
      <>
        <path d="M3.5 3.5v9l7-4.5z" fill="#1f4fa8" />
        <rect x="11.2" y="3.5" width="1.8" height="9" fill="#1f4fa8" />
      </>
    ),
  }
  return <S>{shapes[dir]}</S>
}

/** Small green Back / Forward orbs in Reader's status bar. */
export const IconGreenNav = ({ dir }) => (
  <S>
    <circle cx="8" cy="8" r="6.5" fill="#3cad34" stroke="#1a611a" />
    <path
      d={dir === 'back' ? 'M9.4 4.8 6.2 8l3.2 3.2' : 'M6.6 4.8 9.8 8l-3.2 3.2'}
      fill="none"
      stroke="#fff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </S>
)

export const IconSinglePage = () => (
  <S>
    <rect x="4.5" y="1.5" width="7" height="13" fill="#fff" stroke="#3a5a90" />
  </S>
)

export const IconContinuous = () => (
  <S>
    <rect x="4.5" y="-1" width="7" height="7" fill="#fff" stroke="#3a5a90" />
    <rect x="4.5" y="8" width="7" height="9" fill="#fff" stroke="#3a5a90" />
  </S>
)

/** View buttons (bottom-left in Word / PowerPoint). */
export const IconViewNormal = () => (
  <S w={14} h={12}>
    <rect x="0.5" y="0.5" width="13" height="11" fill="#fff" stroke="#3a5a90" />
    <path d="M2.5 3.5h9M2.5 6h9M2.5 8.5h6" stroke="#6f8ab8" />
  </S>
)

export const IconViewWeb = () => (
  <S w={14} h={12}>
    <rect x="0.5" y="0.5" width="13" height="11" fill="#fff" stroke="#3a5a90" />
    <circle cx="9.5" cy="7" r="3" fill="#4a8fe0" stroke="#1f4f96" strokeWidth="0.8" />
    <path d="M2.5 3h5M2.5 5.5h3" stroke="#6f8ab8" />
  </S>
)

export const IconViewPrint = () => (
  <S w={14} h={12}>
    <rect x="3" y="0.5" width="8" height="11" fill="#fff" stroke="#3a5a90" />
    <path d="M4.5 3h5M4.5 5h5M4.5 7h3" stroke="#6f8ab8" />
  </S>
)

export const IconViewOutline = () => (
  <S w={14} h={12}>
    <rect x="0.5" y="0.5" width="13" height="11" fill="#fff" stroke="#3a5a90" />
    <path d="M2 3h1.5M5 3h7M3.5 6H5M6.5 6h5.5M3.5 9H5M6.5 9h4" stroke="#1f4fa8" />
  </S>
)

export const IconViewSorter = () => (
  <S w={14} h={12}>
    <rect x="0.5" y="0.5" width="5.5" height="4.5" fill="#fff" stroke="#3a5a90" />
    <rect x="8" y="0.5" width="5.5" height="4.5" fill="#fff" stroke="#3a5a90" />
    <rect x="0.5" y="7" width="5.5" height="4.5" fill="#fff" stroke="#3a5a90" />
    <rect x="8" y="7" width="5.5" height="4.5" fill="#fff" stroke="#3a5a90" />
  </S>
)

export const IconViewShow = () => (
  <S w={14} h={12}>
    <path d="M1 1.5h12" stroke="#3a5a90" strokeWidth="1.6" />
    <rect x="2" y="2.5" width="10" height="7" fill="#fff" stroke="#3a5a90" />
    <path d="M7 9.5v2.5M4.5 12 7 10l2.5 2" fill="none" stroke="#3a5a90" />
    <path d="M5.5 4.2v3.6L8.8 6z" fill="#2fa52f" />
  </S>
)
