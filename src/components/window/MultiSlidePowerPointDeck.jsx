import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { buildPowerPointEnterTimeline, resetPowerPointSlide } from './powerPointSlideAnimations'
import PowerPointWorkspace from './retro/PowerPointWorkspace'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

/** Animation finishes at this fraction of each slide's scroll section. */
const ANIM_SCROLL_PORTION = 0.45
/** Stay on the finished slide until this fraction before advancing. */
const STAY_SCROLL_END = 0.82
/** Total pinned scroll distance per slide (× viewport height). */
const SECTION_SCROLL_MULTIPLIER = 2.15
/** Design size of one slide; the stage scales it to fit (matches the Slides pane thumbnails). */
const SLIDE_W = 960
const SLIDE_H = 720

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

    // slides are laid out at a fixed 960×720 and scaled into the 4:3 frame, like PowerPoint
    stage.style.setProperty('--slide-scale', String(width / SLIDE_W))

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

  /**
   * Scroll position where slide `index` has finished animating. This is a snap point,
   * so landing here is stable (the in-between "stay" boundary is not: snap pulls it back).
   */
  const finishedY = useCallback((index) => {
    const st = triggersRef.current[index]
    return st ? st.start + (st.end - st.start) * ANIM_SCROLL_PORTION : null
  }, [])

  /** Go to a slide and show it fully built (thumbnails, Previous/Next Slide). */
  const jumpToSlide = useCallback(
    (index) => {
      const y = finishedY(index)
      if (y != null) {
        scrollStageTo(y, 0.65)
        return
      }
      const section = sectionRefs.current[index]
      if (section) scrollStageTo(section, 0.65)
    },
    [finishedY, scrollStageTo],
  )

  /** Next: finish the current slide's build first, then move on. Previous: go back a slide. */
  const scrollByStep = useCallback(
    (direction) => {
      const idx = activeIndexRef.current
      const st = triggersRef.current[idx]

      if (direction > 0) {
        if (st && st.progress < ANIM_SCROLL_PORTION * 0.98) {
          scrollStageTo(finishedY(idx))
          return
        }
        if (idx < total - 1) jumpToSlide(idx + 1)
        return
      }

      if (idx > 0) {
        jumpToSlide(idx - 1)
      } else if (st && st.progress > 0.02) {
        scrollStageTo(st.start)
      }
    },
    [finishedY, jumpToSlide, scrollStageTo, total],
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
    <PowerPointWorkspace
      slides={slides}
      activeIndex={activeIndex}
      onSelect={jumpToSlide}
      onStep={scrollByStep}
      overlay={
        <p
          className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap border border-black bg-[#ffffe1] px-1.5 py-[1px] text-[11px] text-black shadow-[2px_2px_2px_rgba(0,0,0,0.25)]"
          aria-live="polite"
        >
          {scrollHint}
        </p>
      }
    >
      <div ref={stageWrapRef} className="absolute inset-0 flex flex-col overflow-hidden">
          <div
            ref={stageRef}
            tabIndex={0}
            className="no-scrollbar h-full w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#316ac5]/50"
            aria-label={`${deckLabel} — scroll to animate, then scroll for next slide`}
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
                  className="overflow-hidden bg-white"
                >
                  <div
                    ref={(el) => {
                      slideRootsRef.current[index] = el
                    }}
                    className="overflow-hidden"
                    style={{
                      width: SLIDE_W,
                      height: SLIDE_H,
                      transform: 'scale(var(--slide-scale, 1))',
                      transformOrigin: '0 0',
                    }}
                  >
                    {slide.element}
                  </div>
                </div>
              </section>
            ))}
          </div>
      </div>
    </PowerPointWorkspace>
  )
}
