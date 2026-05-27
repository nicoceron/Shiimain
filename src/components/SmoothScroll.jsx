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

    const lenis = new Lenis({ duration: 1, smoothWheel: true })
    lenisRef.current = lenis
    window.lenisVersion = '1.1.2'

    let animationFrame = 0
    const raf = (time) => {
      lenis.raf(time)
      animationFrame = window.requestAnimationFrame(raf)
    }
    animationFrame = window.requestAnimationFrame(raf)

    const handleAnchorClick = (event) => {
      if (event.defaultPrevented) return

      const target = event.target instanceof Element ? event.target : event.target instanceof Node ? event.target.parentElement : null
      const anchor = target?.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || !url.hash) return

      const targetElement = document.querySelector(decodeURIComponent(url.hash))
      if (!(targetElement instanceof HTMLElement)) return

      const scrollMarginTop = Number.parseInt(window.getComputedStyle(targetElement).scrollMarginTop, 10) || 0

      event.preventDefault()
      window.history.replaceState(null, '', url.hash)
      lenis.scrollTo(targetElement, { offset: -scrollMarginTop })
    }

    document.addEventListener('click', handleAnchorClick, true)

    return () => {
      document.removeEventListener('click', handleAnchorClick, true)
      window.cancelAnimationFrame(animationFrame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return null
}
