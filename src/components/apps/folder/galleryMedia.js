/**
 * Gallery media under `src/assets/gallery/<subdir>/`.
 * Folders are auto-discovered from asset paths; images load lazily.
 *
 * Empty folders: add a `.gitkeep` so Vite’s glob can see the directory.
 */

/** Lazy image modules — keys exist at build time; values load on demand. */
const galleryImageModules = import.meta.glob(
  '../../../assets/gallery/**/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}',
  { import: 'default' },
)

/** Markers so empty subfolders still appear in Explorer. */
const galleryKeepModules = import.meta.glob('../../../assets/gallery/*/.gitkeep', {
  eager: true,
  query: '?raw',
  import: 'default',
})

/**
 * @param {string} filePath
 * @returns {string | null}
 */
function galleryDirFromPath(filePath) {
  const match = String(filePath).match(/\/gallery\/([^/]+)\//)
  return match?.[1] ?? null
}

/**
 * Title-case a directory slug: `my_pics` → `My Pics`.
 * @param {string} dir
 */
export function galleryDirLabel(dir) {
  return String(dir)
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * First-level folder names under `assets/gallery/` (sorted).
 * @returns {string[]}
 */
export function listGalleryDirs() {
  const dirs = new Set()
  for (const path of Object.keys(galleryImageModules)) {
    const dir = galleryDirFromPath(path)
    if (dir) dirs.add(dir)
  }
  for (const path of Object.keys(galleryKeepModules)) {
    const dir = galleryDirFromPath(path)
    if (dir) dirs.add(dir)
  }
  return [...dirs].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

/**
 * Sanitize a gallery subdir name.
 * @param {string} galleryDir
 */
function normalizeGalleryDir(galleryDir) {
  return String(galleryDir || '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.\./g, '')
}

/**
 * Lazy media entries for a gallery subfolder.
 * @param {string} galleryDir folder name under assets/gallery (e.g. `screenshot`)
 * @returns {{ id: string, name: string, load: () => Promise<string> }[]}
 */
export function listGalleryMedia(galleryDir) {
  const dir = normalizeGalleryDir(galleryDir)
  if (!dir) return []

  const needle = `/gallery/${dir}/`
  /** @type {{ id: string, name: string, load: () => Promise<string> }[]} */
  const items = []

  for (const [path, loader] of Object.entries(galleryImageModules)) {
    if (!path.includes(needle)) continue
    if (typeof loader !== 'function') continue
    const name = path.split('/').pop() ?? path
    items.push({
      id: `${dir}/${name}`,
      name,
      load: () =>
        Promise.resolve(loader()).then((src) => {
          if (typeof src !== 'string') throw new Error(`Bad gallery asset: ${path}`)
          return src
        }),
    })
  }

  return items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

/**
 * Registry id for a discovered gallery subfolder.
 * @param {string} dir
 */
export function galleryAppIdForDir(dir) {
  return `gallery_${normalizeGalleryDir(dir)}`
}
