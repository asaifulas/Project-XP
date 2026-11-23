import {
  CommandDock,
  OfficeMenuBar,
  OfficeStatusBar,
  OfficeToolbar,
  SizeGrip,
  StatusPanel,
  TbButton,
  TbCombo,
  TbSep,
  ToolbarRow,
} from './office2003'
import {
  Glyph,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconArrow,
  IconBullets,
  IconChart,
  IconClipArt,
  IconCopy,
  IconCut,
  IconDesign,
  IconFillColor,
  IconFontColor,
  IconFontGrow,
  IconFontShrink,
  IconFormatPainter,
  IconHelp,
  IconHyperlink,
  IconIndent,
  IconLine,
  IconNew,
  IconNewSlide,
  IconNumbering,
  IconOpen,
  IconOutdent,
  IconOval,
  IconPaste,
  IconPicture,
  IconPreview,
  IconPrint,
  IconRect,
  IconRedo,
  IconSave,
  IconSelectArrow,
  IconSpelling,
  IconTable,
  IconTextBox,
  IconUndo,
  IconViewNormal,
  IconViewShow,
  IconViewSorter,
  IconWordArt,
} from './officeIcons'

/** Virtual slide size used to scale slides into thumbnails. */
const SLIDE_W = 960
const SLIDE_H = 720
const THUMB_W = 112

