import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Leaf,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plus,
  X,
  Zap,
} from 'lucide-react'
import { AnimatedButton } from './components/AnimatedButton.jsx'
import { RollingLink } from './components/RollingLink.jsx'
import { SmoothScroll } from './components/SmoothScroll.jsx'
import guajiraMap from './assets/shiimain-territorial-context-user.png'
import shiimainFoodBaskets from './assets/shiimain-food-baskets.webp'
import shiimainFoodChildren from './assets/shiimain-food-children.webp'
import shiimainFoodCommunityMeals from './assets/shiimain-food-community-meals.webp'
import shiimainFoodDeliveryVerification from './assets/shiimain-food-delivery-verification.webp'
import shiimainHeroCactus from './assets/shiimain-hero-guajira-cactus.png'
import shiimainFoodPacking from './assets/shiimain-food-packing.webp'
import shiimainFoodRoute from './assets/shiimain-food-route.webp'
import shiimainLogo from './assets/shiimain-logo.svg'
import './App.css'

const DemoDashboard = lazy(() =>
  import('./components/DemoDashboard.jsx').then((module) => ({
    default: module.DemoDashboard,
  })),
)

const assets = {
  logo: shiimainLogo,
  footerLogo: shiimainLogo,
  hero: shiimainHeroCactus,
  tick: 'https://framerusercontent.com/images/kvdlB3iY4NmbRxGWFXTik82tWI.svg?width=16&height=17',
  arrow: 'https://framerusercontent.com/images/UiJU9i4Jlh4N9ihhIBlKvqycvYw.svg?width=16&height=8',
  map: guajiraMap,
}

const strengths = [
  'Territorio',
  'Hambre',
  'Agua',
  'Niñez',
  'SECOP',
  'Evidencia',
  'Entrega visible',
  'Trazable',
  'Sin inventar datos',
]

const featureCards = [
  {
    title: 'Prioriza territorios con señales públicas.',
    text: 'Cruza hambre, agua, niñez, aislamiento, contratos y evidencia visible para saber dónde mirar primero.',
    image: shiimainFoodPacking,
  },
  {
    title: 'Lee expedientes SECOP sin perder contexto.',
    text: 'Separa contratos, actas, soportes y ejecución financiera visible para no confundir contexto con prueba.',
    image: shiimainFoodChildren,
  },
  {
    title: 'Expone brechas antes de afirmar cobertura.',
    text: 'Muestra qué fuente sostiene cada lectura y qué falta comprobar en territorio, documentos o datos públicos.',
    image: shiimainFoodRoute,
  },
]

const timelineItems = [
  {
    title: 'Cruce de identidad',
    text: 'Une NIT base, entidad, proveedor y participación en UT para definir qué contratos están realmente en alcance.',
    visual: 'identity',
  },
  {
    title: 'Lectura de soportes',
    text: 'Ordena documentos SECOP, actas y extracciones para saber qué fuente sostiene cada señal.',
    visual: 'evidence',
  },
  {
    title: 'Cruce territorial',
    text: 'Une hambre, agua, niñez, choque reportado y contratación pública para priorizar lectura de campo.',
    visual: 'territory',
  },
  {
    title: 'Patrones de auditoría',
    text: 'Prioriza contratos con señales determinísticas y deja claro qué es evidencia, brecha o tarea pendiente.',
    visual: 'audit',
  },
]

