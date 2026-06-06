import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { openForegroundPreserveStack } from '../utils/windowStackUrl'

const WELCOME_SESSION_KEY = 'porto-welcome-opened'

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Auto-open Welcome.doc on the first desktop visit per session.
    // Session flag is set in WelcomePage after mount (avoids React StrictMode skipping navigate).
    if (location.pathname !== '/') return
    if (sessionStorage.getItem(WELCOME_SESSION_KEY) === '1') return
    openForegroundPreserveStack(navigate, location, '/welcome')
  }, [location, navigate])

  return <div className="h-full w-full" />
}
