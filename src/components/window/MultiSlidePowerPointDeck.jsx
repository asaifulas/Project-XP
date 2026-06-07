import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { buildPowerPointEnterTimeline, resetPowerPointSlide } from './powerPointSlideAnimations'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

/** Animation finishes at this fraction of each slide's scroll section. */
const ANIM_SCROLL_PORTION = 0.45
/** Stay on the finished slide until this fraction before advancing. */
const STAY_SCROLL_END = 0.82
/** Total pinned scroll distance per slide (× viewport height). */
const SECTION_SCROLL_MULTIPLIER = 2.15

/**
 * Extend timeline so scrub reaches full animation at ANIM_SCROLL_PORTION scroll progress.
 *
 * @param {gsap.core.Timeline} tl
 * @param {number} animPortion
 */
function appendScrollHold(tl, animPortion) {
  const animDuration = tl.duration()
  if (animDuration <= 0) return tl
  const holdDuration = animDuration * (1 / animPortion - 1)
  if (holdDuration > 0.01) {
    tl.to({}, { duration: holdDuration })
  }
  return tl
}

/**
 * ScrollTrigger-driven deck: scroll scrubs slide animation to completion,
 * then keep scrolling to advance to the next slide.
 *
 * @param {{ id: string, title: string, render: () => import('react').ReactNode }[]} slides
 */
