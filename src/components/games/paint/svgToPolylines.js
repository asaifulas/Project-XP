/**
 * Convert simple SVG outline markup into canvas polylines for Edu tracing.
 * Handles path / polyline / polygon / line / rect / circle / ellipse (basic).
 */

/** @typedef {{ x: number, y: number }} Point */

/**
 * @param {string} d
 * @returns {string[]}
 */
function tokenizePath(d) {
  return d
    .replace(/,/g, ' ')
    .replace(/([MmZzLlHhVvCcSsQqTtAa])/g, ' $1 ')
    .trim()
    .split(/[\s]+/)
    .filter(Boolean)
}

/**
 * Sample a cubic bezier.
 * @param {Point} p0
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @param {number} steps
 */
function sampleCubic(p0, p1, p2, p3, steps = 8) {
  /** @type {Point[]} */
  const out = []
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    const u = 1 - t
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    })
  }
  return out
}

/**
 * Sample a quadratic bezier.
 * @param {Point} p0
 * @param {Point} p1
 * @param {Point} p2
 * @param {number} steps
 */
function sampleQuad(p0, p1, p2, steps = 6) {
  /** @type {Point[]} */
  const out = []
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    const u = 1 - t
    out.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    })
  }
  return out
}

/**
 * Parse SVG path `d` into polylines (absolute coords in SVG space).
 * Arc commands are approximated as a straight segment (enough for most clipart).
 * @param {string} d
 * @returns {Point[][]}
 */
export function pathDToPolylines(d) {
  const tokens = tokenizePath(d)
  /** @type {Point[][]} */
  const strokes = []
  /** @type {Point[]} */
  let cur = []
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  let prevCx = 0
  let prevCy = 0
  let i = 0

  const num = () => {
    const v = Number(tokens[i])
    i += 1
    return Number.isFinite(v) ? v : 0
  }

  while (i < tokens.length) {
    const cmd = tokens[i]
    i += 1
    const rel = cmd === cmd.toLowerCase()
    const c = cmd.toUpperCase()

    if (c === 'Z') {
      cur.push({ x: startX, y: startY })
      x = startX
      y = startY
      if (cur.length > 1) strokes.push(cur)
      cur = []
      continue
    }

    if (c === 'M') {
      if (cur.length > 1) strokes.push(cur)
      cur = []
      let first = true
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        const nx = num()
        const ny = num()
        if (rel) {
          x += nx
          y += ny
        } else {
          x = nx
          y = ny
        }
        if (first) {
          startX = x
          startY = y
          first = false
        }
        cur.push({ x, y })
      }
      continue
    }

    if (c === 'L') {
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        const nx = num()
        const ny = num()
        if (rel) {
          x += nx
          y += ny
        } else {
          x = nx
          y = ny
        }
        cur.push({ x, y })
      }
      continue
    }

    if (c === 'H') {
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        const nx = num()
        x = rel ? x + nx : nx
        cur.push({ x, y })
      }
      continue
    }

    if (c === 'V') {
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        const ny = num()
        y = rel ? y + ny : ny
        cur.push({ x, y })
      }
      continue
    }

    if (c === 'C') {
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        let x1 = num()
        let y1 = num()
        let x2 = num()
        let y2 = num()
        let x3 = num()
        let y3 = num()
        if (rel) {
          x1 += x
          y1 += y
          x2 += x
          y2 += y
          x3 += x
          y3 += y
        }
        const p0 = { x, y }
        const pts = sampleCubic(p0, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 })
        for (const p of pts) cur.push(p)
        prevCx = x2
        prevCy = y2
        x = x3
        y = y3
      }
      continue
    }

    if (c === 'S') {
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        let x2 = num()
        let y2 = num()
        let x3 = num()
        let y3 = num()
        if (rel) {
          x2 += x
          y2 += y
          x3 += x
          y3 += y
        }
        const x1 = 2 * x - prevCx
        const y1 = 2 * y - prevCy
        const p0 = { x, y }
        const pts = sampleCubic(p0, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 })
        for (const p of pts) cur.push(p)
        prevCx = x2
        prevCy = y2
        x = x3
        y = y3
      }
      continue
    }

    if (c === 'Q') {
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        let x1 = num()
        let y1 = num()
        let x2 = num()
        let y2 = num()
        if (rel) {
          x1 += x
          y1 += y
          x2 += x
          y2 += y
        }
        const p0 = { x, y }
        const pts = sampleQuad(p0, { x: x1, y: y1 }, { x: x2, y: y2 })
        for (const p of pts) cur.push(p)
        prevCx = x1
        prevCy = y1
        x = x2
        y = y2
      }
      continue
    }

    if (c === 'T') {
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        let x2 = num()
        let y2 = num()
        if (rel) {
          x2 += x
          y2 += y
        }
        const x1 = 2 * x - prevCx
        const y1 = 2 * y - prevCy
        const p0 = { x, y }
        const pts = sampleQuad(p0, { x: x1, y: y1 }, { x: x2, y: y2 })
        for (const p of pts) cur.push(p)
        prevCx = x1
        prevCy = y1
        x = x2
        y = y2
      }
      continue
    }

    if (c === 'A') {
      // Approximate arcs as endpoint lines (clipart outlines rarely need exact arcs for snap).
      while (i < tokens.length && !/^[MmZzLlHhVvCcSsQqTtAa]$/.test(tokens[i])) {
        num()
        num()
        num()
        num()
        num()
        let x2 = num()
        let y2 = num()
        if (rel) {
          x2 += x
          y2 += y
        }
        x = x2
        y = y2
        cur.push({ x, y })
      }
      continue
    }

    // Unknown token — skip
  }

  if (cur.length > 1) strokes.push(cur)
  return strokes
}

