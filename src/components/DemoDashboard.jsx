import { useMemo, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Compass,
  Database,
  FileSearch,
  FileText,
  FileWarning,
  FolderCheck,
  Landmark,
  MapPin,
  Network,
  PackageCheck,
  Radar,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Users,
  WalletCards,
} from 'lucide-react'
import logo from '../assets/shiimain-logo.svg'
import controlCenter from '../data/araurayu-control-center.json'
import corruptionPatterns from '../data/araurayu-corruption-patterns.json'
import daneAdjustment from '../data/dane-2025-adjustment.json'
import municipalResponse from '../data/municipal-response.json'
import secopAuditPatterns from '../data/secop-audit-patterns-summary.json'
import secopHunger from '../data/secop-corruption-hunger.json'
import foodFulfillment from '../data/secop-food-fulfillment.json'
import territorialPriorities from '../data/territorial-priorities.json'
import timesfmForecast from '../data/timesfm-forecast.json'
import wayuuMvp from '../data/wayuu-mvp.json'

const controlContracts = controlCenter.contracts || []
const patternContracts = corruptionPatterns.contracts || []
const fulfillmentContracts = [
  ...(foodFulfillment.urgent_contracts || []),
  ...(foodFulfillment.top_contracts || []),
].filter((contract, index, rows) => rows.findIndex((item) => (item.contract_id || item.id || item.reference) === (contract.contract_id || contract.id || contract.reference)) === index)
const wayuuTerritories = wayuuMvp.territories || []
const priorityLocations = territorialPriorities.locations || []
const municipalRows = municipalResponse.municipalities || []
const hungerMunicipalities = secopHunger.municipalities || []
const fulfillmentMunicipalities = foodFulfillment.municipalities || []

const patternsByContractId = new Map(patternContracts.map((contract) => [contract.contract_id, contract]))
const fulfillmentByContractId = new Map(
  fulfillmentContracts.flatMap((contract) =>
    [contract.contract_id, contract.id, contract.reference].filter(Boolean).map((key) => [key, contract]),
  ),
)

const pageTabs = [
  {
    key: 'territory',
    label: 'Territorio',
    icon: MapPin,
    description: 'Necesidad, evidencia y exposición pública',
  },
  {
    key: 'contracts',
    label: 'Contratos',
    icon: FolderCheck,
    description: 'Contexto contractual y fuentes visibles',
  },
  {
    key: 'signals',
    label: 'Señales',
    icon: Radar,
    description: 'Patrones, entrega y brechas públicas',
  },
  {
    key: 'evidence',
    label: 'Evidencia',
    icon: FileSearch,
    description: 'Documentos, extracción y calidad de fuente',
  },
  {
    key: 'sources',
    label: 'Fuentes',
    icon: Database,
    description: 'Trazabilidad pública',
  },
]

const auditFlagCopy = {
  'Billion-peso contract': 'Contrato de miles de millones',
  'Billion-peso food-adjacent contracts': 'Contratos alimentarios de miles de millones',
  'Direct contracting': 'Contratación directa',
  'Direct contracting dominates food-adjacent spend': 'Contratación directa domina gasto alimentario',
  'High hunger municipality': 'Municipio con hambre alta',
  'High hunger overlaps procurement risk': 'Hambre alta cruza con riesgo contractual',
  'Modified contract': 'Contrato modificado',
  'Names 1 local place': 'Nombra 1 lugar local',
  'Names 2 local places': 'Nombra 2 lugares locales',
  'Repeated modified contracts': 'Modificaciones repetidas',
  'School meals / PAE': 'PAE / alimentación escolar',
  'Supplier concentration': 'Concentración de proveedor',
  'UNGRD shock without reported food kits': 'Choque UNGRD sin kits alimentarios reportados',
  'Very high value': 'Valor muy alto',
}

const roleCopy = {
  buyer_entity: 'Entidad relacionada',
  supplier_direct: 'Proveedor directo',
  supplier_group_member: 'UT participada',
}

const sourceStatusCopy = {
  found: 'Fuente localizada',
  found_unreadable_text: 'Texto público débil',
  missing: 'Brecha de fuente',
  partial: 'Parcial',
  present: 'Fuente localizada',
}

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const normalizeKey = (value) => normalize(value).replace(/[^a-z0-9]/g, '')

const money = (value) => {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatNumber = (value) => Number(value || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })

const formatDecimal = (value, digits = 1) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed.toLocaleString('es-CO', { maximumFractionDigits: digits }) : 'Sin dato'
}

const formatPercent = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? `${parsed.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%` : 'Sin dato'
}

const formatMoney = (value) => {
  const number = money(value)
  if (!number) return '$0'
  if (Math.abs(number) >= 1_000_000_000_000) {
    return `$${(number / 1_000_000_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}T`
  }
  if (Math.abs(number) >= 1_000_000_000) {
    return `$${(number / 1_000_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}B`
  }
  if (Math.abs(number) >= 1_000_000) {
    return `$${(number / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`
  }
  return `$${formatNumber(number)}`
}

const formatDate = (value) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

const shortText = (value, length = 170) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

const auditFlag = (value) => auditFlagCopy[value] || value

const sourceStatus = (value) => sourceStatusCopy[value] || value || 'Fuente pública'

const scoreTone = (score) => {
  if (score >= 80) return 'danger'
  if (score >= 60) return 'warning'
  return ''
}

const includesQuery = (row, query) => {
  if (!query) return true
  return normalize(JSON.stringify(row)).includes(normalize(query))
}

const documentKey = (document, fallback = 'documento') =>
  String(document?.document_id || document?.id || document?.url || document?.download_url || document?.name || document?.label || fallback)

const publicSourceLinkProps = (url) => ({
  'aria-disabled': !url,
  href: url || '#',
  onClick: url ? undefined : (event) => event.preventDefault(),
})

const safeSources = (sources) => {
  if (Array.isArray(sources)) {
    return sources.map((source) => (typeof source === 'string' ? { name: source, use: 'Contexto público' } : source))
  }
  if (sources && typeof sources === 'object') {
    return Object.entries(sources).map(([name, url]) => ({ name, url, use: 'Contexto público' }))
  }
  return []
}

const sourceLabel = (text) =>
  String(text || '')
    .replace(/Plan de pagos/gi, 'Ejecución financiera pública')
    .replace(/pagos/gi, 'ejecución financiera')
    .replace(/pago/gi, 'ejecución financiera')

