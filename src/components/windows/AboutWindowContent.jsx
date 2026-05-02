import { useLocation, useNavigate } from 'react-router-dom'
import WordA4Page from '../window/WordA4Page'
import { closeWindowAtPath, stackKeyFromLocation } from '../../utils/windowStackUrl'

export default function AboutWindowContent() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <WordA4Page>
      <h1 className="text-xl font-bold tracking-tight">About</h1>
      <p className="mt-2 text-sm text-zinc-700">
        This page uses the same XP frame component, including File/Edit/View menu and
        minimize/maximize/close controls.
      </p>
      <button
        type="button"
        onClick={() => closeWindowAtPath(navigate, location, stackKeyFromLocation(location))}
        className="mt-5 rounded border border-zinc-400 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 hover:bg-zinc-100"
      >
        Back home
      </button>
    </WordA4Page>
  )
}

