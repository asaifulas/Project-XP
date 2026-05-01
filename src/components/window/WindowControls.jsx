import WindowControlButton from './WindowControlButton'

export default function WindowControls({
  isMaximized,
  onMinimize,
  onToggleMaximize,
  onClose,
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <WindowControlButton label="Minimize" symbol="─" onClick={onMinimize} />
      <WindowControlButton
        label={isMaximized ? 'Restore' : 'Maximize'}
        symbol={isMaximized ? '❐' : '□'}
        onClick={onToggleMaximize}
      />
      <WindowControlButton
        label="Close"
        symbol="×"
        onClick={onClose}
        variant="close"
      />
    </div>
  )
}

