import { useLocation, useNavigate } from 'react-router-dom'
import WindowFrame from '../components/window/WindowFrame'
import CalculatorApp from '../components/apps/calculator/CalculatorApp'
import {
  closeWindowAtPath,
  getOtherUrls,
  programIdForPath,
  stackKeyFromLocation,
} from '../utils/windowStackUrl'

export default function CalculatorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const others = getOtherUrls(location.search)
  const stackKey = stackKeyFromLocation(location)

  return (
    <div className="flex h-full items-start justify-center p-3 pt-10 text-left">
      <WindowFrame
        programId={programIdForPath('/calculator')}
        title="Calculator"
        isActive
        stackIndex={others.length}
        onClose={() => closeWindowAtPath(navigate, location, stackKey)}
        showMenuBar={false}
        className="w-[min(360px,calc(100%-24px))]"
      >
        <CalculatorApp keyboardActive />
      </WindowFrame>
    </div>
  )
}
