import { useEffect, useState } from 'react'
import { getAppById, isFolderApp } from '../../../registry/apps'
import XpIconImage from '../../desktop/XpIconImage'
import FilmstripFolderView from './FilmstripFolderView'
import { useFolderNavigation } from './FolderNavigationContext'
import { useFolderSelection } from './FolderSelectionContext'

/** @param {{ folderLabel?: string, desktop?: { label?: string }, title?: string, id: string } | null | undefined} app */
function folderItemLabel(app) {
  if (!app) return 'Unknown'
  return app.folderLabel ?? app.desktop?.label ?? app.title ?? app.id
}

/**
 * Icon grid body (classic large icons).
 * @param {{ childAppIds?: string[] }} props
 */
function IconsFolderView({ childAppIds = [] }) {
  const { openItem } = useFolderNavigation()
  const { setSelected } = useFolderSelection()
  const [selectedId, setSelectedId] = useState(null)
  const items = childAppIds.map((id) => getAppById(id)).filter(Boolean)
  const empty = items.length === 0

  useEffect(() => {
    if (!selectedId) {
      setSelected(null)
      return
    }
    const app = getAppById(selectedId)
    if (!app) {
      setSelected(null)
      return
    }
    setSelected({
      kind: isFolderApp(app) ? 'folder' : 'file',
      name: folderItemLabel(app),
      typeLabel: isFolderApp(app) ? 'File Folder' : 'Application',
    })
  }, [selectedId, setSelected])

  return (
    <div
      className="flex min-h-[240px] flex-1 flex-col bg-white p-3"
      role="list"
      aria-label={empty ? 'Empty folder' : `Folder, ${items.length} items`}
      onClick={() => setSelectedId(null)}
    >
      {empty ? (
        <p className="m-0 self-start font-xp text-[11px] text-[#666]">This folder is empty.</p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap content-start gap-1 p-0">
          {items.map((app) => {
            const label = folderItemLabel(app)
            const selected = selectedId === app.id
            const folder = isFolderApp(app)
            return (
              <li key={app.id} role="listitem" className="m-0 p-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedId(app.id)
                    if (window.matchMedia('(max-width: 767px)').matches) openItem(app)
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    openItem(app)
                  }}
                  className={[
                    'group flex w-[74px] flex-col items-center gap-1 rounded-sm border px-1 py-1.5 text-center focus-visible:outline-none',
                    selected
                      ? 'border-[#316ac5] bg-[#316ac5] text-white'
                      : 'border-transparent hover:border-[#316ac5]/40 hover:bg-[#316ac5]/10',
                  ].join(' ')}
                  title={folder ? `${label} (folder)` : label}
                >
                  <XpIconImage
                    src={app.icon}
                    className="h-8 w-8 object-contain drop-shadow-[1px_1px_0_rgba(0,0,0,0.25)]"
                  />
                  <span
                    className={[
                      'line-clamp-2 w-full break-words font-xp text-[11px] leading-tight',
                      selected ? 'text-white' : 'text-black group-hover:text-[#000080]',
                    ].join(' ')}
                  >
                    {label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/**
 * Folder window body: large-icon list, or XP Filmstrip for picture galleries.
 * @param {{
 *   childAppIds?: string[],
 *   folderView?: 'icons' | 'filmstrip',
 *   galleryDir?: string | null,
 * }} props
 */
export default function FolderApp({
  childAppIds = [],
  folderView = 'icons',
  galleryDir = null,
}) {
  if (folderView === 'filmstrip' && galleryDir) {
    return <FilmstripFolderView galleryDir={galleryDir} childAppIds={childAppIds} />
  }
  return <IconsFolderView childAppIds={childAppIds} />
}
