import myComputerIcon from '../../assets/icons/my_computer.png'
import { XpDialogActions, XpTab } from '../window/XpDialogChrome'

const TABS_ROW_1 = ['Advanced', 'Automatic Updates', 'Remote']
const TABS_ROW_2 = ['General', 'Computer Name', 'Hardware']

function XpSystemMonitorIcon() {
  return (
    <div className="relative h-[72px] w-[88px] shrink-0" aria-hidden>
      <div className="absolute bottom-0 left-1/2 h-[14px] w-[52px] -translate-x-1/2 rounded-sm border border-[#6b6b6b] bg-[linear-gradient(180deg,#c8c8c8_0%,#9a9a9a_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" />
      <div className="absolute bottom-[12px] left-1/2 h-[52px] w-[72px] -translate-x-1/2 rounded-[3px] border-2 border-[#4a4a4a] bg-[#1a1a1a] shadow-[inset_0_0_0_1px_#000,inset_0_2px_4px_rgba(255,255,255,0.08)]">
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#6eb5ff_0%,#2b78da_55%,#1a4e9c_100%)]">
          <img src={myComputerIcon} alt="" className="h-9 w-9 object-contain opacity-95" draggable="false" />
        </div>
      </div>
    </div>
  )
}

function InfoSection({ title, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-[#003399]">{title}</p>
      <div className="mt-1 space-y-0.5 text-[11px] leading-[1.35] text-black">{children}</div>
    </div>
  )
}

/**
 * Windows XP System Properties — General tab, showing portfolio tech stack.
 */
export default function SystemPropertiesContent({ onClose }) {
  return (
    <div className="flex min-w-0 flex-col bg-[#ece9d8] text-[11px] text-black">
      <div className="bg-[#ece9d8] px-2 pt-1">
        <div className="flex w-full gap-px">
          {TABS_ROW_1.map((tab) => (
            <XpTab key={tab} label={tab} />
          ))}
        </div>
        <div className="flex w-full gap-px border-b border-[#919b9c]">
          {TABS_ROW_2.map((tab) => (
            <XpTab key={tab} label={tab} active={tab === 'General'} />
          ))}
        </div>
      </div>

      <div className="border border-t-0 border-[#919b9c] bg-[#ece9d8] px-4 py-3">
        <div className="flex gap-4">
          <XpSystemMonitorIcon />
          <div className="min-w-0 flex-1 space-y-3">
            <InfoSection title="System:">
              <p>Microsoft Portfolio Shell</p>
              <p>Professional Edition</p>
              <p>Version 2026</p>
              <p>Build: React 19 + Vite 5</p>
            </InfoSection>
            <InfoSection title="Registered to:">
              <p>Saiful</p>
              <p>Personal Portfolio</p>
            </InfoSection>
            <InfoSection title="Computer:">
              <p>React 19.2</p>
              <p>Vite 5.0</p>
              <p>Tailwind CSS 3.4</p>
              <p>GSAP 3.15</p>
              <p>React DnD 16</p>
              <p>React Router DOM 6.30</p>
              <p>Zustand 5.0</p>
              <p>react-pdf / PDF.js 5</p>
            </InfoSection>
          </div>
        </div>
      </div>

      <XpDialogActions onClose={onClose} />
    </div>
  )
}
