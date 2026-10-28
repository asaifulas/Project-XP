import { createContext, useContext, useMemo, useState } from 'react'

const FolderSelectionContext = createContext(null)

/**
 * Selection shared between filmstrip / icon views and the Explorer Details pane.
 * @param {{ children: import('react').ReactNode }} props
 */
export function FolderSelectionProvider({ children }) {
  const [selected, setSelected] = useState(
    /** @type {null | {
     *   kind: 'image' | 'folder' | 'file',
     *   name: string,
     *   src?: string,
     *   width?: number,
     *   height?: number,
     *   typeLabel?: string,
     * }} */ (null),
  )

  const value = useMemo(() => ({ selected, setSelected }), [selected])
  return (
    <FolderSelectionContext.Provider value={value}>{children}</FolderSelectionContext.Provider>
  )
}

export function useFolderSelection() {
  const ctx = useContext(FolderSelectionContext)
  if (!ctx) {
    return {
      selected: null,
      setSelected: () => {},
    }
  }
  return ctx
}
