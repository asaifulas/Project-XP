import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'

import DesktopShell from './components/layouts/DesktopShell'
import { ROUTES } from './registry/apps'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<DesktopShell />}>
      {ROUTES.map((r) => (
        <Route key={r.id} path={r.path} element={<r.element />} />
      ))}
    </Route>,
  ),
)
