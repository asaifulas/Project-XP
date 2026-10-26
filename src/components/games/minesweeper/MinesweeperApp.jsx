import { useCallback, useEffect, useRef, useState } from 'react'
import usePhoneGameLayout from '../_shared/usePhoneGameLayout'
import {
  DIFFICULTIES,
  START_LIVES,
  chord,
  createGame,
  flagCell,
  isLost,
  isWon,
  minesRemaining,
  revealCell,
} from './board.js'

const NUMBER_COLORS = {
  1: '#0000ff',
  2: '#008200',
  3: '#d00000',
  4: '#000080',
  5: '#800000',
  6: '#008080',
  7: '#000000',
  8: '#808080',
}

const LONG_PRESS_MS = 420

/**
 * Classic XP Minesweeper — regional scoring + multi-life mine hits.
 *
 * @param {{ keyboardActive?: boolean }} props
 */
export default function MinesweeperApp({ keyboardActive = true }) {
  const isPhone = usePhoneGameLayout()
  const [difficulty, setDifficulty] = useState(/** @type {keyof typeof DIFFICULTIES} */ ('beginner'))
  const [game, setGame] = useState(() => createGame({ difficulty: 'beginner' }))
  const [flagMode, setFlagMode] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [toast, setToast] = useState('')
  const pressRef = useRef(/** @type {null | { r: number, c: number, timer: number, flagged: boolean }} */ (null))

  const restart = useCallback((nextDiff = difficulty) => {
    setDifficulty(nextDiff)
    setGame(createGame({ difficulty: nextDiff }))
    setSeconds(0)
    setToast('')
  }, [difficulty])

  useEffect(() => {
    if (game.status !== 'playing') return undefined
    const id = window.setInterval(() => {
      setSeconds((s) => Math.min(999, s + 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [game.status])

  useEffect(() => {
    if (game.lastSweep > 0) {
      setToast(`Region +${game.lastSweep * 10} · ${game.lastSweep} cleared`)
    } else if (game.lastPenalty > 0 && game.status !== 'lost') {
      setToast(`Mine region −${game.lastPenalty} · ${game.lives} ${game.lives === 1 ? 'life' : 'lives'} left`)
    } else if (game.status === 'lost') {
      setToast(`Boom −${game.lastPenalty} · out of lives`)
    }
  }, [game.lastSweep, game.lastPenalty, game.lives, game.status, game.revealedCount])

  useEffect(() => {
    if (!keyboardActive) return undefined
    function onKey(event) {
      if (event.key === 'n' && !event.metaKey && !event.ctrlKey) {
        restart()
      } else if (event.key === 'f' || event.key === 'F') {
        setFlagMode((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keyboardActive, restart])

  const doReveal = useCallback((r, c) => {
    setGame((prev) => {
      const { game: next } = revealCell(prev, r, c)
      return next
    })
  }, [])

  const doFlag = useCallback((r, c) => {
    setGame((prev) => {
      const { game: next, ok } = flagCell(prev, r, c)
      return ok ? next : prev
    })
  }, [])

  const doChord = useCallback((r, c) => {
    setGame((prev) => {
      const { game: next, ok } = chord(prev, r, c)
      return ok ? next : prev
    })
  }, [])

  const onCellPointerDown = useCallback(
    (r, c, event) => {
      if (event.button === 2) {
        event.preventDefault()
        doFlag(r, c)
        return
      }
      if (event.button !== 0) return

      const cell = game.cells[r * game.width + c]
      if (cell.revealed && cell.adjacent > 0 && !cell.mine) {
        doChord(r, c)
        return
      }

      if (flagMode) {
        doFlag(r, c)
        return
      }

      const timer = window.setTimeout(() => {
        doFlag(r, c)
        if (pressRef.current) pressRef.current.flagged = true
      }, LONG_PRESS_MS)
      pressRef.current = { r, c, timer, flagged: false }
    },
    [doChord, doFlag, flagMode, game.cells, game.width],
  )

  const onCellPointerUp = useCallback(
    (r, c, event) => {
      if (event.button !== 0) return
      const press = pressRef.current
      if (!press || press.r !== r || press.c !== c) return
      window.clearTimeout(press.timer)
      pressRef.current = null
      if (press.flagged || flagMode) return
      doReveal(r, c)
    },
    [doReveal, flagMode],
  )

  const onCellPointerCancel = useCallback(() => {
    if (pressRef.current) {
      window.clearTimeout(pressRef.current.timer)
      pressRef.current = null
    }
  }, [])

  const remaining = minesRemaining(game)
  const face = isWon(game) ? '😎' : isLost(game) ? '😵' : game.lastPenalty > 0 ? '😮' : '🙂'
  const cellSize = difficulty === 'beginner' ? 30 : difficulty === 'intermediate' ? 24 : 18

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#c0c0c0] font-xp text-[11px] text-black">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#808080] bg-[linear-gradient(180deg,#fdfcf4_0%,#ece9d8_100%)] px-2 py-1">
        <span className="font-bold">Minesweeper</span>
        <label className="flex items-center gap-1">
          Level
          <select
            className="border border-black/40 bg-white px-1 py-0.5"
            value={difficulty}
            onChange={(event) => {
              const next = /** @type {keyof typeof DIFFICULTIES} */ (event.target.value)
              restart(next)
            }}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </label>
        <button
          type="button"
          className={`xp-button px-2 py-0.5 ${flagMode ? 'ring-2 ring-[#000080]' : ''}`}
          onClick={() => setFlagMode((v) => !v)}
          aria-pressed={flagMode}
        >
          {flagMode ? '🚩 Flag on' : 'Flag mode'}
        </button>
        <span className="ml-auto tabular-nums text-black/70" title="Score from cleared regions">
          Score {game.score}
        </span>
      </div>

      {/* XP LED strip */}
      <div className="flex shrink-0 items-center justify-between gap-2 border border-[#808080] bg-[#c0c0c0] px-2 py-2 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#808080] sm:gap-3 sm:px-3">
        <LedCounter value={remaining} ariaLabel="Mines remaining" />
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center border-2 border-[#808080] bg-[#c0c0c0] text-[22px] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#404040] active:shadow-[inset_1px_1px_0_#808080]"
            onClick={() => restart()}
            aria-label="New game"
            title="New game"
          >
            {face}
          </button>
          <span className="text-[10px] tracking-wide text-black/60" aria-label="Lives">
            {'♥'.repeat(Math.max(0, game.lives))}
            <span className="text-black/25">{'♡'.repeat(Math.max(0, START_LIVES - game.lives))}</span>
          </span>
        </div>
        <LedCounter value={seconds} ariaLabel="Timer seconds" />
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[#6b8f6b] p-3">
        <div
          className="inline-grid gap-px border-2 border-[#404040] bg-[#404040] p-[3px] shadow-[4px_4px_0_rgba(0,0,0,0.25),inset_1px_1px_0_#808080]"
          style={{
            gridTemplateColumns: `repeat(${game.width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${game.height}, ${cellSize}px)`,
          }}
          onContextMenu={(event) => event.preventDefault()}
          role="grid"
          aria-label="Minesweeper board"
        >
          {game.cells.map((cell, i) => {
            const r = Math.floor(i / game.width)
            const c = i % game.width
            return (
              <CellButton
                key={`${r}-${c}`}
                cell={cell}
                size={cellSize}
                lost={isLost(game)}
                onPointerDown={(event) => onCellPointerDown(r, c, event)}
                onPointerUp={(event) => onCellPointerUp(r, c, event)}
                onPointerCancel={onCellPointerCancel}
                onPointerLeave={onCellPointerCancel}
              />
            )
          })}
        </div>
      </div>

      {(isWon(game) || isLost(game)) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <div className="pointer-events-auto border border-black/50 bg-[#ece9d8] px-6 py-4 text-center shadow-lg">
            <div className="mb-1 font-bold">{isWon(game) ? 'You Win!' : 'Game Over'}</div>
            <div className="mb-3 text-black/70">Score {game.score}</div>
            <button type="button" className="xp-button px-3 py-1" onClick={() => restart()}>
              New Game
            </button>
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-[#808080] bg-[#d4d0c8] px-2 py-1 text-black/80">
        {toast ||
          (flagMode
            ? 'Flag mode — tap cells to flag'
            : isPhone
              ? 'Tap open · long-press flag · clear regions for score'
              : 'Left open · right/long-press flag · mine hit = region penalty + life')}
        {!isPhone ? <span className="ml-2 text-black/45">· N new · F flag mode</span> : null}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-[#808080] bg-[#d4d0c8] p-2 sm:hidden">
        <button
          type="button"
          className={`xp-button min-h-[48px] flex-1 font-bold ${flagMode ? 'ring-2 ring-[#000080]' : ''}`}
          onClick={() => setFlagMode((v) => !v)}
        >
          {flagMode ? '🚩 Flag' : 'Open'}
        </button>
        <button type="button" className="xp-button min-h-[48px] flex-1 font-bold" onClick={() => restart()}>
          New {face}
        </button>
      </div>
    </div>
  )
}

function LedCounter({ value, ariaLabel }) {
  const shown =
    value < 0
      ? `-${String(Math.abs(value)).padStart(2, '0')}`.slice(0, 3)
      : String(Math.max(0, Math.min(999, value))).padStart(3, '0')
  return (
    <div
      className="min-w-[54px] border-2 border-[#404040] bg-black px-1 py-0.5 text-center font-mono text-[20px] font-bold leading-none tracking-wider text-[#ff2020] shadow-[inset_1px_1px_0_#600]"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {shown}
    </div>
  )
}

function CellButton({ cell, size, lost, onPointerDown, onPointerUp, onPointerCancel, onPointerLeave }) {
  let content = null
  /** Unopened = raised silver tile. Opened empty = green field; numbers = flat beige. */
  let className =
    'box-border flex items-center justify-center touch-manipulation select-none font-bold leading-none'
  let style = {
    width: size,
    height: size,
    fontSize: Math.max(11, size * 0.48),
  }

  if (cell.revealed) {
    className += ' border-0'
    if (cell.mine) {
      content = cell.detonated ? '💥' : '💣'
      style = {
        ...style,
        background: '#c62828',
        boxShadow: 'inset 1px 1px 0 #7f0000',
      }
    } else if (cell.adjacent > 0) {
      content = String(cell.adjacent)
      style = {
        ...style,
        color: NUMBER_COLORS[cell.adjacent],
        background: '#cfcab8',
        boxShadow: 'inset 1px 1px 0 #8a8570',
      }
    } else {
      // Empty cleared region — green felt so it reads as “swept open”
      style = {
        ...style,
        background: '#5f8f5f',
        boxShadow: 'inset 1px 1px 0 #3d5c3d',
      }
    }
  } else {
    className += ' border-0'
    style = {
      ...style,
      background: 'linear-gradient(160deg, #f4f4f4 0%, #d0d0d0 40%, #b0b0b0 100%)',
      boxShadow: 'inset 2px 2px 0 #ffffff, inset -2px -2px 0 #505050',
    }
    if (cell.flagged) {
      content = '🚩'
    } else if (lost && cell.mine) {
      content = '💣'
      style = {
        ...style,
        background: '#c62828',
        boxShadow: 'inset 1px 1px 0 #7f0000',
      }
    }
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerLeave}
      aria-label={
        cell.revealed
          ? cell.mine
            ? cell.detonated
              ? 'Detonated mine'
              : 'Mine'
            : cell.adjacent
              ? `${cell.adjacent}`
              : 'Empty'
          : cell.flagged
            ? 'Flagged'
            : 'Hidden'
      }
    >
      {content}
    </button>
  )
}