const processVisuals = {
  audit: {
    chips: ['Evidencia', 'Brecha', 'Tarea'],
    code: 'SIG-04',
    inputs: ['Valor alto', 'Modificación', 'Soporte débil'],
    label: 'Reglas determinísticas',
    output: 'Prioridad de auditoría',
    outputLabel: 'salida',
  },
  evidence: {
    chips: ['SECOP', 'Actas', 'Extracción'],
    code: 'DOC-02',
    inputs: ['Contrato', 'Archivo', 'Campo extraído'],
    label: 'Lectura de fuente',
    output: 'Señal sustentada',
    outputLabel: 'fuente',
  },
  identity: {
    chips: ['NIT', 'Entidad', 'UT'],
    code: 'ID-01',
    inputs: ['NIT base', 'Entidad', 'Proveedor / UT'],
    label: 'Grafo de alcance',
    output: 'Contratos en alcance',
    outputLabel: 'match',
  },
  territory: {
    chips: ['Hambre', 'Agua', 'Niñez'],
    code: 'TER-03',
    inputs: ['Municipio', 'Necesidad', 'Contrato visible'],
    label: 'Cruce territorial',
    output: 'Territorio priorizado',
    outputLabel: 'prioridad',
  },
}

const projectImages = [
  shiimainFoodBaskets,
  shiimainFoodCommunityMeals,
  shiimainFoodDeliveryVerification,
]

const projects = [
  'Prioridad territorial en La Guajira',
  'Expediente público y ejecución visible',
  'Patrones de contratación y evidencia',
].map((title, index) => ({
  title,
  image: projectImages[index],
  text: [
    'Territorios Wayuu, municipios críticos y lugares priorizados se leen desde necesidad, fuente y brecha.',
    'Contratos, TDR, CDP, actas y extracciones quedan separados para no confundir contexto con prueba.',
    'Señales determinísticas sobre valores, proveedores, modificaciones y brechas de evidencia priorizan análisis.',
  ][index],
}))

const projectFacts = [
  ['Territorio', 'La Guajira'],
  ['Caso', 'Demo público'],
  ['Fuente', 'SECOP'],
  ['Capa', 'Inteligencia'],
  ['Señales', '167'],
  ['Estado', 'Demo público'],
]

const avatars = [
  'https://framerusercontent.com/images/KCji3Px3f6JH2gDUhS5rzrvr43c.png?width=1024&height=1024',
  'https://framerusercontent.com/images/RtbUqb3JURQ3fOl98M1dFxLlu8.png?width=1024&height=1024',
  'https://framerusercontent.com/images/rLJMSxLW8qqmCLwOF8FMDwMrLiQ.png?width=160&height=160',
  'https://framerusercontent.com/images/JuWei1O9foNHTYg0eJQUezpnUA.png?width=1024&height=1024',
  'https://framerusercontent.com/images/z67MBhKx0cvPBlOzIPG1yP0awI.png?width=1024&height=1024',
]

const testimonials = [
  'Coordinación territorial',
  'Equipo de campo',
  'Auditoría interna',
  'Análisis de datos',
  'Supervisión contractual',
  'Aliado implementador',
  'Mesa directiva',
].map((name, index) => ({
  name,
  role: index % 2 === 0 ? 'Usuario operativo' : 'Equipo aliado',
  avatar: avatars[index % avatars.length],
  tone: index === 0 ? 'yellow' : index === 6 ? 'dark' : 'base',
}))

const partnerLogos = [
  'ONGs',
  'Fundaciones',
  'Interventorías',
  'Auditoría',
  'Equipos de campo',
  'Finanzas',
  'Dirección',
  'Aliados territoriales',
]

const faqs = [
  [
    '¿Shiimain reemplaza a SECOP?',
    'No. Shiimain usa SECOP y otras fuentes públicas como evidencia base, pero organiza la información para priorizar análisis territorial.',
  ],
  [
    '¿Qué equipos usan el tablero?',
    'Finanzas, supervisión, campo, auditoría y dirección pueden trabajar sobre la misma evidencia sin perder contexto entre áreas.',
  ],
  [
    '¿Qué hace la inteligencia de precios?',
    'Compara valores, cantidades públicas disponibles y patrones de contratación. Si la fuente no permite calcular precio unitario, marca la brecha.',
  ],
  [
    '¿Qué pasa si falta información pública?',
    'El sistema marca la brecha como tarea de evidencia. No inventa cantidades ni precios unitarios cuando la fuente no los soporta.',
  ],
  [
    '¿El demo está basado en datos reales?',
    'Sí. El demo usa territorios Wayuu, municipios, contratos, archivos, extracciones y señales públicas preparadas para mostrar el flujo de inteligencia.',
  ],
  [
    '¿Shiimain trabaja solo en La Guajira?',
    'El foco inicial está en La Guajira, pero la arquitectura sirve para otros territorios y programas con evidencia pública comparable.',
  ],
]

