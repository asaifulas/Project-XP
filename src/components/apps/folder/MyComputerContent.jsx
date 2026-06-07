import myComputerIcon from '../../../assets/icons/my_computer.png'

function SectionHeader({ title }) {
  return (
    <h3 className="mb-1 mt-3 border-b border-[#316ac5] bg-[linear-gradient(180deg,#8ec5ff_0%,#3a7bd5_55%,#2457c5_100%)] px-2 py-[3px] text-[11px] font-bold leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] first:mt-0">
      {title}
    </h3>
  )
}

function SharedDocsIcon() {
  return (
    <span
      className="relative inline-flex h-8 w-9 shrink-0 items-end justify-center"
      aria-hidden
    >
      <span
        className="absolute bottom-0 h-7 w-8 rounded-sm border border-[#a08010]"
        style={{
          background:
            'linear-gradient(180deg,#fffef0 0%,#ffe98a 35%,#e8c020 70%,#c9a010 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
        }}
      />
      <span
        className="absolute bottom-[18px] left-0.5 h-2 w-4 rounded-t-sm border border-b-0 border-[#a08010]"
        style={{
          background: 'linear-gradient(180deg,#fffef8 0%,#ffe98a 100%)',
        }}
      />
      <span className="absolute bottom-1 left-1.5 text-[7px] font-bold text-[#5a4010]">👥</span>
    </span>
  )
}

function LocalDiskIcon() {
  return (
    <span
      className="relative inline-block h-8 w-9 shrink-0"
      aria-hidden
      style={{
        background:
          'linear-gradient(180deg,#e8e8e8 0%,#b8b8b8 40%,#909090 75%,#707070 100%)',
        borderRadius: '2px',
        border: '1px solid #606060',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <span className="absolute left-1 top-1 h-1.5 w-6 rounded-sm bg-[#505050]" />
      <span className="absolute bottom-1 left-1 h-2 w-2 rounded-full bg-[#40a040] shadow-[inset_0_0_0_1px_#208020]" />
    </span>
  )
}

function CdDriveIcon() {
  return (
    <span className="relative inline-flex h-8 w-9 shrink-0 items-center justify-center" aria-hidden>
      <span
        className="h-6 w-8 rounded-sm border border-[#888]"
        style={{
          background: 'linear-gradient(180deg,#f0f0f0 0%,#c8c8c8 100%)',
          boxShadow: 'inset 0 1px 0 #fff',
        }}
      />
      <span
        className="absolute h-5 w-5 rounded-full border border-[#c0c0c0]"
        style={{
          background:
            'radial-gradient(circle at 35% 35%,#fff 0%,#e8e8e8 30%,#c0c0c0 60%,#909090 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
        }}
      />
    </span>
  )
}

function ObjectTile({ icon, title, subtitle }) {
  return (
    <button
      type="button"
      className="group flex w-full max-w-md items-center gap-3 rounded px-2 py-1.5 text-left hover:bg-[#316ac5]"
    >
      {icon}
      <span className="min-w-0">
        <span className="block text-[11px] leading-tight text-black group-hover:text-white">
          {title}
        </span>
        {subtitle ? (
          <span className="block text-[10px] leading-tight text-[#666] group-hover:text-white/85">
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  )
}

/**
 * Windows XP My Computer main pane — drives and shared folders (tile view).
 */
export default function MyComputerContent() {
  return (
    <div className="min-h-full p-2 pb-4">
      <SectionHeader title="Files Stored on This Computer" />
      <ObjectTile
        icon={<SharedDocsIcon />}
        title="Shared Documents"
        subtitle="File Folder"
      />

      <SectionHeader title="Hard Disk Drives" />
      <ObjectTile icon={<LocalDiskIcon />} title="Local Disk (C:)" subtitle="Local Disk" />

      <SectionHeader title="Devices with Removable Storage" />
      <ObjectTile icon={<CdDriveIcon />} title="CD Drive (D:)" subtitle="CD Drive" />
    </div>
  )
}

/** Sidebar details block for My Computer task pane. */
export function MyComputerDetailsPane() {
  return (
    <div className="flex items-start gap-2 px-0.5">
      <img src={myComputerIcon} alt="" className="h-8 w-8 shrink-0 object-contain" draggable="false" />
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-bold leading-tight text-[#1a1a1a]">My Computer</p>
        <p className="text-[10px] leading-snug text-[#4a5568]">System Folder</p>
      </div>
    </div>
  )
}
