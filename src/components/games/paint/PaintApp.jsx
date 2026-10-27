import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import usePhoneGameLayout from '../_shared/usePhoneGameLayout'
import { cursorForTool } from './cursors.js'
import PaintCascadingMenu from './PaintCascadingMenu.jsx'
import { magneticSnapToPaths } from './eduMagnetic.js'
import { EDU_CLIPART_CATEGORIES, loadSvgImage } from './eduClipart.js'
import {
  EDU_A4_H,
  EDU_A4_W,
  EDU_DIGIT_IDS,
  EDU_GUIDE_SIZES,
  EDU_LETTER_IDS,
  EDU_SHAPE_IDS,
  EDU_SHAPE_LABELS,
  drawEduTemplate,
  getEduTemplate,
} from './eduTemplates.js'
import {
  CANVAS_H,
  CANVAS_W,
  DEFAULT_COLORS,
  MAX_CANVAS,
  MAX_STROKE,
  MAX_UNDO,
  MAX_ZOOM,
  MIN_CANVAS,
  MIN_STROKE,
  MIN_ZOOM,
  TOOLS,
  ZOOM_PRESETS,
  clampStrokeSize,
  clampZoom,
  fitZoomForViewport,
  hexToRgba,
  pourFill,
  rgbaToHex,
  stampAirbrush,
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
  const scrollRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const fileRef = useRef(/** @type {HTMLInputElement | null} */ (null))
  const drawingRef = useRef(false)
  const startRef = useRef(/** @type {{ x: number, y: number } | null} */ (null))
  const lastRef = useRef(/** @type {{ x: number, y: number } | null} */ (null))
  const undoRef = useRef(/** @type {ImageData[]} */ ([]))
  const activePointerIdRef = useRef(/** @type {number | null} */ (null))
  const mobileDrawToolRef = useRef(
    /** @type {'pencil' | 'brush' | 'airbrush' | 'eraser'} */ ('brush'),
  )
  const touchPointsRef = useRef(/** @type {Map<number, { x: number, y: number }>} */ (new Map()))
  const pinchRef = useRef(
    /** @type {null | { startDist: number, startZoom: number }} */ (null),
  )
  const resizeDragRef = useRef(
    /** @type {null | { edge: string, startX: number, startY: number, origW: number, origH: number }} */ (null),
  )

  const [tool, setTool] = useState(/** @type {(typeof TOOLS)[number]} */ ('pencil'))
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  /** Shape tools (line/rect/ellipse) width. */
  const [stroke, setStroke] = useState(2)
  /** Independent sizes for freehand tools. */
  const [pencilSize, setPencilSize] = useState(2)
  const [brushSize, setBrushSize] = useState(8)
  const [airbrushSize, setAirbrushSize] = useState(22)
  const [eraserSize, setEraserSize] = useState(18)
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

  /** Edu tracing: kids learn letters/shapes on A4 with optional magnetic snap. */
  const [eduLineMode, setEduLineMode] = useState(/** @type {'magnetic' | 'plain'} */ ('magnetic'))
  const [eduLineType, setEduLineType] = useState(
    /** @type {'dotted' | 'dash' | 'straight'} */ ('dotted'),
  )
  const [eduGuideSize, setEduGuideSize] = useState(
    /** @type {'s' | 'm' | 'l' | 'xl'} */ ('m'),
  )
  const [eduMagneticLevel, setEduMagneticLevel] = useState(
    /** @type {'beginner' | 'medium' | 'expert'} */ ('beginner'),
  )
  const [eduTemplateId, setEduTemplateId] = useState(/** @type {string | null} */ (null))
  const eduTemplateRef = useRef(/** @type {ReturnType<typeof getEduTemplate>} */ (null))
  /** Bumps after applying a template so layout effect repaints after React commits size state. */
  const [eduPaintGen, setEduPaintGen] = useState(0)
  /** Brush stamp preview in CSS px relative to the canvas box (center). */
  const [brushPreview, setBrushPreview] = useState(
    /** @type {null | { x: number, y: number }} */ (null),
  )

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

  const paintEduGuide = useCallback(
    (ctx, template, lineType, guideSize) => {
      if (!template) return
      drawEduTemplate(ctx, template, lineType, guideSize)
    },
    [],
  )

  const clearCanvas = useCallback(
    (pushHistory = true) => {
      const canvas = canvasRef.current
      const ctx = getCtx()
      if (!canvas || !ctx) return
      if (pushHistory) pushUndo()
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const tmpl = eduTemplateRef.current
      if (tmpl) paintEduGuide(ctx, tmpl, eduLineType, eduGuideSize)
      setStatus(tmpl ? `Edu · ${tmpl.label}` : 'New image')
    },
    [bg, eduGuideSize, eduLineType, getCtx, paintEduGuide, pushUndo],
  )

  const applyEduTemplate = useCallback(
    (templateId) => {
      const template = getEduTemplate(templateId)
      if (!template) {
        setStatus('Template not found')
        return
      }
      const canvas = canvasRef.current
      if (!canvas) return
      pushUndo()

      const finishApply = (ready) => {
        eduTemplateRef.current = ready
        setEduTemplateId(templateId)
        // Size bitmap in JS only (avoid React width/height props wiping pixels).
        canvas.width = EDU_A4_W
        canvas.height = EDU_A4_H
        syncOverlaySize(EDU_A4_W, EDU_A4_H)
        setCanvasW(EDU_A4_W)
        setCanvasH(EDU_A4_H)
        setAttrW(String(EDU_A4_W))
        setAttrH(String(EDU_A4_H))
        setTool('brush')
        if (isPhone || preferTouchDrawing()) {
          setMobileMode(true)
          setBrushSize((s) => Math.max(s, 8))
          setPencilSize((s) => Math.max(s, 3))
        } else {
          setBrushSize((s) => Math.max(s, 6))
        }
        // Phone Edu: fit whole A4; desktop stays 100%.
        if (!(isPhone || preferTouchDrawing())) setZoom(1)
        setFileName(`edu-${ready.label}`)
        setEduPaintGen((n) => n + 1)
        setStatus(
          `Edu · ${ready.label} · ${eduLineMode}/${eduLineType}` +
            (eduLineMode === 'magnetic' ? ` · ${eduMagneticLevel}` : ''),
        )
      }

      // Clipart: load the SVG as an image so the guide looks like the real picture.
      if (template.kind === 'clipart' && template.svgMarkup) {
        setStatus(`Edu · loading ${template.label}…`)
        loadSvgImage(template.svgMarkup)
          .then((img) => finishApply({ ...template, guideImage: img }))
          .catch(() => finishApply({ ...template, guideImage: null }))
        return
      }

      finishApply({ ...template, guideImage: null })
    },
    [
      eduLineMode,
      eduLineType,
      eduMagneticLevel,
      isPhone,
      pushUndo,
      syncOverlaySize,
    ],
  )

  const exitEdu = useCallback(() => {
    eduTemplateRef.current = null
    setEduTemplateId(null)
    setStatus('Edu off — free paint')
  }, [])

  // Paint Edu guide after size state commits (React width/height props used to wipe the bitmap).
  const eduGuideStylePrev = useRef(`${eduLineType}:${eduGuideSize}`)
  useLayoutEffect(() => {
    const template = eduTemplateRef.current
    if (!eduTemplateId || !template) return
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    if (canvas.width !== EDU_A4_W || canvas.height !== EDU_A4_H) {
      canvas.width = EDU_A4_W
      canvas.height = EDU_A4_H
      syncOverlaySize(EDU_A4_W, EDU_A4_H)
    }
    const styleKey = `${eduLineType}:${eduGuideSize}`
    const styleChanged = eduGuideStylePrev.current !== styleKey
    eduGuideStylePrev.current = styleKey
    if (styleChanged && eduPaintGen > 0) {
      pushUndo()
    }
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    paintEduGuide(ctx, template, eduLineType, eduGuideSize)
  }, [
    eduTemplateId,
    eduLineType,
    eduGuideSize,
    eduPaintGen,
    getCtx,
    paintEduGuide,
    pushUndo,
    syncOverlaySize,
  ])

  const snapEduPoint = useCallback(
    (pt) => {
      const template = eduTemplateRef.current
      if (!template || eduLineMode !== 'magnetic') return pt
      return magneticSnapToPaths(pt, template.paths, eduMagneticLevel, {
        closed: template.closed,
        previous: lastRef.current,
      })
    },
    [eduLineMode, eduMagneticLevel],
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
      if (drawTool === 'brush') return brushSize
      if (drawTool === 'airbrush') return airbrushSize
      if (drawTool === 'eraser') return eraserSize
      if (drawTool === 'pencil') return pencilSize
      return stroke
    },
    [airbrushSize, brushSize, eraserSize, pencilSize, stroke],
  )

  const activeFreehandSize =
    tool === 'brush'
      ? brushSize
      : tool === 'airbrush'
        ? airbrushSize
        : tool === 'eraser'
          ? eraserSize
          : tool === 'pencil'
            ? pencilSize
            : stroke

  const setActiveFreehandSize = useCallback(
    (raw) => {
      const next = clampStrokeSize(raw)
      if (tool === 'brush') setBrushSize(next)
      else if (tool === 'airbrush') setAirbrushSize(next)
      else if (tool === 'eraser') setEraserSize(next)
      else if (tool === 'pencil') setPencilSize(next)
      else setStroke(next)
      const label =
        tool === 'eraser'
          ? 'Eraser'
          : tool === 'brush'
            ? 'Brush'
            : tool === 'airbrush'
              ? 'Airbrush'
              : tool === 'pencil'
                ? 'Pencil'
                : 'Stroke'
      setStatus(`${label} size: ${next}px`)
    },
    [tool],
  )

  const strokeLine = useCallback(
    (ctx, from, to, opts = {}) => {
      const drawTool = opts.drawTool ?? 'pencil'
      if (drawTool === 'airbrush') {
        const radius = (opts.width ?? widthForDrawTool('airbrush')) / 2
        const color = opts.color ?? fg
        const dx = to.x - from.x
        const dy = to.y - from.y
        const dist = Math.hypot(dx, dy)
        const step = Math.max(2, radius * 0.35)
        const stamps = Math.max(1, Math.ceil(dist / step))
        for (let i = 0; i <= stamps; i += 1) {
          const t = stamps === 0 ? 0 : i / stamps
          stampAirbrush(ctx, from.x + dx * t, from.y + dy * t, { radius, color })
        }
        return
      }
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

  const enableMobileMode = useCallback((on) => {
    setMobileMode(on)
    if (on) {
      setBrushSize((s) => Math.max(s, 6))
      setStatus('Mobile mode — touch canvas to paint (lift finger to stop)')
    } else {
      setStatus('PC mode — click and drag to draw')
    }
  }, [])

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
    const z = clampZoom(next)
    setZoom(z)
    if (announce) setStatus(`Zoom ${z}x`)
  }, [])

  const fitCanvasInView = useCallback(
    (announce = true) => {
      const scroller = scrollRef.current
      if (!scroller) {
        applyZoom(1, announce)
        return
      }
      const z = fitZoomForViewport(canvasW, canvasH, scroller.clientWidth, scroller.clientHeight, 28)
      applyZoom(z, announce)
      if (announce) setStatus(`Show all · ${z}x`)
    },
    [applyZoom, canvasH, canvasW],
  )

  // Edu on phone/tablet: fit the whole A4 after the viewport lays out.
  useLayoutEffect(() => {
    if (!eduTemplateId || !(isPhone || preferTouchDrawing())) return
    fitCanvasInView(false)
  }, [eduPaintGen, eduTemplateId, fitCanvasInView, isPhone])

  const updateBrushPreviewFromEvent = useCallback(
    (event) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const stampTool =
        tool === 'pencil' ||
        tool === 'brush' ||
        tool === 'airbrush' ||
        tool === 'eraser' ||
        tool === 'line'
          ? tool
          : mobileMode
            ? 'brush'
            : null
      if (!stampTool) {
        setBrushPreview(null)
        return
      }
      const rect = canvas.getBoundingClientRect()
      setBrushPreview({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    },
    [mobileMode, tool],
  )

  const touchDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

  const syncPinchFromTouches = useCallback(() => {
    const pts = [...touchPointsRef.current.values()]
    if (pts.length < 2) {
      pinchRef.current = null
      return
    }
    const dist = touchDistance(pts[0], pts[1])
    if (!pinchRef.current) {
      pinchRef.current = { startDist: dist, startZoom: zoom }
      drawingRef.current = false
      return
    }
    if (pinchRef.current.startDist < 8) return
    const next = pinchRef.current.startZoom * (dist / pinchRef.current.startDist)
    applyZoom(next, false)
  }, [applyZoom, zoom])

  const onPointerDown = useCallback(
    (event) => {
      setMenuOpen(null)
      updateBrushPreviewFromEvent(event)
      const canvas = canvasRef.current
      const ctx = getCtx()
      if (!canvas || !ctx) return

      if (event.pointerType === 'touch') {
        touchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (touchPointsRef.current.size >= 2) {
          event.preventDefault()
          drawingRef.current = false
          activePointerIdRef.current = null
          syncPinchFromTouches()
          setStatus('Pinch to zoom')
          return
        }
      }

      const isTouchLike =
        event.pointerType === 'touch' ||
        event.pointerType === 'pen' ||
        (mobileMode && event.pointerType !== 'mouse')
      const useMobilePaint = mobileMode || isTouchLike

      // Touch/pen: treat contact as tool-down (ignore mouse button quirks).
      if (useMobilePaint && (event.pointerType === 'touch' || event.pointerType === 'pen')) {
        event.preventDefault()
      }

      event.currentTarget.setPointerCapture?.(event.pointerId)
      activePointerIdRef.current = event.pointerId
      const pt = canvasPoint(event)
      setCoords(`${Math.floor(pt.x)}, ${Math.floor(pt.y)}`)

      if (tool === 'magnify') {
        if (event.button === 2) {
          event.preventDefault()
          applyZoom(zoom / 1.5)
        } else if (event.button === 0 || useMobilePaint) {
          applyZoom(zoom * 1.5)
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
      if (!useMobilePaint && event.button !== 0 && event.button !== -1) return

      if (tool === 'fill') {
        pushUndo()
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
        // Watercolor pour: blend from the click; more pours layer pigment in the basin.
        const n = pourFill(image, pt.x, pt.y, hexToRgba(fg))
        ctx.putImageData(image, 0, 0)
        setStatus(n ? `Poured ${n} px` : 'Nothing to fill')
        return
      }

      // Mobile freehand: finger paints with the selected freehand tool.
      if (
        useMobilePaint &&
        (tool === 'pencil' || tool === 'brush' || tool === 'airbrush' || tool === 'eraser')
      ) {
        const drawTool = tool
        mobileDrawToolRef.current = drawTool
        pushUndo()
        drawingRef.current = true
        startRef.current = pt
        lastRef.current = pt
        strokeLine(ctx, pt, pt, { drawTool, erase: drawTool === 'eraser' })
        setStatus(
          drawTool === 'eraser'
            ? 'Erasing…'
            : drawTool === 'airbrush'
              ? 'Spraying…'
              : 'Painting…',
        )
        return
      }

      pushUndo()
      drawingRef.current = true
      const startPt =
        tool === 'eraser' || tool === 'fill' || tool === 'eyedropper' || tool === 'magnify'
          ? pt
          : snapEduPoint(pt)
      startRef.current = startPt
      lastRef.current = startPt
      mobileDrawToolRef.current =
        tool === 'eraser'
          ? 'eraser'
          : tool === 'airbrush'
            ? 'airbrush'
            : tool === 'brush'
              ? 'brush'
              : tool === 'pencil'
                ? 'pencil'
                : 'brush'

      if (tool === 'pencil' || tool === 'eraser' || tool === 'brush' || tool === 'airbrush') {
        strokeLine(ctx, startPt, startPt, { drawTool: tool, erase: tool === 'eraser' })
      }
    },
    [
      applyZoom,
      canvasPoint,
      fg,
      getCtx,
      mobileMode,
      pushUndo,
      snapEduPoint,
      strokeLine,
      syncPinchFromTouches,
      tool,
      updateBrushPreviewFromEvent,
      zoom,
    ],
  )

  const onPointerMove = useCallback(
    (event) => {
      if (event.pointerType === 'touch' && touchPointsRef.current.has(event.pointerId)) {
        touchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (touchPointsRef.current.size >= 2) {
          event.preventDefault()
          syncPinchFromTouches()
          return
        }
      }

      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return
      }
      updateBrushPreviewFromEvent(event)
      const pt = canvasPoint(event)
      setCoords(`${Math.floor(pt.x)}, ${Math.floor(pt.y)}`)
      if (!drawingRef.current) return
      const ctx = getCtx()
      const overlay = overlayRef.current
      if (!ctx || !startRef.current) return

      const drawTool = mobileDrawToolRef.current
      const isFreehandTool =
        tool === 'pencil' || tool === 'eraser' || tool === 'brush' || tool === 'airbrush'

      if (isFreehandTool) {
        if (!lastRef.current) return
        event.preventDefault?.()
        const nextPt = drawTool === 'eraser' ? pt : snapEduPoint(pt)
        strokeLine(ctx, lastRef.current, nextPt, {
          drawTool,
          erase: drawTool === 'eraser',
        })
        lastRef.current = nextPt
        return
      }

      if ((tool === 'line' || tool === 'rect' || tool === 'ellipse') && overlay) {
        const octx = overlay.getContext('2d')
        if (!octx) return
        octx.clearRect(0, 0, overlay.width, overlay.height)
        drawShape(octx, tool, startRef.current, pt)
      }
    },
    [
      canvasPoint,
      drawShape,
      getCtx,
      snapEduPoint,
      strokeLine,
      syncPinchFromTouches,
      tool,
      updateBrushPreviewFromEvent,
    ],
  )

  const endStroke = useCallback(
    (event) => {
      if (event?.pointerType === 'touch') {
        touchPointsRef.current.delete(event.pointerId)
        if (touchPointsRef.current.size < 2) pinchRef.current = null
      }
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
        (tool === 'line' || tool === 'rect' || tool === 'ellipse')
      ) {
        drawShape(ctx, tool, startRef.current, pt)
        clearOverlay()
      }
      startRef.current = null
      lastRef.current = null
      if (mobileMode) setStatus('Mobile mode — touch to paint · pinch to zoom')
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
    { id: 'airbrush', title: 'Airbrush', icon: '✧' },
    { id: 'eraser', title: 'Eraser', icon: 'eraser' },
    { id: 'fill', title: 'Fill With Color', icon: '▤' },
    { id: 'eyedropper', title: 'Pick Color', icon: '⌖' },
    { id: 'magnify', title: 'Magnifier', icon: '🔍' },
    { id: 'line', title: 'Line', icon: '/' },
    { id: 'rect', title: 'Rectangle', icon: '□' },
    { id: 'ellipse', title: 'Ellipse', icon: '○' },
  ]
  const visibleToolDefs = toolDefs

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
        { label: 'Show All', action: () => fitCanvasInView(true), bold: true },
        { label: 'Zoom 25%', action: () => applyZoom(0.25) },
        { label: 'Zoom 50%', action: () => applyZoom(0.5) },
        { label: 'Zoom 100%', action: () => applyZoom(1) },
        { label: 'Zoom 200%', action: () => applyZoom(2) },
        { label: 'Zoom 400%', action: () => applyZoom(4) },
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
      id: 'Edu',
      items: [
        {
          label: 'Settings',
          submenu: [
            {
              label: 'Line',
              submenu: [
                {
                  label: 'Magnetic',
                  checked: eduLineMode === 'magnetic',
                  action: () => setEduLineMode('magnetic'),
                },
                {
                  label: 'Plain',
                  checked: eduLineMode === 'plain',
                  action: () => setEduLineMode('plain'),
                },
              ],
            },
            {
              label: 'Type',
              submenu: [
                {
                  label: 'Dotted',
                  checked: eduLineType === 'dotted',
                  action: () => setEduLineType('dotted'),
                },
                {
                  label: 'Dash',
                  checked: eduLineType === 'dash',
                  action: () => setEduLineType('dash'),
                },
                {
                  label: 'Straight',
                  checked: eduLineType === 'straight',
                  action: () => setEduLineType('straight'),
                },
              ],
            },
            {
              label: 'Size',
              submenu: /** @type {const} */ (['s', 'm', 'l', 'xl']).map((id) => ({
                label: EDU_GUIDE_SIZES[id].label,
                checked: eduGuideSize === id,
                action: () => setEduGuideSize(id),
              })),
            },
            { separator: true },
            {
              label: 'Magnetic level',
              disabled: eduLineMode !== 'magnetic',
              submenu: [
                {
                  label: 'Beginner',
                  checked: eduMagneticLevel === 'beginner',
                  action: () => setEduMagneticLevel('beginner'),
                },
                {
                  label: 'Medium',
                  checked: eduMagneticLevel === 'medium',
                  action: () => setEduMagneticLevel('medium'),
                },
                {
                  label: 'Expert',
                  checked: eduMagneticLevel === 'expert',
                  action: () => setEduMagneticLevel('expert'),
                },
              ],
            },
          ],
        },
        {
          label: 'ABC',
          submenu: [
            {
              label: 'Uppercase',
              submenu: EDU_LETTER_IDS.filter((id) => id.slice(7) === id.slice(7).toUpperCase()).map(
                (id) => ({
                  label: id.slice(7),
                  checked: eduTemplateId === id,
                  action: () => applyEduTemplate(id),
                }),
              ),
            },
            {
              label: 'Lowercase',
              submenu: EDU_LETTER_IDS.filter((id) => id.slice(7) === id.slice(7).toLowerCase()).map(
                (id) => ({
                  label: id.slice(7),
                  checked: eduTemplateId === id,
                  action: () => applyEduTemplate(id),
                }),
              ),
            },
          ],
        },
        {
          label: '123',
          submenu: EDU_DIGIT_IDS.map((id) => ({
            label: id.slice(6),
            checked: eduTemplateId === id,
            action: () => applyEduTemplate(id),
          })),
        },
        {
          label: 'Jawi',
          disabled: true,
          submenu: [{ label: 'Coming soon', disabled: true }],
        },
        {
          label: 'Shape',
          submenu: EDU_SHAPE_IDS.map((id) => {
            const name = id.slice(6)
            return {
              label: EDU_SHAPE_LABELS[name] ?? name.charAt(0).toUpperCase() + name.slice(1),
              checked: eduTemplateId === id,
              action: () => applyEduTemplate(id),
            }
          }),
        },
        {
          label: 'Clipart',
          submenu: EDU_CLIPART_CATEGORIES.map((category) => ({
            label: category.label,
            submenu: category.items.map((item) => {
              const id = `clipart:${item.id}`
              return {
                label: item.label,
                checked: eduTemplateId === id,
                action: () => applyEduTemplate(id),
              }
            }),
          })),
        },
        {
          label: 'Drawing',
          disabled: true,
          submenu: [{ label: 'Coming soon', disabled: true }],
        },
        {
          label: 'Exit Edu',
          action: exitEdu,
          disabled: !eduTemplateId,
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
              'Edu: ABC · 123 · shapes · Openclipart clipart · Magnetic snaps to the guide · Save PNG',
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
  const showZoomOptions = tool === 'magnify' || isPhone
  const stampTool =
    tool === 'pencil' || tool === 'brush' || tool === 'airbrush' || tool === 'eraser'
      ? tool
      : tool === 'line'
        ? 'pencil'
        : mobileMode
          ? 'brush'
          : null
  const brushDiameterCss = stampTool ? widthForDrawTool(stampTool) * zoom : 0
  const canvasCursor = stampTool
    ? cursorForTool(stampTool, {
        widthCss: Math.max(6, brushDiameterCss),
        erase: stampTool === 'eraser',
      })
    : cursorForTool(tool)
  const toolBtnClass = isPhone
    ? 'flex h-8 w-8 shrink-0 items-center justify-center border text-[13px] leading-none'
    : 'flex h-[26px] w-[26px] items-center justify-center border text-[12px] leading-none'
  const paletteCell = isPhone ? 16 : 15
  const fgBgBox = isPhone ? 32 : 34

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col bg-[#c0c0c0] font-xp text-[11px] text-black"
      onClick={() => setMenuOpen(null)}
    >
      <div
        className="xp-menubar relative shrink-0"
        onClick={(event) => event.stopPropagation()}
      >
        {menus.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              type="button"
              className={`cursor-default select-none ${
                menuOpen === menu.id ? '!bg-[#316ac5] !text-white' : ''
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
              <div className="absolute left-0 top-full z-30 pt-0.5">
                <PaintCascadingMenu items={menu.items} onClose={() => setMenuOpen(null)} />
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
            isPhone
              ? 'order-2 flex-col gap-0.5 border-t px-1 py-0.5'
              : 'w-[58px] flex-col border-r'
          }`}
        >
          <div
            className={
              isPhone
                ? 'flex flex-row items-center gap-0.5 overflow-x-auto'
                : `m-0.5 grid grid-cols-2 gap-0 border border-[#808080] bg-[#c0c0c0] p-0.5`
            }
          >
            {visibleToolDefs.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.title}
                aria-label={t.title}
                aria-pressed={tool === t.id}
                className={`${toolBtnClass} ${
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
                    className={`block rotate-[-20deg] border border-[#333] bg-[#f2d84a] shadow-[inset_-2px_0_0_#ffe566] ${
                      isPhone ? 'h-2.5 w-4' : 'h-[10px] w-[14px]'
                    }`}
                    aria-hidden
                  />
                ) : (
                  t.icon
                )}
              </button>
            ))}
          </div>

          <div
            className={`flex items-center justify-center gap-1 border border-[#808080] bg-[#c0c0c0] ${
              isPhone
                ? 'h-7 flex-row flex-nowrap px-1'
                : 'mx-0.5 mb-0.5 min-h-[96px] w-[52px] flex-col p-1.5'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            {showZoomOptions ? (
              <div
                className={`flex items-center gap-0.5 ${isPhone ? 'min-w-0 flex-1' : 'flex-col'}`}
              >
                {isPhone || tool === 'magnify' ? (
                  <>
                    <input
                      type="range"
                      min={MIN_ZOOM}
                      max={MAX_ZOOM}
                      step={0.05}
                      value={zoom}
                      onChange={(event) => applyZoom(Number(event.target.value))}
                      className={`accent-[#000080] ${isPhone ? 'h-4 min-w-0 flex-1' : 'h-16 w-3'}`}
                      style={isPhone ? undefined : { writingMode: 'vertical-lr', direction: 'rtl' }}
                      aria-label="Zoom"
                      title={`Zoom ${zoom}x`}
                    />
                    <button
                      type="button"
                      className={`shrink-0 border border-[#808080] bg-[#c0c0c0] px-1 text-[9px] font-bold leading-none shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] ${
                        isPhone ? 'h-5' : 'w-10 py-1'
                      }`}
                      onClick={() => fitCanvasInView(true)}
                      title="Fit canvas in view"
                    >
                      All
                    </button>
                    <span className="shrink-0 text-[9px] tabular-nums text-black/70">
                      {zoom < 1 ? zoom.toFixed(2) : zoom.toFixed(zoom % 1 ? 2 : 0)}x
                    </span>
                  </>
                ) : (
                  ZOOM_PRESETS.filter((z) => z >= 1).map((z) => (
                    <button
                      key={z}
                      type="button"
                      title={`${z}x`}
                      className={`w-10 px-0.5 text-center text-[10px] ${
                        zoom === z ? 'bg-[#000080] text-white' : 'hover:bg-[#000080]/20'
                      }`}
                      onClick={() => applyZoom(z)}
                    >
                      {z}x
                    </button>
                  ))
                )}
              </div>
            ) : null}
            {showStrokeOptions ? (
              <>
                <div
                  className={`flex shrink-0 items-center justify-center border border-[#808080] bg-white shadow-[inset_1px_1px_0_#fff] ${
                    isPhone ? 'h-5 w-5' : 'h-10 w-10'
                  }`}
                  title={`${activeFreehandSize}px`}
                  aria-hidden
                >
                  <span
                    className="block rounded-full"
                    style={{
                      width: Math.min(isPhone ? 14 : 36, Math.max(2, activeFreehandSize * (isPhone ? 0.45 : 1))),
                      height: Math.min(isPhone ? 14 : 36, Math.max(2, activeFreehandSize * (isPhone ? 0.45 : 1))),
                      background: tool === 'eraser' ? '#f2d84a' : fg,
                      border: tool === 'eraser' ? '1px solid #8a7a10' : '1px solid rgba(0,0,0,0.35)',
                      opacity: tool === 'airbrush' ? 0.55 : 1,
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={MIN_STROKE}
                  max={MAX_STROKE}
                  value={activeFreehandSize}
                  onChange={(event) => setActiveFreehandSize(event.target.value)}
                  className={`accent-[#000080] ${isPhone ? 'h-4 min-w-[64px] flex-1' : 'h-16 w-3'}`}
                  style={isPhone ? undefined : { writingMode: 'vertical-lr', direction: 'rtl' }}
                  aria-label="Tool size"
                />
                <span className="shrink-0 text-[9px] tabular-nums text-black/70">{activeFreehandSize}</span>
              </>
            ) : null}
            {!showStrokeOptions && !showZoomOptions ? (
              <span className="px-1 text-center text-[9px] text-black/50">—</span>
            ) : null}
          </div>
        </div>

        <div
          ref={scrollRef}
          className={`min-h-0 flex-1 overflow-auto bg-[#808080] ${isPhone ? 'order-1' : ''}`}
          style={{
            backgroundImage:
              'linear-gradient(45deg, #787878 25%, transparent 25%), linear-gradient(-45deg, #787878 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #787878 75%), linear-gradient(-45deg, transparent 75%, #787878 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
            backgroundColor: '#808080',
            touchAction: 'none',
          }}
        >
          <div className="inline-block p-1 pb-4 pr-4">
            <div className="relative border border-[#404040] bg-white shadow-[1px_1px_0_#fff]">
              <canvas
                ref={canvasRef}
                className="block touch-none"
                style={{
                  width: displayW,
                  height: displayH,
                  imageRendering: zoom > 1 ? 'pixelated' : 'auto',
                  cursor: canvasCursor,
                }}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={() => setBrushPreview(null)}
                onPointerCancel={() => {
                  drawingRef.current = false
                  clearOverlay()
                  startRef.current = null
                  setBrushPreview(null)
                }}
              />
              <canvas
                ref={overlayRef}
                className="pointer-events-none absolute left-0 top-0"
                style={{
                  width: displayW,
                  height: displayH,
                  imageRendering: zoom > 1 ? 'pixelated' : 'auto',
                }}
                aria-hidden
              />
              {brushPreview && brushDiameterCss > 0 ? (
                <div
                  className="pointer-events-none absolute z-[5] rounded-full border border-black/80"
                  style={{
                    left: brushPreview.x - brushDiameterCss / 2,
                    top: brushPreview.y - brushDiameterCss / 2,
                    width: brushDiameterCss,
                    height: brushDiameterCss,
                    background:
                      tool === 'eraser' ? 'rgba(242, 216, 74, 0.28)' : 'rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.85)',
                  }}
                  aria-hidden
                />
              ) : null}

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
        className={`flex shrink-0 items-center gap-1.5 bg-[#c0c0c0] ${isPhone ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}
        style={{ borderTop: '1px solid #fff', borderBottom: '1px solid #808080' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative shrink-0 border border-[#808080] bg-[#c0c0c0] shadow-[inset_1px_1px_0_#fff]"
          style={{ width: fgBgBox, height: fgBgBox }}
        >
          <div
            className="absolute border border-black"
            style={{
              background: bg,
              width: isPhone ? 14 : 16,
              height: isPhone ? 14 : 16,
              left: isPhone ? 14 : 14,
              top: isPhone ? 14 : 14,
            }}
            title="Background"
          />
          <div
            className="absolute z-[1] border border-black"
            style={{
              background: fg,
              width: isPhone ? 14 : 16,
              height: isPhone ? 14 : 16,
              left: isPhone ? 4 : 6,
              top: isPhone ? 4 : 6,
            }}
            title="Foreground"
          />
        </div>
        <div
          className="min-w-0 flex-1 overflow-x-auto"
        >
          <div
            className="grid gap-0 border border-[#808080] bg-[#c0c0c0] p-0.5"
            style={{
              gridTemplateColumns: `repeat(14, ${paletteCell}px)`,
              width: 14 * paletteCell + 4,
            }}
          >
            {DEFAULT_COLORS.map((c, i) => (
              <button
                key={`${c}-${i}`}
                type="button"
                className="border border-[#808080]"
                style={{ background: c, width: paletteCell, height: paletteCell }}
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
        </div>
        <input
          type="color"
          value={fg}
          onChange={(event) => setFg(event.target.value)}
          className={`ml-0.5 cursor-pointer border border-[#808080] bg-[#c0c0c0] ${
            isPhone ? 'h-7 w-8' : 'h-7 w-8'
          }`}
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
