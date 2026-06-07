import WindowControlButton from './WindowControlButton'

export default function WindowControls({
  isMaximized,
  onMinimize,
  onToggleMaximize,
  onClose,
  maximizeDisabled = false,
  minimizeDisabled = false,
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {!minimizeDisabled ? (
        <WindowControlButton label="Minimize" symbol="─" onClick={onMinimize} />
      ) : null}
      {!maximizeDisabled ? (
        <WindowControlButton
          label={isMaximized ? 'Restore' : 'Maximize'}
          symbol={isMaximized ? '❐' : '□'}
          onClick={onToggleMaximize}
          disabled={Boolean(maximizeDisabled && !isMaximized)}
        />
      ) : null}
      <WindowControlButton
        label="Close"
        symbol="×"
        onClick={onClose}
        variant="close"
      />
    </div>
  )
}