export default function MultiSlidePowerPointDeck({ slides: slideDefs, deckLabel = 'Presentation' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollHint, setScrollHint] = useState('Scroll to animate this slide')

  const stageRef = useRef(null)
  const stageWrapRef = useRef(null)
  const sectionRefs = useRef(/** @type {(HTMLElement | null)[]} */ ([]))
  const pinRefs = useRef(/** @type {(HTMLElement | null)[]} */ ([]))
  const slideRootsRef = useRef(/** @type {(HTMLElement | null)[]} */ ([]))
  const timelinesRef = useRef(/** @type {gsap.core.Timeline[]} */ ([]))
  const triggersRef = useRef(/** @type {ScrollTrigger[]} */ ([]))
  const activeIndexRef = useRef(0)
  const setupDoneRef = useRef(false)

  const slides = useMemo(
    () =>
      slideDefs.map((slide) => ({
        id: slide.id,
        title: slide.title,
        element: slide.render(),
      })),
    [slideDefs],
  )

  const total = slides.length

  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  const syncPinSizes = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return 0

    const height = stage.clientHeight
    const width = stage.clientWidth

    sectionRefs.current.forEach((section) => {
      if (!section) return
      section.style.minHeight = `${height}px`
    })

    pinRefs.current.forEach((pin) => {
      if (!pin) return
      pin.style.height = `${height}px`
      pin.style.width = `${width}px`
    })

    return height
  }, [])

  const bindStageScroller = useCallback((stage) => {
    ScrollTrigger.scrollerProxy(stage, {
      scrollTop(value) {
        if (arguments.length) {
          stage.scrollTop = value
        }
        return stage.scrollTop
      },
      scrollHeight: () => stage.scrollHeight,
      getBoundingClientRect() {
        return stage.getBoundingClientRect()
      },
      pinType: 'transform',
    })
  }, [])

  const destroyTriggers = useCallback(() => {
    triggersRef.current.forEach((st) => st.kill())
    triggersRef.current = []
    timelinesRef.current.forEach((tl) => tl.kill())
    timelinesRef.current = []
    setupDoneRef.current = false
  }, [])

  const buildTriggers = useCallback(() => {
    const stage = stageRef.current
    if (!stage || total === 0) return false

    const stageHeight = syncPinSizes()
    if (stageHeight < 80) return false

    destroyTriggers()

    sectionRefs.current.forEach((section, index) => {
      const pin = pinRefs.current[index]
      const rootHost = slideRootsRef.current[index]
      if (!section || !pin || !rootHost) return

      const root =
        rootHost.firstElementChild instanceof HTMLElement ? rootHost.firstElementChild : rootHost

      resetPowerPointSlide(root)
      gsap.set(root.querySelectorAll('[data-pp]'), {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
      })

      const enterTl = appendScrollHold(buildPowerPointEnterTimeline(root), ANIM_SCROLL_PORTION)
      enterTl.pause(0)
      timelinesRef.current[index] = enterTl

      const scrollDistance = Math.round(stageHeight * SECTION_SCROLL_MULTIPLIER)

      const st = ScrollTrigger.create({
        id: `experience-slide-${index}`,
        trigger: section,
        scroller: stage,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin,
        pinSpacing: true,
        pinType: 'transform',
        scrub: 0.65,
        animation: enterTl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const animProgress = gsap.utils.clamp(0, 1, self.progress / ANIM_SCROLL_PORTION)

          if (animProgress < 0.98) {
            setScrollHint('Scroll to animate this slide')
          } else if (self.progress < STAY_SCROLL_END * 0.98) {
            setScrollHint('Stay a moment — keep scrolling for next slide')
          } else {
            setScrollHint(index >= total - 1 ? 'End of presentation' : 'Next slide')
          }
        },
        onEnter: () => {
          setActiveIndex(index)
          activeIndexRef.current = index
        },
        onEnterBack: () => {
          setActiveIndex(index)
          activeIndexRef.current = index
        },
        snap: {
          snapTo: (progress) => {
            if (progress < ANIM_SCROLL_PORTION * 0.4) return 0
            if (progress < STAY_SCROLL_END) return ANIM_SCROLL_PORTION
            return 1
          },
          duration: { min: 0.22, max: 0.5 },
          delay: 0.06,
          ease: 'power1.inOut',
        },
      })

      triggersRef.current.push(st)
    })

    setupDoneRef.current = triggersRef.current.length > 0
    if (stageRef.current) {
      stageRef.current.scrollTop = 0
    }
    ScrollTrigger.refresh()
    return setupDoneRef.current
  }, [destroyTriggers, syncPinSizes, total])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    bindStageScroller(stage)

    let cancelled = false
    let attempts = 0

    const trySetup = () => {
      if (cancelled) return
      attempts += 1
      const ok = buildTriggers()
      if (!ok && attempts < 40) {
        requestAnimationFrame(trySetup)
      }
    }

    trySetup()

    const ro = new ResizeObserver(() => {
      syncPinSizes()
      if (!setupDoneRef.current) {
        buildTriggers()
      } else {
        ScrollTrigger.refresh()
      }
    })
    ro.observe(stage)

    return () => {
      cancelled = true
      ro.disconnect()
      destroyTriggers()
      ScrollTrigger.scrollerProxy(stage, null)
    }
  }, [bindStageScroller, buildTriggers, destroyTriggers, syncPinSizes, total])

  useEffect(() => {
    const stage = stageRef.current
    const wrap = stageWrapRef.current
    if (!stage || !wrap) return undefined

    const onWheel = (event) => {
      const maxScroll = stage.scrollHeight - stage.clientHeight
      if (maxScroll <= 2) return

      let delta = event.deltaY
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16
      else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= stage.clientHeight

      const nextTop = gsap.utils.clamp(0, maxScroll, stage.scrollTop + delta)
      const canScrollDown = delta > 0 && stage.scrollTop < maxScroll - 0.5
      const canScrollUp = delta < 0 && stage.scrollTop > 0.5

      if (!canScrollDown && !canScrollUp) return

      event.preventDefault()
      event.stopPropagation()

      if (nextTop !== stage.scrollTop) {
        stage.scrollTop = nextTop
        ScrollTrigger.update()
      }
    }

    wrap.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => wrap.removeEventListener('wheel', onWheel, { capture: true })
  }, [])

  const scrollStageTo = useCallback((y, duration = 0.55) => {
    const stage = stageRef.current
    if (!stage) return

    gsap.to(stage, {
      scrollTo: { y, autoKill: true },
      duration,
      ease: 'power2.out',
      onComplete: () => ScrollTrigger.refresh(),
    })
  }, [])

  const jumpToSlide = useCallback(
    (index) => {
      const section = sectionRefs.current[index]
      if (!section) return
      scrollStageTo(section, 0.65)
    },
    [scrollStageTo],
  )

  const scrollByStep = useCallback(
    (direction) => {
      const idx = activeIndexRef.current
      const st = triggersRef.current[idx]

      if (!st) {
        const target = sectionRefs.current[idx + direction]
        if (target) jumpToSlide(idx + direction)
        return
      }

      const progress = st.progress
      const animDone = progress >= ANIM_SCROLL_PORTION * 0.98
      const stayDone = progress >= STAY_SCROLL_END * 0.98

      if (direction > 0) {
        if (!animDone) {
          const targetY = st.start + (st.end - st.start) * ANIM_SCROLL_PORTION
          scrollStageTo(targetY)
          return
        }
        if (!stayDone) {
          const targetY = st.start + (st.end - st.start) * STAY_SCROLL_END
          scrollStageTo(targetY)
          return
        }
        if (idx < total - 1) {
          jumpToSlide(idx + 1)
        }
        return
      }

      if (progress > STAY_SCROLL_END * 0.05) {
        const targetY = st.start + (st.end - st.start) * ANIM_SCROLL_PORTION
        scrollStageTo(targetY)
        return
      }
      if (progress > ANIM_SCROLL_PORTION * 0.05) {
        scrollStageTo(st.start)
        return
      }
      if (idx > 0) {
        jumpToSlide(idx - 1)
      }
    },
    [jumpToSlide, scrollStageTo, total],
  )

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        scrollByStep(1)
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        scrollByStep(-1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [scrollByStep])

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#808080] text-[11px] text-black">
      <nav
        className="flex h-[22px] shrink-0 items-center gap-0.5 border-b border-black/25 bg-[linear-gradient(180deg,#ece9d8_0%,#d8d4ca_100%)] px-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
        aria-label="PowerPoint menu"
      >
        {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Slide Show', 'Window', 'Help'].map(
          (m) => (
            <button
              key={m}
              type="button"
              disabled
              aria-disabled="true"
              className="cursor-not-allowed px-1 py-0.5 text-zinc-700 opacity-90"
            >
              {m}
            </button>
          ),
        )}
      </nav>
      <div className="flex min-h-0 flex-1">
        <aside
          className="flex w-[112px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-black/30 bg-[#5a5a5a] p-1 no-scrollbar"
          aria-label="Slides"
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => jumpToSlide(index)}
                aria-label={`Slide ${index + 1}: ${slide.title}`}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'relative aspect-[4/3] w-full overflow-hidden border-2 bg-white text-left shadow-sm transition-colors',
                  isActive ? 'border-[#316ac5] ring-1 ring-[#316ac5]/40' : 'border-white hover:border-zinc-200',
                ].join(' ')}
              >
                <div className="pointer-events-none absolute inset-0 origin-top-left scale-[0.22]">
                  {slide.element}
                </div>
                <span className="absolute bottom-0 left-0 right-0 bg-black/55 px-0.5 py-px text-center text-[8px] font-semibold text-white">
                  {index + 1}
                </span>
              </button>
            )
          })}
        </aside>
        <div
          ref={stageWrapRef}
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#7b7b7b]"
        >
          <div
            ref={stageRef}
            tabIndex={0}
            className="h-full min-h-[320px] w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#316ac5]/50"
            aria-label="Slide stage — scroll to animate, then scroll for next slide"
          >
            {slides.map((slide, index) => (
              <section
                key={slide.id}
                ref={(el) => {
                  sectionRefs.current[index] = el
                }}
                className="relative w-full"
                aria-label={`Slide ${index + 1}: ${slide.title}`}
              >
                <div
                  ref={(el) => {
                    pinRefs.current[index] = el
                  }}
                  className="overflow-hidden bg-[#7b7b7b]"
                >
                  <div
                    ref={(el) => {
                      slideRootsRef.current[index] = el
                    }}
                    className="size-full overflow-hidden"
                  >
                    {slide.element}
                  </div>
                </div>
              </section>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-1">
            <p className="rounded bg-black/45 px-2 py-0.5 text-[9px] font-medium text-white/90">{scrollHint}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollByStep(-1)}
                disabled={activeIndex <= 0}
                aria-label="Previous slide"
                className="pointer-events-auto rounded border border-black/25 bg-[#ece9d8]/95 px-2 py-0.5 text-[10px] font-bold text-zinc-800 shadow-sm enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹ Prev
              </button>
              <button
                type="button"
                onClick={() => scrollByStep(1)}
                disabled={activeIndex >= total - 1}
                aria-label="Next slide"
                className="pointer-events-auto rounded border border-black/25 bg-[#ece9d8]/95 px-2 py-0.5 text-[10px] font-bold text-zinc-800 shadow-sm enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="flex h-5 shrink-0 items-center border-t border-black/25 bg-[#ece9d8] px-2 text-[10px] text-zinc-700">
        {deckLabel} · Slide {activeIndex + 1} of {total}
      </footer>
    </div>
  )
}