const recommendationSignal = (value) => {
  const text = String(value || '').trim()
  const key = normalize(text)

  if (!text) return 'Sin señal pública específica'
  if (key.includes('hot meals') || key.includes('ready-to-eat') || key.includes('comidas listas') || key.includes('calientes')) {
    return 'Alimentación preparada: verificar raciones entregadas y soporte por comunidad'
  }
  if (key.includes('emergency food kits') || key.includes('kits alimentarios de emergencia')) {
    return 'Kits de emergencia: verificar familias atendidas, fechas y soportes'
  }
  if (key.includes('standard food kit') || key.includes('kit alimentario estandar')) {
    return 'Paquetes alimentarios: verificar beneficiarios, fechas y contenido'
  }
  if (key.includes('water-safe') || key.includes('agua')) {
    return 'Agua segura + nutrición: verificar condiciones de preparación y entrega'
  }

  return text
}

const recommendationReason = (value) => {
  const text = String(value || '').trim()
  const key = normalize(text)

  if (!text) return 'necesidad territorial visible en fuentes públicas'
  if (key.includes('household cooking constraints')) return 'restricciones de cocina y almacenamiento en hogares'
  if (key.includes('recent emergency impact')) return 'impacto reciente de emergencia alto frente a ayuda alimentaria reportada'
  if (key.includes('risk exists')) return 'riesgo presente sin una modalidad dominante en los datos'
  if (key.includes('water quality risk')) return 'riesgo de agua que condiciona la preparación segura de alimentos'

  return text
}

const recommendationWarning = (value) => {
  const text = String(value || '').trim()
  const key = normalize(text)

  if (!text) return ''
  if (key.includes('avoid perishables')) return 'Verificar que la entrega no dependa de perecederos o cadena de frío sin evidencia operativa.'
  if (key.includes('avoid raw')) return 'Si hay kits crudos, confirmar apoyo para cocción, agua y combustible.'
  if (key.includes('shock reported')) return 'Contrastar choque UNGRD con evidencia de kits o entregas reportadas.'
  if (key.includes('coverage gap')) return 'Revisar posible brecha de cobertura: riesgo alto con baja señal activa de programas alimentarios.'
  if (key.includes('water-safe')) return 'Exigir evidencia de agua segura o tratamiento cuando la entrega requiera preparación.'

  return text
}

const buildLookup = (items, getKey) => {
  const lookup = new Map()
  items.forEach((item) => {
    const key = getKey(item)
    if (key) lookup.set(normalizeKey(key), item)
  })
  return lookup
}

const municipalByCode = buildLookup(municipalRows, (row) => row.code)
const municipalByName = buildLookup(municipalRows, (row) => `${row.name}-${row.department}`)
const hungerByName = buildLookup(hungerMunicipalities, (row) => `${row.name}-${row.department}`)
const timesfmByCode = buildLookup(timesfmForecast.municipalities || [], (row) => row.code)
const daneByCode = buildLookup(daneAdjustment.municipalities || [], (row) => row.code)
const fulfillmentByName = buildLookup(fulfillmentMunicipalities, (row) => `${row.municipality}-${row.department}`)

const findMunicipal = (name, department = 'LA GUAJIRA') =>
  municipalByName.get(normalizeKey(`${name}-${department}`)) || municipalRows.find((row) => normalize(row.name) === normalize(name))

const findHunger = (name, department = 'LA GUAJIRA') =>
  hungerByName.get(normalizeKey(`${name}-${department}`)) || hungerMunicipalities.find((row) => normalize(row.name) === normalize(name))

const findFulfillment = (name, department = 'La Guajira') =>
  fulfillmentByName.get(normalizeKey(`${name}-${department}`)) || fulfillmentMunicipalities.find((row) => normalize(row.municipality) === normalize(name))

const buildTerritoryRows = () => {
  const wayuuRows = wayuuTerritories
    .map((territory) => {
      const municipal = findMunicipal(territory.municipality)
      const hunger = findHunger(territory.municipality)
      const forecast = timesfmByCode.get(normalizeKey(municipal?.code || territory.code))
      const dane = daneByCode.get(normalizeKey(municipal?.code || territory.code))
      const fulfillment = findFulfillment(territory.municipality)
      const relatedLocations = priorityLocations
        .filter((location) => normalize(location.municipality) === normalize(territory.municipality))
        .sort((left, right) => money(right.priority_score) - money(left.priority_score))
        .slice(0, 4)
      const localContracts = relatedLocations.flatMap((location) => location.contracts?.top_contracts || [])
      const evidenceGaps = territory.evidence_gaps || []
      const score = Math.max(money(territory.priority_score), money(hunger?.audit_priority_score), money(relatedLocations[0]?.priority_score))

      return {
        ...territory,
        dane,
        evidenceGaps,
        filterText: [
          territory.name,
          territory.municipality,
          territory.primary_issue,
          territory.next_step,
          territory.contracts?.summary,
          evidenceGaps.join(' '),
          relatedLocations.map((location) => [location.name, location.recommendation_label, recommendationSignal(location.recommendation_label || location.recommendation)].join(' ')).join(' '),
          localContracts.map((contract) => [contract.proveedor, contract.objeto, contract.flags?.join(' ')].join(' ')).join(' '),
        ].join(' '),
        forecast,
        fulfillment,
        hunger,
        localContracts,
        municipal,
        relatedLocations,
        score,
      }
    })

  const municipalityRows = hungerMunicipalities
    .filter((row) => normalize(row.department) === 'la guajira')
    .map((row) => {
      const municipal = municipalByCode.get(normalizeKey(row.code)) || findMunicipal(row.name)
      const forecast = timesfmByCode.get(normalizeKey(row.code))
      const dane = daneByCode.get(normalizeKey(row.code))
      const fulfillment = findFulfillment(row.name)
      const relatedLocations = priorityLocations
        .filter((location) => normalize(location.municipality) === normalize(row.name))
        .sort((left, right) => money(right.priority_score) - money(left.priority_score))
        .slice(0, 4)
      const localContracts = (row.top_contracts || []).slice(0, 5)
      const warnings = (municipal?.recommendation?.warnings || []).map(recommendationWarning).filter(Boolean)
      const evidenceGaps = [
        ...warnings,
        ...(row.flags || []).includes('UNGRD shock without reported food kits') ? ['Contrastar choque UNGRD con evidencia de kits o entregas reportadas'] : [],
        !localContracts.length ? ['Identificar contrato alimentario que nombre el municipio o lugar específico'] : [],
      ].slice(0, 5)

      return {
        code: row.code,
        contracts: { summary: `${formatNumber(row.contract_count)} contratos alimentarios o adyacentes mapeados.` },
        dane,
        department: row.department,
        evidenceGaps,
        filterText: [
          row.name,
          row.department,
          row.relationship,
          row.top_supplier,
          row.flags?.join(' '),
          recommendationSignal(municipal?.recommendation?.primary),
          recommendationReason(municipal?.recommendation?.reason),
          warnings.join(' '),
          localContracts.map((contract) => [contract.proveedor, contract.objeto, contract.flags?.join(' ')].join(' ')).join(' '),
        ].join(' '),
        forecast,
        fulfillment,
        hunger: row,
        id: `municipality-${row.code}`,
        localContracts,
        municipal,
        municipality: row.name,
        name: row.name,
        next_step: 'Comparar necesidad municipal con contratos que nombran lugares específicos, soportes de entrega y evidencia comunitaria.',
        plain_answers: {
          gap: evidenceGaps[0] || 'La fuente pública requiere verificación territorial complementaria.',
          need: municipal?.recommendation?.reason
            ? `${row.name} combina ${formatDecimal(row.hunger_score)} de hambre con ${recommendationReason(municipal.recommendation.reason)}.`
            : row.relationship || 'Cruce municipal de necesidad y riesgo contractual.',
          promise: `${formatNumber(row.contract_count)} contratos públicos mapeados por municipio; proveedor más visible: ${row.top_supplier || 'sin dato'}.`,
        },
        primary_issue: row.relationship || 'Municipio priorizado por cruce de necesidad y contratación pública.',
        relatedLocations,
        score: money(row.audit_priority_score),
        type: 'Municipio',
        user_summary: `${row.name} se lee como una ficha municipal: necesidad, exposición contractual, evidencia visible y brechas que deben comprobarse antes de afirmar cobertura.`,
      }
    })

  return [...wayuuRows, ...municipalityRows].sort((left, right) => right.score - left.score)
}

