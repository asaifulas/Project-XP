import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import DesktopIcon from './DesktopIcon'
import { useDesktopIconStore } from '../../stores/useDesktopIconStore'
import {
  computeDefaultDesktopIconPositions,
  snapDesktopIconPosition,
} from '../../utils/desktopIconLayout'
import {
  XP_DESKTOP_ICON_CELL_HEIGHT_PX,
  XP_DESKTOP_ICON_CELL_WIDTH_PX,
} from '../../constants/xpDesktop'

/**
 * @param {Array<{ id: string, desktop: { label: string }, icon: string, path?: string, externalUrl?: string }>} apps
 * @param {(app: { id: string, path?: string, externalUrl?: string }) => void} onOpenApp
 */
export default function DesktopIconsArea({ apps, onOpenApp, onIconContextMenu }) {
  const containerRef = useRef(null)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  const positions = useDesktopIconStore((s) => s.positions)
  const setIconPosition = useDesktopIconStore((s) => s.setIconPosition)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      setBounds({ width: el.clientWidth, height: el.clientHeight })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const defaultPositions = useMemo(
    () => computeDefaultDesktopIconPositions(apps.length, bounds),
    [apps.length, bounds.width, bounds.height],
  )

  const areaPaddingX = 8
  const areaPaddingY = 8

  const minWidth =
    apps.length > 0 && defaultPositions.length > 0
      ? Math.max(
          ...defaultPositions.map((p) => p.x + XP_DESKTOP_ICON_CELL_WIDTH_PX),
        ) + areaPaddingX * 2
      : 0

  const minHeight =
    apps.length > 0 && defaultPositions.length > 0
      ? Math.max(
          ...defaultPositions.map((p) => p.y + XP_DESKTOP_ICON_CELL_HEIGHT_PX),
        ) + areaPaddingY * 2
      : 0

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto relative box-border h-full min-h-0 w-full min-w-0 overflow-auto no-scrollbar p-2"
      style={{
        minWidth: minWidth > 0 ? minWidth : undefined,
        minHeight: minHeight > 0 ? minHeight : undefined,
      }}
    >
      {apps.map((app, index) => {
        const fallback = defaultPositions[index] ?? { x: 0, y: 0 }
        const pos = positions[app.id] ?? fallback

        return (
          <DesktopIcon
            key={app.id}
            label={app.desktop.label}
            iconSrc={app.icon}
            position={pos}
            bounds={bounds}
            onPositionChange={(next) => setIconPosition(app.id, next)}
            onOpen={() => onOpenApp(app)}
            onContextMenu={
              onIconContextMenu ? (event) => onIconContextMenu(app, event) : undefined
            }
          />
        )
      })}
    </div>
  )
}
