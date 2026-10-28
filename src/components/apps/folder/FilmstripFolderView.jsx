import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAppById, isFolderApp } from '../../../registry/apps'
import XpIconImage from '../../desktop/XpIconImage'
import { useFolderNavigation } from './FolderNavigationContext'
import { useFolderSelection } from './FolderSelectionContext'
import { listGalleryMedia } from './galleryMedia'

/** XP filmstrip control — small blue orb under the preview. */
function FilmstripOrb({ label, onClick, disabled = false, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]',
        disabled
          ? 'cursor-default border-[#8aa8c8] bg-[#b8cce0] opacity-70'
          : 'border-[#1a4a8a] bg-[radial-gradient(circle_at_35%_30%,#7eb8f0_0%,#3d7ec4_40%,#215dc6_75%,#0b3a8a_100%)] hover:brightness-110',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/**
 * Windows XP “Filmstrip” folder view — large preview + thumbnail strip.
 * Images under `assets/gallery/<dir>/` load lazily.
 * @param {{ galleryDir: string, childAppIds?: string[] }} props
 */
export default function FilmstripFolderView({ galleryDir, childAppIds = [] }) {
  const { openItem } = useFolderNavigation()
  const { setSelected } = useFolderSelection()
  const media = useMemo(() => listGalleryMedia(galleryDir), [galleryDir])
  const folders = useMemo(
    () => childAppIds.map((id) => getAppById(id)).filter((app) => app && isFolderApp(app)),
    [childAppIds],
  )

  const [index, setIndex] = useState(0)
  const [rotation, setRotation] = useState(0)
  /** @type {Record<string, string>} */
  const [srcById, setSrcById] = useState({})
  const srcByIdRef = useRef(srcById)
  srcByIdRef.current = srcById
  const rootRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const thumbRefs = useRef(/** @type {Record<number, HTMLButtonElement | null>} */ ({}))
  const loadingRef = useRef(/** @type {Set<string>} */ (new Set()))

  const current = media[index] ?? null
  const currentSrc = current ? srcById[current.id] : null

  const ensureLoaded = useCallback((item) => {
    if (!item) return
    if (srcByIdRef.current[item.id] || loadingRef.current.has(item.id)) return
    loadingRef.current.add(item.id)
    item
      .load()
      .then((src) => {
        setSrcById((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: src }))
      })
      .catch(() => {
        loadingRef.current.delete(item.id)
      })
  }, [])

  useEffect(() => {
    setIndex(0)
    setRotation(0)
    setSrcById({})
    loadingRef.current = new Set()
  }, [galleryDir])

  // Prefetch selected + neighbors + first strip thumbs.
  useEffect(() => {
    if (media.length === 0) return
    const targets = new Set()
    for (let i = 0; i < Math.min(8, media.length); i += 1) targets.add(i)
    if (index > 0) targets.add(index - 1)
    targets.add(index)
    if (index < media.length - 1) targets.add(index + 1)
    for (const i of targets) {
      const item = media[i]
      if (item) ensureLoaded(item)
    }
  }, [ensureLoaded, index, media])

  useEffect(() => {
    if (!current) {
      setSelected(null)
      return
    }
    setSelected({
      kind: 'image',
      name: current.name,
      src: currentSrc || undefined,
      typeLabel: 'Image',
    })
  }, [current, currentSrc, setSelected])

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest',
      block: 'nearest',
    })
  }, [index])

  const goPrev = useCallback(() => {
    if (media.length === 0) return
    setIndex((i) => (i - 1 + media.length) % media.length)
    setRotation(0)
  }, [media.length])

  const goNext = useCallback(() => {
    if (media.length === 0) return
    setIndex((i) => (i + 1) % media.length)
    setRotation(0)
  }, [media.length])

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [galleryDir])

  useEffect(() => {
    function onKey(event) {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        goPrev()
        return
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="application"
      aria-label="Filmstrip view — use arrow keys to move between pictures"
      className="flex min-h-0 flex-1 flex-col bg-white font-xp text-[11px] text-black outline-none"
      onMouseDown={() => rootRef.current?.focus({ preventScroll: true })}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-3 py-2">
        {current ? (
          <>
            <div className="flex max-h-full min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
              {currentSrc ? (
                <img
                  src={currentSrc}
                  alt={current.name}
                  className="max-h-full max-w-full object-contain shadow-[1px_1px_0_#808080]"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  draggable={false}
                  onLoad={(event) => {
                    const img = event.currentTarget
                    setSelected({
                      kind: 'image',
                      name: current.name,
                      src: currentSrc,
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      typeLabel: 'Image',
                    })
                  }}
                />
              ) : (
                <p className="m-0 text-[#666]">Loading…</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <FilmstripOrb
                label="Rotate counterclockwise"
                onClick={() => setRotation((r) => r - 90)}
              >
                ↺
              </FilmstripOrb>
              <FilmstripOrb label="Rotate clockwise" onClick={() => setRotation((r) => r + 90)}>
                ↻
              </FilmstripOrb>
              <FilmstripOrb label="Previous" onClick={goPrev} disabled={media.length < 2}>
                ◀
              </FilmstripOrb>
              <FilmstripOrb label="Next" onClick={goNext} disabled={media.length < 2}>
                ▶
              </FilmstripOrb>
            </div>
            <p className="m-0 shrink-0 truncate text-[11px] text-[#215dc6]">{current.name}</p>
          </>
        ) : (
          <p className="m-0 text-[#666]">This folder is empty.</p>
        )}
      </div>

      <div
        className="flex shrink-0 items-end gap-2 overflow-x-auto border-t border-[#aca899] bg-[#ece9d8] px-2 py-2"
        role="list"
        aria-label="Filmstrip"
      >
        {folders.map((app) => (
          <button
            key={app.id}
            type="button"
            role="listitem"
            title={`${app.folderLabel ?? app.title} (folder)`}
            className="flex w-[72px] shrink-0 flex-col items-center gap-1 rounded-sm border border-transparent px-1 py-1 hover:border-[#316ac5] hover:bg-[#316ac5]/15"
            onDoubleClick={() => openItem(app)}
            onClick={() =>
              setSelected({
                kind: 'folder',
                name: app.folderLabel ?? app.title ?? app.id,
                typeLabel: 'File Folder',
              })
            }
          >
            <XpIconImage src={app.icon} className="h-10 w-10 object-contain" />
            <span className="line-clamp-2 w-full text-center text-[10px] leading-tight text-black">
              {app.folderLabel ?? app.title}
            </span>
          </button>
        ))}
        {media.map((item, i) => {
          const selected = i === index
          const src = srcById[item.id]
          return (
            <button
              key={item.id}
              ref={(node) => {
                thumbRefs.current[i] = node
              }}
              type="button"
              role="listitem"
              title={item.name}
              aria-current={selected ? 'true' : undefined}
              className={[
                'flex w-[72px] shrink-0 flex-col items-center gap-1 rounded-sm border px-1 py-1',
                selected
                  ? 'border-[#316ac5] bg-[#316ac5]/25'
                  : 'border-transparent hover:border-[#316ac5]/60 hover:bg-[#316ac5]/10',
              ].join(' ')}
              onClick={() => {
                setIndex(i)
                setRotation(0)
                ensureLoaded(item)
              }}
              onMouseEnter={() => ensureLoaded(item)}
            >
              <span className="flex h-12 w-14 items-center justify-center overflow-hidden border border-[#808080] bg-white">
                {src ? (
                  <img
                    src={src}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <span className="text-[9px] text-[#808080]">…</span>
                )}
              </span>
              <span className="line-clamp-2 w-full text-center text-[10px] leading-tight text-black">
                {item.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
