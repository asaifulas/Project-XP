import { createContext, useContext } from 'react'

/**
 * When a window uses `chrome="none"`, children can attach the shell drag ref
 * and wire custom minimize/close controls (e.g. Winamp skin title bar).
 *
 * @type {import('react').Context<{
 *   attachDragRef: import('react').RefCallback<Element> | null
 *   onMinimize: () => void
 *   onClose: () => void
 * } | null>}
 */
export const FramelessWindowContext = createContext(null)

export function useFramelessWindow() {
  return useContext(FramelessWindowContext)
}
