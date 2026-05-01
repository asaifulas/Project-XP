import { Outlet } from 'react-router-dom'
import AppLayout from './AppLayout'
import BackgroundWindows from '../window/BackgroundWindows'

/**
 * Keeps the desktop chrome mounted while routes change, and paints stacked
 * background windows from `otherurl` before the active `<Outlet />` window.
 */
export default function DesktopShell() {
  return (
    <AppLayout>
      <BackgroundWindows />
      <Outlet />
    </AppLayout>
  )
}
