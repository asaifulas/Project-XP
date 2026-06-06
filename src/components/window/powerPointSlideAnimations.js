import gsap from 'gsap'

/** Classic Office 2003-ish easing curves. */
const EASE_IN = 'power2.in'
const EASE_OUT = 'power2.out'
const EASE_IN_OUT = 'power1.inOut'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * @param {gsap.core.Timeline} tl
 * @param {Element | NodeListOf<Element> | Element[] | null | undefined} targets
 * @param {gsap.TweenVars} fromVars
 * @param {gsap.TweenVars} toVars
 * @param {gsap.Position} [position]
 */
function fromToIfPresent(tl, targets, fromVars, toVars, position) {
  if (!targets) return
  const list = targets instanceof NodeList || Array.isArray(targets) ? targets : [targets]
  if (list.length === 0) return
  tl.fromTo(
    list,
    fromVars,
    { ...toVars, immediateRender: false },
    position,
  )
}

/**
 * Build a paused enter timeline for ScrollTrigger scrubbing.
 *
 * @param {HTMLElement} root
 */
export function buildPowerPointEnterTimeline(root) {
  if (prefersReducedMotion()) return gsap.timeline({ paused: true })

  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE_OUT } })

  tl.fromTo(
    root,
    { opacity: 0.35 },
    { opacity: 1, duration: 0.22, ease: EASE_IN_OUT, immediateRender: false },
    0,
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="header"]'),
    { scaleX: 0, opacity: 0.6, transformOrigin: 'left center' },
    { scaleX: 1, opacity: 1, duration: 0.55, ease: EASE_IN_OUT },
    0,
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="badge"], [data-pp="era"]'),
    { x: -72, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: EASE_OUT },
    0.05,
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="title"]'),
    { y: 56, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.62, ease: EASE_OUT },
    0.12,
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="subtitle"]'),
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.48, ease: EASE_IN_OUT },
    '-=0.38',
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="rail"]'),
    { scaleY: 0, opacity: 0.5, transformOrigin: 'top center' },
    { scaleY: 1, opacity: 1, duration: 0.55, ease: EASE_IN_OUT },
    '-=0.35',
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="panel"]'),
    { scale: 0.88, y: 24, opacity: 0 },
    { scale: 1, y: 0, opacity: 1, duration: 0.58, ease: 'back.out(1.35)' },
    '-=0.42',
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="timeline-entry"]'),
    { x: 64, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.52, stagger: 0.11, ease: EASE_OUT },
    '-=0.38',
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="item"]'),
    { x: -48, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.46, stagger: 0.09, ease: EASE_OUT },
    '-=0.42',
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="footer"]'),
    { y: 32, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.42, ease: EASE_IN },
    '-=0.2',
  )

  fromToIfPresent(
    tl,
    root.querySelectorAll('[data-pp="byline"]'),
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.35, ease: EASE_IN_OUT },
    '-=0.15',
  )

  return tl
}

/**
 * Fly in / wipe / stagger — mimics PowerPoint 2003 custom animation presets.
 *
 * @param {HTMLElement} root
 */
export function runPowerPointEnter(root) {
  const tl = buildPowerPointEnterTimeline(root)
  tl.play(0)
  return tl
}

/**
 * Fly out — quick ease-in when leaving a slide.
 *
 * @param {HTMLElement} root
 */
export function runPowerPointExit(root) {
  if (prefersReducedMotion()) return gsap.timeline()

  const animated = root.querySelectorAll(
    '[data-pp="title"], [data-pp="subtitle"], [data-pp="item"], [data-pp="timeline-entry"], [data-pp="panel"], [data-pp="footer"], [data-pp="badge"], [data-pp="era"]',
  )

  if (!animated.length) return gsap.timeline()

  return gsap
    .timeline({ defaults: { ease: EASE_IN } })
    .to(animated, {
      y: -36,
      opacity: 0,
      duration: 0.26,
      stagger: 0.025,
    })
    .to(root, { opacity: 0.55, duration: 0.18 }, 0)
}

/**
 * Reset animated elements so the next enter can replay cleanly.
 *
 * @param {HTMLElement} root
 */
export function resetPowerPointSlide(root) {
  gsap.killTweensOf(root)
  const marked = root.querySelectorAll('[data-pp]')
  if (marked.length) gsap.killTweensOf(marked)
  gsap.set(root, { clearProps: 'opacity' })
  if (marked.length) gsap.set(marked, { clearProps: 'all' })
}
