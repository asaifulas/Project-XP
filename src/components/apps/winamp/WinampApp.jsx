import { useEffect, useMemo, useRef, useState } from 'react'
import { useFramelessWindow } from '../../window/FramelessWindowContext'
import { loadSongTracks } from '../../../utils/loadSongTracks'
import './WinampApp.css'

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const EQ_LABELS = [
  'PRE',
  '60',
  '170',
  '310',
  '600',
  '1K',
  '3K',
  '6K',
  '12K',
  '14K',
  '16K',
]

function useSpectrumBars(isPlaying) {
  const [bars, setBars] = useState(() => Array.from({ length: 12 }, () => 4))

  useEffect(() => {
    if (!isPlaying) {
      setBars((b) => b.map(() => 3))
      return undefined
    }
    let id = 0
    const tick = () => {
      setBars((prev) =>
        prev.map((h, i) => {
          const n = Math.sin(Date.now() / 200 + i * 0.7) * 0.5 + 0.5
          return 3 + Math.round(n * 9 * (0.5 + (i % 3) * 0.15))
        }),
      )
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [isPlaying])

  return bars
}

export default function WinampApp() {
  const frame = useFramelessWindow()
  const tracks = useMemo(() => loadSongTracks(), [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [showEq, setShowEq] = useState(true)
  const [showPl, setShowPl] = useState(true)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [eqOn, setEqOn] = useState(true)

  const audioRef = useRef(null)
  const seekRef = useRef(false)
  const repeatRef = useRef(repeat)
  const spectrum = useSpectrumBars(isPlaying)

  const current = tracks[currentIndex] ?? null
  const hasTracks = tracks.length > 0

  useEffect(() => {
    repeatRef.current = repeat
  }, [repeat])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return undefined
    el.volume = volume
  }, [volume])

  useEffect(() => {
    if (!hasTracks) return
    const el = audioRef.current
    const t = tracks[currentIndex]
    if (!el || !t?.url) return
    el.src = t.url
    el.load()
    setPosition(0)
    setDuration(0)
  }, [currentIndex, hasTracks, tracks])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !hasTracks) return undefined

    const onTime = () => {
      if (!seekRef.current) setPosition(el.currentTime)
    }
    const onMeta = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0)
    const onEnded = () => {
      if (repeatRef.current) {
        el.currentTime = 0
        void el.play().catch(() => setIsPlaying(false))
        return
      }
      if (currentIndex < tracks.length - 1) {
        setCurrentIndex((i) => i + 1)
        setIsPlaying(true)
      } else {
        setIsPlaying(false)
        setPosition(0)
        el.currentTime = 0
      }
    }

    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('ended', onEnded)
    }
  }, [currentIndex, hasTracks, tracks.length])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !hasTracks) return
    if (isPlaying) {
      void el.play().catch(() => setIsPlaying(false))
    } else {
      el.pause()
    }
  }, [isPlaying, hasTracks, currentIndex])

  const play = () => {
    if (!hasTracks) return
    setIsPlaying(true)
  }

  const pause = () => setIsPlaying(false)

  const stop = () => {
    const el = audioRef.current
    setIsPlaying(false)
    if (el) {
      el.pause()
      el.currentTime = 0
    }
    setPosition(0)
  }

  const next = () => {
    if (!hasTracks) return
    if (shuffle && tracks.length > 1) {
      let n = currentIndex
      while (n === currentIndex) {
        n = Math.floor(Math.random() * tracks.length)
      }
      setCurrentIndex(n)
      return
    }
    setCurrentIndex((i) => Math.min(tracks.length - 1, i + 1))
  }

  const prev = () => {
    const el = audioRef.current
    if (el && el.currentTime > 2) {
      el.currentTime = 0
      setPosition(0)
      return
    }
    if (!hasTracks) return
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  const onSeekInput = (e) => {
    const el = audioRef.current
    const v = Number(e.target.value)
    if (el) el.currentTime = v
    setPosition(v)
  }

  const onSeekDown = () => {
    seekRef.current = true
  }
  const onSeekUp = () => {
    seekRef.current = false
  }

  const playlistLine = current
    ? `${currentIndex + 1}. ${current.title}`
    : 'No tracks in src/assets/songs'


  return (
    <div className="winamp-root">
      <audio ref={audioRef} preload="metadata" />

      <div className="winamp-skin">
        {/* Main player */}
        <div className="winamp-module">
          <div className="winamp-titlebar">
            <div
              ref={frame?.attachDragRef ?? null}
              className="winamp-titlebar-drag"
            >
              <span className="winamp-bolt" aria-hidden />
              <span className="winamp-title">WINAMP</span>
            </div>
            <div className="winamp-title-controls">
              <button
                type="button"
                className="winamp-sysbtn"
                aria-label="Minimize"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => frame?.onMinimize?.()}
              >
                ─
              </button>
              <button
                type="button"
                className="winamp-sysbtn"
                aria-label="Close"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => frame?.onClose?.()}
              >
                ×
              </button>
            </div>
          </div>

          <div className="winamp-main-body">
            <div className="winamp-row-top">
              <div>
                <div className="winamp-time">{formatTime(position)}</div>
                <div className="winamp-vis" aria-hidden>
                  {spectrum.map((h, i) => (
                    <span
                      key={i}
                      className="winamp-vis-bar"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="winamp-scroll-wrap">
                  <div className="winamp-scroll-text">{playlistLine}</div>
                </div>
                <div className="winamp-meta">
                  <span>128 kbps</span>
                  <span>44 kHz</span>
                  <span className="st">Stereo</span>
                </div>
              </div>
            </div>

            <div className="winamp-sliders">
              <span className="winamp-slider-label">Vol</span>
              <span className="winamp-slider-label">Bal</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                className="winamp-hslider"
                aria-label="Volume"
                onChange={(e) => setVolume(Number(e.target.value))}
              />
              <input
                type="range"
                min={-1}
                max={1}
                step={0.05}
                defaultValue={0}
                className="winamp-hslider"
                aria-label="Balance"
              />
            </div>

            <div className="winamp-toggles">
              <button
                type="button"
                className={`winamp-chip ${showEq ? 'on' : ''}`}
                onClick={() => setShowEq((v) => !v)}
              >
                EQ
              </button>
              <button
                type="button"
                className={`winamp-chip ${showPl ? 'on' : ''}`}
                onClick={() => setShowPl((v) => !v)}
              >
                PL
              </button>
            </div>

            <div className="winamp-seek">
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 1}
                step={0.1}
                value={duration > 0 ? position : 0}
                disabled={!hasTracks || duration <= 0}
                aria-label="Seek"
                onChange={onSeekInput}
                onMouseDown={onSeekDown}
                onMouseUp={onSeekUp}
                onTouchStart={onSeekDown}
                onTouchEnd={onSeekUp}
              />
            </div>

            <div className="winamp-transport">
              <button
                type="button"
                className="winamp-tpb"
                aria-label="Previous"
                disabled={!hasTracks}
                onClick={prev}
              >
                ⏮
              </button>
              <button
                type="button"
                className="winamp-tpb"
                aria-label="Play"
                disabled={!hasTracks}
                onClick={play}
              >
                ▶
              </button>
              <button
                type="button"
                className="winamp-tpb"
                aria-label="Pause"
                disabled={!hasTracks}
                onClick={pause}
              >
                ⏸
              </button>
              <button
                type="button"
                className="winamp-tpb"
                aria-label="Stop"
                disabled={!hasTracks}
                onClick={stop}
              >
                ⏹
              </button>
              <button
                type="button"
                className="winamp-tpb"
                aria-label="Next"
                disabled={!hasTracks}
                onClick={next}
              >
                ⏭
              </button>
              <button type="button" className="winamp-tpb" aria-label="Eject" disabled>
                ⏏
              </button>
              <button
                type="button"
                className={`winamp-opt ${shuffle ? 'on' : ''}`}
                onClick={() => setShuffle((s) => !s)}
              >
                SHUF
              </button>
              <button
                type="button"
                className={`winamp-opt ${repeat ? 'on' : ''}`}
                onClick={() => setRepeat((r) => !r)}
              >
                REP
              </button>
            </div>
          </div>
        </div>

        {/* Equalizer */}
        {showEq ? (
          <div className="winamp-module">
            <div className="winamp-titlebar inactive">
              <span className="winamp-bolt" style={{ opacity: 0.35 }} aria-hidden />
              <span className="winamp-title">WINAMP EQUALIZER</span>
              <span style={{ width: 26 }} />
            </div>
            <div className="winamp-eq-head">
              <div style={{ display: 'flex', gap: 3 }}>
                <button
                  type="button"
                  className={`winamp-chip ${eqOn ? 'on' : ''}`}
                  onClick={() => setEqOn((v) => !v)}
                >
                  ON
                </button>
                <button type="button" className="winamp-chip">
                  AUTO
                </button>
              </div>
              <div
                style={{
                  flex: 1,
                  height: 3,
                  background: eqOn ? '#00ff44' : '#334433',
                  border: '1px inset #0a0a0c',
                }}
              />
              <button type="button" className="winamp-eq-preset">
                PRESETS
              </button>
            </div>
            <div className="winamp-eq-sliders">
              {EQ_LABELS.map((label) => (
                <div key={label} className="winamp-eq-col">
                  <div className="winamp-eq-label">{label}</div>
                  <div
                    style={{
                      width: 6,
                      height: 52,
                      marginTop: 2,
                      background:
                        'linear-gradient(90deg, #2a2a18 0%, #e8d040 50%, #2a2a18 100%)',
                      border: '1px solid #111',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: -1,
                        right: -1,
                        top: '42%',
                        height: 8,
                        background:
                          'linear-gradient(180deg, #e8ecf4 0%, #787c84 100%)',
                        border: '1px solid #333',
                        boxShadow:
                          'inset 1px 1px 0 #fff, inset -1px -1px 0 #444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Playlist */}
        {showPl ? (
          <div className="winamp-module">
            <div className="winamp-titlebar inactive">
              <span className="winamp-bolt" style={{ opacity: 0.35 }} aria-hidden />
              <span className="winamp-title">WINAMP PLAYLIST</span>
              <span style={{ width: 26 }} />
            </div>
            <div className="winamp-pl-list" role="listbox" aria-label="Playlist">
              {tracks.length === 0 ? (
                <div className="winamp-pl-item" style={{ cursor: 'default', color: '#668866' }}>
                  Add .mp3 files to src/assets/songs
                </div>
              ) : (
                tracks.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    role="option"
                    aria-selected={i === currentIndex}
                    className={`winamp-pl-item ${i === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentIndex(i)
                      setIsPlaying(true)
                    }}
                  >
                    <span className="winamp-pl-num">{i + 1}.</span>
                    <span className="truncate">{t.title}</span>
                    <span className="winamp-pl-dur">
                      {i === currentIndex ? formatTime(duration) : '--:--'}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="winamp-pl-foot">
              <div className="winamp-pl-btns">
                <span className="winamp-pl-btn">ADD</span>
                <span className="winamp-pl-btn">REM</span>
                <span className="winamp-pl-btn">SEL</span>
                <span className="winamp-pl-btn">MISC</span>
              </div>
              <span className="winamp-pl-time">
                {formatTime(position)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