const buildMunicipalityRows = () =>
  hungerMunicipalities
    .filter((row) => normalize(row.department) === 'la guajira')
    .map((row) => {
      const municipal = municipalByCode.get(normalizeKey(row.code)) || findMunicipal(row.name)
      const forecast = timesfmByCode.get(normalizeKey(row.code))
      const dane = daneByCode.get(normalizeKey(row.code))
      const fulfillment = findFulfillment(row.name)
      const locations = priorityLocations
        .filter((location) => normalize(location.municipality) === normalize(row.name))
        .sort((left, right) => money(right.priority_score) - money(left.priority_score))
        .slice(0, 3)
      return {
        ...row,
        dane,
        filterText: [row.name, row.department, row.relationship, row.top_supplier, row.flags?.join(' '), row.top_contracts?.map((contract) => contract.proveedor).join(' ')].join(' '),
        forecast,
        fulfillment,
        locations,
        municipal,
      }
    })
    .sort((left, right) => money(right.audit_priority_score) - money(left.audit_priority_score))

const buildContractRows = () =>
  controlContracts
    .map((contract) => {
      const pattern = patternsByContractId.get(contract.id)
      const fulfillment = fulfillmentByContractId.get(contract.id) || fulfillmentByContractId.get(contract.reference)
      const municipality = contract.municipality || contract.city || fulfillment?.municipality || 'La Guajira'
      const evidenceFiles = [
        ...(contract.files?.evidence_files || []),
        ...(fulfillment?.public_fulfillment?.delivery_evidence_files || []),
      ].filter((file, index, rows) => rows.findIndex((candidate) => (candidate.document_id || candidate.url) === (file.document_id || file.url)) === index)
      return {
        ...contract,
        evidenceFiles,
        filterText: [
          contract.reference,
          contract.id,
          contract.object,
          contract.supplier_name,
          contract.counterparty,
          contract.entity_name,
          municipality,
          contract.review?.all?.join(' '),
          fulfillment?.flags?.join(' '),
          pattern?.signals?.map((signal) => `${signal.title} ${signal.reason}`).join(' '),
        ].join(' '),
        fulfillment,
        municipality,
        pattern,
      }
    })
    .sort((left, right) => money(right.value) - money(left.value))

const buildSignalRows = (municipalityRows) => {
  const territorySignals = municipalityRows.slice(0, 8).map((row) => ({
    id: `municipality-${row.code}`,
    category: 'Territorio',
    detail: `${formatDecimal(row.hunger_score)} hambre · ${formatDecimal(row.procurement_risk_score)} riesgo contractual`,
    flags: row.flags || [],
    municipality: row.name,
    score: row.audit_priority_score,
    source: 'Cruce SECOP + DANE + UNGRD',
    supplier: row.top_supplier,
    text: row.relationship || 'Cruce de necesidad y contratación pública',
    title: `${row.name}, ${row.department}`,
    type: 'territory',
  }))

  const deliverySignals = fulfillmentContracts
    .slice(0, 6)
    .map((contract) => ({
      id: `delivery-${contract.id || contract.reference}`,
      category: 'Entrega visible',
      detail: `${formatNumber(contract.delivery_evidence_file_rows)} archivos de entrega · confianza ${formatNumber(contract.arrival_confidence)}`,
      flags: contract.flags || [],
      municipality: contract.municipality || contract.city,
      score: contract.audit_score,
      source: 'SECOP archivos + ejecución pública',
      supplier: contract.supplier_name,
      text: shortText(contract.object, 190),
      title: contract.reference || contract.id,
      type: 'delivery',
    }))

  const contractSignals = patternContracts.slice(0, 8).map((contract) => ({
    id: `pattern-${contract.contract_id}`,
    category: 'Patrón contractual',
    detail: `${formatNumber(contract.signal_count)} señales · ${formatNumber(contract.evidence_ref_count)} referencias`,
    flags: (contract.signals || []).map((signal) => signal.title),
    municipality: contract.municipality || 'La Guajira',
    score: contract.risk_score,
    source: 'Reglas sobre expediente público',
    supplier: contract.supplier_name,
    text: contract.signals?.[0]?.reason || 'Patrón público para revisión analítica.',
    title: contract.reference || contract.contract_id,
    type: 'contract',
  }))

  return [...territorySignals, ...deliverySignals, ...contractSignals].sort((left, right) => money(right.score) - money(left.score))
}

