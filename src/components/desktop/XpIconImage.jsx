import calculatorIcon from '../../assets/icons/calculator.svg'
import certiMagicIcon from '../../assets/icons/certimagic.png'
import githubIcon from '../../assets/icons/github.svg'
import gmailIcon from '../../assets/icons/gmail.svg'
import linkedinIcon from '../../assets/icons/linkedin.svg'
import whatsappIcon from '../../assets/icons/whatsapp.svg'

/** 2024 tiles that sit on the desktop next to XP icons. */
const PLATED_ICONS = new Set([
  githubIcon,
  whatsappIcon,
  linkedinIcon,
  gmailIcon,
  certiMagicIcon,
  calculatorIcon,
])

/**
 * XP desktop glyph. Modern marks render inside a shared 32px beveled plate.
 *
 * @param {{ src?: string, className?: string }} props
 */
export default function XpIconImage({ src, className = '' }) {
  if (!src) return null
  if (!PLATED_ICONS.has(src)) {
    return <img src={src} alt="" className={className} draggable={false} />
  }
  return (
    <span className="xp-icon-plate">
      <img src={src} alt="" draggable={false} />
    </span>
  )
}
