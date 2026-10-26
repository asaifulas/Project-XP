import { useCallback, useEffect, useRef, useState } from 'react'
import usePhoneGameLayout from '../_shared/usePhoneGameLayout'
import { cursorForTool } from './cursors.js'
import {
  CANVAS_H,
  CANVAS_W,
  DEFAULT_COLORS,
  MAX_CANVAS,
  MAX_UNDO,
  MIN_CANVAS,
  STROKE_PRESETS,
  TOOLS,
  ZOOM_PRESETS,
  floodFill,
  hexToRgba,
  rgbaToHex,
} from './paintTools.js'
import { saveCanvasPng } from './savePng.js'

/**
 * Classic Windows XP Paint — resizeable canvas, magnifier, tool cursors.
 *
 * @param {{ keyboardActive?: boolean }} props
 */
function preferTouchDrawing() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(max-width: 767px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  )
}

export default function PaintApp({ keyboardActive = true }) {
  const isPhone = usePhoneGameLayout()
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null))
  const overlayRef = useRef(/** @type {HTMLCanvasElement | null} */ (null))
  const fileRef = useRef(/** @type {HTMLInputElement | null} */ (null))
  const drawingRef = useRef(false)
  const startRef = useRef(/** @type {{ x: number, y: number } | null} */ (null))
  const lastRef = useRef(/** @type {{ x: number, y: number } | null} */ (null))
  const undoRef = useRef(/** @type {ImageData[]} */ ([]))
  const activePointerIdRef = useRef(/** @type {number | null} */ (null))
  const mobileDrawToolRef = useRef(/** @type {'pencil' | 'brush' | 'eraser'} */ ('brush'))
  const resizeDragRef = useRef(
    /** @type {null | { edge: string, startX: number, startY: number, origW: number, origH: number }} */ (null),
  )

  const [tool, setTool] = useState(/** @type {(typeof TOOLS)[number]} */ ('pencil'))
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [stroke, setStroke] = useState(2)
  const [zoom, setZoom] = useState(1)
  const [canvasW, setCanvasW] = useState(CANVAS_W)
  const [canvasH, setCanvasH] = useState(CANVAS_H)
  const [status, setStatus] = useState('For Help, click Help Topics on the Help Menu.')
  const [coords, setCoords] = useState('')
  const [canUndo, setCanUndo] = useState(false)
  const [fileName, setFileName] = useState('untitled')
  const [menuOpen, setMenuOpen] = useState(/** @type {null | string} */ (null))
  const [attrsOpen, setAttrsOpen] = useState(false)
  const [attrW, setAttrW] = useState(String(CANVAS_W))
  const [attrH, setAttrH] = useState(String(CANVAS_H))
  /** Touch/finger paints on contact — like a real brush on canvas (no PC click model). */
  const [mobileMode, setMobileMode] = useState(() => preferTouchDrawing())

  const getCtx = useCallback(() => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null, [])

  const pushUndo = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const next = [...undoRef.current, snap]
    if (next.length > MAX_UNDO) next.shift()
    undoRef.current = next
    setCanUndo(true)
  }, [getCtx])

  const syncOverlaySize = useCallback((w, h) => {
    const overlay = overlayRef.current
    if (!overlay) return
    overlay.width = w
    overlay.height = h
  }, [])

  /**
   * Resize document; keeps existing pixels (cropped or padded with bg).
   * @param {number} nextW
   * @param {number} nextH
   * @param {{ pushHistory?: boolean }} [opts]
   */
  const resizeCanvas = useCallback(
    (nextW, nextH, opts = {}) => {
      const w = Math.min(MAX_CANVAS, Math.max(MIN_CANVAS, Math.round(nextW)))
      const h = Math.min(MAX_CANVAS, Math.max(MIN_CANVAS, Math.round(nextH)))
      const canvas = canvasRef.current
      const ctx = getCtx()
      if (!canvas || !ctx) return
      if (w === canvas.width && h === canvas.height) return
      if (opts.pushHistory !== false) pushUndo()

      const temp = document.createElement('canvas')
      temp.width = canvas.width
      temp.height = canvas.height
      const tctx = temp.getContext('2d')
      if (tctx) tctx.drawImage(canvas, 0, 0)

      canvas.width = w
      canvas.height = h
      syncOverlaySize(w, h)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(temp, 0, 0)
      setCanvasW(w)
      setCanvasH(h)
      setAttrW(String(w))
      setAttrH(String(h))
      setStatus(`Canvas ${w}×${h}`)
    },
    [bg, getCtx, pushUndo, syncOverlaySize],
  )

  const clearCanvas = useCallback(
    (pushHistory = true) => {
      const canvas = canvasRef.current
      const ctx = getCtx()
      if (!canvas || !ctx) return
      if (pushHistory) pushUndo()
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setStatus('New image')
    },
    [bg, getCtx, pushUndo],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return
    canvas.width = CANVAS_W
    canvas.height = CANVAS_H
    overlay.width = CANVAS_W
    overlay.height = CANVAS_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }, [])

  const canvasPoint = useCallback((event) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height
    return { x, y }
  }, [])

  const clearOverlay = useCallback(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    const octx = overlay.getContext('2d')
    if (!octx) return
    octx.clearRect(0, 0, overlay.width, overlay.height)
  }, [])

  const widthForDrawTool = useCallback(
    (drawTool) => {
      if (drawTool === 'brush') return Math.max(stroke * 2, mobileMode ? 6 : 4)
      if (drawTool === 'eraser') return Math.max(stroke * 3, mobileMode ? 10 : 6)
      return Math.max(stroke, mobileMode ? 2 : 1)
    },
    [mobileMode, stroke],
  )

  const strokeLine = useCallback(
    (ctx, from, to, opts = {}) => {
      const drawTool = opts.drawTool ?? 'pencil'
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = opts.width ?? widthForDrawTool(drawTool)
      if (opts.erase || drawTool === 'eraser') {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = bg
      } else {
        ctx.strokeStyle = opts.color ?? fg
      }
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.restore()
    },
    [bg, fg, widthForDrawTool],
  )

  const enableMobileMode = useCallback(
    (on) => {
      setMobileMode(on)
      if (on) {
        setTool('brush')
        setStroke((s) => Math.max(s, 3))
        setStatus('Mobile mode — touch canvas to paint (lift finger to stop)')
      } else {
        setStatus('PC mode — click and drag to draw')
      }
    },
    [],
  )

  useEffect(() => {
    if (isPhone && !mobileMode) {
      // Keep preference if user turned it off; only auto-on once via initial state.
    }
  }, [isPhone, mobileMode])

  const drawShape = useCallback(
    (ctx, shape, from, to) => {
      ctx.save()
      ctx.lineWidth = stroke
      ctx.strokeStyle = fg
      const x = Math.min(from.x, to.x)
      const y = Math.min(from.y, to.y)
      const w = Math.abs(to.x - from.x)
      const h = Math.abs(to.y - from.y)
      if (shape === 'line') {
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      } else if (shape === 'rect') {
        ctx.strokeRect(x + 0.5, y + 0.5, w, h)
      } else if (shape === 'ellipse') {
        ctx.beginPath()
        ctx.ellipse(x + w / 2, y + h / 2, Math.max(w / 2, 0.5), Math.max(h / 2, 0.5), 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    },
    [fg, stroke],
  )

  const doUndo = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx || undoRef.current.length === 0) {
      setStatus('Nothing to undo')
      return
    }
    const snap = undoRef.current.pop()
    if (!snap) return
    if (snap.width !== canvas.width || snap.height !== canvas.height) {
      canvas.width = snap.width
      canvas.height = snap.height
      syncOverlaySize(snap.width, snap.height)
      setCanvasW(snap.width)
      setCanvasH(snap.height)
      setAttrW(String(snap.width))
      setAttrH(String(snap.height))
    }
    ctx.putImageData(snap, 0, 0)
    setCanUndo(undoRef.current.length > 0)
    setStatus('Undo')
  }, [getCtx, syncOverlaySize])

  const doSave = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const name = fileName.endsWith('.png') ? fileName : `${fileName}.png`
    try {
      setStatus('Saving…')
      const result = await saveCanvasPng(canvas, name)
      if (result.method === 'cancelled') {
        setStatus('Save cancelled')
        return
      }
      if (result.name) setFileName(result.name.replace(/\.png$/i, ''))
      setStatus(
        result.method === 'picker' ? `Saved to disk: ${result.name}` : `Downloaded: ${result.name}`,
      )
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Save failed')
    }
  }, [fileName])

  useEffect(() => {
    if (!keyboardActive) return undefined
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        doUndo()
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void doSave()
      } else if (event.key === 'Escape') {
        setMenuOpen(null)
        setAttrsOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keyboardActive, doUndo, doSave])

  const doOpen = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) {
        setStatus('Pick an image file')
        return
      }
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        const ctx = getCtx()
        if (!canvas || !ctx) return
        pushUndo()
        const w = Math.min(MAX_CANVAS, Math.max(1, img.naturalWidth || img.width))
        const h = Math.min(MAX_CANVAS, Math.max(1, img.naturalHeight || img.height))
        canvas.width = w
        canvas.height = h
        syncOverlaySize(w, h)
        setCanvasW(w)
        setCanvasH(h)
        setAttrW(String(w))
        setAttrH(String(h))
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        setFileName(file.name.replace(/\.[^.]+$/, ''))
        setStatus(`Opened ${file.name}`)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        setStatus('Could not open image')
      }
      img.src = url
    },
    [bg, getCtx, pushUndo, syncOverlaySize],
  )

  const applyZoom = useCallback((next, announce = true) => {
    const z = ZOOM_PRESETS.includes(next) ? next : 1
    setZoom(z)
    if (announce) setStatus(`Zoom ${z}x`)
  }, [])

  const onPointerDown = useCallback(
    (event) => {
      setMenuOpen(null)
      const canvas = canvasRef.current
      const ctx = getCtx()
      if (!canvas || !ctx) return

      const isTouchLike =
        event.pointerType === 'touch' || event.pointerType === 'pen' || (mobileMode && event.pointerType !== 'mouse')
      const useMobilePaint = mobileMode || isTouchLike

      // Touch/pen: always treat contact as brush-down (ignore mouse button quirks).
      if (useMobilePaint && (event.pointerType === 'touch' || event.pointerType === 'pen')) {
        event.preventDefault()
      }

      event.currentTarget.setPointerCapture?.(event.pointerId)
      activePointerIdRef.current = event.pointerId
      const pt = canvasPoint(event)
      setCoords(`${Math.floor(pt.x)}, ${Math.floor(pt.y)}`)

      // Mobile mode: finger on canvas = paint immediately (real brush feel).
      if (useMobilePaint && (event.pointerType === 'touch' || event.pointerType === 'pen' || mobileMode)) {
        if (event.button === 2) {
          event.preventDefault()
          return
        }
        // Keep eraser if selected; otherwise brush (or pencil if user picked it).
        const drawTool =
          tool === 'eraser' ? 'eraser' : tool === 'pencil' ? 'pencil' : 'brush'
        mobileDrawToolRef.current = drawTool
        pushUndo()
        drawingRef.current = true
        startRef.current = pt
        lastRef.current = pt
        strokeLine(ctx, pt, pt, { drawTool, erase: drawTool === 'eraser' })
        setStatus(drawTool === 'eraser' ? 'Erasing…' : 'Painting…')
        return
      }

      if (tool === 'magnify') {
        if (event.button === 2) {
          event.preventDefault()
          const idx = ZOOM_PRESETS.indexOf(zoom)
          applyZoom(ZOOM_PRESETS[Math.max(0, idx - 1)] ?? 1)
        } else if (event.button === 0) {
          const idx = ZOOM_PRESETS.indexOf(zoom)
          applyZoom(ZOOM_PRESETS[Math.min(ZOOM_PRESETS.length - 1, idx + 1)] ?? 8)
        }
        return
      }

      if (tool === 'eyedropper') {
        const pixel = ctx.getImageData(Math.floor(pt.x), Math.floor(pt.y), 1, 1).data
        const hex = rgbaToHex(pixel[0], pixel[1], pixel[2], pixel[3])
        if (event.button === 2) setBg(hex)
        else setFg(hex)
        setStatus('Color picked')
        return
      }

      if (event.button === 2) {
        event.preventDefault()
        return
      }
      if (event.button !== 0 && event.button !== -1) return

      if (tool === 'fill') {
        pushUndo()
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const n = floodFill(image, pt.x, pt.y, hexToRgba(fg))
        ctx.putImageData(image, 0, 0)
        setStatus(n ? `Filled ${n} px` : 'Nothing to fill')
        return
      }

      pushUndo()
      drawingRef.current = true
      startRef.current = pt
      lastRef.current = pt
      mobileDrawToolRef.current =
        tool === 'eraser' ? 'eraser' : tool === 'brush' ? 'brush' : tool === 'pencil' ? 'pencil' : 'brush'

      if (tool === 'pencil' || tool === 'eraser' || tool === 'brush') {
        strokeLine(ctx, pt, pt, { drawTool: tool, erase: tool === 'eraser' })
      }
    },
    [applyZoom, canvasPoint, fg, getCtx, mobileMode, pushUndo, strokeLine, tool, zoom],
  )

  const onPointerMove = useCallback(
    (event) => {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return
      }
      const pt = canvasPoint(event)
      setCoords(`${Math.floor(pt.x)}, ${Math.floor(pt.y)}`)
      if (!drawingRef.current) return
      const ctx = getCtx()
      const overlay = overlayRef.current
      if (!ctx || !startRef.current) return

      const drawTool = mobileDrawToolRef.current
      const freehand =
        mobileMode ||
        tool === 'pencil' ||
        tool === 'eraser' ||
        tool === 'brush' ||
        event.pointerType === 'touch' ||
        event.pointerType === 'pen'

      if (freehand && (tool === 'pencil' || tool === 'eraser' || tool === 'brush' || mobileMode)) {
        if (!lastRef.current) return
        event.preventDefault?.()
        strokeLine(ctx, lastRef.current, pt, {
          drawTool,
          erase: drawTool === 'eraser',
        })
        lastRef.current = pt
        return
      }

      if ((tool === 'line' || tool === 'rect' || tool === 'ellipse') && overlay) {
        const octx = overlay.getContext('2d')
        if (!octx) return
        octx.clearRect(0, 0, overlay.width, overlay.height)
        drawShape(octx, tool, startRef.current, pt)
      }
    },
    [canvasPoint, drawShape, getCtx, mobileMode, strokeLine, tool],
  )

  const endStroke = useCallback(
    (event) => {
      if (activePointerIdRef.current !== null && event?.pointerId !== activePointerIdRef.current) {
        return
      }
      if (!drawingRef.current) {
        activePointerIdRef.current = null
        return
      }
      drawingRef.current = false
      activePointerIdRef.current = null
      const ctx = getCtx()
      const pt = event ? canvasPoint(event) : lastRef.current
      if (
        ctx &&
        startRef.current &&
        pt &&
        !mobileMode &&
        (tool === 'line' || tool === 'rect' || tool === 'ellipse')
      ) {
        drawShape(ctx, tool, startRef.current, pt)
        clearOverlay()
      }
      startRef.current = null
      lastRef.current = null
      if (mobileMode) setStatus('Mobile mode — touch to paint')
    },
    [canvasPoint, clearOverlay, drawShape, getCtx, mobileMode, tool],
  )

  const onPointerUp = useCallback(
    (event) => {
      endStroke(event)
    },
    [endStroke],
  )

  const onResizePointerDown = useCallback(
    (edge, event) => {
      event.preventDefault()
      event.stopPropagation()
      resizeDragRef.current = {
        edge,
        startX: event.clientX,
        startY: event.clientY,
        origW: canvasW,
        origH: canvasH,
      }
      event.currentTarget.setPointerCapture?.(event.pointerId)
    },
    [canvasH, canvasW],
  )

  const onResizePointerMove = useCallback(
    (event) => {
      const drag = resizeDragRef.current
      if (!drag) return
      const dx = (event.clientX - drag.startX) / zoom
      const dy = (event.clientY - drag.startY) / zoom
      let nextW = drag.origW
      let nextH = drag.origH
      if (drag.edge.includes('e')) nextW = drag.origW + dx
      if (drag.edge.includes('s')) nextH = drag.origH + dy
      // Live preview size in status only; commit on up (avoids thrashing ImageData)
      setCoords(`${Math.round(nextW)} × ${Math.round(nextH)}`)
      setStatus(`Resize to ${Math.round(nextW)}×${Math.round(nextH)} — release to apply`)
      // Store pending on the ref for commit
      resizeDragRef.current = { ...drag, pendingW: nextW, pendingH: nextH }
    },
    [zoom],
  )

  const onResizePointerUp = useCallback(() => {
    const drag = resizeDragRef.current
    if (!drag) return
    const nextW = drag.pendingW ?? drag.origW
    const nextH = drag.pendingH ?? drag.origH
    resizeDragRef.current = null
    if (Math.round(nextW) !== canvasW || Math.round(nextH) !== canvasH) {
      resizeCanvas(nextW, nextH)
    }
  }, [canvasH, canvasW, resizeCanvas])

  const toolDefs = [
    { id: 'pencil', title: 'Pencil', icon: '✎' },
    { id: 'brush', title: 'Brush', icon: '●' },
    { id: 'eraser', title: 'Eraser', icon: 'eraser' },
    { id: 'fill', title: 'Fill With Color', icon: '▤' },
    { id: 'eyedropper', title: 'Pick Color', icon: '⌖' },
    { id: 'magnify', title: 'Magnifier', icon: '🔍' },
    { id: 'line', title: 'Line', icon: '/' },
    { id: 'rect', title: 'Rectangle', icon: '□' },
    { id: 'ellipse', title: 'Ellipse', icon: '○' },
  ]

  const openAttributes = useCallback(() => {
    setAttrW(String(canvasW))
    setAttrH(String(canvasH))
    setAttrsOpen(true)
    setMenuOpen(null)
  }, [canvasH, canvasW])

  const menus = [
    {
      id: 'File',
      items: [
        { label: 'New', action: () => clearCanvas(true) },
        { label: 'Open...', action: () => fileRef.current?.click() },
        { label: 'Save', action: () => void doSave(), bold: true },
        { label: 'Save As...', action: () => void doSave() },
      ],
    },
    {
      id: 'Edit',
      items: [{ label: 'Undo\tCtrl+Z', action: doUndo, disabled: !canUndo }],
    },
    {
      id: 'View',
      items: [
        { label: 'Zoom 100%', action: () => applyZoom(1) },
        { label: 'Zoom 200%', action: () => applyZoom(2) },
        { label: 'Zoom 600%', action: () => applyZoom(6) },
        { label: 'Zoom 800%', action: () => applyZoom(8) },
      ],
    },
    {
      id: 'Image',
      items: [
        { label: 'Attributes...\tCtrl+E', action: openAttributes },
        { label: 'Clear Image', action: () => clearCanvas(true) },
      ],
    },
    {
      id: 'Colors',
      items: [
        {
          label: 'Edit Colors...',
          action: () => {
            const input = document.createElement('input')
            input.type = 'color'
            input.value = fg
            input.addEventListener('input', () => setFg(input.value))
            input.click()
          },
        },
      ],
    },
    {
      id: 'Help',
      items: [
        {
          label: 'Help Topics',
          action: () =>
            setStatus(
              'Drag canvas handles to resize · Magnifier zooms · Tool shown on cursor · Save → disk',
            ),
        },
      ],
    },
  ]

  useEffect(() => {
    if (!keyboardActive) return undefined
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault()
        openAttributes()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keyboardActive, openAttributes])

  const displayW = canvasW * zoom
  const displayH = canvasH * zoom
  const showStrokeOptions = tool !== 'magnify' && tool !== 'fill' && tool !== 'eyedropper'
  const showZoomOptions = tool === 'magnify'

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col bg-[#c0c0c0] font-xp text-[11px] text-black"
      onClick={() => setMenuOpen(null)}
    >
      <div
        className="relative flex shrink-0 items-stretch border-b border-[#808080] bg-[#c0c0c0] px-1"
        onClick={(event) => event.stopPropagation()}
      >
        {menus.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              type="button"
              className={`cursor-default px-2 py-0.5 hover:bg-[#000080] hover:text-white ${
                menuOpen === menu.id ? 'bg-[#000080] text-white' : ''
              }`}
              onClick={() => setMenuOpen((v) => (v === menu.id ? null : menu.id))}
              onMouseEnter={() => {
                if (menuOpen) setMenuOpen(menu.id)
              }}
            >
              <span className="underline">{menu.id[0]}</span>
              {menu.id.slice(1)}
            </button>
            {menuOpen === menu.id ? (
              <div className="absolute left-0 top-full z-20 min-w-[180px] border border-[#808080] bg-[#c0c0c0] py-0.5 shadow-[2px_2px_0_rgba(0,0,0,0.35)]">
                {menu.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={Boolean(item.disabled)}
                    className={`flex w-full cursor-default whitespace-pre px-4 py-0.5 text-left hover:bg-[#000080] hover:text-white disabled:text-[#808080] ${
                      item.bold ? 'font-bold' : ''
                    }`}
                    onClick={() => {
                      setMenuOpen(null)
                      item.action?.()
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) doOpen(file)
            event.target.value = ''
          }}
        />
      </div>

      <div className={`flex min-h-0 flex-1 ${isPhone ? 'flex-col' : 'flex-row'}`}>
        <div
          className={`flex shrink-0 border-[#808080] bg-[#c0c0c0] ${
            isPhone ? 'order-2 flex-row items-start gap-1 overflow-x-auto border-t p-1' : 'w-[58px] flex-col border-r'
          }`}
        >
          <div className={`grid grid-cols-2 gap-0 border border-[#808080] bg-[#c0c0c0] p-0.5 ${isPhone ? '' : 'm-0.5'}`}>
            {toolDefs.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.title}
                aria-label={t.title}
                aria-pressed={tool === t.id}
                className={`flex h-[26px] w-[26px] items-center justify-center border text-[12px] leading-none ${
                  tool === t.id
                    ? 'border-[#808080] bg-[#c0c0c0] shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#fff]'
                    : 'border-transparent bg-[#c0c0c0] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] hover:border-[#808080]'
                }`}
                onClick={(event) => {
                  event.stopPropagation()
                  setTool(/** @type {(typeof TOOLS)[number]} */ (t.id))
                }}
              >
                {t.icon === 'eraser' ? (
                  <span
                    className="block h-[10px] w-[14px] rotate-[-20deg] border border-[#333] bg-[#f2d84a] shadow-[inset_-2px_0_0_#ffe566]"
                    aria-hidden
                  />
                ) : (
                  t.icon
                )}
              </button>
            ))}
          </div>

          <div
            className={`flex flex-col items-center justify-center gap-1 border border-[#808080] bg-[#c0c0c0] p-1 ${
              isPhone ? 'min-w-[72px]' : 'mx-0.5 mb-0.5 min-h-[72px]'
            }`}
          >
            {showZoomOptions
              ? ZOOM_PRESETS.map((z) => (
                  <button
                    key={z}
                    type="button"
                    title={`${z}x`}
                    className={`w-10 px-0.5 text-center text-[10px] ${
                      zoom === z ? 'bg-[#000080] text-white' : 'hover:bg-[#000080]/20'
                    }`}
                    onClick={(event) => {
                      event.stopPropagation()
                      applyZoom(z)
                    }}
                  >
                    {z}x
                  </button>
                ))
              : null}
            {showStrokeOptions
              ? STROKE_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    title={`${n}px`}
                    className={`flex h-3 w-10 items-center justify-center ${
                      stroke === n ? 'bg-[#000080]' : 'hover:bg-[#000080]/20'
                    }`}
                    onClick={(event) => {
                      event.stopPropagation()
                      setStroke(n)
                    }}
                  >
                    <span
                      className="block w-8"
                      style={{ height: Math.max(1, n), background: stroke === n ? '#fff' : '#000' }}
                    />
                  </button>
                ))
              : null}
            {!showStrokeOptions && !showZoomOptions ? (
              <span className="px-1 text-center text-[9px] text-black/50">—</span>
            ) : null}
          </div>
        </div>

        <div
          className={`min-h-0 flex-1 overflow-auto bg-[#808080] ${isPhone ? 'order-1' : ''}`}
          style={{
            backgroundImage:
              'linear-gradient(45deg, #787878 25%, transparent 25%), linear-gradient(-45deg, #787878 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #787878 75%), linear-gradient(-45deg, transparent 75%, #787878 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
            backgroundColor: '#808080',
          }}
        >
          <div className="inline-block p-1 pb-4 pr-4">
            <div className="relative border border-[#404040] bg-white shadow-[1px_1px_0_#fff]">
              <canvas
                ref={canvasRef}
                width={canvasW}
                height={canvasH}
                className="block touch-none"
                style={{
                  width: displayW,
                  height: displayH,
                  imageRendering: zoom > 1 ? 'pixelated' : 'auto',
                  cursor: cursorForTool(tool),
                }}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  drawingRef.current = false
                  clearOverlay()
                  startRef.current = null
                }}
              />
              <canvas
                ref={overlayRef}
                width={canvasW}
                height={canvasH}
                className="pointer-events-none absolute left-0 top-0"
                style={{
                  width: displayW,
                  height: displayH,
                  imageRendering: zoom > 1 ? 'pixelated' : 'auto',
                }}
                aria-hidden
              />

              {/* Classic resize grips — grow the document */}
              <div
                className="absolute -right-1.5 top-1/2 z-10 h-3 w-3 -translate-y-1/2 cursor-e-resize border border-white bg-[#000080]"
                title="Drag to change width"
                onPointerDown={(event) => onResizePointerDown('e', event)}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
                onPointerCancel={onResizePointerUp}
              />
              <div
                className="absolute -bottom-1.5 left-1/2 z-10 h-3 w-3 -translate-x-1/2 cursor-s-resize border border-white bg-[#000080]"
                title="Drag to change height"
                onPointerDown={(event) => onResizePointerDown('s', event)}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
                onPointerCancel={onResizePointerUp}
              />
              <div
                className="absolute -bottom-1.5 -right-1.5 z-10 h-3 w-3 cursor-se-resize border border-white bg-[#000080]"
                title="Drag to resize canvas"
                onPointerDown={(event) => onResizePointerDown('se', event)}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
                onPointerCancel={onResizePointerUp}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-2 bg-[#c0c0c0] px-2 py-1"
        style={{ borderTop: '1px solid #fff', borderBottom: '1px solid #808080' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-[34px] w-[34px] shrink-0 border border-[#808080] bg-[#c0c0c0] shadow-[inset_1px_1px_0_#fff]">
          <div
            className="absolute left-[14px] top-[14px] h-4 w-4 border border-black"
            style={{ background: bg }}
            title="Background"
          />
          <div
            className="absolute left-[6px] top-[6px] z-[1] h-4 w-4 border border-black"
            style={{ background: fg }}
            title="Foreground"
          />
        </div>
        <div
          className="grid gap-0 border border-[#808080] bg-[#c0c0c0] p-0.5"
          style={{ gridTemplateColumns: 'repeat(14, 15px)' }}
        >
          {DEFAULT_COLORS.map((c, i) => (
            <button
              key={`${c}-${i}`}
              type="button"
              className="h-[15px] w-[15px] border border-[#808080]"
              style={{ background: c }}
              title={`${c} — left: color 1, right: color 2`}
              aria-label={`Palette ${c}`}
              onClick={() => setFg(c)}
              onContextMenu={(event) => {
                event.preventDefault()
                setBg(c)
              }}
            />
          ))}
        </div>
        <input
          type="color"
          value={fg}
          onChange={(event) => setFg(event.target.value)}
          className="ml-1 h-7 w-8 cursor-pointer border border-[#808080] bg-[#c0c0c0]"
          aria-label="Edit colors"
          title="Edit Colors"
        />
      </div>

      <div className="flex shrink-0 items-stretch border-t border-[#fff] bg-[#c0c0c0] text-[11px] text-black">
        <div className="min-w-0 flex-1 truncate border-r border-[#808080] px-2 py-0.5 shadow-[inset_1px_1px_0_#fff]">
          {status}
        </div>
        <div className="w-[110px] shrink-0 border-r border-[#808080] px-2 py-0.5 shadow-[inset_1px_1px_0_#fff] tabular-nums">
          {coords}
        </div>
        <div className="w-[100px] shrink-0 px-2 py-0.5 shadow-[inset_1px_1px_0_#fff] tabular-nums">
          {canvasW}×{canvasH}
          {zoom !== 1 ? ` @${zoom}x` : ''}
        </div>
      </div>

      {attrsOpen ? (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/30"
          onClick={() => setAttrsOpen(false)}
        >
          <div
            className="w-[280px] border border-[#000] bg-[#c0c0c0] shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-label="Attributes"
          >
            <div className="xp-titlebar flex h-7 items-center px-2 text-[11px] text-white">
              Attributes
            </div>
            <div className="space-y-3 p-3">
              <p className="text-black/70">Width and Height are measured in pixels.</p>
              <label className="flex items-center justify-between gap-2">
                Width:
                <input
                  type="number"
                  min={MIN_CANVAS}
                  max={MAX_CANVAS}
                  value={attrW}
                  onChange={(event) => setAttrW(event.target.value)}
                  className="w-24 border border-[#808080] bg-white px-1 py-0.5"
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                Height:
                <input
                  type="number"
                  min={MIN_CANVAS}
                  max={MAX_CANVAS}
                  value={attrH}
                  onChange={(event) => setAttrH(event.target.value)}
                  className="w-24 border border-[#808080] bg-white px-1 py-0.5"
                />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="xp-button min-w-[72px] px-3 py-1"
                  onClick={() => {
                    resizeCanvas(Number(attrW) || canvasW, Number(attrH) || canvasH)
                    setAttrsOpen(false)
                  }}
                >
                  OK
                </button>
                <button
                  type="button"
                  className="xp-button min-w-[72px] px-3 py-1"
                  onClick={() => setAttrsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