const buildEvidenceRows = () => {
  const deliveryDocs = fulfillmentContracts.flatMap((contract) =>
    (contract.public_fulfillment?.delivery_evidence_files || []).slice(0, 5).map((document) => ({
      category: 'Soporte de entrega',
      detail: `${contract.reference || contract.contract_id} · ${contract.supplier_name}`,
      documentId: document.document_id,
      excerpt: document.pdf_text_excerpt,
      extension: document.extension,
      id: `${contract.contract_id || contract.id}-${document.document_id || document.name}`,
      name: document.name || document.description || 'Documento público',
      sourceUrl: document.url,
      status: document.pdf_text_readable === false ? 'found_unreadable_text' : 'found',
      url: document.url,
    })),
  )

  const controlDocs = controlContracts.flatMap((contract) =>
    (contract.files?.evidence_files || []).slice(0, 4).map((document) => ({
      category: 'Archivo SECOP',
      detail: `${contract.reference || contract.id} · ${contract.supplier_name || contract.counterparty || 'Sin contraparte'}`,
      documentId: document.document_id,
      excerpt: document.pdf_text_excerpt,
      extension: document.extension,
      id: `${contract.id}-${document.document_id || document.name}`,
      name: document.name || document.description || 'Documento público',
      sourceUrl: document.url || document.download_url,
      status: document.pdf_text_status || 'found',
      url: document.url || document.download_url,
    })),
  )

  return [...deliveryDocs, ...controlDocs]
}

const buildSourceRows = () => {
  const sourceGroups = [
    ['Territorio Wayuu', safeSources(wayuuMvp.sources)],
    ['Prioridad territorial', safeSources(territorialPriorities.sources)],
    ['Respuesta municipal', safeSources(municipalResponse.sources)],
    ['SECOP + hambre', safeSources(secopHunger.sources)],
    ['Cumplimiento visible', safeSources(foodFulfillment.sources)],
    ['Caso Araurayu', safeSources(controlCenter.sources)],
  ]

  return sourceGroups.flatMap(([category, sources]) =>
    sources.map((source, index) => ({
      category,
      id: `${category}-${source.name || index}`,
      name: sourceLabel(source.name || source.dataset || source.url || `Fuente ${index + 1}`),
      use: sourceLabel(source.use || source.url || 'Contexto público'),
      url: source.url,
    })),
  )
}

function MetricCard({ detail, icon: Icon, label, tone = '', value }) {
  return (
    <article className={`demo-metric ${tone}`}>
      <span>
        <Icon size={22} />
      </span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
        {detail ? <em>{detail}</em> : null}
      </div>
    </article>
  )
}

function StatusPill({ children, tone = '' }) {
  return <span className={`demo-status ${tone}`}>{children}</span>
}

function AuditFlag({ children }) {
  return <span className="audit-flag">{children}</span>
}

function DemoHeader() {
  return (
    <header className="demo-header">
      <a className="demo-brand" href="#home" aria-label="Volver al inicio de Shiimain">
        <img src={logo} alt="Shiimain" />
      </a>
      <nav aria-label="Navegación de Shiimain">
        <a href="#home">
          <ArrowLeft size={16} />
          Inicio
        </a>
        <a href="#contact">Contacto</a>
      </nav>
    </header>
  )
}

function PageNav({ activePage, counts, onChange }) {
  return (
    <nav className="demo-page-nav" aria-label="Secciones de inteligencia">
      {pageTabs.map(({ description, icon: Icon, key, label }) => (
        <button aria-label={label} className={activePage === key ? 'active' : ''} key={key} type="button" onClick={() => onChange(key)}>
          <span>
            <Icon size={20} />
          </span>
          <strong>{label}</strong>
          <b>{counts[key]}</b>
          <small>{description}</small>
        </button>
      ))}
    </nav>
  )
}

function EmptyState({ children }) {
  return <p className="demo-empty">{children}</p>
}

