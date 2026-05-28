import { useEffect, useRef, useState } from 'react'
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
import './App.css'

const assets = {
  logo: 'https://framerusercontent.com/images/AFwXQUK9MMdnMdYyZE79TctHdlE.svg?width=81&height=24',
  footerLogo: 'https://framerusercontent.com/images/EikuxwDlcxDhExsrn77csIFZtB0.svg?width=208&height=58',
  hero: 'https://framerusercontent.com/images/f9NvQ83dbDeuMAAoNh05FBHt1mw.png?width=2880&height=1640',
  tick: 'https://framerusercontent.com/images/kvdlB3iY4NmbRxGWFXTik82tWI.svg?width=16&height=17',
  arrow: 'https://framerusercontent.com/images/UiJU9i4Jlh4N9ihhIBlKvqycvYw.svg?width=16&height=8',
  award: 'https://framerusercontent.com/images/ul8OXA8zB9JOEgXSYFnVkPOeV9k.svg?width=166&height=79',
  map: 'https://framerusercontent.com/images/7kiFKxMsptIQUNn7F1EQA4ZZtlQ.png?width=1080&height=696',
}

const logoStrip = [
  'https://framerusercontent.com/images/rHspQO7eR95Gmirx7c5uAclh8.svg?width=106&height=30',
  'https://framerusercontent.com/images/kDgAc9jW9i9H9gsWMJzYbCSFJ6Q.svg?width=140&height=28',
  'https://framerusercontent.com/images/1owsNx2phueT5YvR3zbGTuIJ7M.svg?width=120&height=28',
  'https://framerusercontent.com/images/R5wytmc0EXBl0eI8FG666AhrRn0.svg?width=140&height=35',
  'https://framerusercontent.com/images/vtbhJElO4uLy2RolPcM5TOM07Q.svg?width=106&height=34',
]

const strengths = [
  'Visionary',
  'Collaborative',
  'Sustainable',
  'Global',
  'Impactful',
  'Reliable',
  'Adaptive',
  'Efficient',
  'Innovative',
]

const featureCards = [
  {
    title: "Boost Your Farm's Sustainability.",
    image: 'https://framerusercontent.com/images/5veOm1AgLGYsc3zZY7VUGz7uCxc.png?width=1968&height=1005',
  },
  {
    title: 'Maximize Farm Efficiency.',
    image: 'https://framerusercontent.com/images/q7BKkWln3QR0t01C4Xi2k8NXVw.png?width=1968&height=1005',
  },
  {
    title: 'Generate Revenue from Waste.',
    image:
      'https://framerusercontent.com/images/1omJYtEJQPTdbDiLsyA4qx1lzQ.png?scale-down-to=2048&width=3936&height=2010',
  },
]

const serviceCards = [
  {
    title: 'Waste-to-Energy Conversion',
    text: 'Our expert engineers design custom biogas systems to maximize gas output, and reduce emissions',
    image:
      'https://framerusercontent.com/images/om7WTGKadTNlJ3HPkNyVDE5xXX4.png?scale-down-to=1024&width=2240&height=2600',
    icon: 'https://framerusercontent.com/images/jdGLhtyddn2TylfYyeHTRE7Tlw.svg?width=60&height=60',
  },
  {
    title: 'Biogas Plant Installation',
    text: 'From site assessment to commissioning, we deliver full-scale biogas plant setups that are efficient, and durable',
    image: 'https://framerusercontent.com/images/BuD1c6H5KDQ8NtQbVYwFqb4oDCo.png?width=840&height=975',
    icon: 'https://framerusercontent.com/images/znqSZ4N9hgWJoFQhouLCmUL0V8.svg?width=61&height=61',
  },
  {
    title: 'Biofertilizer Recovery & Soil Enrichment',
    text: 'We upgrade outdated components and integrate modern technologies to improve efficiency and capacity',
    image: 'https://framerusercontent.com/images/I5fjViChalLoQLnnaxpIAM1zzI.png?width=841&height=976',
    icon: 'https://framerusercontent.com/images/fzifwFuaeIMNMtdy5uRE2e4NjWY.svg?width=60&height=60',
  },
]

