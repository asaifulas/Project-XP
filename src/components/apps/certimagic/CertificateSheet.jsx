import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useCertiMagicStore } from '../../../stores/useCertiMagicStore'
import FieldStylePanel from './FieldStylePanel.jsx'
import {
  NUDGE_STEP,
  NUDGE_STEP_FAST,
  scaleForWidth,
  textStyleFromField,
} from './fieldStyle.js'
import { createSampleCertificateDataUrl } from './pdf.js'

export const CERTI_COLUMN = 'CERTI_COLUMN'
export const CERTI_PLACED_FIELD = 'CERTI_PLACED_FIELD'

function ColumnChip({ column }) {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: CERTI_COLUMN,
      item: { column },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [column],
  )

  return (
    <button
      ref={dragRef}
      type="button"
      className="w-full truncate rounded-sm border border-black/30 bg-[linear-gradient(180deg,#fff8d0_0%,#f0d56a_100%)] px-2 py-1 text-left text-[11px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
      style={{ opacity: isDragging ? 0.45 : 1 }}
    >
      {column}
    </button>
  )
}

function PlacedField({ field, previewValue, selected, scale }) {
  const selectField = useCertiMagicStore((s) => s.selectField)
  const removeField = useCertiMagicStore((s) => s.removeField)
  const style = textStyleFromField(field)
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: CERTI_PLACED_FIELD,
      item: { id: field.id, column: field.column },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [field.id, field.column],
  )

  const translateX = style.textAlign === 'center' ? -50 : style.textAlign === 'right' ? -100 : 0
  const fontSize = Math.max(8, style.fontSize * scale)

  return (
    <div
      ref={dragRef}
      data-certi-field="true"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        selectField(field.id)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          removeField(field.id)
        }
      }}
      className={[
        'absolute cursor-grab whitespace-pre px-[5px] py-[5px]',
        selected ? 'bg-blue-400/50 shadow-md ring-1 ring-[#0b5bd3]' : '',
      ].join(' ')}
      style={{
        left: `${field.x * 100}%`,
        top: `${field.y * 100}%`,
        fontWeight: style.bold ? 'bold' : 'normal',
        fontStyle: style.italic ? 'italic' : 'normal',
        fontSize,
        letterSpacing: `${style.letterSpacing * scale}px`,
        color: style.color,
        textAlign: style.textAlign,
        transform: `translateX(${translateX}%) rotate(${style.rotate}deg)`,
        transformOrigin: 'top left',
        opacity: isDragging ? 0.5 : 1,
        zIndex: selected ? 20 : 10,
        fontFamily: `"${style.fontFamily}", Arial, sans-serif`,
      }}
    >
      {previewValue || `{${field.column}}`}
    </div>
  )
}