const sourceReveal = {
  hidden: { opacity: 0.001, y: 0, filter: 'blur(0px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', bounce: 0.2, duration: 0.9 },
  },
}

const sourceFade = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { type: 'spring', bounce: 0.2, duration: 0.9 },
  },
}

const testimonialReveal = {
  hidden: { opacity: 0, y: 150 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', bounce: 0.2, duration: 1.1 },
  },
}

const surfaceHover = {
  y: -8,
  transition: { type: 'spring', stiffness: 260, damping: 24 },
}

const listContainer = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.08,
    },
  },
}

const navLayoutTransition = {
  damping: 42,
  mass: 1,
  stiffness: 320,
  type: 'spring',
}

const mobileMenuItemVariants = {
  closed: { opacity: 0.001, transition: { duration: 0 }, x: 50 },
  open: (delay = 0.08) => ({
    opacity: 1,
    transition: {
      bounce: 0,
      delay,
      duration: 0.6,
      type: 'spring',
    },
    x: 0,
  }),
}

function Button({ children, href = '#contact', variant = 'lime', className = '', onClick }) {
  return <AnimatedButton arrow={assets.arrow} className={className} href={href} label={String(children).trim()} onClick={onClick} variant={variant} />
}

function Eyebrow({ children, dark = false }) {
  return (
    <span className={`eyebrow ${dark ? 'eyebrow-dark' : ''}`}>
      <Leaf size={12} strokeWidth={2.2} />
      {children}
    </span>
  )
}