const processCards = [
  {
    title: 'Expert installation',
    text: 'Our team is skilled in designing and implementing energy systems for all types of properties.',
    bgIcon: 'https://framerusercontent.com/images/BO83huXhYMFSxdO9UgWaJSbE3WY.svg?width=101&height=119',
    icon: 'https://framerusercontent.com/images/tnRaG5yDMMPNdIlZMhRWdhsdz4.svg?width=40&height=40',
  },
  {
    title: 'Long-term savings',
    text: 'We partner with leading manufacturers to bring you the best solar, battery, and EV charging solutions.',
    bgIcon: 'https://framerusercontent.com/images/Eg2EKP3kIaAyneFVfKaS8mEHY.svg?width=165&height=175',
    icon: 'https://framerusercontent.com/images/gCRtudDexFs0DfuKSXfZMwncg.svg?width=40&height=40',
  },
  {
    title: 'Premium Technology',
    text: 'Our energy solutions are designed to reduce electricity costs and maximize efficiency.',
    bgIcon: 'https://framerusercontent.com/images/JFxTKUr2lhTKQnucQGxdVRRdWOE.svg?width=175&height=175',
    icon: 'https://framerusercontent.com/images/BtrwXmhlkgqQ8Usf3y6GCpH6c.svg?width=40&height=40',
  },
]

const timelineItems = [
  {
    title: 'Site Audit',
    text: 'Performed waste and energy assessment; estimated 4–5 tons of daily cow dung.',
    image: 'https://framerusercontent.com/images/gPvWkluhTZcaBGMARUCjYN07DhQ.jpg?width=876&height=584',
  },
  {
    title: 'Construction',
    text: 'Took 6 weeks with local masonry labor and prefabricated dome components.',
    image: 'https://framerusercontent.com/images/eACpYOlzzfJnZBBboMbTCZb1Ck.png?width=438&height=213',
  },
  {
    title: 'System Design',
    text: 'Custom fixed-dome digester with gas storage, slurry outlet, and underground piping.',
    image: 'https://framerusercontent.com/images/rZ1tNz9b9U8RSGNeIgbrTrSEkI.png?width=438&height=213',
  },
  {
    title: 'Installation & Integration',
    text: 'Biogas piped directly to kitchen, milking parlor, and backup generator.',
    image: 'https://framerusercontent.com/images/xWmOnWdE2aozIFHKMkfTqZS6Ok.png?width=438&height=212',
  },
]

const projectImages = [
  'https://framerusercontent.com/images/AFkdLzJhwZSOBtXcWOPnZUHSHxY.png?width=640&height=374',
  'https://framerusercontent.com/images/Q0PuBQNfWFVjyE09cRYDZBWoSb0.png?width=640&height=374',
  'https://framerusercontent.com/images/RFCpzxhpPZyZ0arCxpdMJnuHzg.png?width=640&height=374',
]

const projects = [
  'Savannah Agro-Processing Biogas Retrofit',
  'Nyeri Co-Digestion Pilot',
  'Green Pastures Dairy Biogas Plant',
].map((title, index) => ({
  title,
  image: projectImages[index],
  text: 'We designed and installed a 60m³ anaerobic digester that now powers the entire milking and cold storage system.',
}))

const projectFacts = [
  ['📍 Location', 'Eldoret, Kenya'],
  ['♻️ Waste Used', 'Cow dung'],
  ['🔋 Biogas Capacity', '60 m³/day'],
  ['⚡ Energy Output', '~6,200 kWh/month'],
  ['🏁 Completion', 'Aug 21, 2025'],
  ['💰 ROI', 'Estimated 13 months'],
]

const blogPosts = [
  {
    title: 'The Science Behind Biogas',
    text: 'A breakdown of the anaerobic digestion process and why it works so well on farms.',
    category: 'General',
    date: 'Jan 28, 2025',
    image: projectImages[0],
  },
  {
    title: 'How Biofertilizer Can Restore Soil Health Naturally',
    text: 'hemical fertilizers degrade the soil. Learn how biogas byproducts offer a regenerative solution.',
    category: 'Clean Energy',
    date: 'Jan 28, 2025',
    image: projectImages[1],
  },
]

const avatars = [
  'https://framerusercontent.com/images/KCji3Px3f6JH2gDUhS5rzrvr43c.png?width=1024&height=1024',
  'https://framerusercontent.com/images/RtbUqb3JURQ3fOl98M1dFxLlu8.png?width=1024&height=1024',
  'https://framerusercontent.com/images/rLJMSxLW8qqmCLwOF8FMDwMrLiQ.png?width=160&height=160',
  'https://framerusercontent.com/images/JuWei1O9foNHTYg0eJQUezpnUA.png?width=1024&height=1024',
  'https://framerusercontent.com/images/z67MBhKx0cvPBlOzIPG1yP0awI.png?width=1024&height=1024',
]

