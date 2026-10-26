import { useCallback, useEffect, useState } from 'react'
import usePhoneGameLayout from '../_shared/usePhoneGameLayout'
import CardFace from './CardFace.jsx'
import {
  createGame,
  drawFromStock,
  findAutoTarget,
  isWon,
  moveCards,
  undo,
} from './klondike.js'

/**
 * Classic Klondike solitaire — tap-to-move primary (phone + desktop).
 *
 * @param {{ keyboardActive?: boolean }} props
 */
export default function SolitaireApp({ keyboardActive = true }) {
  const isPhone = usePhoneGameLayout()
  const [drawCount, setDrawCount] = useState(/** @type {1|3} */ (1))
  const [game, setGame] = useState(() => createGame({ drawCount: 1 }))
  const [selection, setSelection] = useState(/** @type {null | object} */ (null))
  const [status, setStatus] = useState('Deal complete — tap a card, then a destination')
  const won = isWon(game)

  const restart = useCallback(
    (nextDraw = drawCount) => {
      setGame(createGame({ drawCount: nextDraw }))
      setSelection(null)
      setStatus(`New game (draw ${nextDraw})`)
    },
    [drawCount],
  )

  const tryMove = useCallback((from, to) => {
    const result = moveCards(game, from, to)
    if (!result.ok) {
      setStatus('Illegal move')
      setSelection(null)
      return false
    }
    setGame(result.game)
    setSelection(null)
    if (isWon(result.game)) setStatus('You win!')
    else setStatus('Nice move')
    return true
  }, [game])

  const onStockClick = useCallback(() => {
    setGame(drawFromStock(game))
    setSelection(null)
    setStatus(game.stock.length === 0 ? 'Recycled stock' : 'Drew')
  }, [game])

  const onWasteClick = useCallback(() => {
    if (!game.waste.length) return
    const from = { type: 'waste' }
    if (!selection) {
      setSelection(from)
      setStatus('Waste selected — tap a pile')
      return
    }
    if (selection.type === 'waste') {
      const auto = findAutoTarget(game, from)
      if (auto) tryMove(from, auto)
      else {
        setSelection(null)
        setStatus('No auto-move')
      }
      return
    }
    setSelection(from)
    setStatus('Waste selected — tap a pile')
  }, [game, selection, tryMove])

  const onFoundationClick = useCallback(
    (pile) => {
      const to = { type: 'foundation', pile }
      if (selection) {
        tryMove(selection, to)
        return
      }
      if (!game.foundations[pile].length) {
        setStatus('Empty foundation')
        return
      }
      setSelection({ type: 'foundation', pile })
      setStatus('Foundation card selected')
    },
    [game, selection, tryMove],
  )

  const onTableauCardClick = useCallback(
    (pile, index) => {
      const card = game.tableau[pile][index]
      if (!card) return

      if (!card.faceUp) {
        setStatus('That card is face-down')
        return
      }

      const from = { type: 'tableau', pile, index }

      if (selection) {
        // Same stack tip → try auto to foundation/tableau
        if (
          selection.type === 'tableau' &&
          selection.pile === pile &&
          selection.index === index
        ) {
          const auto = findAutoTarget(game, from)
          if (auto) tryMove(from, auto)
          else {
            setSelection(null)
            setStatus('No auto-move')
          }
          return
        }
        // Drop onto this pile (onto the pile as a whole — use pile top)
        tryMove(selection, { type: 'tableau', pile })
        return
      }

      setSelection(from)
      setStatus('Selected — tap destination (or same card to auto-move)')
    },
    [game, selection, tryMove],
  )

  const onTableauEmptyClick = useCallback(
    (pile) => {
      if (!selection) {
        setStatus('Empty column — select a King run first')
        return
      }
      tryMove(selection, { type: 'tableau', pile })
    },
    [selection, tryMove],
  )

  const doUndo = useCallback(() => {
    if (!(game.history?.length > 0)) {
      setStatus('Nothing to undo')
      return
    }
    setGame(undo(game))
    setSelection(null)
    setStatus('Undo')
  }, [game])

  useEffect(() => {
    if (!keyboardActive) return undefined
    function onKey(event) {
      if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        doUndo()
      } else if (event.key === 'n' && !event.metaKey && !event.ctrlKey) {
        restart()
      } else if (event.key === 'Escape') {
        setSelection(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keyboardActive, doUndo, restart])

  const wasteTop = game.waste.length ? game.waste[game.waste.length - 1] : null
  const selKey = selection
    ? `${selection.type}:${selection.pile ?? ''}:${selection.index ?? ''}`
    : ''

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#008080] font-xp text-[11px] text-black">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-black/30 bg-[linear-gradient(180deg,#fdfcf4_0%,#ece9d8_100%)] px-2 py-1">
        <span className="font-bold">Solitaire</span>
        <button type="button" className="xp-button px-2 py-0.5" onClick={() => restart()}>
          New Game
        </button>
        <button
          type="button"
          className="xp-button px-2 py-0.5"
          onClick={doUndo}
          disabled={!(game.history?.length > 0)}
        >
          Undo
        </button>
        <label className="ml-auto flex items-center gap-1">
          Draw
          <select
            className="border border-black/40 bg-white px-1 py-0.5"
            value={drawCount}
            onChange={(event) => {
              const next = Number(event.target.value) === 3 ? 3 : 1
              setDrawCount(next)
              restart(next)
            }}
          >
            <option value={1}>1</option>
            <option value={3}>3</option>
          </select>
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-3">
        {/* Stock / waste / foundations */}
        <div className="mb-3 flex flex-wrap items-start gap-2 sm:gap-3">
          <CardFace
            card={game.stock.length ? { suit: 'spades', rank: 1, id: 'stock', faceUp: false } : null}
            placeholder={game.stock.length === 0}
            aria-label={game.stock.length ? 'Stock — draw' : 'Empty stock — recycle'}
            onClick={onStockClick}
          />
          <CardFace
            card={wasteTop}
            placeholder={!wasteTop}
            selected={selection?.type === 'waste'}
            aria-label="Waste"
            onClick={onWasteClick}
          />
          <div className="mx-1 hidden w-px self-stretch bg-white/20 sm:block" />
          {game.foundations.map((pile, i) => (
            <CardFace
              key={`f-${i}`}
              card={pile.length ? pile[pile.length - 1] : null}
              placeholder={!pile.length}
              selected={selection?.type === 'foundation' && selection.pile === i}
              aria-label={`Foundation ${i + 1}`}
              onClick={() => onFoundationClick(i)}
            />
          ))}
        </div>

        {/* Tableau */}
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          {game.tableau.map((pile, pileIndex) => (
            <div
              key={`t-${pileIndex}`}
              className="relative flex min-h-[220px] flex-1 flex-col items-center"
            >
              {pile.length === 0 ? (
                <CardFace
                  card={null}
                  placeholder
                  aria-label={`Empty column ${pileIndex + 1}`}
                  onClick={() => onTableauEmptyClick(pileIndex)}
                />
              ) : (
                pile.map((card, cardIndex) => {
                  const selected =
                    selection?.type === 'tableau' &&
                    selection.pile === pileIndex &&
                    selection.index === cardIndex
                  const inSelectedRun =
                    selection?.type === 'tableau' &&
                    selection.pile === pileIndex &&
                    cardIndex >= selection.index
                  return (
                    <CardFace
                      key={`${card.id}-${selKey}`}
                      card={card}
                      selected={selected || Boolean(inSelectedRun && card.faceUp)}
                      aria-label={`Column ${pileIndex + 1} card`}
                      onClick={() => onTableauCardClick(pileIndex, cardIndex)}
                      className={cardIndex === 0 ? '' : '!-mt-[48px] sm:!-mt-[54px]'}
                      style={{ zIndex: cardIndex + 1 }}
                    />
                  )
                })
              )}
            </div>
          ))}
        </div>
      </div>

      {won ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
          <div className="pointer-events-auto border border-black/50 bg-[#ece9d8] px-6 py-4 text-center shadow-lg">
            <div className="mb-2 font-bold">You Win!</div>
            <button type="button" className="xp-button px-3 py-1" onClick={() => restart()}>
              New Game
            </button>
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-black/30 bg-[#d4d0c8] px-2 py-1 text-black/80">
        {status}
        {!isPhone ? (
          <span className="ml-2 text-black/45">· Ctrl/⌘Z undo · N new · Esc clear</span>
        ) : (
          <span className="ml-2 text-black/45">· Tap select, tap move</span>
        )}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-black/30 bg-[#d4d0c8] p-2 sm:hidden">
        <button type="button" className="xp-button min-h-[48px] flex-1 font-bold" onClick={onStockClick}>
          Draw
        </button>
        <button
          type="button"
          className="xp-button min-h-[48px] flex-1 font-bold"
          onClick={doUndo}
          disabled={!(game.history?.length > 0)}
        >
          Undo
        </button>
        <button type="button" className="xp-button min-h-[48px] flex-1 font-bold" onClick={() => restart()}>
          New
        </button>
      </div>
    </div>
  )
}
