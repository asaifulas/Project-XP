import { useEffect, useRef, useState } from 'react'
import { getAppById } from '../../../registry/apps'
import { useShellStore } from '../../../stores/useShellStore'
import { MyComputerDetailsPane } from './MyComputerContent'
import { useFolderNavigation } from './FolderNavigationContext'
import {
  FolderSelectionProvider,
  useFolderSelection,
} from './FolderSelectionContext'
import {
  Caret,
  ComputerIcon,
  DesktopIcon,
  DocumentsIcon,
  FolderIcon,
  FoldersTreeIcon,
  GoIcon,
  NavArrowIcon,
  NetworkIcon,
  NewFolderIcon,
  PicturesIcon,
  PublishWebIcon,
  SearchIcon,
  ShareFolderIcon,
  SlideShowIcon,
  UpFolderIcon,
  ViewsIcon,
  WindowsFlag,
} from '../../window/retro/xpIcons'

/* Small XP glyphs used by the task pane and the address bar. */
const MiniFolder = () => <FolderIcon />
const MiniComputer = () => <ComputerIcon />
const MiniNetwork = () => <NetworkIcon />

/** Flat XP toolbar button: border and gradient only on hover, sunken when pressed (as in IE6). */
const toolBtn =
  'flex h-[30px] shrink-0 cursor-default items-center gap-1 rounded-[3px] border border-transparent px-1 text-[11px] text-black enabled:hover:border-[#c2bba6] enabled:hover:bg-[linear-gradient(180deg,#ffffff_0%,#f6f4ee_55%,#e8e4d6_100%)] enabled:active:border-[#a8a08a] enabled:active:bg-[#e3dfd0] enabled:active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.18)] disabled:text-[#aca899]'

const toolSep = <span className="mx-0.5 h-[26px] w-px shrink-0 bg-[#c5c2b2] shadow-[1px_0_0_#fff]" aria-hidden />

