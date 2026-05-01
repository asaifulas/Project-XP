import { create } from 'zustand'

const initialPrograms = []

const wallpaperModules = import.meta.glob('../assets/wallpaper/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
})

const wallpapers = Object.entries(wallpaperModules)
  .map(([path, src]) => {
    const filename = path.split('/').pop() ?? 'wallpaper'
    const id = filename
    const name = filename
      .replace(/\.[^.]+$/, '')
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    return {
      id,
      name: name || filename,
      src,
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const defaultWallpaper =
  wallpapers.find((wallpaper) => wallpaper.id.toLowerCase().startsWith('default.')) ??
  wallpapers[0] ??
  null

export const useShellStore = create((set) => ({
  startMenuOpen: false,
  runningPrograms: initialPrograms,
  /** @type {Record<string, { x: number; y: number }>} Last translate position per window (programId). */
  windowFramePositions: {},
  wallpapers,
  currentWallpaper: defaultWallpaper,

  toggleStartMenu: () => set((s) => ({ startMenuOpen: !s.startMenuOpen })),
  closeStartMenu: () => set({ startMenuOpen: false }),
  setWallpaper: (wallpaperId) =>
    set((state) => ({
      currentWallpaper:
        state.wallpapers.find((wallpaper) => wallpaper.id === wallpaperId) ??
        state.currentWallpaper,
    })),

  setActiveProgram: (id) =>
    set((s) => ({
      runningPrograms: s.runningPrograms.map((p) => ({
        ...p,
        active: p.id === id,
        minimized: p.id === id ? false : p.minimized ?? false,
      })),
    })),
  upsertProgram: (program) =>
    set((state) => {
      const exists = state.runningPrograms.some((p) => p.id === program.id)
      if (!exists) {
        return {
          runningPrograms: [
            ...state.runningPrograms.map((p) => ({ ...p, active: false })),
            {
              id: program.id,
              title: program.title,
              active: true,
              minimized: false,
              ...program,
            },
          ],
        }
      }

      return {
        runningPrograms: state.runningPrograms.map((p) =>
          p.id === program.id
            ? {
                ...p,
                ...program,
              }
            : p,
        ),
      }
    }),
  launchProgram: (program) =>
    set((state) => {
      const exists = state.runningPrograms.some((p) => p.id === program.id)
      if (!exists) {
        return {
          runningPrograms: [
            ...state.runningPrograms.map((p) => ({ ...p, active: false })),
            {
              id: program.id,
              title: program.title,
              active: true,
              minimized: false,
              ...program,
            },
          ],
        }
      }

      return {
        runningPrograms: state.runningPrograms.map((p) =>
          p.id === program.id
            ? {
                ...p,
                ...program,
                active: true,
                minimized: false,
              }
            : { ...p, active: false },
        ),
      }
    }),
  removeProgram: (id) =>
    set((state) => ({
      runningPrograms: state.runningPrograms.filter((p) => p.id !== id),
    })),
  toggleProgramMinimize: (id) =>
    set((state) => ({
      runningPrograms: state.runningPrograms.map((p) => {
        if (p.id !== id) return p
        const nextMinimized = !(p.minimized ?? false)
        return {
          ...p,
          minimized: nextMinimized,
          active: !nextMinimized,
        }
      }),
    })),

  setWindowFramePosition: (id, pos) =>
    set((s) => ({
      windowFramePositions: { ...s.windowFramePositions, [id]: { x: pos.x, y: pos.y } },
    })),

  removeWindowFramePosition: (id) =>
    set((s) => {
      if (!(id in s.windowFramePositions)) return s
      const next = { ...s.windowFramePositions }
      delete next[id]
      return { windowFramePositions: next }
    }),
}))