const testimonials = [
  'Cooper Geidt',
  'Maria',
  'James Garry',
  'Sabrina Kay',
  'Mercy Gomes',
  'Jason Roy',
  'Garry Bones',
].map((name, index) => ({
  name,
  role: index % 2 === 0 ? 'Farm Owner' : 'Agricultural Partner',
  avatar: avatars[index % avatars.length],
  tone: index === 0 ? 'yellow' : index === 6 ? 'dark' : 'base',
}))

const partnerLogos = [
  'https://framerusercontent.com/images/TCKhYzJ9089cauXsbX168cUVsr8.svg?width=104&height=24',
  'https://framerusercontent.com/images/2bIy5NFM43MHYHka0m1XlfhiU.svg?width=128&height=32',
  'https://framerusercontent.com/images/clmSLNFRhdZgxemZvHncscVt8I.svg?width=115&height=29',
  'https://framerusercontent.com/images/IKECdWxzbYXhaBwOqHtSt9mr4Uk.svg?width=161&height=24',
  'https://framerusercontent.com/images/FIOahvlVI8fgV49d39bbW3yXyo.svg?width=102&height=22',
  'https://framerusercontent.com/images/clmSLNFRhdZgxemZvHncscVt8I.svg?width=115&height=29',
  'https://framerusercontent.com/images/0cmdb7tIAegKeDoTF31HjW1gQQ.svg?width=105&height=28',
  'https://framerusercontent.com/images/j9Z9NEHYEqmkWrVXHl3Hh1zMRhk.svg?width=77&height=22',
]

