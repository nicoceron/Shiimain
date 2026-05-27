import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

const transition = {
  delay: 0,
  duration: 0.5,
  ease: [0.93, 0.21, 0.42, 0.97],
  type: 'tween',
}

const titleOneRest = { opacity: 1, rotateX: 0, transformPerspective: 500, y: 0 }
const titleTwoRest = { opacity: 0, rotateX: -60, transformPerspective: 500, y: 0 }
const titleOneEnter = { opacity: 1, rotateX: 0, transformPerspective: 500, y: 13 }
const titleTwoEnter = { opacity: 0, rotateX: -60, transformPerspective: 500, y: 13 }
const titleOneHover = { opacity: 0, rotateX: 60, transformPerspective: 500, y: 0 }
const titleTwoHover = { opacity: 1, rotateX: 0, transformPerspective: 500, y: 0 }
const titleOneExit = { opacity: 0, rotateX: 60, transformPerspective: 500, y: -13 }
const titleTwoExit = { opacity: 1, rotateX: 0, transformPerspective: 500, y: -13 }
export function AnimatedButton({ arrow, className = '', href = '#contact', label, variant = 'lime' }) {
  const [hovered, setHovered] = useState(false)
  const hoveredRef = useRef(false)
  const frameRef = useRef(undefined)
  const tokenRef = useRef(0)
  const titleOneControls = useAnimationControls()
  const titleTwoControls = useAnimationControls()

  const cancelFrame = () => {
    if (frameRef.current === undefined) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = undefined
  }

  const queue = (token, callback) => {
    cancelFrame()
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = undefined
      if (tokenRef.current !== token) return
      callback()
    })
  }

  const setHoverState = (nextHovered) => {
    flushSync(() => setHovered(nextHovered))
    hoveredRef.current = nextHovered
  }

  const enter = () => {
    if (hoveredRef.current) return
    const token = tokenRef.current + 1
    tokenRef.current = token
    titleOneControls.stop()
    titleTwoControls.stop()
    setHoverState(true)
    titleOneControls.set(titleOneEnter)
    titleTwoControls.set(titleTwoEnter)
    queue(token, () => {
      void titleOneControls.start({ ...titleOneHover, transition })
      void titleTwoControls.start({ ...titleTwoHover, transition })
    })
  }

  const leave = () => {
    if (!hoveredRef.current) return
    const token = tokenRef.current + 1
    tokenRef.current = token
    titleOneControls.stop()
    titleTwoControls.stop()
    setHoverState(false)
    titleOneControls.set(titleOneExit)
    titleTwoControls.set(titleTwoExit)
    queue(token, () => {
      void titleOneControls.start({ ...titleOneRest, transition })
      void titleTwoControls.start({ ...titleTwoRest, transition })
    })
  }

  useEffect(
    () => () => {
      tokenRef.current += 1
      cancelFrame()
      titleOneControls.stop()
      titleTwoControls.stop()
    },
    [titleOneControls, titleTwoControls],
  )

  return (
    <motion.a
      aria-label={label}
      className={`button button-${variant} animated-button ${hovered ? 'hover' : ''} ${className}`}
      data-framer-name="Primary Button"
      href={href}
      onBlur={leave}
      onFocus={enter}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <span className="button-title-wrap">
        <motion.span
          aria-hidden="true"
          animate={titleOneControls}
          className="button-title button-title-one"
          initial={titleOneRest}
        >
          {label}
        </motion.span>
        <motion.span
          aria-hidden="true"
          animate={titleTwoControls}
          className="button-title button-title-two"
          initial={titleTwoRest}
        >
          {label}
        </motion.span>
        <span className="button-sr-text">{label}</span>
      </span>
      {arrow ? (
        <span className="button-arrow-track" aria-hidden="true">
          <img className="button-arrow-one" src={arrow} alt="" width="16" height="8" />
          <img className="button-arrow-two" src={arrow} alt="" width="16" height="8" />
        </span>
      ) : null}
    </motion.a>
  )
}
