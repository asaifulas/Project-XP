import PowerPointWorkspace from './retro/PowerPointWorkspace'

/**
 * PowerPoint 2003 workspace for a single-slide presentation (`shell: 'ppt'`).
 * `children` fills the 4:3 slide and is mirrored in the Slides pane thumbnail.
 */
export default function PowerPointOfficeChrome({ children }) {
  return (
    <PowerPointWorkspace slides={[{ id: 'slide-1', element: children }]} activeIndex={0}>
      {children}
    </PowerPointWorkspace>
  )
}