function WordHeading({ as: Tag = 'h2', children, className = '' }) {
  const words = String(children).split(' ')

  return (
    <Tag className={`word-heading ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0.001, y: 10, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.75, delay: index * 0.045 }}
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  )
}

function Count({ value }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (latest) => setCount(Math.round(latest)),
    })

    return () => controls.stop()
  }, [value])

  return <strong>{count}+</strong>
}

function Header() {
  const [open, setOpen] = useState(false)
  const [barLoaded, setBarLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1200)
  const hiddenRef = useRef(false)
  const hiddenFromYRef = useRef(0)
  const lastScrollYRef = useRef(0)
  const links = [
    ['Inicio', '#home'],
    ['Qué hacemos', '#about'],
    ['Casos', '#projects'],
    ['Territorio', '#territory'],
    ['Demo', '#/demo'],
  ]

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setBarLoaded(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const setHiddenState = (nextHidden, scrollY) => {
      hiddenRef.current = nextHidden
      if (nextHidden) hiddenFromYRef.current = scrollY
      setHidden(nextHidden)
    }

    let frame = 0

    const update = () => {
      frame = 0
      const hero = document.getElementById('home')
      const nextScrollY = window.scrollY
      const deltaY = nextScrollY - lastScrollYRef.current

      setScrolled(hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 80)

      if (open || nextScrollY <= 1) {
        setHiddenState(false, nextScrollY)
      } else if (deltaY > 8) {
        setHiddenState(true, nextScrollY)
      } else if (deltaY < -8 && hiddenRef.current && hiddenFromYRef.current - nextScrollY >= 180) {
        setHiddenState(false, nextScrollY)
      }

      lastScrollYRef.current = nextScrollY
    }

    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [open])

  useEffect(() => {
    const updateViewport = () => {
      const nextMobile = window.innerWidth < 1200
      setIsMobile(nextMobile)
      if (!nextMobile) setOpen(false)
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return (
    <motion.header
      className={['site-header', scrolled ? 'site-header-scrolled' : '', open ? 'site-header-open' : ''].filter(Boolean).join(' ')}
      initial={{ opacity: 0, y: -100, x: '-50%' }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? -100 : 0, x: '-50%' }}
      style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      transition={{ type: 'spring', bounce: 0.12, duration: 0.65 }}
    >
      <motion.div className="nav-progress" style={{ scaleX: barLoaded && (!isMobile || open) ? 1 : 0.01 }} />
      <div className="nav-top-row">
        <a className="brand" href="#home" aria-label="Inicio Shiimain">
          <img src={assets.logo} alt="Shiimain" />
        </a>
        <button className="menu-toggle" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      <motion.nav className={open ? 'nav-open' : ''} aria-label="Navegación principal" layout transition={navLayoutTransition}>
        {links.map(([label, href], index) => (
          <motion.span
            animate={isMobile ? (open ? 'open' : 'closed') : 'open'}
            custom={[0.08, 0.14, 0.2, 0.26, 0.26][index]}
            initial={false}
            key={label}
            variants={mobileMenuItemVariants}
          >
            <RollingLink href={href} hoverEnabled={!isMobile} label={label} onClick={() => setOpen(false)} />
          </motion.span>
        ))}
        <motion.span
          animate={isMobile ? (open ? 'open' : 'closed') : 'open'}
          className="mobile-nav-cta"
          custom={0.32}
          initial={false}
          variants={mobileMenuItemVariants}
        >
          <Button className="mobile-header-cta" href="#/demo" onClick={() => setOpen(false)}>
            Ver demo
          </Button>
        </motion.span>
      </motion.nav>
      <Button className="header-cta" href="#/demo">Ver demo</Button>
    </motion.header>
  )
}

function Hero() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0px', '130px'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0px', '-54px'])

  return (
    <section className="hero-section" id="home" ref={heroRef}>
      <motion.img
        className="hero-bg"
        src={assets.hero}
        alt="La Guajira con capas de inteligencia territorial"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1.1 }}
        style={{ y: backgroundY }}
        transition={{ type: 'spring', bounce: 0.3, duration: 10 }}
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <motion.div className="hero-copy" initial="hidden" animate="show" variants={sourceReveal} style={{ y: contentY }}>
          <span className="hero-pill">Inteligencia territorial y evidencia pública</span>
          <WordHeading as="h1" className="hero-title">
            Convierte señales públicas en prioridad territorial
          </WordHeading>
          <div className="hero-actions">
            <Button href="#/demo">Abrir demo</Button>
            <Button variant="white" href="#projects">
              Ver cómo funciona
            </Button>
          </div>
          <div className="hero-benefits">
            {['Brechas de evidencia', 'Entrega visible', 'Patrones públicos'].map((item) => (
              <span key={item}>
                <img src={assets.tick} alt="" width="16" height="17" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
        <div className="hero-stats">
          {[
            [41, 'Contratos leídos'],
            [2783, 'Archivos SECOP'],
            [167, 'Señales de auditoría'],
          ].map(([value, label]) => (
            <motion.div className="stat" key={label} variants={sourceReveal} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <Count value={value} />
              <span>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureScrollCard({ card, index, progress }) {
  const scaleRanges = [
    [1, 0.8],
    [1, 0.9],
    [1, 1],
  ]
  const scale = useTransform(progress, [0.25, 0.86], scaleRanges[index])

  return (
    <motion.article
      className="feature-card"
      key={card.title}
      style={{ scale, zIndex: featureCards.length + index, '--stack-offset': `${index * 16}px` }}
    >
      <img src={card.image} alt="" />
      <div>
        <h3>{card.title}</h3>
        <p>{card.text}</p>
        <Button variant="white" href="#/demo">Explorar demo</Button>
      </div>
    </motion.article>
  )
}

function Features() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  return (
    <section className="section features-section" id="about" ref={sectionRef}>
      <div className="intro-top">
        <div>
          <Eyebrow>QUÉ HACEMOS</Eyebrow>
          <WordHeading>Inteligencia territorial para programas sensibles</WordHeading>
          <div className="strengths">
            {strengths.map((strength) => (
              <span key={strength}>{strength}</span>
            ))}
          </div>
          <Button href="#/demo">Ver demo</Button>
        </div>
        <motion.div className="intro-copy" variants={sourceReveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <h3>Ayudamos a organizaciones a priorizar dónde mirar primero y qué evidencia pública sostiene cada lectura.</h3>
          <p>
            Shiimain toma territorios, contratos, expedientes, documentos SECOP, datos municipales y señales de auditoría para convertirlos en una
            capa de inteligencia entendible. El objetivo es que una ONG, fundación, interventoría o equipo público pueda ver qué falta, qué riesgo
            pesa más y qué fuente sostiene la lectura.
          </p>
          <p>
            Empezamos en La Guajira porque el caso público tiene territorios Wayuu, municipios críticos, contratos, archivos y señales suficientes
            para mostrar el flujo real: de evidencia pública a priorización territorial.
          </p>
        </motion.div>
      </div>
      <div className="feature-stack">
        {featureCards.map((card, index) => (
          <FeatureScrollCard card={card} index={index} key={card.title} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  )
}

function TimelineProcessVisual({ type }) {
  const visual = processVisuals[type] || processVisuals.identity

  return (
    <div className={`timeline-visual timeline-visual-${type}`} aria-label={visual.label} role="img">
      <div className="timeline-visual-grid" aria-hidden="true" />
      <div className="timeline-visual-head">
        <span>{visual.code}</span>
        <strong>{visual.label}</strong>
      </div>
      <div className="timeline-visual-canvas">
        <div className="timeline-visual-inputs">
          {visual.inputs.map((input) => (
            <span key={input}>{input}</span>
          ))}
        </div>
        <div className="timeline-visual-bus" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="timeline-visual-output">
          <small>{visual.outputLabel}</small>
          <strong>{visual.output}</strong>
        </div>
      </div>
      <div className="timeline-visual-chips">
        {visual.chips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>
    </div>
  )
}

function TimelineStep({ active, index, item, onActive }) {
  const rowRef = useRef(null)
  const inView = useInView(rowRef, { margin: '-42% 0px -42% 0px' })

  useEffect(() => {
    if (inView) onActive(index)
  }, [inView, index, onActive])

  return (
    <motion.article
      className={`timeline-row ${active ? 'active' : ''}`}
      id={`step-${index + 1}`}
      initial="hidden"
      key={item.title}
      ref={rowRef}
      transition={{ bounce: 0.18, delay: index * 0.04, duration: 1.4, type: 'spring' }}
      variants={sourceFade}
      viewport={{ once: false, amount: 0.35 }}
      whileHover={surfaceHover}
      whileInView="show"
    >
      <span className="round-icon">
        <Zap size={22} />
      </span>
      <div>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </div>
      <TimelineProcessVisual type={item.visual} />
    </motion.article>
  )
}

function Benefits() {
  const timelineRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 62%', 'end 42%'] })
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section className="section benefits-section">
      <div className="section-center">
        <Eyebrow>BENEFICIOS</Eyebrow>
        <WordHeading>De datos dispersos a una lectura territorial revisable</WordHeading>
        <p className="section-lede">
          Shiimain reduce ruido analítico: qué territorio concentra necesidad, qué evidencia pública existe y qué brecha exige verificación.
        </p>
      </div>
      <div className="benefit-timeline" ref={timelineRef}>
        <div className="timeline-progress" aria-hidden="true">
          <span className="timeline-progress-track">
            <motion.span className="timeline-progress-fill" style={{ scaleY: progressScale }} />
          </span>
          <div className="timeline-progress-badges">
            {timelineItems.map((item, index) => (
              <span className={`timeline-progress-badge ${activeStep >= index ? 'active' : ''}`} key={item.title}>
                {index + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="timeline-steps">
          {timelineItems.map((item, index) => (
            <TimelineStep active={activeStep === index} index={index} item={item} key={item.title} onActive={setActiveStep} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ index, item }) {
  return (
    <motion.article
      className={`testimonial-card ${item.tone !== 'base' ? item.tone : ''}`}
      initial="hidden"
      key={`${item.name}-${index}`}
      variants={testimonialReveal}
      viewport={{ once: true, amount: 0.5 }}
      whileHover={surfaceHover}
      whileInView="show"
    >
      <strong>
        <img className="testimonial-logo" src={assets.logo} alt="" />
      </strong>
      <p>“Necesitamos entender necesidad, evidencia pública y brecha territorial antes de afirmar cobertura.”</p>
      <div>
        <img src={item.avatar} alt="" />
        <span>{item.name}</span>
      </div>
    </motion.article>
  )
}

function Testimonials() {
  const sectionRef = useRef(null)
  const columns = [
    { items: testimonials.slice(0, 2) },
    { items: testimonials.slice(2, 5) },
    { items: testimonials.slice(5, 7) },
  ]

  return (
    <section className="section testimonials-section" ref={sectionRef}>
      <Eyebrow>USUARIOS</Eyebrow>
      <WordHeading>Hecho para equipos que leen territorios sensibles</WordHeading>
      <div className="testimonial-marquee">
        <div>
          {columns.map((column, columnIndex) => (
            <div className="testimonial-column" key={`testimonial-column-${columnIndex}`}>
              {column.items.map((item, itemIndex) => (
                <TestimonialCard index={columnIndex * 3 + itemIndex} item={item} key={`${item.name}-${columnIndex}-${itemIndex}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <Button className="testimonial-cta" href="#/demo">Probar demo</Button>
    </section>
  )
}

function Projects() {
  return (
    <section className="section projects-section" id="projects">
      <div className="section-row-heading">
        <div>
          <Eyebrow>CASOS</Eyebrow>
          <WordHeading>El demo se concentra en territorio, contratos y patrones de La Guajira</WordHeading>
        </div>
        <Button href="#/demo">Ver demo completo</Button>
      </div>
      <div className="project-list">
        {projects.map((project) => (
          <motion.article
            className="project-card"
            key={project.title}
            variants={sourceFade}
            initial="hidden"
            whileHover={surfaceHover}
            whileInView="show"
            viewport={{ once: true, amount: 0.18 }}
          >
            <img src={project.image} alt="" />
            <div className="project-copy">
              <h3>{project.title}</h3>
              <p>{project.text}</p>
              <div className="project-facts">
                {projectFacts.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <Button href="#/demo">Ver detalle</Button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function PartnersFaqLocation() {
  const [openFaq, setOpenFaq] = useState(-1)

  return (
    <>
      <section className="section partners-section">
        <div className="section-center">
          <Eyebrow>PARA QUIÉN</Eyebrow>
          <WordHeading>Equipos que trabajan con territorio crítico y evidencia pública</WordHeading>
        </div>
        <motion.div className="partner-grid" initial="hidden" variants={listContainer} viewport={{ once: true, amount: 0.25 }} whileInView="show">
          {partnerLogos.map((label, index) => (
            <motion.article className="partner-card" key={`${label}-${index}`} variants={sourceReveal} whileHover={surfaceHover}>
              <strong>{label}</strong>
              <span>{String(index + 1).padStart(2, '0')}</span>
            </motion.article>
          ))}
        </motion.div>
      </section>
      <section className="section faq-section">
        <div className="faq-copy">
          <Eyebrow>PREGUNTAS</Eyebrow>
          <WordHeading>Preguntas frecuentes</WordHeading>
          <p>Shiimain está pensado para equipos que necesitan leer evidencia pública con trazabilidad, no para reemplazar la fuente pública.</p>
        </div>
        <motion.div className="faq-panel" variants={sourceFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          <div>
            {faqs.map(([question, answer], index) => (
              <article className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  {question}
                  <Plus size={20} />
                </button>
                <motion.div
                  animate={{ height: openFaq === index ? 'auto' : 0 }}
                  initial={false}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                >
                  <p>{answer}</p>
                </motion.div>
              </article>
            ))}
          </div>
        </motion.div>
        <div className="faq-contact">
          <span>¿Hablamos del caso?</span>
          <a href="mailto:hola@shiimain.ai">hola@shiimain.ai</a>
        </div>
      </section>
      <section className="section locations-section" id="territory">
        <Eyebrow>TERRITORIO</Eyebrow>
        <WordHeading>Empezamos donde el dato debe tocar campo: La Guajira</WordHeading>
        <div className="map-wrap">
          <img src={assets.map} alt="Mapa de contexto territorial de Shiimain en La Guajira" />
        </div>
      </section>
    </>
  )
}

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-cta">
        <h2>¿Listo para ver Shiimain sobre el demo territorial?</h2>
        <Button href="#/demo">Abrir demo</Button>
      </div>
      <div className="footer-main">
        <img src={assets.footerLogo} alt="Shiimain" />
        <div>
          <h3>Enlaces</h3>
          {[
            ['Qué hacemos', '#about'],
            ['Casos', '#projects'],
            ['Territorio', '#territory'],
            ['Demo', '#/demo'],
          ].map(([item, href]) => (
            <a key={item} href={href}>
              {item}
            </a>
          ))}
        </div>
        <div>
          <h3>Canales</h3>
          {['LinkedIn', 'X', 'Correo'].map((item) => (
            <a key={item} href="#contact">
              {item}
            </a>
          ))}
        </div>
        <div>
          <h3>Recibe avances</h3>
          <p>Déjanos tu correo para compartir nuevos casos y mejoras del demo.</p>
          <form>
            <input aria-label="Correo electrónico" placeholder="Tu correo" type="email" />
            <button type="button">Enviar</button>
          </form>
        </div>
      </div>
      <div className="footer-contact">
        <div>
          <Phone />
          <span>Contacto:</span>
          <strong>Demo bajo solicitud</strong>
        </div>
        <div>
          <Mail />
          <span>Correo:</span>
          <strong>hola@shiimain.ai</strong>
        </div>
        <div>
          <MapPin />
          <span>Territorio:</span>
          <strong>La Guajira, Colombia</strong>
        </div>
      </div>
      <div className="footer-bottom">
        <span>©Shiimain</span>
        <div>
          <a href="#contact">Privacidad</a>
          <a href="#contact">Términos</a>
        </div>
      </div>
    </footer>
  )
}

function TemplateBadge() {
  return (
    <div className="template-badge" aria-label="Acceso rápido al demo">
      <a href="#/demo">Abrir demo</a>
      <span>Shiimain</span>
    </div>
  )
}

function DemoLoading() {
  return (
    <main className="demo-loading" aria-label="Cargando demo Shiimain">
      <img src={assets.logo} alt="Shiimain" />
      <span>Cargando demo</span>
    </main>
  )
}

function useHashRoute() {
  const readRoute = () => window.location.hash.replace(/^#\/?/, '') || 'home'
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const update = () => setRoute(readRoute())
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  return route
}

function App() {
  const route = useHashRoute()

  if (route === 'demo') {
    return (
      <Suspense fallback={<DemoLoading />}>
        <DemoDashboard />
      </Suspense>
    )
  }

  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <Features />
        <Benefits />
        <Projects />
        <Testimonials />
        <PartnersFaqLocation />
      </main>
      <Footer />
      <TemplateBadge />
    </>
  )
}

export default App