/**
 * @param {string} styleOrAttrs
 */
function isWhiteFill(styleOrAttrs) {
  const s = styleOrAttrs.toLowerCase()
  return (
    /fill\s*:\s*#fff(?:fff)?\b/.test(s) ||
    /fill\s*:\s*white\b/.test(s) ||
    /fill\s*=\s*["']#fff(?:fff)?["']/.test(s) ||
    /fill\s*=\s*["']white["']/.test(s)
  )
}

/**
 * @param {string} svg
 * @param {{ skipRects?: boolean, skipWhiteFills?: boolean }} [opts]
 * @returns {Point[][]}
 */
export function svgMarkupToPolylines(svg, opts = {}) {
  const skipRects = opts.skipRects !== false
  const skipWhiteFills = opts.skipWhiteFills !== false
  /** @type {Point[][]} */
  const strokes = []

  const pathRe = /<path\b([^>]*)>/gi
  let m
  while ((m = pathRe.exec(svg))) {
    const attrs = m[1]
    if (skipWhiteFills && isWhiteFill(attrs)) continue
    const dHit = attrs.match(/\bd\s*=\s*["']([^"']+)["']/i)
    if (!dHit) continue
    strokes.push(...pathDToPolylines(dHit[1]))
  }

  const polyRe = /<(polyline|polygon)\b([^>]*)>/gi
  while ((m = polyRe.exec(svg))) {
    const attrs = m[2]
    if (skipWhiteFills && isWhiteFill(attrs)) continue
    const ptsHit = attrs.match(/\bpoints\s*=\s*["']([^"']+)["']/i)
    if (!ptsHit) continue
    const nums = ptsHit[1]
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => Number.isFinite(n))
    /** @type {Point[]} */
    const pts = []
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] })
    if (m[1].toLowerCase() === 'polygon' && pts.length) pts.push({ ...pts[0] })
    if (pts.length > 1) strokes.push(pts)
  }

  const lineRe = /<line\b[^>]*>/gi
  while ((m = lineRe.exec(svg))) {
    const tag = m[0]
    const attr = (name) => {
      const hit = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))
      return hit ? Number(hit[1]) : 0
    }
    strokes.push([
      { x: attr('x1'), y: attr('y1') },
      { x: attr('x2'), y: attr('y2') },
    ])
  }

  if (!skipRects) {
    const rectRe = /<rect\b[^>]*>/gi
    while ((m = rectRe.exec(svg))) {
      const tag = m[0]
      if (skipWhiteFills && isWhiteFill(tag)) continue
      const attr = (name, fallback = 0) => {
        const hit = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))
        return hit ? Number(hit[1]) : fallback
      }
      const x = attr('x')
      const y = attr('y')
      const w = attr('width')
      const h = attr('height')
      if (w > 0 && h > 0) {
        strokes.push([
          { x, y },
          { x: x + w, y },
          { x: x + w, y: y + h },
          { x, y: y + h },
          { x, y },
        ])
      }
    }
  }

  const circleRe = /<(circle|ellipse)\b([^>]*)>/gi
  while ((m = circleRe.exec(svg))) {
    const tag = m[0]
    const kind = m[1]
    if (skipWhiteFills && isWhiteFill(m[2] || tag)) continue
    const attr = (name, fallback = 0) => {
      const hit = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))
      return hit ? Number(hit[1]) : fallback
    }
    const cx = attr('cx')
    const cy = attr('cy')
    const rx = kind.toLowerCase() === 'circle' ? attr('r') : attr('rx')
    const ry = kind.toLowerCase() === 'circle' ? attr('r') : attr('ry')
    if (rx > 0 && ry > 0) {
      /** @type {Point[]} */
      const pts = []
      const steps = 36
      for (let i = 0; i <= steps; i += 1) {
        const t = (i / steps) * Math.PI * 2
        pts.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry })
      }
      strokes.push(pts)
    }
  }

  return strokes.filter((s) => s.length > 1)
}

