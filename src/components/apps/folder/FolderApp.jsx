/**
 * Folder window body: large-icon list area for shortcuts to nested apps.
 * @param {{ childAppIds?: string[] }} props
 *   `childAppIds` — registry `APPS[].id` values listed in the parent folder entry's `children` (see `apps.js`); UI wiring comes later.
 */
export default function FolderApp({ childAppIds = [] }) {
  const empty = childAppIds.length === 0

  return (
    <div
      className="flex min-h-[240px] flex-1 flex-col p-3"
      role="list"
      aria-label={empty ? 'Empty folder' : `Folder, ${childAppIds.length} items`}
    >
      {/* Empty until `childAppIds` are rendered as launchable shortcuts */}
    </div>
  )
}