function SlideThumb({ element }) {
  return (
    <div className="relative overflow-hidden bg-white" style={{ width: THUMB_W, height: (THUMB_W * 3) / 4 }}>
      {element ? (
        <div
          className="pointer-events-none absolute left-0 top-0"
          style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${THUMB_W / SLIDE_W})`, transformOrigin: '0 0' }}
          aria-hidden
        >
          {element}
        </div>
      ) : null}
    </div>
  )
}

/** XP-style double-arrow "Previous Slide" / "Next Slide" button at the foot of the scrollbar. */
function SlideStepButton({ dir, onClick, disabled }) {
  const up = dir === 'prev'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={up ? 'Previous Slide' : 'Next Slide'}
      aria-label={up ? 'Previous slide' : 'Next slide'}
      className="flex h-[17px] w-[17px] cursor-default items-center justify-center rounded-[2px] border border-[#b9cdf3] bg-[linear-gradient(90deg,#e6eefc_0%,#c6d8f7_100%)] enabled:hover:brightness-105 enabled:active:brightness-95 disabled:opacity-50"
    >
      <svg width="7" height="8" viewBox="0 0 7 8" aria-hidden>
        <path d={up ? 'M0 3.5 3.5 0 7 3.5zM0 8l3.5-3.5L7 8z' : 'M0 0l3.5 3.5L7 0zM0 4.5 3.5 8 7 4.5z'} fill="#4d6185" />
      </svg>
    </button>
  )
}

/**
 * PowerPoint 2003 (Windows XP) Normal view: command bars, Outline/Slides pane,
 * slide pane on grey with a 4:3 slide, notes pane, view buttons, Drawing toolbar, status bar.
 *
 * @param {{
 *   slides: { id: string, title?: string, element?: import('react').ReactNode }[]
 *   activeIndex: number
 *   onSelect?: (index: number) => void
 *   onStep?: (dir: 1 | -1) => void
 *   children: import('react').ReactNode   // contents of the 4:3 slide frame
 *   overlay?: import('react').ReactNode   // floats over the slide pane (hints)
 *   slideRef?: import('react').Ref<HTMLDivElement>
 * }} props
 */
export default function PowerPointWorkspace({ slides, activeIndex, onSelect, onStep, children, overlay, slideRef }) {
  const total = Math.max(1, slides.length)
  const thumbTop = total > 1 ? (activeIndex / (total - 1)) * 100 : 0

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#d4d0c8] font-xp text-[11px] text-black">
      <CommandDock>
        <OfficeMenuBar
          label="PowerPoint menu"
          items={['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Slide Show', 'Window', 'Help']}
        />
        <ToolbarRow>
          <OfficeToolbar>
            <TbButton icon={<IconNew />} title="New" />
            <TbButton icon={<IconOpen />} title="Open" />
            <TbButton icon={<IconSave />} title="Save" />
            <TbSep />
            <TbButton icon={<IconPrint />} title="Print" />
            <TbButton icon={<IconPreview />} title="Print Preview" />
            <TbButton icon={<IconSpelling />} title="Spelling" />
            <TbSep />
            <TbButton icon={<IconCut />} title="Cut" />
            <TbButton icon={<IconCopy />} title="Copy" />
            <TbButton icon={<IconPaste />} title="Paste" />
            <TbButton icon={<IconFormatPainter />} title="Format Painter" />
            <TbSep />
            <TbButton icon={<IconUndo />} title="Undo" caret />
            <TbButton icon={<IconRedo />} title="Redo" caret />
            <TbSep />
            <TbButton icon={<IconChart />} title="Insert Chart" />
            <TbButton icon={<IconTable />} title="Insert Table" />
            <TbButton icon={<IconHyperlink />} title="Insert Hyperlink" />
            <TbCombo value="50%" width={48} label="Zoom" />
            <TbButton icon={<IconHelp />} title="Microsoft Office PowerPoint Help" />
          </OfficeToolbar>
        </ToolbarRow>
        <ToolbarRow>
          <OfficeToolbar>
            <TbCombo value="Arial" width={100} label="Font" />
            <TbCombo value="18" width={38} label="Font size" />
            <TbSep />
            <TbButton icon={<Glyph style={{ fontWeight: 700 }}>B</Glyph>} title="Bold" />
            <TbButton icon={<Glyph style={{ fontStyle: 'italic', fontFamily: 'Times New Roman, serif', fontSize: 14 }}>I</Glyph>} title="Italic" />
            <TbButton icon={<Glyph style={{ textDecoration: 'underline' }}>U</Glyph>} title="Underline" />
            <TbButton icon={<Glyph style={{ fontWeight: 700, textShadow: '1px 1px 0 #9aa3b3' }}>S</Glyph>} title="Shadow" />
            <TbSep />
            <TbButton icon={<IconAlignLeft />} title="Align Left" />
            <TbButton icon={<IconAlignCenter />} title="Center" />
            <TbButton icon={<IconAlignRight />} title="Align Right" />
            <TbSep />
            <TbButton icon={<IconNumbering />} title="Numbering" />
            <TbButton icon={<IconBullets />} title="Bullets" />
            <TbButton icon={<IconFontGrow />} title="Increase Font Size" />
            <TbButton icon={<IconFontShrink />} title="Decrease Font Size" />
            <TbButton icon={<IconOutdent />} title="Decrease Indent" />
            <TbButton icon={<IconIndent />} title="Increase Indent" />
            <TbSep />
            <TbButton icon={<IconFontColor />} title="Font Color" caret />
            <TbSep />
            <TbButton icon={<IconDesign />} label="Design" title="Slide Design" />
            <TbButton icon={<IconNewSlide />} label="New Slide" title="New Slide" />
          </OfficeToolbar>
        </ToolbarRow>
      </CommandDock>

      <div className="flex min-h-0 min-w-0 flex-1">
        {/* Outline / Slides pane */}
        <aside className="hidden w-[150px] shrink-0 flex-col border-r border-[#6f93cf] bg-[#e8eef8] sm:flex" aria-label="Slides">
          <div className="flex h-[22px] shrink-0 items-end gap-[2px] border-b border-[#6f93cf] bg-[linear-gradient(180deg,#e3efff_0%,#c4daf9_100%)] px-1">
            <span className="cursor-default px-2 pb-[2px] text-[11px] text-[#3a4a66]">Outline</span>
            <span className="-mb-px cursor-default rounded-t-[3px] border border-b-0 border-[#6f93cf] bg-[#e8eef8] px-2 pb-[3px] pt-[1px] text-[11px] font-bold">
              Slides
            </span>
            <span className="ml-auto pb-[3px] text-[12px] leading-none text-[#1a1a1a]" aria-hidden>
              ×
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1.5 py-2 no-scrollbar">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={onSelect ? () => onSelect(index) : undefined}
                  aria-label={`Slide ${index + 1}${slide.title ? `: ${slide.title}` : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                  className="flex cursor-default items-start gap-1 text-left"
                >
                  <span className="w-[14px] shrink-0 pt-px text-right text-[11px] text-[#3a4a66]">{index + 1}</span>
                  <span
                    className={[
                      'block p-[2px]',
                      isActive ? 'bg-[#0a246a] shadow-[0_0_0_1px_#0a246a]' : 'bg-transparent hover:bg-[#9ebef5]',
                    ].join(' ')}
                  >
                    <span className="block border border-[#8d9ab0]">
                      <SlideThumb element={slide.element} />
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Slide pane + notes */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 min-w-0 flex-1">
            <div className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center bg-[#a9a9a9]" style={{ containerType: 'size' }}>
              <div
                ref={slideRef}
                className="relative overflow-hidden bg-white shadow-[2px_2px_0_#5a5a5a]"
                style={{
                  width: 'min(calc(100cqw - 28px), calc((100cqh - 28px) * 4 / 3))',
                  aspectRatio: '4 / 3',
                }}
              >
                {children}
              </div>
              {overlay}
            </div>
            {/* vertical scrollbar with Previous / Next Slide */}
            <div className="flex w-[17px] shrink-0 flex-col border-l border-[#b9cdf3] bg-[#f3f1ea]" aria-hidden={!onStep}>
              <div className="relative min-h-0 flex-1">
                <span
                  className="absolute left-[1px] right-[1px] h-[36px] rounded-[2px] border border-[#8fb1e6] bg-[linear-gradient(90deg,#e6eefc_0%,#c6d8f7_100%)]"
                  style={{ top: `calc(${thumbTop}% - ${(thumbTop / 100) * 36}px)` }}
                />
              </div>
              <SlideStepButton dir="prev" onClick={onStep ? () => onStep(-1) : undefined} disabled={!onStep || activeIndex <= 0} />
              <SlideStepButton dir="next" onClick={onStep ? () => onStep(1) : undefined} disabled={!onStep || activeIndex >= total - 1} />
            </div>
          </div>
          <div className="hidden h-[52px] shrink-0 border-t-[3px] border-t-[#c4daf9] bg-white px-3 py-2 text-[12px] text-[#8a8a8a] sm:block">
            Click to add notes
          </div>
        </div>
      </div>

      {/* view buttons + Drawing toolbar */}
      <div className="flex h-[17px] shrink-0 items-stretch border-t border-[#6f93cf] bg-[#f3f1ea]" aria-hidden>
        {[
          { icon: <IconViewNormal />, title: 'Normal View', on: true },
          { icon: <IconViewSorter />, title: 'Slide Sorter View' },
          { icon: <IconViewShow />, title: 'Slide Show from current slide' },
        ].map((v) => (
          <span
            key={v.title}
            title={v.title}
            className={`flex w-[22px] items-center justify-center border-r border-[#b9c9e4] ${v.on ? 'bg-[linear-gradient(180deg,#ffd599_0%,#ffe7a2_100%)] shadow-[inset_0_0_0_1px_#000080]' : ''}`}
          >
            {v.icon}
          </span>
        ))}
        <span className="flex-1 bg-[repeating-linear-gradient(45deg,#f3f1ea_0_2px,#ebe8de_2px_3px)]" />
      </div>
      <CommandDock className="hidden border-b-0 border-t border-t-[#6f93cf] pt-[2px] sm:flex">
        <ToolbarRow>
          <OfficeToolbar>
            <TbButton label="Draw" title="Draw" caret />
            <TbButton icon={<IconSelectArrow />} title="Select Objects" />
            <TbButton label="AutoShapes" title="AutoShapes" caret />
            <TbButton icon={<IconLine />} title="Line" />
            <TbButton icon={<IconArrow />} title="Arrow" />
            <TbButton icon={<IconRect />} title="Rectangle" />
            <TbButton icon={<IconOval />} title="Oval" />
            <TbButton icon={<IconTextBox />} title="Text Box" />
            <TbButton icon={<IconWordArt />} title="Insert WordArt" />
            <TbButton icon={<IconClipArt />} title="Insert Clip Art" />
            <TbButton icon={<IconPicture />} title="Insert Picture" />
            <TbSep />
            <TbButton icon={<IconFillColor />} title="Fill Color" caret />
            <TbButton icon={<IconFontColor />} title="Font Color" caret />
          </OfficeToolbar>
        </ToolbarRow>
      </CommandDock>

      <OfficeStatusBar>
        <StatusPanel className="w-[110px]">
          Slide {Math.min(activeIndex + 1, total)} of {total}
        </StatusPanel>
        <StatusPanel grow>Default Design</StatusPanel>
        <StatusPanel className="hidden sm:flex">English (U.S.)</StatusPanel>
        <SizeGrip />
      </OfficeStatusBar>
    </div>
  )
}