/**
 * Drop page frames / keep a few long strokes kids can follow (not 50k-point blobs).
 * @param {Point[][]} strokes
 * @param {{ maxStrokes?: number, maxPointsPerStroke?: number }} [opts]
 */
export function simplifyClipartStrokes(strokes, opts = {}) {
  const maxStrokes = opts.maxStrokes ?? 14
  const maxPts = opts.maxPointsPerStroke ?? 72

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const stroke of strokes) {
    for (const p of stroke) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
  }
  const gw = Math.max(1, maxX - minX)
  const gh = Math.max(1, maxY - minY)

  const scoredAll = strokes.map((stroke) => {
    let len = 0
    let sMinX = Infinity
    let sMinY = Infinity
    let sMaxX = -Infinity
    let sMaxY = -Infinity
    for (let i = 0; i < stroke.length; i += 1) {
      const p = stroke[i]
      if (p.x < sMinX) sMinX = p.x
      if (p.y < sMinY) sMinY = p.y
      if (p.x > sMaxX) sMaxX = p.x
      if (p.y > sMaxY) sMaxY = p.y
      if (i > 0) {
        const dx = p.x - stroke[i - 1].x
        const dy = p.y - stroke[i - 1].y
        len += Math.hypot(dx, dy)
      }
    }
    const cover = ((sMaxX - sMinX) / gw) * ((sMaxY - sMinY) / gh)
    return { stroke, len, cover }
  })

  // Drop full-page frames / backgrounds — but keep solid silhouettes
  // (single blob often covers the whole viewBox; cover≈1).
  let scored = scoredAll
    .filter((s) => s.cover < 0.72 && s.len > 8)
    .sort((a, b) => b.len - a.len)
    .slice(0, maxStrokes)

  if (!scored.length && scoredAll.length) {
    scored = scoredAll
      .filter((s) => s.len > 8)
      .sort((a, b) => b.len - a.len)
      .slice(0, Math.min(3, maxStrokes))
  }

  return scored.map(({ stroke }) => {
    if (stroke.length <= maxPts) return stroke
    const step = Math.ceil(stroke.length / maxPts)
    /** @type {Point[]} */
    const out = []
    for (let i = 0; i < stroke.length; i += step) out.push(stroke[i])
    const last = stroke[stroke.length - 1]
    const prev = out[out.length - 1]
    if (!prev || prev.x !== last.x || prev.y !== last.y) out.push(last)
    return out
  })
}

/**
 * Fit SVG-space strokes into a target box (contain).
 * @param {Point[][]} strokes
 * @param {{ x: number, y: number, w: number, h: number }} box
 * @param {number} [padFrac]
 * @returns {Point[][]}
 */
export function fitStrokesToBox(strokes, box, padFrac = 0.06) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const stroke of strokes) {
    for (const p of stroke) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
  }
  const bw = Math.max(1e-6, maxX - minX)
  const bh = Math.max(1e-6, maxY - minY)
  const padX = box.w * padFrac
  const padY = box.h * padFrac
  const availW = box.w - padX * 2
  const availH = box.h - padY * 2
  const scale = Math.min(availW / bw, availH / bh)
  const ox = box.x + padX + (availW - bw * scale) / 2
  const oy = box.y + padY + (availH - bh * scale) / 2

  return strokes.map((stroke) =>
    stroke.map((p) => ({
      x: ox + (p.x - minX) * scale,
      y: oy + (p.y - minY) * scale,
    })),
  )
}