function TerritoryPage({ municipalityRows, territoryRows }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(territoryRows[0]?.id)

  const filteredTerritories = territoryRows.filter((territory) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'gap' && territory.evidenceGaps.length) ||
      (filter === 'contracts' && territory.localContracts.length) ||
      (filter === 'critical' && territory.score >= 75)
    return matchesFilter && includesQuery(territory.filterText, query)
  })
  const selected = filteredTerritories.find((territory) => territory.id === selectedId) || filteredTerritories[0] || territoryRows[0]
  const topLocations = selected?.relatedLocations || []

  return (
    <section className="territory-page">
      <div className="demo-panel territory-command-panel">
        <div className="demo-panel-head">
          <div>
            <span className="eyebrow">Inteligencia territorial</span>
            <h2>Territorios priorizados en La Guajira</h2>
            <p>
              Cruza municipio, territorio, necesidad, exposición contractual y brechas de evidencia para decidir dónde mirar primero.
            </p>
          </div>
          <label className="demo-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar territorio, municipio, proveedor o bandera" />
          </label>
        </div>
        <div className="demo-filter-row">
          {[
            ['all', 'Todos'],
            ['critical', 'Alta prioridad'],
            ['gap', 'Brecha de evidencia'],
            ['contracts', 'Con contrato nombrado'],
          ].map(([key, label]) => (
            <button className={filter === key ? 'active' : ''} key={key} type="button" onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="territory-overview-grid">
          <div className="territory-priority-list territory-selector-list">
            {filteredTerritories.map((territory) => (
              <button className={selected?.id === territory.id ? 'active territory-priority-card' : 'territory-priority-card'} key={territory.id} type="button" onClick={() => setSelectedId(territory.id)}>
                <span className="pattern-score">{formatNumber(territory.score)}</span>
                <div>
                  <header>
                    <strong>{territory.name}</strong>
                    <small>{territory.type} · {territory.municipality}</small>
                  </header>
                  <p>{territory.primary_issue}</p>
                  <div className="municipality-risk-line">
                    <span>Hambre {formatDecimal(territory.hunger?.hunger_score)}</span>
                    <span>{formatNumber(territory.evidenceGaps.length)} brechas</span>
                    <span>{formatNumber(territory.localContracts.length)} contratos nombran zona</span>
                  </div>
                </div>
              </button>
            ))}
            {!filteredTerritories.length ? <EmptyState>No hay territorios que coincidan con esa búsqueda.</EmptyState> : null}
          </div>
        </div>
      </div>

      {selected ? (
        <div className="demo-panel territory-detail-panel">
          <div className="contract-detail-title">
            <div>
              <span className="eyebrow">Ficha de territorio</span>
              <h2>{selected.name}, {selected.municipality}</h2>
              <p>{selected.user_summary}</p>
            </div>
            <StatusPill tone={scoreTone(selected.score)}>Prioridad {formatNumber(selected.score)}</StatusPill>
          </div>

          <div className="territory-insight-grid">
            <article>
              <Compass size={20} />
              <strong>Por qué importa</strong>
              <p>{selected.plain_answers?.need || selected.primary_issue}</p>
            </article>
            <article>
              <CheckCircle2 size={20} />
              <strong>Promesa pública visible</strong>
              <p>{selected.plain_answers?.promise || selected.contracts?.summary || 'Sin promesa específica en la fuente pública.'}</p>
            </article>
            <article>
              <FileWarning size={20} />
              <strong>Brecha que cambia la lectura</strong>
              <p>{selected.plain_answers?.gap || selected.evidenceGaps[0] || 'No hay brecha principal registrada.'}</p>
            </article>
          </div>

          <div className="territory-detail-columns">
            <section>
              <h3>Señales municipales</h3>
              <div className="territory-stat-list">
                <span><b>{formatDecimal(selected.hunger?.hunger_score)}</b><small>hambre municipal</small></span>
                <span><b>{formatDecimal(selected.hunger?.procurement_risk_score)}</b><small>riesgo contractual</small></span>
                <span><b>{formatPercent(selected.municipal?.household?.no_fridge_pct * 100)}</b><small>hogares sin nevera</small></span>
                <span><b>{formatNumber(selected.municipal?.shock?.people_affected)}</b><small>personas afectadas UNGRD</small></span>
                <span><b>{formatDecimal(selected.forecast?.timesfm_score)}</b><small>score forecast</small></span>
                <span><b>{formatDecimal(selected.dane?.dane_timesfm_score)}</b><small>DANE + forecast</small></span>
              </div>
            </section>
            <section>
              <h3>Preguntas de inteligencia</h3>
              <ol className="next-action-list intelligence-question-list">
                <li>{selected.next_step}</li>
                {selected.evidenceGaps.slice(0, 4).map((gap) => <li key={gap}>{gap}</li>)}
              </ol>
            </section>
          </div>

          <div className="territory-detail-columns">
            <section>
              <h3>Lugares cercanos y qué comprobar</h3>
              <div className="source-table compact-source-table">
                {topLocations.map((location) => (
                  <a href="#/demo" key={location.id} onClick={(event) => event.preventDefault()}>
                    <span>{formatNumber(location.priority_score)}</span>
                    <strong>{location.name}</strong>
                    <small>{recommendationSignal(location.recommendation_label || location.recommendation)}</small>
                  </a>
                ))}
                {!topLocations.length ? <EmptyState>Sin lugares de prioridad asociados en esta ficha.</EmptyState> : null}
              </div>
            </section>
            <section>
              <h3>Contratos relacionados por mención territorial</h3>
              <div className="risk-list">
                {selected.localContracts.slice(0, 3).map((contract) => (
                  <article key={`${contract.id_contrato}-${contract.referencia}`}>
                    <div>
                      <StatusPill tone={scoreTone(contract.audit_score)}>{formatNumber(contract.audit_score)} prioridad</StatusPill>
                      <strong>{contract.referencia || contract.id_contrato}</strong>
                    </div>
                    <p>{shortText(contract.objeto, 160)}</p>
                    <small>{contract.proveedor || 'Proveedor no visible'} · {contract.valor_label || formatMoney(contract.valor)}</small>
                    <div className="audit-flag-list">
                      {(contract.flags || []).slice(0, 4).map((flag) => <AuditFlag key={`${contract.id_contrato}-${flag}`}>{auditFlag(flag)}</AuditFlag>)}
                    </div>
                  </article>
                ))}
                {!selected.localContracts.length ? <EmptyState>No hay contrato público que nombre este territorio exacto.</EmptyState> : null}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      <div className="demo-panel territory-audit-panel">
        <div className="demo-panel-head compact">
          <span className="eyebrow">Municipios priorizados</span>
          <h2>La Guajira vista como mapa de riesgo público, no como lista de contratos</h2>
          <p>Los municipios combinan hambre, condiciones de hogar, choque reportado, valor contractual, concentración y visibilidad documental.</p>
        </div>
        <div className="territory-priority-list">
          {municipalityRows.slice(0, 6).map((municipality) => (
            <article className="territory-priority-card" key={municipality.code}>
              <span className="pattern-score">{formatNumber(municipality.audit_priority_score)}</span>
              <div>
                <header>
                  <strong>{municipality.name}, {municipality.department}</strong>
                  <small>{municipality.total_value_label} · {formatNumber(municipality.contract_count)} contratos alimentarios o adyacentes</small>
                </header>
                <div className="municipality-risk-line">
                  <span>Hambre {formatDecimal(municipality.hunger_score)}</span>
                  <span>Contratación directa {formatPercent(municipality.direct_contract_value_pct)}</span>
                  <span>{formatNumber(municipality.locations.length)} lugares priorizados</span>
                  <span>{municipality.fulfillment?.urgent_count || 0} entrega urgente</span>
                </div>
                <p>Proveedor más visible: {municipality.top_supplier || 'Sin dato'} · {recommendationSignal(municipality.municipal?.recommendation?.primary)}.</p>
                <div className="audit-flag-list">
                  {(municipality.flags || []).slice(0, 4).map((flag) => <AuditFlag key={`${municipality.code}-${flag}`}>{auditFlag(flag)}</AuditFlag>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContractsPage({ contractRows }) {
  const [query, setQuery] = useState('')
  const [contextFilter, setContextFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(contractRows[0]?.id)
  const [selectedDocumentKey, setSelectedDocumentKey] = useState(null)

  const filteredContracts = contractRows.filter((contract) => {
    const matchesFilter =
      contextFilter === 'all' ||
      (contextFilter === 'araurayu' && contract.role_keys?.length) ||
      (contextFilter === 'signals' && (contract.pattern?.signals?.length || ['review', 'watch'].includes(contract.review?.state))) ||
      (contextFilter === 'evidence' && contract.evidenceFiles.length)
    return matchesFilter && includesQuery(contract.filterText, query)
  })
  const selected = filteredContracts.find((contract) => contract.id === selectedId) || filteredContracts[0] || contractRows[0]
  const invoice = selected?.telemetry?.invoice || {}
  const execution = selected?.telemetry?.execution || {}
  const fulfillment = selected?.fulfillment?.public_fulfillment || {}
  const selectedDocument =
    selected?.evidenceFiles?.find((source) => documentKey(source) === selectedDocumentKey) ||
    selected?.evidenceFiles?.[0]

  return (
    <section className="contract-workbench">
      <aside className="demo-panel contract-list-panel">
        <div className="demo-panel-head compact">
          <span className="eyebrow">Contratos como contexto</span>
          <h2>{formatNumber(filteredContracts.length)} registros públicos</h2>
        </div>
        <label className="demo-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar municipio, proveedor, referencia o bandera" />
        </label>
        <div className="demo-filter-row">
          {[
            ['all', 'Todos'],
            ['araurayu', 'Caso Araurayu'],
            ['signals', 'Con señales'],
            ['evidence', 'Con documentos'],
          ].map(([key, label]) => (
            <button className={contextFilter === key ? 'active' : ''} key={key} type="button" onClick={() => setContextFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="contract-list">
          {filteredContracts.map((contract) => (
            <button className={selected?.id === contract.id ? 'active' : ''} key={contract.id} type="button" onClick={() => setSelectedId(contract.id)}>
              <strong>{contract.reference || contract.id}</strong>
              <span>{shortText(contract.supplier_name || contract.counterparty || contract.entity_name, 70)}</span>
              <small>{contract.municipality} · {formatMoney(contract.value)}</small>
            </button>
          ))}
        </div>
      </aside>

      {selected ? (
        <div className="demo-panel contract-detail-panel">
          <div className="contract-detail-title">
            <div>
              <span className="eyebrow">Ficha pública</span>
              <h2>{selected.reference || selected.id}</h2>
              <p>{shortText(selected.object || selected.fulfillment?.object, 260)}</p>
            </div>
            <StatusPill tone={selected.pattern?.risk_score >= 70 ? 'warning' : ''}>
              {roleCopy[selected.role_keys?.[0]] || selected.role_label || 'Contexto público'}
            </StatusPill>
          </div>
          <div className="contract-detail-metrics">
            <MetricCard icon={Landmark} label="Valor contractual" value={formatMoney(selected.value)} />
            <MetricCard icon={WalletCards} label="Ejecución financiera visible" value={formatMoney(selected.paid_value || selected.fulfillment?.paid_value || invoice.invoice_confirmed_paid_total)} />
            <MetricCard icon={FileText} label="Archivos fuente" value={formatNumber(selected.evidenceFiles.length || selected.files?.file_rows)} />
          </div>

          <div className="contract-columns">
            <section>
              <h3>Contexto financiero público</h3>
              <article className="financial-context-card">
                <p>Exposición financiera visible para leer el contrato junto con territorio y evidencia.</p>
                <div className="contract-audit-meta">
                  <span><b>{formatNumber(invoice.invoice_rows || fulfillment.invoice_rows)}</b><small>filas de factura</small></span>
                  <span><b>{formatMoney(invoice.invoice_total || fulfillment.invoice_total)}</b><small>valor facturado</small></span>
                  <span><b>{formatPercent(selected.telemetry?.financial_execution_percent || fulfillment.financial_execution_percent)}</b><small>ejecución financiera</small></span>
                  <span><b>{formatNumber(execution.actual_progress_max || fulfillment.actual_progress_max)}</b><small>avance público máximo</small></span>
                </div>
              </article>
            </section>
            <section>
              <h3>Señales asociadas</h3>
              <div className="pattern-signal-list">
                {(selected.pattern?.signals || selected.review?.all || []).slice(0, 8).map((signal) => {
                  const label = typeof signal === 'string' ? signal : signal.title
                  return <AuditFlag key={`${selected.id}-${label}`}>{label}</AuditFlag>
                })}
                {!(selected.pattern?.signals || selected.review?.all || []).length ? <AuditFlag>Sin señal fuerte en esta capa</AuditFlag> : null}
              </div>
              <p>{selected.pattern?.signals?.[0]?.reason || selected.review?.label || 'Señal disponible para orientar la siguiente revisión territorial.'}</p>
            </section>
          </div>

          <div className="contract-columns contract-extra">
            <section>
              <h3>Alcance territorial y evidencia</h3>
              <div className="mini-row">
                <div>
                  <strong>{selected.fulfillment?.municipality || selected.municipality || selected.city || 'La Guajira'}</strong>
                  <span>{selected.fulfillment?.arrival_label || selected.service_category || 'Sin detalle territorial específico'}</span>
                </div>
                <MapPin size={20} />
              </div>
              {(fulfillment.signals || []).slice(0, 4).map((signal) => (
                <div className="asset-row" key={signal.label}>
                  <span>
                    <strong>{signal.label}</strong>
                    <small>{signal.detail}</small>
                  </span>
                  <b>{signal.level}</b>
                </div>
              ))}
              {!fulfillment.signals?.length ? <EmptyState>Sin señales de entrega visibles para esta ficha.</EmptyState> : null}
            </section>
            <section>
              <h3>Documentos fuente</h3>
              {selectedDocument ? (
                <article className="document-preview-card">
                  <span>{sourceStatus(selectedDocument.status || selectedDocument.pdf_text_status || (selectedDocument.pdf_text_readable === false ? 'found_unreadable_text' : 'found'))}</span>
                  <strong>{selectedDocument.label || selectedDocument.name || selectedDocument.description || 'Documento público'}</strong>
                  <p>{selectedDocument.pdf_text_excerpt ? shortText(selectedDocument.pdf_text_excerpt, 220) : 'Sin resumen legible. Revisar soporte, fecha, entrega asociada y responsable.'}</p>
                  <small>ID {selectedDocument.document_id || 'sin ID visible'} · {selectedDocument.extension || selectedDocument.category || 'archivo público'}</small>
                </article>
              ) : null}
              <div className="source-table compact-source-table">
                {selected.evidenceFiles.slice(0, 8).map((source) => (
                  <button className={documentKey(selectedDocument) === documentKey(source) ? 'active' : ''} key={`${selected.id}-${documentKey(source)}`} type="button" onClick={() => setSelectedDocumentKey(documentKey(source))}>
                    <span>{sourceStatus(source.status || source.pdf_text_status || 'found')}</span>
                    <strong>{source.label || source.name || source.description || 'Documento público'}</strong>
                    <small>{source.document_id || source.category || formatDate(source.date)}</small>
                  </button>
                ))}
                {!selected.evidenceFiles.length ? <EmptyState>Sin documentos fuente para esta ficha.</EmptyState> : null}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function SignalsPage({ signalRows }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const filteredSignals = signalRows.filter((signal) => (type === 'all' || signal.type === type) && includesQuery(signal, query))

  return (
    <section className="intelligence-layout intelligence-expanded">
      <div className="demo-panel pattern-demo-panel">
        <div className="demo-panel-head">
          <div>
            <span className="eyebrow">Señales de inteligencia</span>
            <h2>Señales que muestran dónde mirar primero</h2>
            <p>Necesidad territorial, contratación, entrega visible y calidad documental reunidas en una lista de priorización.</p>
          </div>
          <label className="demo-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar bandera, proveedor, municipio o contrato" />
          </label>
        </div>
        <div className="demo-filter-row">
          {[
            ['all', 'Todas'],
            ['territory', 'Territorio'],
            ['delivery', 'Entrega visible'],
            ['contract', 'Contrato'],
          ].map(([key, label]) => (
            <button className={type === key ? 'active' : ''} key={key} type="button" onClick={() => setType(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="corruption-metrics">
          <span><strong>{formatNumber(secopHunger.summary?.matched_contract_count)}</strong> contratos georreferenciados</span>
          <span><strong>{secopHunger.summary?.total_value_label || formatMoney(secopHunger.summary?.total_value)}</strong> valor revisado</span>
          <span><strong>{formatNumber(foodFulfillment.summary?.contracts_checked)}</strong> contratos con entrega visible</span>
          <span><strong>{formatNumber(corruptionPatterns.summary?.total_signals)}</strong> señales del caso</span>
        </div>
        <div className="pattern-ledger-list">
          {filteredSignals.map((signal) => (
            <article className="pattern-ledger-row" key={signal.id}>
              <span className="pattern-score">{formatNumber(signal.score)}</span>
              <div className="pattern-ledger-main">
                <div>
                  <StatusPill tone={scoreTone(signal.score)}>{signal.category}</StatusPill>
                  <strong>{signal.title}</strong>
                  <small>{signal.municipality} · {signal.supplier || 'Sin proveedor destacado'}</small>
                </div>
                <p>{signal.text}</p>
                <div className="pattern-signal-list">
                  {signal.flags.slice(0, 5).map((flag) => <AuditFlag key={`${signal.id}-${flag}`}>{auditFlag(flag)}</AuditFlag>)}
                </div>
              </div>
              <div className="pattern-ledger-meta">
                <span>{signal.source}</span>
                <strong>{signal.detail}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="demo-panel detector-backlog-panel">
        <div className="demo-panel-head compact">
          <span className="eyebrow">Pendientes de verificación</span>
          <h2>Fuentes que faltan para cerrar la lectura</h2>
          <p>Qué está sustentado, qué se infiere y qué falta por confirmar antes de cerrar la lectura.</p>
        </div>
        <div className="detector-backlog-grid">
          {(secopAuditPatterns.detector_backlog || []).map((detector) => (
            <article key={detector.title}>
              <ShieldQuestion size={18} />
              <strong>{detector.title}</strong>
              <p>{detector.detail}</p>
              <small>Fuente requerida: {detector.needed_source}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function EvidencePage({ evidenceRows, sourceRows }) {
  const [query, setQuery] = useState('')
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null)
  const [status, setStatus] = useState('all')
  const filteredEvidence = evidenceRows.filter((row) => {
    const rowStatus = row.status || 'found'
    const matchesStatus = status === 'all' || (status === 'weak' && ['found_unreadable_text', 'partial'].includes(rowStatus)) || (status === 'gap' && rowStatus === 'missing') || (status === 'found' && rowStatus === 'found')
    return matchesStatus && includesQuery(row, query)
  })
  const selectedEvidence = filteredEvidence.find((row) => row.id === selectedEvidenceId) || filteredEvidence[0]

  return (
    <section className="sources-layout evidence-layout">
      <div className="demo-panel">
        <div className="demo-panel-head compact">
          <span className="eyebrow">Calidad documental</span>
          <h2>Evidencia detrás de cada lectura</h2>
          <p>Contratos, actas, soportes y extracciones se ordenan por estado de lectura y vínculo territorial.</p>
        </div>
        <div className="source-summary-grid">
          <MetricCard icon={FileSearch} label="Archivos SECOP revisados" value={formatNumber(foodFulfillment.summary?.file_rows_checked)} />
          <MetricCard icon={CheckCircle2} label="Textos PDF legibles" value={formatNumber((foodFulfillment.summary?.pdf_text_readable_files || 0) + (foodFulfillment.summary?.pdf_text_ocr_readable_files || 0))} />
          <MetricCard icon={Archive} label="Archivos SECOP revisados" value={formatNumber(foodFulfillment.summary?.file_rows_checked)} />
          <MetricCard icon={ShieldCheck} label="Soportes de entrega" value={formatNumber(foodFulfillment.summary?.contracts_with_delivery_files)} />
        </div>
      </div>
      <div className="demo-panel">
        <div className="demo-panel-head compact">
          <span className="eyebrow">Explorador de evidencia</span>
          <h2>{formatNumber(filteredEvidence.length)} documentos filtrados</h2>
        </div>
        <label className="demo-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar fuente, contrato, proveedor o estado" />
        </label>
        <div className="demo-filter-row">
          {[
            ['all', 'Todo'],
            ['found', 'Localizada'],
            ['weak', 'Texto débil'],
            ['gap', 'Brecha'],
          ].map(([key, label]) => (
            <button className={status === key ? 'active' : ''} key={key} type="button" onClick={() => setStatus(key)}>
              {label}
            </button>
          ))}
        </div>
        {selectedEvidence ? (
          <article className="evidence-preview-card">
            <div>
              <span>{selectedEvidence.category}</span>
              <StatusPill>{sourceStatus(selectedEvidence.status)}</StatusPill>
            </div>
            <h3>{selectedEvidence.name}</h3>
            <p>{selectedEvidence.excerpt ? shortText(selectedEvidence.excerpt, 420) : 'Sin resumen legible. Revisar soporte, fecha, entrega asociada y responsable.'}</p>
            <dl>
              <div>
                <dt>Contrato / fuente</dt>
                <dd>{selectedEvidence.detail}</dd>
              </div>
              <div>
                <dt>ID documento</dt>
                <dd>{selectedEvidence.documentId || 'Sin ID visible'}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{selectedEvidence.extension || 'Sin extensión'}</dd>
              </div>
            </dl>
          </article>
        ) : null}
        <div className="source-table">
          {filteredEvidence.slice(0, 20).map((row) => (
            <button className={selectedEvidence?.id === row.id ? 'active' : ''} key={row.id} type="button" onClick={() => setSelectedEvidenceId(row.id)}>
              <span>{row.category}</span>
              <strong>{row.name}</strong>
              <small>{sourceStatus(row.status)} · {row.detail}</small>
            </button>
          ))}
          {!filteredEvidence.length ? <EmptyState>No hay documentos con ese filtro.</EmptyState> : null}
        </div>
      </div>
      <div className="demo-panel source-panel-wide">
        <div className="demo-panel-head compact">
          <span className="eyebrow">Fuentes principales</span>
          <h2>Capas públicas que sostienen la lectura</h2>
        </div>
        <div className="source-table">
          {sourceRows.slice(0, 12).map((source) => (
            <a key={source.id} {...publicSourceLinkProps(source.url)}>
              <span>{source.category}</span>
              <strong>{source.name}</strong>
              <small>{source.use}</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function SourcesPage({ sourceRows }) {
  const [query, setQuery] = useState('')
  const filteredSources = sourceRows.filter((source) => includesQuery(source, query))

  return (
    <section className="sources-layout">
      <div className="demo-panel">
        <span className="eyebrow">Trazabilidad</span>
        <h2>Fuentes públicas conectadas a la lectura territorial</h2>
        <p>Territorio, municipio, contratación y documentos conectados con fuentes trazables.</p>
        <div className="source-summary-grid">
          <MetricCard icon={Database} label="Capas de fuente" value={formatNumber(filteredSources.length)} />
          <MetricCard icon={Network} label="Municipios analizados" value={formatNumber(secopHunger.summary?.municipalities_with_contracts)} />
          <MetricCard icon={Users} label="Territorios Wayuu" value={formatNumber(wayuuMvp.summary?.territory_count)} />
          <MetricCard icon={FileText} label="Filas únicas SECOP" value={formatNumber(secopHunger.summary?.fetched_unique_rows)} />
        </div>
      </div>
      <div className="demo-panel">
        <div className="demo-panel-head compact">
          <span className="eyebrow">Catálogo de fuentes</span>
          <h2>Buscar por capa o uso</h2>
        </div>
        <label className="demo-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar DANE, SECOP, SIWayuu, UNGRD..." />
        </label>
        <div className="source-table source-catalog-table">
          {filteredSources.map((source) => (
            <a key={source.id} {...publicSourceLinkProps(source.url)}>
              <span>{source.category}</span>
              <strong>{source.name}</strong>
              <small>{source.use}</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function DemoDashboard() {
  const [activePage, setActivePage] = useState('territory')

  const territoryRows = useMemo(() => buildTerritoryRows(), [])
  const municipalityRows = useMemo(() => buildMunicipalityRows(), [])
  const contractRows = useMemo(() => buildContractRows(), [])
  const signalRows = useMemo(() => buildSignalRows(municipalityRows), [municipalityRows])
  const evidenceRows = useMemo(() => buildEvidenceRows(), [])
  const sourceRows = useMemo(() => buildSourceRows(), [])

  const highPriorityMunicipalities = municipalityRows.filter((row) => money(row.audit_priority_score) >= 75).length
  const evidenceGapTerritories = territoryRows.filter((row) => row.evidenceGaps.length).length
  const visibleDeliveryContracts = foodFulfillment.summary?.contracts_with_delivery_files || 0
  const counts = {
    contracts: formatNumber(contractRows.length),
    evidence: formatNumber(evidenceRows.length),
    signals: formatNumber(signalRows.length),
    sources: formatNumber(sourceRows.length),
    territory: formatNumber(territoryRows.length),
  }

  return (
    <>
      <DemoHeader />
      <main className="demo-shell">
        <section className="demo-hero territory-demo-hero">
          <div>
            <a className="demo-back-link" href="#home">
              <ArrowLeft size={17} />
              Volver al inicio
            </a>
            <h1>Inteligencia territorial para leer necesidad, evidencia y contratación pública</h1>
            <p>
              Prioriza territorios de La Guajira con señales públicas: hambre, agua, niñez, choque reportado,
              documentos visibles, entrega verificable y exposición contractual.
            </p>
          </div>
          <div className="demo-hero-card">
            <span>Actualizado {formatDate(wayuuMvp.generated_at || secopHunger.generated_at)}</span>
            <strong>{formatNumber(highPriorityMunicipalities)}</strong>
            <small>municipios de La Guajira con prioridad territorial alta</small>
          </div>
        </section>
        <section className="demo-metrics-grid">
          <MetricCard detail="Corregimientos y fichas Wayuu del caso" icon={Compass} label="Territorios leídos" value={formatNumber(territoryRows.length)} />
          <MetricCard detail="Contratos con cruce municipal y señales públicas" icon={BarChart3} label="Cruce SECOP-territorio" value={formatNumber(secopHunger.summary?.matched_contract_count)} />
          <MetricCard detail="Territorios con tareas de fuente explícitas" icon={FileWarning} label="Brechas de evidencia" tone="warning" value={formatNumber(evidenceGapTerritories)} />
          <MetricCard detail="Contratos alimentarios con archivos asociados" icon={PackageCheck} label="Entrega visible" value={formatNumber(visibleDeliveryContracts)} />
        </section>
        <PageNav activePage={activePage} counts={counts} onChange={setActivePage} />
        {activePage === 'territory' ? <TerritoryPage municipalityRows={municipalityRows} territoryRows={territoryRows} /> : null}
        {activePage === 'contracts' ? <ContractsPage contractRows={contractRows} /> : null}
        {activePage === 'signals' ? <SignalsPage signalRows={signalRows} /> : null}
        {activePage === 'evidence' ? <EvidencePage evidenceRows={evidenceRows} sourceRows={sourceRows} /> : null}
        {activePage === 'sources' ? <SourcesPage sourceRows={sourceRows} /> : null}
      </main>
    </>
  )
}
