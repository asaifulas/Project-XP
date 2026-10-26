import { useEffect, useState } from 'react'

const PHONE_LAYOUT_QUERY = '(max-width: 767px)'

/**
 * Same breakpoint as WindowFrame phone fill.
 * @returns {boolean}
 */
export default function usePhoneGameLayout() {
  const [isPhone, setIsPhone] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(PHONE_LAYOUT_QUERY).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(PHONE_LAYOUT_QUERY)
    const onChange = () => setIsPhone(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isPhone
}
