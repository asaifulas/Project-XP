import { getBallKind } from './balls.js'
import { flipperSegment } from './physics.js'
import { CAP, SC } from './palette.js'
import { TABLE_H, TABLE_W, batSegment } from './table.js'

/** Deterministic grain (no Math.random in draw). */
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Space Cadet materials (Microsoft XP palette) on our altered layout.
 */
export function drawTable(canvas, layout, state) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = TABLE_W
  const H = TABLE_H
  const decor = layout.decor

  drawCabinet(ctx, W, H)
  drawPlayfield(ctx, W, H)
  drawFieldTexture(ctx, W, H)
  drawMissionRing(ctx, decor.mission)
  drawWormholes(ctx, decor.wormholes)
  drawPurpleRamp(ctx, decor.ramp)
  drawLaunchPlatform(ctx)
  drawRails(ctx, layout)
  drawPlungeLane(ctx, layout)
  drawSlingshots(ctx, H)
  drawLaneLights(ctx, decor.laneLights, state.flash)
  drawArrows(ctx, decor.arrows)
  drawApronStar(ctx, W, H)
  if (layout.kicker) drawKicker(ctx, layout.kicker, state.kicker)

  const bumpers = state.bumpers ?? layout.bumpers
  for (const bumper of bumpers) {
    if (bumper.bat) drawBat(ctx, bumper)
    drawBumper(ctx, bumper, state.flash)
  }

  drawFlipper(ctx, flipperSegment(layout.leftFlipper, 'left', state.left))
  drawFlipper(ctx, flipperSegment(layout.rightFlipper, 'right', state.right))
  drawPlunger(ctx, layout, state)
  drawBall(ctx, state.ball)
  drawFx(ctx, state.fx)

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(252, 248, 80, ${Math.min(0.28, state.flash * 1.8)})`
    ctx.fillRect(12, 12, W - 24, H - 36)
  }

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(24, H * 0.34, W - 48, 78)
    ctx.strokeStyle = SC.missionBlue
    ctx.lineWidth = 2
    ctx.strokeRect(24, H * 0.34, W - 48, 78)
    ctx.fillStyle = SC.led
    ctx.font = 'bold 18px "XP Tahoma", Tahoma, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', W / 2, H * 0.34 + 34)
    ctx.font = '12px "XP Tahoma", Tahoma, sans-serif'
    ctx.fillStyle = SC.status
    ctx.fillText(`Score ${String(state.score).padStart(6, '0')}`, W / 2, H * 0.34 + 56)
  }
}

function drawCabinet(ctx, W, H) {
  // Grey metal outer rim (XP side-panel bevel language)
  const metal = ctx.createLinearGradient(0, 0, W, H)
  metal.addColorStop(0, SC.metalMid)
  metal.addColorStop(0.35, SC.metal)
  metal.addColorStop(0.7, SC.metalDark)
  metal.addColorStop(1, SC.metalDeep)
  ctx.fillStyle = metal
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = SC.bevelHi
  ctx.lineWidth = 2
  ctx.strokeRect(2, 2, W - 4, H - 4)
  ctx.strokeStyle = SC.bevelLo
  ctx.lineWidth = 2
  ctx.strokeRect(6, 6, W - 12, H - 12)

  // Black mat under glass
  ctx.fillStyle = SC.void
  ctx.fillRect(10, 10, W - 20, H - 32)
}

function drawPlayfield(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 14, 0, H - 28)
  g.addColorStop(0, SC.fieldDeep)
  g.addColorStop(0.28, SC.field)
  g.addColorStop(0.55, SC.fieldMid)
  g.addColorStop(0.82, SC.field)
  g.addColorStop(1, SC.fieldEdge)
  ctx.fillStyle = g
  ctx.fillRect(12, 12, W - 24, H - 36)

  // Depth falloff toward top (camera looking up-table)
  const depth = ctx.createLinearGradient(0, 14, 0, H * 0.5)
  depth.addColorStop(0, 'rgba(0,0,0,0.4)')
  depth.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = depth
  ctx.fillRect(12, 12, W - 24, H * 0.48)
}

function drawFieldTexture(ctx, W, H) {
  // Faint lightning / cracked-ice veins (XP playfield)
  ctx.strokeStyle = 'rgba(80, 100, 150, 0.14)'
  ctx.lineWidth = 1
  for (let i = 0; i < 18; i += 1) {
    const x0 = 20 + hash(i * 9.1) * (W - 50)
    const y0 = 40 + hash(i * 11.3) * (H - 120)
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x0 + (hash(i * 13) - 0.5) * 55, y0 + 18 + hash(i * 17) * 45)
    ctx.lineTo(x0 + (hash(i * 19) - 0.5) * 40, y0 + 40 + hash(i * 23) * 30)
    ctx.stroke()
  }
  // Sparse stars
  for (let i = 0; i < 70; i += 1) {
    const x = 18 + hash(i * 3.1) * (W - 36)
    const y = 22 + hash(i * 7.7) * (H - 90)
    const a = 0.2 + hash(i * 1.9) * 0.55
    ctx.fillStyle = `rgba(200, 210, 230, ${a})`
    ctx.fillRect(x, y, 1 + hash(i) * 1.2, 1 + hash(i * 2) * 1.2)
  }
}

function drawMissionRing(ctx, mission) {
  if (!mission) return
  const { x, y, r } = mission

  const crater = ctx.createRadialGradient(x - 8, y - 10, 4, x, y, r)
  crater.addColorStop(0, SC.holeRim)
  crater.addColorStop(0.5, SC.hole)
  crater.addColorStop(1, SC.fieldDeep)
  ctx.fillStyle = crater
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  // Soft cyan glow (XP black-hole / mission array)
  const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 1.15)
  glow.addColorStop(0, 'rgba(83, 166, 204, 0.2)')
  glow.addColorStop(1, 'rgba(83, 166, 204, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, r * 1.15, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = SC.holeRim
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()

  // Yellow perimeter lights (classic mission ring)
  const n = 14
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const lx = x + Math.cos(a) * (r - 5)
    const ly = y + Math.sin(a) * (r - 5)
    const on = i % 4 !== 2
    ctx.fillStyle = on ? SC.yellow : SC.yellowDim
    ctx.shadowColor = on ? SC.yellowHot : 'transparent'
    ctx.shadowBlur = on ? 5 : 0
    ctx.beginPath()
    ctx.arc(lx, ly, 2.8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.shadowBlur = 0

  // Center core
  const core = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 9)
  core.addColorStop(0, '#ffffff')
  core.addColorStop(0.35, SC.redHot)
  core.addColorStop(1, SC.redDim)
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(x, y, 8, 0, Math.PI * 2)
  ctx.fill()
}

function drawWormholes(ctx, holes) {
  for (const h of holes ?? []) {
    const g = ctx.createRadialGradient(h.x - 3, h.y - 3, 1, h.x, h.y, h.r)
    g.addColorStop(0, SC.purpleBright)
    g.addColorStop(0.4, h.hue || SC.purpleDark)
    g.addColorStop(1, SC.fieldDeep)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = SC.purpleLite
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function drawPurpleRamp(ctx, ramp) {
  if (!ramp?.points?.length) return
  const pts = ramp.points
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()

  const fill = ctx.createLinearGradient(30, 110, 90, 400)
  fill.addColorStop(0, SC.purpleLite)
  fill.addColorStop(0.45, SC.purple)
  fill.addColorStop(1, SC.purpleDark)
  ctx.globalAlpha = 0.92
  ctx.fillStyle = fill
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = SC.purpleBright
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Chevron arrows on ramp (XP purple ramp detail)
  ctx.strokeStyle = 'rgba(192, 164, 236, 0.55)'
  ctx.lineWidth = 2
  for (let t = 0.2; t < 0.85; t += 0.18) {
    const i = Math.floor(t * (pts.length - 1))
    const [x, y] = pts[Math.min(i, pts.length - 1)]
    ctx.beginPath()
    ctx.moveTo(x + 4, y - 4)
    ctx.lineTo(x + 10, y + 2)
    ctx.lineTo(x + 4, y + 8)
    ctx.stroke()
  }
  ctx.restore()
}

function drawLaunchPlatform(ctx) {
  ctx.beginPath()
  ctx.moveTo(18, 318)
  ctx.lineTo(112, 318)
  ctx.lineTo(112, 378)
  ctx.lineTo(18, 408)
  ctx.closePath()
  const plat = ctx.createLinearGradient(18, 318, 18, 408)
  plat.addColorStop(0, SC.purple)
  plat.addColorStop(1, SC.purpleDark)
  ctx.globalAlpha = 0.88
  ctx.fillStyle = plat
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = SC.purpleBright
  ctx.lineWidth = 1.5
  ctx.stroke()
}

function drawRails(ctx, layout) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = SC.rail
  ctx.lineWidth = 4.5
  ctx.shadowColor = 'rgba(160, 180, 200, 0.25)'
  ctx.shadowBlur = 3
  for (const wall of layout.walls) {
    if (wall.kind === 'shelf') continue
    ctx.beginPath()
    ctx.moveTo(wall.ax, wall.ay)
    ctx.lineTo(wall.bx, wall.by)
    ctx.stroke()
  }
  ctx.shadowBlur = 0

  ctx.strokeStyle = SC.railHi
  ctx.lineWidth = 1.25
  for (const wall of layout.walls) {
    if (wall.kind === 'shelf') continue
    ctx.beginPath()
    ctx.moveTo(wall.ax, wall.ay)
    ctx.lineTo(wall.bx, wall.by)
    ctx.stroke()
  }

  ctx.strokeStyle = SC.purpleLite
  ctx.lineWidth = 2
  for (const wall of layout.walls) {
    if (wall.kind !== 'shelf') continue
    ctx.beginPath()
    ctx.moveTo(wall.ax, wall.ay)
    ctx.lineTo(wall.bx, wall.by)
    ctx.stroke()
  }
}

function drawPlungeLane(ctx, layout) {
  const x = layout.plunge.x
  const top = 78
  const bottom = layout.plunge.yMax + 4
  const lane = ctx.createLinearGradient(x - 14, 0, x + 14, 0)
  lane.addColorStop(0, SC.chuteDark)
  lane.addColorStop(0.18, SC.chute)
  lane.addColorStop(0.5, '#2a1810')
  lane.addColorStop(0.82, SC.chuteMid)
  lane.addColorStop(1, SC.chuteDark)
  ctx.fillStyle = lane
  ctx.fillRect(x - 14, top, 28, bottom - top)

  ctx.strokeStyle = 'rgba(168, 104, 80, 0.35)'
  ctx.lineWidth = 1
  for (let y = top + 10; y < bottom; y += 16) {
    ctx.beginPath()
    ctx.moveTo(x - 11, y)
    ctx.lineTo(x + 11, y + 2)
    ctx.stroke()
  }

  ctx.strokeStyle = SC.chuteEdge
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 14, top)
  ctx.lineTo(x - 14, bottom)
  ctx.moveTo(x + 14, top)
  ctx.lineTo(x + 14, bottom)
  ctx.stroke()
}

function drawSlingshots(ctx, H) {
  function wedge(ax, ay, bx, by, cx, cy) {
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.lineTo(cx, cy)
    ctx.closePath()
    const g = ctx.createLinearGradient(ax, ay, bx, by)
    g.addColorStop(0, 'rgba(90, 100, 130, 0.5)')
    g.addColorStop(1, 'rgba(30, 36, 56, 0.65)')
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = SC.railDark
    ctx.lineWidth = 1
    ctx.stroke()
  }
  wedge(70, H - 200, 105, H - 160, 70, H - 130)
  wedge(TABLE_W - 118, H - 200, TABLE_W - 153, H - 160, TABLE_W - 118, H - 130)

  ctx.strokeStyle = SC.yellow
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.shadowColor = SC.yellowHot
  ctx.shadowBlur = 4
  ctx.beginPath()
  ctx.moveTo(78, H - 188)
  ctx.lineTo(98, H - 158)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(TABLE_W - 126, H - 188)
  ctx.lineTo(TABLE_W - 146, H - 158)
  ctx.stroke()
  ctx.shadowBlur = 0
}

function drawLaneLights(ctx, lights, flash) {
  for (const light of lights ?? []) {
    const on = light.on || flash > 0.08
    const g = ctx.createRadialGradient(light.x, light.y, 0.5, light.x, light.y, 6)
    g.addColorStop(0, on ? SC.yellowHot : SC.yellowDim)
    g.addColorStop(0.45, on ? SC.redHot : SC.redDim)
    g.addColorStop(1, 'rgba(80, 0, 0, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(light.x, light.y, 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawArrows(ctx, arrows) {
  for (const a of arrows ?? []) {
    ctx.save()
    ctx.translate(a.x, a.y)
    ctx.rotate(a.rot)
    ctx.fillStyle = SC.yellow
    ctx.shadowColor = SC.yellowHot
    ctx.shadowBlur = 4
    ctx.beginPath()
    ctx.moveTo(0, -7)
    ctx.lineTo(5, 5)
    ctx.lineTo(0, 2)
    ctx.lineTo(-5, 5)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()
  }
}

function drawApronStar(ctx, W, H) {
  // Purple 8-point star behind flippers (XP apron)
  const cx = W * 0.44
  const cy = H - 92
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? 62 : 28
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r * 0.55
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 70)
  g.addColorStop(0, SC.purpleStar)
  g.addColorStop(0.55, SC.purpleStarDeep)
  g.addColorStop(1, 'rgba(84, 56, 104, 0)')
  ctx.globalAlpha = 0.55
  ctx.fillStyle = g
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = 'rgba(168, 136, 200, 0.35)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

/** Spinning baseball-bat arm around a bumper hub. */
function drawBat(ctx, bumper) {
  const seg = batSegment(bumper)
  if (!seg) return
  const dx = seg.bx - seg.ax
  const dy = seg.by - seg.ay
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const hw = (bumper.bat.halfWidth ?? 5) * 0.9

  // Handle (near hub) — darker wood
  const handleLen = len * 0.38
  ctx.beginPath()
  ctx.moveTo(seg.ax + nx * (hw * 0.55), seg.ay + ny * (hw * 0.55))
  ctx.lineTo(seg.ax + ux * handleLen + nx * (hw * 0.55), seg.ay + uy * handleLen + ny * (hw * 0.55))
  ctx.lineTo(seg.ax + ux * handleLen - nx * (hw * 0.55), seg.ay + uy * handleLen - ny * (hw * 0.55))
  ctx.lineTo(seg.ax - nx * (hw * 0.55), seg.ay - ny * (hw * 0.55))
  ctx.closePath()
  ctx.fillStyle = '#5a3820'
  ctx.fill()
  ctx.strokeStyle = '#3a2410'
  ctx.lineWidth = 1
  ctx.stroke()

  // Barrel (tip) — lighter wood, wider
  const barrelHw = hw * 1.35
  ctx.beginPath()
  ctx.moveTo(seg.ax + ux * handleLen + nx * hw, seg.ay + uy * handleLen + ny * hw)
  ctx.lineTo(seg.bx + nx * barrelHw, seg.by + ny * barrelHw)
  ctx.lineTo(seg.bx - nx * barrelHw, seg.by - ny * barrelHw)
  ctx.lineTo(seg.ax + ux * handleLen - nx * hw, seg.ay + uy * handleLen - ny * hw)
  ctx.closePath()
  const wood = ctx.createLinearGradient(seg.ax, seg.ay, seg.bx, seg.by)
  wood.addColorStop(0, '#c89048')
  wood.addColorStop(0.5, '#e8b86a')
  wood.addColorStop(1, '#a87038')
  ctx.fillStyle = wood
  ctx.fill()
  ctx.strokeStyle = '#6a4420'
  ctx.lineWidth = 1
  ctx.stroke()

  // Tip cap
  ctx.fillStyle = '#d8c8a0'
  ctx.beginPath()
  ctx.arc(seg.bx, seg.by, barrelHw * 0.85, 0, Math.PI * 2)
  ctx.fill()

  // Motion blur hint (ghost trail opposite spin)
  const trail = bumper.batAngle - Math.sign(bumper.bat.spinSpeed || 1) * 0.35
  const hub = bumper.r + 3
  const tip = hub + bumper.bat.length
  ctx.globalAlpha = 0.22
  ctx.strokeStyle = '#e8b86a'
  ctx.lineWidth = hw * 1.6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(bumper.x + Math.cos(trail) * hub, bumper.y + Math.sin(trail) * hub)
  ctx.lineTo(bumper.x + Math.cos(trail) * tip, bumper.y + Math.sin(trail) * tip)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.lineCap = 'butt'
}

function drawBumper(ctx, bumper, flash) {
  const { x, y, r } = bumper
  const cap = CAP[bumper.cap] ?? CAP.red
  const lit = flash > 0.05

  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath()
  ctx.ellipse(x + 2, y + r * 0.7, r * 1.05, r * 0.38, 0, 0, Math.PI * 2)
  ctx.fill()

  // Yellow skirt (XP bumper base)
  const skirt = ctx.createLinearGradient(x - r, y + r * 0.15, x + r, y + r * 0.15)
  skirt.addColorStop(0, SC.bumperBaseDark)
  skirt.addColorStop(0.5, SC.bumperBase)
  skirt.addColorStop(1, SC.bumperBaseDark)
  ctx.fillStyle = skirt
  ctx.beginPath()
  ctx.ellipse(x, y + r * 0.4, r * 0.98, r * 0.36, 0, 0, Math.PI * 2)
  ctx.fill()

  // White dome
  const body = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, 1, x, y, r)
  body.addColorStop(0, SC.bumperHi)
  body.addColorStop(0.45, SC.bumperWhite)
  body.addColorStop(0.8, SC.bumperShade)
  body.addColorStop(1, '#786858')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.arc(x, y - 1, r, 0, Math.PI * 2)
  ctx.fill()

  // Red / white stripe band
  ctx.strokeStyle = lit ? '#ffffff' : SC.capRed
  ctx.lineWidth = Math.max(2.2, r * 0.16)
  ctx.beginPath()
  ctx.arc(x, y - 1, r * 0.78, 0.2, Math.PI - 0.2)
  ctx.stroke()
  ctx.strokeStyle = lit ? SC.capRedMid : SC.bumperHi
  ctx.lineWidth = Math.max(1.4, r * 0.09)
  ctx.beginPath()
  ctx.arc(x, y - 1, r * 0.78, Math.PI + 0.2, Math.PI * 2 - 0.2)
  ctx.stroke()

  // Colored light on top
  const topR = r * 0.5
  const top = ctx.createRadialGradient(x - 2, y - r * 0.5, 1, x, y - r * 0.25, topR)
  top.addColorStop(0, lit ? '#ffffff' : cap.core)
  top.addColorStop(0.4, cap.mid)
  top.addColorStop(1, cap.rim)
  ctx.fillStyle = top
  ctx.shadowColor = lit ? cap.mid : 'transparent'
  ctx.shadowBlur = lit ? 8 : 0
  ctx.beginPath()
  ctx.arc(x, y - r * 0.28, topR, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(x, y - 1, r, 0, Math.PI * 2)
  ctx.stroke()
}

function drawFlipper(ctx, seg) {
  const dx = seg.bx - seg.ax
  const dy = seg.by - seg.ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const half = 5.5

  // White bat
  ctx.beginPath()
  ctx.moveTo(seg.ax + nx * half, seg.ay + ny * half)
  ctx.lineTo(seg.bx + nx * 2.2, seg.by + ny * 2.2)
  ctx.lineTo(seg.bx - nx * 2.2, seg.by - ny * 2.2)
  ctx.lineTo(seg.ax - nx * half, seg.ay - ny * half)
  ctx.closePath()
  const bat = ctx.createLinearGradient(seg.ax, seg.ay, seg.bx, seg.by)
  bat.addColorStop(0, SC.flipper)
  bat.addColorStop(0.5, SC.flipperMid)
  bat.addColorStop(1, SC.flipperDark)
  ctx.fillStyle = bat
  ctx.fill()
  ctx.strokeStyle = SC.railDark
  ctx.lineWidth = 1
  ctx.stroke()

  // Red rubber tip (XP flippers)
  const tipX = seg.bx
  const tipY = seg.by
  const tip = ctx.createRadialGradient(tipX - 1, tipY - 1, 0.5, tipX, tipY, 5)
  tip.addColorStop(0, SC.flipperTipHot)
  tip.addColorStop(0.55, SC.flipperTip)
  tip.addColorStop(1, SC.redDim)
  ctx.fillStyle = tip
  ctx.beginPath()
  ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2)
  ctx.fill()

  // Pivot
  const root = ctx.createRadialGradient(seg.ax - 1, seg.ay - 1, 1, seg.ax, seg.ay, 7)
  root.addColorStop(0, '#f0a0b0')
  root.addColorStop(0.45, SC.flipperPivot)
  root.addColorStop(1, SC.redDim)
  ctx.fillStyle = root
  ctx.beginPath()
  ctx.arc(seg.ax, seg.ay, 6.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawKicker(ctx, kicker, kickerState) {
  const lit = Boolean(kickerState?.active)
  const g = ctx.createRadialGradient(kicker.x - 3, kicker.y - 3, 1, kicker.x, kicker.y, kicker.r + 4)
  g.addColorStop(0, lit ? SC.yellowHot : SC.purpleLite)
  g.addColorStop(0.45, lit ? SC.yellow : SC.purpleDark)
  g.addColorStop(1, SC.fieldDeep)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(kicker.x, kicker.y, kicker.r + 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = lit ? SC.yellow : SC.purpleBright
  ctx.lineWidth = 2
  ctx.stroke()
  // Inner cup
  ctx.fillStyle = SC.void
  ctx.beginPath()
  ctx.arc(kicker.x, kicker.y, kicker.r * 0.55, 0, Math.PI * 2)
  ctx.fill()
}

function drawPlunger(ctx, layout, state) {
  // Spring stays at rest / charge pull only — does not track the ball
  const x = layout.plunge.x
  const yMax = layout.plunge.yMax
  const charge = state.ball.inLane ? state.plungeCharge ?? 0 : 0
  const pull = charge * 30
  const tipY = yMax + 2 + pull
  const knobY = yMax + 44 + pull

  ctx.strokeStyle = SC.metal
  ctx.lineWidth = 1.5
  const coils = 6 + Math.round(charge * 3)
  for (let i = 0; i < coils; i += 1) {
    const y = tipY + 4 + i * (5 - charge)
    ctx.beginPath()
    ctx.moveTo(x - 5, y)
    ctx.lineTo(x + 5, y + 2)
    ctx.stroke()
  }

  const shaft = ctx.createLinearGradient(x - 3, 0, x + 3, 0)
  shaft.addColorStop(0, SC.metalDark)
  shaft.addColorStop(0.5, SC.metalLite)
  shaft.addColorStop(1, SC.metalDark)
  ctx.fillStyle = shaft
  ctx.fillRect(x - 2.5, tipY, 5, 42 + pull)

  const knob = ctx.createRadialGradient(x - 2, knobY - 4, 1, x, knobY, 8)
  knob.addColorStop(0, charge >= 1 ? SC.yellowHot : SC.flipperTipHot)
  knob.addColorStop(0.5, charge >= 1 ? SC.yellow : SC.red)
  knob.addColorStop(1, SC.redDim)
  ctx.fillStyle = knob
  ctx.beginPath()
  ctx.arc(x, knobY, 7, 0, Math.PI * 2)
  ctx.fill()
}

function drawBall(ctx, ball) {
  const colors = getBallKind(ball.kind).colors
  const pending = Boolean(ball.pendingBounce)

  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.beginPath()
  ctx.ellipse(ball.x + 1.5, ball.y + ball.r * 0.7, ball.r * 0.85, ball.r * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()

  // Kind aura
  if (ball.kind === 'magnetic') {
    const aura = ctx.createRadialGradient(ball.x, ball.y, ball.r, ball.x, ball.y, ball.r + 14)
    aura.addColorStop(0, 'rgba(176, 96, 232, 0.35)')
    aura.addColorStop(1, 'rgba(176, 96, 232, 0)')
    ctx.fillStyle = aura
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.r + 14, 0, Math.PI * 2)
    ctx.fill()
  } else if (ball.kind === 'explosive') {
    const aura = ctx.createRadialGradient(ball.x, ball.y, ball.r * 0.5, ball.x, ball.y, ball.r + 10)
    aura.addColorStop(0, 'rgba(255, 112, 48, 0.4)')
    aura.addColorStop(1, 'rgba(255, 80, 20, 0)')
    ctx.fillStyle = aura
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.r + 10, 0, Math.PI * 2)
    ctx.fill()
  } else if (ball.kind === 'kinetic' && pending) {
    ctx.strokeStyle = 'rgba(64, 208, 216, 0.7)'
    ctx.lineWidth = 2
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.r + 5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const g = ctx.createRadialGradient(ball.x - 2.5, ball.y - 2.5, 0.8, ball.x, ball.y, ball.r)
  g.addColorStop(0, colors.hi)
  g.addColorStop(0.4, colors.mid)
  g.addColorStop(0.8, colors.dark)
  g.addColorStop(1, colors.rim)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
  ctx.fill()

  // Crack marks on “broken” balls
  if (ball.kind !== 'normal') {
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(ball.x - 3, ball.y - 2)
    ctx.lineTo(ball.x + 1, ball.y + 1)
    ctx.lineTo(ball.x + 3, ball.y - 3)
    ctx.stroke()
  }
}

function drawFx(ctx, fxList) {
  if (!fxList?.length) return
  for (const fx of fxList) {
    const t = Math.max(0, fx.life ?? 0)
    const a = Math.min(1, t * 4)
    if (fx.type === 'explosion') {
      const r = 8 + (0.3 - Math.min(0.3, t)) * 80
      const g = ctx.createRadialGradient(fx.x, fx.y, 2, fx.x, fx.y, r)
      g.addColorStop(0, `rgba(255, 240, 160, ${a})`)
      g.addColorStop(0.4, `rgba(255, 100, 40, ${a * 0.7})`)
      g.addColorStop(1, 'rgba(80, 0, 0, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2)
      ctx.fill()
    } else if (fx.type === 'kinetic') {
      ctx.strokeStyle = `rgba(64, 220, 230, ${a})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(fx.x, fx.y, 10 + (0.2 - Math.min(0.2, t)) * 30, 0, Math.PI * 2)
      ctx.stroke()
    } else if (fx.type === 'magnetic') {
      ctx.strokeStyle = `rgba(180, 100, 240, ${a * 0.6})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(fx.x, fx.y, 12, 0, Math.PI * 2)
      ctx.stroke()
    } else if (fx.type === 'morph') {
      const colors = getBallKind(fx.kind).colors
      const r = 6 + (0.45 - Math.min(0.45, t)) * 50
      ctx.strokeStyle = colors.mid
      ctx.globalAlpha = a
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = colors.hi
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(fx.x, fx.y, r * 0.55, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }
}
