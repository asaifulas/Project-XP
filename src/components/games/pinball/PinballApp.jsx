import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GameControlPad from '../_shared/GameControlPad'
import usePhoneGameLayout from '../_shared/usePhoneGameLayout'
import {
  BALL_MORPH,
  getBallKind,
  morphBall,
  pickBallKind,
  pickDifferentBallKind,
  scheduleNextMorph,
} from './balls.js'
import { createInitialBall, plungeBall, stepPinball, updateFlipperAngle } from './physics.js'
import { SC } from './palette.js'
import { drawTable } from './render.js'
import { FLIPPER, TABLE_H, TABLE_W, createTableLayout, liveBumpers } from './table.js'

const MAX_BALLS = 3
const FIXED_DT = 1 / 120

function formatScore(n) {
  return String(n).padStart(6, '0')
}

/**
 * Space Cadet–inspired pinball. Keyboard optional; in-game pads required on phone.
 *
 * @param {{ keyboardActive?: boolean }} props
 */
export default function PinballApp({ keyboardActive = true }) {
  const isPhone = usePhoneGameLayout()
  const layout = useMemo(() => createTableLayout(), [])
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const keysRef = useRef({ left: false, right: false, plunge: false })

  const [score, setScore] = useState(0)
  const [ballsLeft, setBallsLeft] = useState(MAX_BALLS)
  const [status, setStatus] = useState('Hold Plunge to charge, release to launch')
  const [gameOver, setGameOver] = useState(false)
  const [ballKind, setBallKind] = useState('normal')

  const spawnBall = useCallback(() => {
    const kind = pickBallKind()
    const ball = createInitialBall(layout.ballStart, kind)
    const def = getBallKind(kind)
    return { ball, def }
  }, [layout])

  const newGame = useCallback(() => {
    const { ball, def } = spawnBall()
    stateRef.current = {
      ball,
      left: FLIPPER.restAngle,
      right: FLIPPER.restAngle,
      score: def.spawnBonus,
      ballsLeft: MAX_BALLS,
      gameOver: false,
      flash: 0,
      time: 0,
      plungeCharge: 0,
      plungeWasHeld: false,
      bumpers: liveBumpers(layout.bumpers, 0),
      kicker: { hold: 0, cooldown: 0, active: false },
      fx: [],
      morphIn: scheduleNextMorph(),
    }
    keysRef.current.plunge = false
    setScore(def.spawnBonus)
    setBallsLeft(MAX_BALLS)
    setGameOver(false)
    setBallKind(def.id)
    setStatus(
      def.id === 'normal'
        ? 'Hold Plunge to charge, release to launch'
        : `${def.label} ball! +${def.spawnBonus} · Hold Plunge`,
    )
  }, [layout, spawnBall])

  useEffect(() => {
    newGame()
  }, [newGame])

  const setLeft = useCallback((pressed) => {
    keysRef.current.left = pressed
  }, [])

  const setRight = useCallback((pressed) => {
    keysRef.current.right = pressed
  }, [])

  const setPlunge = useCallback((pressed) => {
    keysRef.current.plunge = pressed
  }, [])

  useEffect(() => {
    if (!keyboardActive) return undefined

    function onKeyDown(event) {
      if (event.repeat) return
      const key = event.key.toLowerCase()
      if (key === 'z' || key === 'arrowleft') {
        event.preventDefault()
        setLeft(true)
      } else if (key === '/' || key === 'arrowright' || key === 'x') {
        event.preventDefault()
        setRight(true)
      } else if (key === ' ' || key === 'enter') {
        event.preventDefault()
        setPlunge(true)
      } else if (key === 'n') {
        newGame()
      }
    }

    function onKeyUp(event) {
      const key = event.key.toLowerCase()
      if (key === 'z' || key === 'arrowleft') setLeft(false)
      if (key === '/' || key === 'arrowright' || key === 'x') setRight(false)
      if (key === ' ' || key === 'enter') setPlunge(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [keyboardActive, newGame, setLeft, setRight, setPlunge])

  useEffect(() => {
    let raf = 0
    let acc = 0
    let last = performance.now()
    const chargeTime = layout.plunge.chargeTime ?? 1

    function frame(now) {
      raf = requestAnimationFrame(frame)
      const state = stateRef.current
      const canvas = canvasRef.current
      if (!state || !canvas) return

      const elapsed = Math.min(0.05, (now - last) / 1000)
      last = now
      acc += elapsed

      const pressed = {
        leftPressed: keysRef.current.left,
        rightPressed: keysRef.current.right,
      }
      const plungeHeld = keysRef.current.plunge

      while (acc >= FIXED_DT) {
        acc -= FIXED_DT
        if (state.gameOver) break

        state.time += FIXED_DT
        state.bumpers = liveBumpers(layout.bumpers, state.time)
        state.left = updateFlipperAngle(state.left, pressed.leftPressed, FIXED_DT)
        state.right = updateFlipperAngle(state.right, pressed.rightPressed, FIXED_DT)

        // Mid-play morph — only while live on table, slow cadence
        if (
          typeof state.morphIn === 'number' &&
          !state.ball.inLane &&
          !state.kicker?.active
        ) {
          state.morphIn -= FIXED_DT
          if (state.morphIn <= 0) {
            const nextKind = pickDifferentBallKind(state.ball.kind)
            const def = getBallKind(nextKind)
            state.ball = morphBall(state.ball, nextKind)
            state.morphIn = scheduleNextMorph()
            state.score += BALL_MORPH.bonus
            setScore(state.score)
            setBallKind(nextKind)
            state.fx = [
              ...(state.fx ?? []),
              { type: 'morph', x: state.ball.x, y: state.ball.y, life: 0.45, kind: nextKind },
            ]
            setStatus(`Morphed → ${def.label}! +${BALL_MORPH.bonus}`)
          }
        }

        // Charge plunge while held (ball in lane only); release launches
        if (plungeHeld && state.ball.inLane) {
          state.plungeCharge = Math.min(1, state.plungeCharge + FIXED_DT / chargeTime)
          state.plungeWasHeld = true
          // Pull ball back with the plunger
          state.ball = {
            ...state.ball,
            y: layout.ballStart.y + state.plungeCharge * 26,
            vx: 0,
            vy: 0,
          }
          const bucket = Math.floor(state.plungeCharge * 10)
          if (state._chargeBucket !== bucket) {
            state._chargeBucket = bucket
            setStatus(state.plungeCharge >= 1 ? 'MAX — release!' : `Charging ${bucket * 10}%`)
          }
        } else if (state.plungeWasHeld && state.ball.inLane) {
          const power = state.plungeCharge
          state.ball = plungeBall(state.ball, layout, power)
          state.plungeCharge = 0
          state.plungeWasHeld = false
          state._chargeBucket = -1
          setStatus(power >= 0.85 ? 'Full power!' : 'Flip!')
        } else if (!plungeHeld) {
          state.plungeWasHeld = false
          if (state.plungeCharge > 0 && !state.ball.inLane) state.plungeCharge = 0
        }

        const result = stepPinball(
          state.ball,
          {
            left: state.left,
            right: state.right,
            leftPressed: pressed.leftPressed,
            rightPressed: pressed.rightPressed,
          },
          layout,
          FIXED_DT,
          state.kicker,
          state.bumpers,
        )
        state.ball = result.ball
        state.kicker = result.kicker
        if (result.fx?.length) {
          state.fx = [...(state.fx ?? []), ...result.fx]
        }
        if (state.fx?.length) {
          state.fx = state.fx
            .map((f) => ({ ...f, life: f.life - FIXED_DT }))
            .filter((f) => f.life > 0)
        }
        if (result.scored) {
          state.score += result.scored
          state.flash = 0.15
          setScore(state.score)
          if (result.kicker && !result.kicker.active && state.kicker.cooldown > 0) {
            setStatus('Auto-eject!')
          }
        }
        if (state.flash > 0) state.flash -= FIXED_DT

        if (result.drained) {
          const remaining = state.ballsLeft - 1
          state.ballsLeft = remaining
          setBallsLeft(remaining)
          state.plungeCharge = 0
          state.plungeWasHeld = false
          keysRef.current.plunge = false
          if (remaining <= 0) {
            state.gameOver = true
            setGameOver(true)
            setStatus('Game over — New Game to retry')
          } else {
            const { ball, def } = spawnBall()
            state.ball = ball
            state.fx = []
            state.morphIn = scheduleNextMorph()
            if (def.spawnBonus) {
              state.score += def.spawnBonus
              setScore(state.score)
            }
            setBallKind(def.id)
            setStatus(
              def.id === 'normal'
                ? `Ball drained · ${remaining} left · Hold Plunge`
                : `${def.label}! +${def.spawnBonus} · ${remaining} left`,
            )
          }
        }
      }

      drawTable(canvas, layout, state)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [layout, spawnBall])

  return (
    <div
      className="flex min-h-0 flex-1 flex-col font-xp text-[11px] text-black"
      style={{ background: SC.metalDark }}
    >
      {/* Side-panel readout colors match XP Space Cadet HUD */}
      <div
        className="flex shrink-0 items-stretch gap-2 border-b p-1.5"
        style={{
          background: `linear-gradient(180deg, ${SC.metal} 0%, ${SC.metalMid} 45%, ${SC.metalDark} 100%)`,
          borderColor: SC.void,
          boxShadow: `inset 0 1px 0 ${SC.bevelHi}`,
        }}
      >
        <div
          className="hidden w-[52px] shrink-0 flex-col items-center justify-center sm:flex"
          aria-hidden
          title="Space Cadet"
          style={{
            background: SC.panelInset,
            border: `1px solid ${SC.void}`,
            boxShadow: `inset 1px 1px 0 ${SC.bevelLo}, inset -1px -1px 0 ${SC.metalMid}`,
          }}
        >
          <span className="text-[8px] font-bold leading-none" style={{ color: SC.purpleTitle }}>
            3D
          </span>
          <svg width="22" height="18" viewBox="0 0 22 18" className="mt-0.5">
            <ellipse cx="11" cy="11" rx="8" ry="5" fill={SC.metalMid} />
            <circle cx="11" cy="8" r="5.5" fill={SC.purpleTitle} stroke={SC.purpleDark} strokeWidth="1" />
            <ellipse cx="11" cy="8" rx="3.2" ry="2.4" fill={SC.missionBlueHot} opacity="0.9" />
            <circle cx="9.5" cy="7.5" r="0.7" fill="#fff" />
          </svg>
          <span className="mt-0.5 text-[7px] font-bold tracking-wide" style={{ color: SC.purpleBright }}>
            CADET
          </span>
        </div>
        <div
          className="flex min-w-0 flex-1 flex-col justify-center px-2 py-1"
          style={{
            background: SC.panelInset,
            border: `1px solid ${SC.void}`,
            boxShadow: `inset 1px 1px 0 ${SC.bevelLo}, inset -1px -1px 0 ${SC.metalMid}`,
          }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="text-[10px] font-bold tracking-[0.12em]"
              style={{ color: SC.ledBall }}
            >
              BALL {ballsLeft}
            </span>
            <span
              className="truncate text-[9px] font-bold tracking-wide"
              style={{ color: getBallKind(ballKind).colors.mid }}
              title={getBallKind(ballKind).label}
            >
              {getBallKind(ballKind).label}
            </span>
            <span
              className="font-mono text-[16px] font-bold tabular-nums tracking-[0.15em]"
              style={{ color: SC.led, textShadow: `0 0 6px ${SC.missionBlueDeep}` }}
            >
              {formatScore(score)}
            </span>
          </div>
          <div className="truncate font-mono text-[10px] tracking-wide" style={{ color: SC.status }}>
            {status}
          </div>
        </div>
        <button
          type="button"
          className="xp-button shrink-0 self-center px-2 py-1 text-[11px]"
          onClick={newGame}
        >
          New Game
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-1"
        style={{ background: SC.void }}
      >
        <canvas
          ref={canvasRef}
          width={TABLE_W}
          height={TABLE_H}
          className="max-h-full max-w-full touch-none [image-rendering:auto]"
          style={{ aspectRatio: `${TABLE_W} / ${TABLE_H}`, width: '100%', height: 'auto' }}
          aria-label="Pinball table"
        />
      </div>

      {!isPhone ? (
        <div
          className="shrink-0 border-t px-2 py-0.5 font-mono text-[10px]"
          style={{ background: SC.metalDark, borderColor: SC.void, color: SC.ledDim }}
        >
          Z / ← left · X / → right · hold Space plunge · N new game
        </div>
      ) : null}

      <GameControlPad
        leftLabel="◀ Left"
        rightLabel="Right ▶"
        centerLabel={gameOver ? 'New Game' : 'Plunge'}
        onLeftChange={setLeft}
        onRightChange={setRight}
        onCenter={gameOver ? newGame : undefined}
        onCenterChange={gameOver ? undefined : setPlunge}
        centerDisabled={false}
      />
    </div>
  )
}
