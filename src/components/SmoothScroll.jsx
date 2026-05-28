import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

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

export function SmoothScroll() {
  const lenisRef = useRef(null)

  useEffect(() => {
    markNestedScrollAreas()

    const lenis = new Lenis({
      allowNestedScroll: true,
      anchors: true,
      autoRaf: true,
      autoToggle: true,
      duration: 1.2,
      gestureOrientation: 'vertical',
      lerp: 0.065,
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
    })
    lenisRef.current = lenis
    window.lenis = lenis
    window.lenisVersion = '1.3.8'

    return () => {
      if (window.lenis === lenis) window.lenis = undefined
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return null
}