function percentFromOffset(offset, rect) {
  if (!offset || !rect.width || !rect.height) return null
  return {
    x: Math.min(1, Math.max(0, (offset.x - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (offset.y - rect.top) / rect.height)),
  }
}

function isTypingTarget(el) {
  if (!el) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true
  if (el.getAttribute?.('role') === 'slider') return true
  return Boolean(el.closest?.('[data-radix-slider]'))
}

export default function CertificateSheet() {
  const columns = useCertiMagicStore((s) => s.columns)
  const rows = useCertiMagicStore((s) => s.rows)
  const fields = useCertiMagicStore((s) => s.fields)
  const selectedFieldId = useCertiMagicStore((s) => s.selectedFieldId)
  const templateDataUrl = useCertiMagicStore((s) => s.templateDataUrl)
  const templateName = useCertiMagicStore((s) => s.templateName)
  const setTemplate = useCertiMagicStore((s) => s.setTemplate)
  const addField = useCertiMagicStore((s) => s.addField)
  const moveField = useCertiMagicStore((s) => s.moveField)
  const nudgeField = useCertiMagicStore((s) => s.nudgeField)
  const selectField = useCertiMagicStore((s) => s.selectField)
  const removeField = useCertiMagicStore((s) => s.removeField)
  const updateFieldStyle = useCertiMagicStore((s) => s.updateFieldStyle)
  const fileRef = useRef(null)
  const stageRef = useRef(null)
  const [stageWidth, setStageWidth] = useState(800)
  const previewRow = rows[0] ?? {}
  const selected = fields.find((field) => field.id === selectedFieldId) ?? null
  const scale = scaleForWidth(stageWidth)

  useLayoutEffect(() => {
    const node = stageRef.current
    if (!node) return undefined
    function measure() {
      setStageWidth(node.getBoundingClientRect().width)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [templateDataUrl])

  useEffect(() => {
    function onKeyDown(e) {
      if (!selectedFieldId) return
      if (isTypingTarget(document.activeElement)) return
      const step = e.shiftKey ? NUDGE_STEP_FAST : NUDGE_STEP
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        nudgeField(selectedFieldId, 0, -step)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        nudgeField(selectedFieldId, 0, step)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        nudgeField(selectedFieldId, -step, 0)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nudgeField(selectedFieldId, step, 0)
      } else if (e.key === 'Delete') {
        e.preventDefault()
        removeField(selectedFieldId)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [nudgeField, removeField, selectedFieldId])

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: [CERTI_COLUMN, CERTI_PLACED_FIELD],
      drop: (item, monitor) => {
        const stage = stageRef.current
        if (!stage) return
        const pos = percentFromOffset(monitor.getClientOffset(), stage.getBoundingClientRect())
        if (!pos) return
        if (item.id) {
          moveField(item.id, pos.x, pos.y)
          selectField(item.id)
          return
        }
        if (item.column) addField({ column: item.column, x: pos.x, y: pos.y })
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [addField, moveField, selectField],
  )

  function onUpload(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setTemplate(reader.result, file.name)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 bg-[#808080]">
      <aside className="flex w-[200px] shrink-0 flex-col gap-2 overflow-hidden border-r border-black/30 bg-[#ece9d8] p-2">
        <div className="text-[11px] font-bold">Merge fields</div>
        <div className="min-h-0 flex-1 overflow-auto">
          {columns.length === 0 ? (
            <p className="text-[10px] text-black/70">Import a CSV on Recipients first.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {columns.map((column) => (
                <ColumnChip key={column} column={column} />
              ))}
            </div>
          )}
        </div>
        <FieldStylePanel
          field={selected}
          onStyle={(patch) => selected && updateFieldStyle(selected.id, patch)}
          onRemove={() => selected && removeField(selected.id)}
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-black/20 bg-[#ece9d8] px-2 py-1 text-[11px]">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-sm border border-black/30 bg-[linear-gradient(180deg,#f8f8f8_0%,#dfdfdf_100%)] px-2 py-0.5"
          >
            Upload certificate
          </button>
          <button
            type="button"
            onClick={() => setTemplate(createSampleCertificateDataUrl(), 'sample-certificate.png')}
            className="rounded-sm border border-black/30 bg-[linear-gradient(180deg,#f8f8f8_0%,#dfdfdf_100%)] px-2 py-0.5"
          >
            Use sample
          </button>
          <span className="truncate text-black/70">{templateName || 'No template yet'}</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              onUpload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3">
          {templateDataUrl ? (
            <div
              ref={(node) => {
                stageRef.current = node
                dropRef(node)
              }}
              className={[
                'relative max-h-full max-w-full shadow-[2px_2px_8px_rgba(0,0,0,0.45)]',
                isOver ? 'ring-2 ring-[#0b5bd3]' : '',
              ].join(' ')}
              onClick={() => selectField(null)}
            >
              <img
                src={templateDataUrl}
                alt="Certificate template"
                className="block max-h-[70vh] max-w-full select-none"
                draggable={false}
              />
              {fields.map((field) => (
                <PlacedField
                  key={field.id}
                  field={field}
                  selected={field.id === selectedFieldId}
                  previewValue={previewRow[field.column]}
                  scale={scale}
                />
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-[320px] w-[min(640px,100%)] flex-col items-center justify-center border-2 border-dashed border-white/70 bg-black/20 text-[13px] text-white"
            >
              Upload a blank certificate image
              <span className="mt-1 text-[11px] text-white/80">PNG or JPG — or use the sample</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