const faqs = [
  [
    'How long does it take to set up Planquo?',
    'A digital one-stop shop offering premium Framer & Figma templates, resources, and digital designs. Specializing in web design, we deliver stunning and functional UI/UX solutions for B2B and B2C brands looking to make a lasting impact.',
  ],
  [
    'Do I need training to use Planquo?',
    'The CustomAccordion component is designed to make it easier for users to organize content like FAQs. With this component, you don’t have to manually link each question and answer inside Framer. Instead, you can automatically generate as many questions and answers as you need by using a simple dropdown control—making it perfect for users of all experience levels.',
  ],
  [
    'Can I import tasks from another tool?',
    'Absolutely! With CustomAccordion, you have full control over design elements like the background color, border radius, fonts, icons, and more. This allows you to integrate the component seamlessly into your project while maintaining a consistent look with your overall design.',
  ],
  [
    'Do I need to install Planquo?',
    'CustomAccordion is ideal for both beginners and experienced Framer users. If you’re not familiar with Framer’s inner workings, this component saves you time by automating the creation of questions and answers. For advanced users, it offers full customization options so you can tailor the design and functionality to meet your specific needs.',
  ],
  [
    'Is there a free trial available?',
    'Yes, the CustomAccordion component is fully responsive and mobile-friendly. It works seamlessly on both desktop and mobile devices, ensuring that your content remains organized and easily accessible, no matter what platform your users are on.',
  ],
  [
    'Does Planquo work for solo users?',
    'Yes, the CustomAccordion component is fully responsive and mobile-friendly. It works seamlessly on both desktop and mobile devices, ensuring that your content remains organized and easily accessible, no matter what platform your users are on.',
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

const processCardReveal = {
  hidden: { opacity: 0, y: 75 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring', bounce: 0.2, duration: 0.9, delay: index * 0.08 },
  }),
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

function Button({ children, href = '#contact', variant = 'lime', className = '' }) {
  return <AnimatedButton arrow={assets.arrow} className={className} href={href} label={String(children)} variant={variant} />
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
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { scrollYProgress } = useScroll()
  const links = [
    ['Home', '#home'],
    ['About', '#about'],
    ['Services', '#services'],
    ['Projects', '#projects'],
    ['Blogs', '#blogs'],
  ]

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const hero = document.getElementById('home')
      const nextScrollY = window.scrollY

      setScrolled(hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 80)
      setHidden(!open && nextScrollY > 1)
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
      const nextMobile = window.innerWidth <= 1040
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
      transition={{ type: 'spring', bounce: 0.2, duration: 1.1 }}
    >
      <motion.div className="nav-progress" style={{ scaleX: scrollYProgress }} />
      <a className="brand" href="#home" aria-label="Biogax home">
        <img src={assets.logo} alt="Brand logo" />
      </a>
      <motion.nav className={open ? 'nav-open' : ''} aria-label="Primary navigation" layout transition={navLayoutTransition}>
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
      </motion.nav>
      <Button className="header-cta">Free Energy Assessment</Button>
      <button className="menu-toggle" type="button" aria-label="Toggle menu" onClick={() => setOpen((value) => !value)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
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
        alt="Background image"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1.1 }}
        style={{ y: backgroundY }}
        transition={{ type: 'spring', bounce: 0.3, duration: 10 }}
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <motion.div className="hero-copy" initial="hidden" animate="show" variants={sourceReveal} style={{ y: contentY }}>
          <span className="hero-pill">Farm-Powered Energy</span>
          <WordHeading as="h1" className="hero-title">
            Sustainable Biogas Energy for Modern Agriculture
          </WordHeading>
          <div className="hero-actions">
            <Button>Free Energy Assessment</Button>
            <Button variant="white" href="#services">
              See How It Works
            </Button>
          </div>
          <div className="hero-benefits">
            {['Lower energy bills', 'Reduce emissions', 'Increase farm productivity'].map((item) => (
              <span key={item}>
                <img src={assets.tick} alt="" width="16" height="17" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
        <div className="hero-stats">
          {[
            [350, 'Organic Waste Processed'],
            [200, 'Clean Energy Installed'],
            [120, 'Farms Empowered'],
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

function BrandTicker() {
  return (
    <section className="trusted-strip">
      <p>Trusted by top agriculture leader</p>
      <motion.div className="logo-marquee" initial="hidden" variants={sourceFade} viewport={{ once: true, amount: 0.4 }} whileInView="show">
        <div>
          {[...logoStrip, ...logoStrip, ...logoStrip].map((logo, index) => (
            <img src={logo} alt="" key={`${logo}-${index}`} />
          ))}
        </div>
      </motion.div>
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
        <p>Reduce carbon emissions and your environmental footprint with clean, renewable biogas energy.</p>
        <Button variant="white">Free Energy Assessment</Button>
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
          <Eyebrow>WHAT WE DO</Eyebrow>
          <WordHeading>Powering Farms with Clean, Circular Energy</WordHeading>
          <div className="strengths">
            {strengths.map((strength) => (
              <span key={strength}>{strength}</span>
            ))}
          </div>
          <Button>Free Energy Assessment</Button>
        </div>
        <motion.div className="intro-copy" variants={sourceReveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <h3>We're helping farmers turn waste into opportunity with sustainable biogas systems that fuel productivity.</h3>
          <p>
            Our mission is simple: to make clean energy accessible to farmers by transforming everyday agricultural waste into reliable
            biogas. We design and install complete systems that help reduce emissions, cut energy costs, and produce organic fertilizer as a
            valuable byproduct.
          </p>
          <p>
            From small family farms to larger agricultural operations, our solutions are built to scale with your needs. We bring renewable
            power and environmental benefits straight to the farm—empowering you to grow sustainably, today and for the future.
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

function ServiceScrollCard({ card, index, progress }) {
  const scaleRanges = [
    [0.98, 0.915, 0.9],
    [0.99, 0.958, 0.95],
    [1, 1, 1],
  ]
  const rotateRanges = [
    ['-0.2deg', '-0.85deg', '-1deg'],
    ['0.2deg', '0.85deg', '1deg'],
    ['0deg', '0deg', '0deg'],
  ]
  const scale = useTransform(progress, [0.25, 0.62, 0.8], scaleRanges[index])
  const rotate = useTransform(progress, [0.25, 0.62, 0.8], rotateRanges[index])

  return (
    <motion.article
      className="service-card"
      key={card.title}
      style={{ rotate, scale, zIndex: index + 1, '--service-stack-offset': `${index * 10}px` }}
      whileHover={surfaceHover}
    >
      <img className="service-bg" src={card.image} alt="" />
      <div className="service-icon">
        <img src={card.icon} alt="" />
      </div>
      <div className="service-body">
        <h3>{card.title}</h3>
        <p>{card.text}</p>
        <Button>Free Energy Assessment</Button>
      </div>
    </motion.article>
  )
}

function Services() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  return (
    <section className="section services-section" id="services" ref={sectionRef}>
      <div className="section-center">
        <Eyebrow>SERVICES WE OFFER</Eyebrow>
        <WordHeading>Clean energy solutions built for farms</WordHeading>
        <p className="section-lede">
          We deliver farm-ready biogas systems that convert agricultural waste into clean energy, boosting sustainability, reducing fuel costs,
          and unlocking new revenue streams.
        </p>
        <Button>View all services</Button>
      </div>
      <div className="service-stack">
        {serviceCards.map((card, index) => (
          <ServiceScrollCard card={card} index={index} key={card.title} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  )
}

function AwardsProcess() {
  return (
    <>
      <section className="section awards-section">
        <div className="awards-copy">
          <Eyebrow>OUR AWARDS</Eyebrow>
          <WordHeading>Awards & Recognition</WordHeading>
          <p>Proudly Recognized for Impact, Innovation, and Sustainability</p>
        </div>
        <motion.div className="award-grid" variants={sourceFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          {[1, 2, 3].map((item) => (
            <motion.article className="award-card" key={item} whileHover={surfaceHover}>
              <strong>5X</strong>
              <img src={assets.award} alt="" />
              <span>GreenTech Innovation Award 2024</span>
            </motion.article>
          ))}
        </motion.div>
      </section>
      <section className="section process-section">
        <div className="section-center">
          <Eyebrow>OUR PROCESS</Eyebrow>
          <WordHeading>Implementation Process.</WordHeading>
          <p className="section-lede">Take a quick look at the intricate implementation process as our contributions grow everyday</p>
        </div>
        <div className="process-grid">
          {processCards.map(({ title, text, icon, bgIcon }, index) => (
            <motion.article
              className="process-card"
              custom={index}
              data-card-index={index + 1}
              initial="hidden"
              key={title}
              variants={processCardReveal}
              viewport={{ once: true, amount: 0.45 }}
              whileHover={surfaceHover}
              whileInView="show"
            >
              <span className="process-icon">
                <img src={icon} alt="" />
              </span>
              <img className="process-faded-icon" src={bgIcon} alt="" />
              <div className="process-card-content">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
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
      <img src={item.image} alt="" />
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
        <Eyebrow>BENEFITS</Eyebrow>
        <WordHeading>Practical Solutions for Real Farm Challenges.</WordHeading>
        <p className="section-lede">
          Our biogas systems are designed to solve the everyday problems farmers face — from rising fuel costs to waste management.
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
      <p>“A team of young people who wake up the market, have expertise in-house and gain experience in the field, offer a tailor-made solution to the customer.”</p>
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
      <Eyebrow>TESTIMONIALS</Eyebrow>
      <WordHeading>Trusted by Leading Agricultural Innovators</WordHeading>
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
      <Button className="testimonial-cta">Free Energy Assessment</Button>
    </section>
  )
}

function Projects() {
  return (
    <section className="section projects-section" id="projects">
      <div className="section-row-heading">
        <div>
          <Eyebrow>SEE OUR PROJECTS</Eyebrow>
          <WordHeading>See How We’re Powering Change Around the World</WordHeading>
        </div>
        <Button>View all projects</Button>
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
              <Button>View Details</Button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function Blog() {
  return (
    <section className="section blog-section" id="blogs">
      <div className="section-row-heading">
        <div>
          <Eyebrow>OUR BLOG</Eyebrow>
          <WordHeading>Our latest insights</WordHeading>
        </div>
        <Button>View all posts</Button>
      </div>
      <div className="blog-grid">
        {blogPosts.map((post) => (
          <motion.article className="blog-card" key={post.title} variants={sourceReveal} initial="hidden" whileHover={surfaceHover} whileInView="show" viewport={{ once: true }}>
            <img src={post.image} alt="" />
            <div className="blog-card-body">
              <h3>{post.title}</h3>
              <p>{post.text}</p>
              <div>
                <span>{post.category}</span>
                <span>{post.date}</span>
                <a href="#blogs">Read blog</a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}


function PartnersFaqLocation() {
  const [activeTab, setActiveTab] = useState('Getting stared')
  const [openFaq, setOpenFaq] = useState(-1)
  const tabs = ['Getting stared', 'Collaboration', 'Support']

  return (
    <>
      <section className="section partners-section">
        <div className="section-center">
          <Eyebrow>OUR PARTNERS</Eyebrow>
          <WordHeading>Brands we partner with</WordHeading>
        </div>
        <motion.div className="partner-grid" initial="hidden" variants={listContainer} viewport={{ once: true, amount: 0.25 }} whileInView="show">
          {partnerLogos.map((logo, index) => (
            <motion.article className="partner-card" key={`${logo}-${index}`} variants={sourceReveal} whileHover={surfaceHover}>
              <img src={logo} alt="" />
              <span>{index + 1}. Chain</span>
            </motion.article>
          ))}
        </motion.div>
      </section>
      <section className="section faq-section">
        <div className="faq-copy">
          <Eyebrow>FAQs</Eyebrow>
          <WordHeading>Got questions?</WordHeading>
          <p>We’re here to make biogas easy to understand. Find answers to the most common questions below.</p>
        </div>
        <motion.div className="faq-panel" variants={sourceFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          <div className="faq-tabs" role="tablist" aria-label="FAQ categories">
            {tabs.map((tab) => (
              <button className={tab === activeTab ? 'active' : ''} key={tab} type="button" onClick={() => setActiveTab(tab)}>
                {tab}
                {tab === activeTab ? <motion.span className="faq-tab-underline" layoutId="faq-tab-underline" /> : null}
              </button>
            ))}
          </div>
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
          <span>Still got questions?</span>
          <a href="mailto:hey@biogax.com">hey@biogax.com</a>
        </div>
      </section>
      <section className="section locations-section">
        <Eyebrow>LOCATIONS</Eyebrow>
        <WordHeading>We’ve made impact all over the world</WordHeading>
        <div className="map-wrap">
          <img src={assets.map} alt="" />
          {[
            ['83%', '47%'],
            ['29%', '68%'],
            ['65%', '39%'],
            ['73%', '50%'],
            ['65%', '56%'],
            ['16%', '49%'],
          ].map(([left, top], index) => (
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              className="map-pin"
              key={`${left}-${top}`}
              style={{ left, top }}
              transition={{ delay: index * 0.2, duration: 2.4, repeat: Infinity, repeatType: 'loop' }}
            >
              <MapPin size={15} />
            </motion.span>
          ))}
        </div>
      </section>
    </>
  )
}

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-cta">
        <h2>Ready to Transform Your Farm With Biogax?</h2>
        <Button>Free Energy Assessment</Button>
      </div>
      <div className="footer-main">
        <img src={assets.footerLogo} alt="Biogax" />
        <div>
          <h3>Links</h3>
          {['About', 'Services', 'Projects', 'Blog'].map((item) => (
            <a key={item} href={item === 'Blog' ? '#blogs' : `#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </div>
        <div>
          <h3>Socials</h3>
          {['LinkedIn', 'X', 'Instagram'].map((item) => (
            <a key={item} href="#contact">
              {item}
            </a>
          ))}
        </div>
        <div>
          <h3>Subscribe Newsletter</h3>
          <p>Sign up to get updates & news.</p>
          <form>
            <input aria-label="Email address" placeholder="Your email" type="email" />
            <button type="button">Submit</button>
          </form>
        </div>
      </div>
      <div className="footer-contact">
        <div>
          <Phone />
          <span>Phone No:</span>
          <strong>+542 456 789 963</strong>
        </div>
        <div>
          <Mail />
          <span>Email Address:</span>
          <strong>biogax@gmail.com</strong>
        </div>
        <div>
          <MapPin />
          <span>Location:</span>
          <strong>No: 59 A East Madison Street Baltimore, MD, USA, 4508</strong>
        </div>
      </div>
      <div className="footer-bottom">
        <span>©Biogax</span>
        <div>
          <a href="#contact">Privacy Policy</a>
          <a href="#contact">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  )
}

function TemplateBadge() {
  return (
    <div className="template-badge" aria-label="Template badge">
      <a href="#home">Get this template</a>
      <span>Made in Framer</span>
    </div>
  )
}

function App() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <BrandTicker />
        <Features />
        <Services />
        <AwardsProcess />
        <Benefits />
        <Projects />
        <Blog />
        <Testimonials />
        <PartnersFaqLocation />
      </main>
      <Footer />
      <TemplateBadge />
    </>
  )
}

export default App
