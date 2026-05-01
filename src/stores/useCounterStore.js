import { create } from 'zustand'

export const useCounterStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}))

