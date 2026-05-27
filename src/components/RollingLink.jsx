import { motion } from 'framer-motion'
import { useState } from 'react'

const rollingDuration = 0.4
const rollingStagger = 0.55
const rollingEase = [0.82, 0.08, 0.29, 1]
const rollingLetterVariants = {
  initial: { y: '0%' },
  hover: { y: '-120px' },
}

export function RollingLink({ href, label, className = '', hoverEnabled = true, onClick }) {
  const [hovered, setHovered] = useState(false)
  const letters = Array.from(label)
  const letterCount = letters.length

  const showHover = () => {
    if (hoverEnabled) setHovered(true)
  }

  return (
    <a
      aria-label={label}
      className={`rolling-link ${className}`}
      href={href}
      onBlur={() => setHovered(false)}
      onClick={onClick}
      onFocus={showHover}
      onMouseEnter={showHover}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="rolling-link-mask">
        <span className="rolling-text-inner">
          {letters.map((letter, index) => {
            const delay = letterCount > 0 ? (rollingDuration / letterCount) * index * rollingStagger : 0

            return (
              <motion.span
                animate={hoverEnabled && hovered ? 'hover' : 'initial'}
                className="rolling-letter"
                initial="initial"
                key={`${label}-${letter}-${index}`}
                transition={{
                  delay,
                  duration: rollingDuration,
                  ease: rollingEase,
                  type: 'tween',
                }}
                variants={rollingLetterVariants}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            )
          })}
        </span>
      </span>
    </a>
  )
}
