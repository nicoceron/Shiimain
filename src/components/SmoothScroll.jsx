import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

const easing = (time) => 1 - Math.pow(1 - time, 3)
const wheelDuration = 1.2
const wheelMultiplier = 0.72

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function markNestedScrollAreas() {
  const elements = Array.from(document.getElementsByTagName('*'))

  for (const element of elements) {
    if (!(element instanceof HTMLElement)) continue

    const styles = window.getComputedStyle(element)
    if (styles.overflow === 'auto' || styles.overflowY === 'auto') {
      element.setAttribute('data-lenis-prevent', 'true')
    }
  }
}

function shouldSkipSmoothWheel(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey) return true

  const target = event.target instanceof Element ? event.target : event.target instanceof Node ? event.target.parentElement : null
  return Boolean(target?.closest('[data-lenis-prevent], [data-lenis-prevent-wheel], input, textarea, select'))
}

function getWheelDelta(event) {
  const modeMultiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1
  return event.deltaY * modeMultiplier
}

export function SmoothScroll() {
  const lenisRef = useRef(null)
  const targetScrollRef = useRef(0)
  const lastWheelAtRef = useRef(0)

  useEffect(() => {
    markNestedScrollAreas()

    const lenis = new Lenis({
      allowNestedScroll: true,
      anchors: {
        duration: 1.45,
        easing,
      },
      autoRaf: true,
      autoToggle: true,
      duration: 1.45,
      easing,
      gestureOrientation: 'vertical',
      orientation: 'vertical',
      smoothWheel: false,
      syncTouch: false,
    })
    lenisRef.current = lenis
    window.lenis = lenis
    window.lenisVersion = '1.3.8'

    const handleWheel = (event) => {
      if (shouldSkipSmoothWheel(event)) return

      const delta = getWheelDelta(event)
      if (Math.abs(delta) < 1) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      const now = window.performance.now()
      const currentScroll = Number.isFinite(lenis.scroll) ? lenis.scroll : window.scrollY
      const scrollLimit = Number.isFinite(lenis.limit) ? lenis.limit : document.documentElement.scrollHeight - window.innerHeight
      const resetTarget = now - lastWheelAtRef.current > 180 || Math.abs(targetScrollRef.current - currentScroll) < 1

      if (resetTarget) targetScrollRef.current = currentScroll
      targetScrollRef.current = clamp(targetScrollRef.current + delta * wheelMultiplier, 0, scrollLimit)
      lastWheelAtRef.current = now

      lenis.scrollTo(targetScrollRef.current, {
        duration: wheelDuration,
        easing,
        force: true,
        lock: false,
      })
    }

    window.addEventListener('wheel', handleWheel, { capture: true, passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      if (window.lenis === lenis) window.lenis = undefined
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return null
}
