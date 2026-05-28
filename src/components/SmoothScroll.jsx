import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const smooth = true
const intensity = 12
const infinite = false
const orientation = 'vertical'

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      allowNestedScroll: true,
      anchors: true,
      autoRaf: true,
      autoToggle: true,
      duration: intensity / 10,
      gestureOrientation: orientation === 'horizontal' ? 'both' : 'vertical',
      infinite,
      orientation,
      smoothWheel: smooth,
      syncTouch: Boolean(infinite) || orientation === 'horizontal',
    })

    window.lenis = lenis
    window.lenisVersion = '1.3.8'

    return () => {
      if (window.lenis === lenis) window.lenis = undefined
      lenis.destroy()
    }
  }, [])

  return null
}
