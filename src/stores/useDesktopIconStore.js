import { create } from 'zustand'

/** @typedef {{ x: number, y: number }} DesktopIconPosition */

export const useDesktopIconStore = create((set) => ({
  /** Custom positions by app id; empty = use computed grid default. */
  positions: /** @type {Record<string, DesktopIconPosition>} */ ({}),

  setIconPosition: (id, position) =>
    set((state) => ({
      positions: { ...state.positions, [id]: position },
    })),

  resetIconPositions: () => set({ positions: {} }),
}))
