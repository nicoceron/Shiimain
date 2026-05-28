import { motion } from 'framer-motion'

const hoverTransition = {
  duration: 0.42,
  ease: [0.93, 0.21, 0.42, 0.97],
  type: 'tween',
}

export function AnimatedButton({ arrow, className = '', href = '#contact', label, onClick, variant = 'lime' }) {
  return (
    <motion.a
      aria-label={label}
      className={`button button-${variant} animated-button ${className}`}
      data-framer-name="Primary Button"
      href={href}
      onClick={onClick}
      transition={hoverTransition}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.985, y: 0 }}
    >
      <span className="button-title-wrap" aria-hidden="true">
        <span className="button-title-stack">
          <span className="button-title">{label}</span>
          <span className="button-title">{label}</span>
        </span>
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