/** Round chevron button in a task-pane header (points up when open). */
function PaneChevron({ open }) {
  return (
    <span
      className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border border-[#c6d3f7] bg-white shadow-[0_1px_1px_rgba(0,0,64,0.2)]"
      aria-hidden
    >
      <svg width="9" height="9" viewBox="0 0 9 9">
        <path
          d={open ? 'M1.5 4.5 4.5 1.5l3 3M1.5 8 4.5 5l3 3' : 'M1.5 1 4.5 4l3-3M1.5 4.5 4.5 7.5l3-3'}
          fill="none"
          stroke="#215dc6"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/**
 * Collapsible task-pane block in XP's default style: white-to-lavender header with a blue title
 * and round chevron, pale lavender body.
 */
function TaskPaneSection({ title, children: sectionChildren }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-3 overflow-hidden rounded-t-[3px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex h-[25px] w-full cursor-default items-center justify-between gap-1 bg-[linear-gradient(90deg,#ffffff_0%,#c6d3f7_100%)] pl-3 pr-1.5 text-left"
      >
        <span className="text-[11px] font-bold leading-none text-[#215dc6] group-hover:text-[#428eff]">{title}</span>
        <PaneChevron open={open} />
      </button>
      {open ? (
        <div className="border border-t-0 border-white bg-[#d6dff7] px-3 py-2">{sectionChildren}</div>
      ) : null}
    </div>
  )
}

function TaskLink({ icon, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex w-full cursor-default items-start gap-1.5 py-[3px] text-left"
    >
      <span className="shrink-0">{icon}</span>
      <span
        className={[
          'text-[11px] leading-snug text-[#215dc6]',
          disabled ? '' : 'group-hover:text-[#428eff] group-hover:underline',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  )
}

function SelectionDetails() {
  const { selected } = useFolderSelection()
  if (!selected) {
    return (
      <p className="px-0.5 text-[10px] leading-snug text-[#4a5568]">
        Select an item in the view to read its description.
      </p>
    )
  }
  return (
    <div className="space-y-1 px-0.5 text-[10px] leading-snug text-[#1a1a1a]">
      <p className="m-0 break-all font-bold">{selected.name}</p>
      {selected.typeLabel ? <p className="m-0 text-[#4a5568]">Type: {selected.typeLabel}</p> : null}
      {selected.kind === 'image' && selected.width && selected.height ? (
        <p className="m-0 text-[#4a5568]">
          Dimensions: {selected.width} × {selected.height}
        </p>
      ) : null}
      {selected.kind === 'image' && selected.src ? (
        <div className="mt-1 overflow-hidden border border-[#7aa6d8] bg-white p-0.5">
          <img src={selected.src} alt="" className="mx-auto max-h-16 max-w-full object-contain" />
        </div>
      ) : null}
    </div>
  )
}

/**
 * Windows XP Explorer–style host: menu, standard-buttons toolbar, address bar, task pane, main pane.
 *
 * @param {'default' | 'myComputer' | 'pictures'} [variant]
 */
export default function FolderExplorerChrome({ addressPath, children, variant = 'default' }) {
  const menuItems = ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']
  const isMyComputer = variant === 'myComputer'
  const isPictures = variant === 'pictures'
  const setSystemPropertiesOpen = useShellStore((s) => s.setSystemPropertiesOpen)
  const setWallpaperSettingsOpen = useShellStore((s) => s.setWallpaperSettingsOpen)
  const AddressIcon = isMyComputer ? MiniComputer : MiniFolder
  const {
    canBack,
    canForward,
    canUp,
    goBack,
    goForward,
    goUp,
    goToAddress,
    openFolder,
    addressPath: liveAddressPath,
    addressHistory,
    active: navActive,
  } = useFolderNavigation()

  const resolvedAddress = liveAddressPath || addressPath || ''
  const [addressInput, setAddressInput] = useState(resolvedAddress)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [goFailed, setGoFailed] = useState(false)
  const addressWrapRef = useRef(null)

  useEffect(() => {
    setAddressInput(resolvedAddress)
    setGoFailed(false)
  }, [resolvedAddress])

  useEffect(() => {
    if (!historyOpen) return undefined
    const onDoc = (event) => {
      if (!addressWrapRef.current?.contains(event.target)) setHistoryOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [historyOpen])

  const submitAddress = () => {
    if (!navActive) return
    const ok = goToAddress(addressInput)
    setGoFailed(!ok)
    if (ok) setHistoryOpen(false)
  }

  const rebarStrip =
    'border-b border-[#aca899] bg-[linear-gradient(180deg,#fffcf8_0%,#f0ebe0_40%,#e4dfd4_100%)] shadow-[inset_0_1px_0_#fff]'

  return (
    <FolderSelectionProvider>
    <div className="flex min-h-0 flex-1 flex-col bg-[#ece9d8] font-xp text-[11px] text-black">
      {/* Menu — Luna beige strip */}
      <div className={`flex h-[24px] shrink-0 items-stretch justify-between ${rebarStrip}`}>
        <nav className="flex min-w-0 items-center overflow-hidden px-1" aria-label="Menu">
          {menuItems.map((label) => (
            <span
              key={label}
              className="cursor-default select-none whitespace-nowrap rounded-[2px] px-[7px] py-[2px] text-[11px] text-black hover:bg-[#316ac5] hover:text-white"
            >
              {label}
            </span>
          ))}
        </nav>
        <div className="flex w-[42px] shrink-0 items-center justify-center border-l border-[#aca899] bg-white" aria-hidden>
          <WindowsFlag />
        </div>
      </div>

      {/* Standard Buttons toolbar */}
      <div className={`flex h-[38px] shrink-0 items-center overflow-hidden whitespace-nowrap px-1 ${rebarStrip}`}>
        <button type="button" className={toolBtn} disabled={!canBack} onClick={goBack} title="Back" aria-label="Back">
          <NavArrowIcon dir="back" disabled={!canBack} />
          <span className="hidden sm:inline">Back</span>
          <Caret />
        </button>
        <button type="button" className={toolBtn} disabled={!canForward} onClick={goForward} title="Forward" aria-label="Forward">
          <NavArrowIcon dir="forward" disabled={!canForward} />
          <Caret />
        </button>
        <button
          type="button"
          className={`${toolBtn} disabled:opacity-60 disabled:grayscale`}
          disabled={!canUp}
          onClick={goUp}
          title="Up"
          aria-label="Up"
        >
          <UpFolderIcon />
        </button>
        {toolSep}
        <button type="button" className={toolBtn} title="Search" tabIndex={-1}>
          <SearchIcon />
          <span className="hidden sm:inline">Search</span>
        </button>
        <button type="button" className={toolBtn} title="Folders" tabIndex={-1}>
          <FoldersTreeIcon />
          <span className="hidden sm:inline">Folders</span>
        </button>
        {toolSep}
        <button type="button" className={toolBtn} title="Views" aria-label="Views" tabIndex={-1}>
          <ViewsIcon />
          <Caret />
        </button>
      </div>

      {/* Address bar row */}
      <div className={`flex h-[28px] shrink-0 items-center gap-1 px-1.5 ${rebarStrip}`}>
        <span className="shrink-0 px-0.5 text-[11px] font-normal text-[#5c5346]">Address</span>
        <div className="relative min-w-0 flex-1" ref={addressWrapRef}>
          <form
            className={[
              'flex h-[21px] min-w-0 flex-1 items-stretch overflow-hidden border bg-white',
              goFailed ? 'border-[#c00]' : 'border-[#7f9db9]',
            ].join(' ')}
            onSubmit={(e) => {
              e.preventDefault()
              submitAddress()
            }}
          >
            <div className="flex min-w-0 flex-1 items-center gap-1 px-1">
              <AddressIcon className="h-3.5 w-4 shrink-0" />
              <input
                type="text"
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value)
                  setGoFailed(false)
                }}
                onFocus={(e) => e.target.select()}
                spellCheck={false}
                aria-label="Address"
                disabled={!navActive}
                className="min-w-0 flex-1 border-0 bg-transparent font-xp text-[11px] leading-tight text-black outline-none disabled:text-[#666]"
              />
            </div>
            <button
              type="button"
              onClick={() => navActive && setHistoryOpen((v) => !v)}
              disabled={!navActive}
              className="my-px mr-px flex w-[17px] shrink-0 cursor-default items-center justify-center rounded-[2px] border border-[#b9cdf3] bg-[linear-gradient(180deg,#e6eefc_0%,#c4d6f8_50%,#b2c8f4_100%)] hover:brightness-105 disabled:opacity-70"
              aria-label="Address history"
              aria-expanded={historyOpen}
            >
              <svg width="7" height="4" viewBox="0 0 7 4" aria-hidden>
                <path d="M0 0h7L3.5 4z" fill="#4d6185" />
              </svg>
            </button>
          </form>
          {historyOpen && navActive && addressHistory.length > 0 ? (
            <ul
              className="absolute left-0 right-0 top-full z-20 m-0 max-h-40 list-none overflow-auto border border-[#7f9db9] bg-white p-0 shadow-md"
              role="listbox"
            >
              {[...new Set(addressHistory)].map((path) => (
                <li key={path} className="m-0 p-0">
                  <button
                    type="button"
                    className="flex w-full items-center gap-1 px-1.5 py-1 text-left font-xp text-[11px] hover:bg-[#316ac5] hover:text-white"
                    onClick={() => {
                      setAddressInput(path)
                      setHistoryOpen(false)
                      goToAddress(path)
                    }}
                  >
                    <AddressIcon className="h-3.5 w-4 shrink-0" />
                    <span className="truncate">{path}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          onClick={submitAddress}
          disabled={!navActive}
          className={`${toolBtn} h-[24px] pr-1.5 disabled:opacity-70`}
          title="Go to the address"
        >
          <GoIcon />
          <span>Go</span>
        </button>
      </div>

      {/* Task pane + content */}
      <div className="flex min-h-0 min-w-0 flex-1 border-t border-white/70">
        <aside
          className="w-[200px] shrink-0 overflow-y-auto px-3 py-3 sm:w-[210px]"
          style={{
            background: 'linear-gradient(180deg, #7ba2e7 0%, #6375d6 100%)',
          }}
          aria-label="Tasks and other places"
        >
          {isMyComputer ? (
            <>
              <TaskPaneSection title="System Tasks">
                <ul className="space-y-0">
                  <li>
                    <TaskLink
                      icon={<MiniComputer />}
                      label="View system information"
                      onClick={() => setSystemPropertiesOpen(true)}
                    />
                  </li>
                  <li>
                    <TaskLink icon={<DocumentsIcon />} label="Add or remove programs" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<ComputerIcon />} label="Change a setting" disabled />
                  </li>
                </ul>
              </TaskPaneSection>

              <TaskPaneSection title="Other Places">
                <ul className="space-y-0">
                  <li>
                    <TaskLink icon={<MiniNetwork />} label="My Network Places" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<DocumentsIcon />} label="My Documents" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<FolderIcon />} label="Shared Documents" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<ComputerIcon />} label="Control Panel" disabled />
                  </li>
                </ul>
              </TaskPaneSection>

              <TaskPaneSection title="Details">
                <MyComputerDetailsPane />
              </TaskPaneSection>
            </>
          ) : isPictures ? (
            <>
              <TaskPaneSection title="Picture Tasks">
                <ul className="space-y-0">
                  <li>
                    <TaskLink icon={<SlideShowIcon />} label="View as a slide show" disabled />
                  </li>
                  <li>
                    <TaskLink
                      icon={<DesktopIcon />}
                      label="Set as desktop background"
                      onClick={() => setWallpaperSettingsOpen(true)}
                    />
                  </li>
                </ul>
              </TaskPaneSection>

              <TaskPaneSection title="File and Folder Tasks">
                <ul className="space-y-0">
                  <li>
                    <TaskLink icon={<NewFolderIcon />} label="Make a new folder" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<PublishWebIcon />} label="Publish this folder to the Web" disabled />
                  </li>
                </ul>
              </TaskPaneSection>

              <TaskPaneSection title="Other Places">
                <ul className="space-y-0">
                  <li>
                    <TaskLink
                      icon={<PicturesIcon />}
                      label="Gallery"
                      onClick={() => {
                        const gallery = getAppById('gallery_folder')
                        if (gallery) openFolder(gallery)
                      }}
                    />
                  </li>
                  <li>
                    <TaskLink icon={<MiniComputer />} label="My Computer" disabled />
                  </li>
                </ul>
              </TaskPaneSection>

              <TaskPaneSection title="Details">
                <SelectionDetails />
              </TaskPaneSection>
            </>
          ) : (
            <>
              <TaskPaneSection title="File and Folder Tasks">
                <ul className="space-y-0">
                  <li>
                    <TaskLink icon={<NewFolderIcon />} label="Make a new folder" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<PublishWebIcon />} label="Publish this folder to the Web" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<ShareFolderIcon />} label="Share this folder" disabled />
                  </li>
                </ul>
              </TaskPaneSection>

              <TaskPaneSection title="Other Places">
                <ul className="space-y-0">
                  <li>
                    <TaskLink icon={<FolderIcon />} label="Documents and Settings" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<DocumentsIcon />} label="My Documents" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<FolderIcon />} label="Shared Documents" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<MiniComputer />} label="My Computer" disabled />
                  </li>
                  <li>
                    <TaskLink icon={<MiniNetwork />} label="My Network Places" disabled />
                  </li>
                </ul>
              </TaskPaneSection>

              <TaskPaneSection title="Details">
                <SelectionDetails />
              </TaskPaneSection>
            </>
          )}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">{children}</div>
      </div>
    </div>
    </FolderSelectionProvider>
  )
}
