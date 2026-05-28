import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Archive,
  ArrowLeft,
  Ban,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  CircleAlert,
  Database,
  FileSearch,
  FileWarning,
  FolderCheck,
  GitCompareArrows,
  Landmark,
  ListChecks,
  MapPin,
  Network,
  OctagonAlert,
  PackageCheck,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  WalletCards,
} from 'lucide-react'
import logo from '../assets/shiimain-logo.svg'
import apExtracts from '../data/araurayu-ap-extractions.json'
import controlCenter from '../data/araurayu-control-center.json'
import corruptionPatterns from '../data/araurayu-corruption-patterns.json'
import procurementControl from '../data/araurayu-procurement-control.json'
import secopAuditPatterns from '../data/secop-audit-patterns-summary.json'

const procurementRows = procurementControl.contracts || []
const controlContracts = controlCenter.contracts || []
const riskRows = corruptionPatterns.contracts || []
const liveContractIds = new Set(procurementRows.map((contract) => contract.contract_id))
const archiveContracts = controlContracts.filter((contract) => !liveContractIds.has(contract.id))

const pageTabs = [
  {
    key: 'payments',
    label: 'Pagos',
    icon: WalletCards,
    description: 'Compuertas, bloqueos y solicitudes',
  },
  {
    key: 'contracts',
    label: 'Contratos',
    icon: FolderCheck,
    description: 'Activos, garantías y fuentes',
  },
  {
    key: 'intelligence',
    label: 'Patrones',
    icon: Radar,
    description: 'Señales de auditoría y contratistas',
  },
  {
    key: 'archive',
    label: 'Archivo',
    icon: Archive,
    description: 'SECOP histórico y contexto',
  },
  {
    key: 'sources',
    label: 'Fuentes',
    icon: Database,
    description: 'Trazabilidad del demo público',
  },
]

const paymentFilters = [
  ['all', 'Todos'],
  ['blocked', 'Bloqueados'],
  ['not_due', 'No vencen'],
  ['ready', 'Listos'],
]

const statusCopy = {
  blocked: 'Bloqueado',
  not_due: 'No vence todavía',
  present: 'Listo',
  partial: 'Parcial',
  missing: 'Falta',
  found: 'Encontrado',
  found_unreadable_text: 'Encontrado, texto débil',
}

const categoryCopy = {
  food_service: 'Alimentos / atención',
  productive_fishing: 'Pesca productiva',
  other: 'Otros servicios',
}

const auditCategoryCopy = {
  'Food basket': 'Canasta alimentaria',
  'Nutrition services': 'Servicios de nutrición',
  'School meals / PAE': 'PAE / alimentación escolar',
}

const roleCopy = {
  buyer_entity: 'Entidad compra',
  supplier_direct: 'Proveedor directo',
  supplier_group_member: 'UT participada',
}

const patternSeverityCopy = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
  none: 'Sin patrón',
}

const auditFlagCopy = {
  'Billion-peso contract': 'Contrato de miles de millones',
  'Billion-peso food-adjacent contracts': 'Contratos alimentarios de miles de millones',
  'Direct contracting': 'Contratación directa',
  'Direct contracting dominates food-adjacent spend': 'La contratación directa domina el gasto alimentario',
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

const candidateReasonCopy = {
  high_hunger_municipality: 'Municipio con hambre alta',
  red_flag: 'Bandera roja contractual',
}

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const money = (value) => {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatNumber = (value) => Number(value || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })

const formatPercent = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? `${parsed.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%` : 'Sin dato'
}

const formatMoney = (value) => {
  const number = money(value)
  if (!number) return '$0'
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

const auditCategory = (value) => auditCategoryCopy[value] || value

const candidateReason = (value) => candidateReasonCopy[value] || value

const gateTone = (status, missingCount = 0) => {
  if (status === 'blocked') return 'danger'
  if (status === 'not_due') return 'warning'
  if (missingCount) return 'warning'
  return 'ready'
}

const requirementOwner = (requirement = {}) => {
  const label = normalize(requirement.label)
  if (/factura|cuenta/.test(label)) return 'Proveedor'
  if (/poliza|garantia/.test(label)) return 'Proveedor + Finanzas'
  if (/cronograma|logistica/.test(label)) return 'Supervisor + Proveedor'
  if (/recibidos|acta|serial|manual|ficha|informe|conformidad|componentes|certifica/.test(label)) {
    return 'Campo + Supervisor'
  }
  return 'Finanzas'
}

const buildPaymentRows = () =>
  procurementRows.flatMap((procurement) =>
    (procurement.payment_gates || []).map((gate) => {
      const missing = (gate.requirements || []).filter((requirement) => requirement.status !== 'present')
      const tone = gateTone(gate.status, missing.length)
      const action =
        gate.status === 'blocked'
          ? gate.key === 'advance'
            ? 'Retener anticipo'
            : 'Retener pago'
          : gate.status === 'not_due'
            ? 'No programar todavía'
            : missing.length
              ? 'Solicitar soporte'
              : 'Listo para revisión financiera'

      return {
        key: `${procurement.contract_id}:${gate.key}`,
        action,
        gate,
        missing,
        procurement,
        tone,
      }
    }),
  )

const buildSourceRows = () =>
  procurementRows.flatMap((procurement) =>
    (procurement.source_documents || []).map((document) => ({
      ...document,
      contract: procurement.reference,
      supplier: procurement.supplier_name,
    })),
  )

const buildCategoryRows = () => {
  const byCategory = controlContracts.reduce((acc, contract) => {
    const key = contract.service_category || 'other'
    if (!acc[key]) acc[key] = { key, value: 0, contracts: 0 }
    acc[key].value += money(contract.value)
    acc[key].contracts += 1
    return acc
  }, {})
  return Object.values(byCategory).sort((left, right) => right.value - left.value)
}

const buildEvidenceTaskRows = (decisionRows) =>
  decisionRows
    .flatMap((decision) =>
      decision.missing.map((requirement) => ({
        key: `${decision.key}:${requirement.label}`,
        contractId: decision.procurement.contract_id,
        evidence: requirement.evidence || 'Sin evidencia registrada',
        gate: decision.gate.label,
        label: requirement.label,
        owner: requirementOwner(requirement),
        reference: decision.procurement.reference,
        supplier: decision.procurement.supplier_name,
        tone: decision.tone,
      })),
    )
    .slice(0, 12)

const buildSupplierRows = () =>
  procurementRows.map((procurement) => {
    const supplierKey = normalize(procurement.supplier_name)
    const supplierDocument = String(procurement.supplier_document || '')
    const relatedContracts = controlContracts.filter((contract) => {
      const counterparty = normalize([contract.counterparty, contract.supplier_name].join(' '))
      return (supplierKey && counterparty.includes(supplierKey)) || (supplierDocument && String(contract.supplier_document || '').includes(supplierDocument))
    })
    const missingGuarantees = (procurement.guarantees || []).filter((guarantee) => guarantee.status !== 'present').length
    const blockedAmount = (procurement.payment_gates || [])
      .filter((gate) => gate.status === 'blocked')
      .reduce((sum, gate) => sum + money(gate.amount), 0)
    return {
      blockedAmount,
      missingGuarantees,
      procurement,
      relatedContracts,
      riskCount: (procurement.risk_signals || []).length,
    }
  })

const buildMatchRows = (decisionRows) =>
  decisionRows.map((decision) => {
    const requirementText = normalize(decision.missing.map((item) => item.label).join(' '))
    const sourceDocs = decision.procurement.source_documents || []
    const hasTerms = sourceDocs.some((doc) => ['tdr', 'contract', 'prior_study'].includes(doc.type) && doc.status !== 'missing')
    const hasInvoice = !/factura|cuenta/.test(requirementText)
    const hasGuarantee = !/poliza|garantia/.test(requirementText)
    const hasDelivery = !/recibidos|acta|serial|manual|ficha|informe|conformidad|componentes|certifica/.test(requirementText)

    return {
      checks: [
        ['Términos / contrato', hasTerms, 'TDR o contrato extraído'],
        ['Factura / cuenta', hasInvoice, hasInvoice ? 'No bloquea esta compuerta' : 'Proveedor debe adjuntar factura'],
        ['Garantías', hasGuarantee, hasGuarantee ? 'Sin faltante en esta compuerta' : 'Pólizas requeridas no visibles'],
        ['Entrega / campo', hasDelivery, hasDelivery ? 'No aplica o aún no vence' : 'Falta acta, seriales o supervisor'],
      ],
      decision,
    }
  })

const buildContractorRows = () => {
  const byCounterparty = new Map()
  controlContracts.forEach((contract) => {
    const name = contract.counterparty || contract.supplier_name || contract.entity_name || 'Sin contraparte'
    const key = normalize(name)
    if (!byCounterparty.has(key)) {
      byCounterparty.set(key, {
        contracts: [],
        invoices: 0,
        name,
        paid: 0,
        reviews: new Set(),
        roles: new Set(),
        statuses: new Set(),
        supplierDocuments: new Set(),
        value: 0,
      })
    }
    const row = byCounterparty.get(key)
    row.contracts.push(contract)
    row.value += money(contract.value)
    row.invoices += money(contract.telemetry?.invoice?.invoice_total)
    row.paid += money(contract.telemetry?.invoice?.invoice_confirmed_paid_total || contract.paid_value)
    ;(contract.role_keys || []).forEach((role) => row.roles.add(role))
    row.reviews.add(contract.review?.state || 'sin_estado')
    row.statuses.add(contract.status || 'sin_estado')
    if (contract.supplier_document) row.supplierDocuments.add(contract.supplier_document)
  })

  return [...byCounterparty.values()]
    .map((row) => ({
      ...row,
      reviews: [...row.reviews],
      riskCount: row.contracts.filter((contract) => ['review', 'watch'].includes(contract.review?.state)).length,
      roles: [...row.roles],
      statuses: [...row.statuses],
      supplierDocuments: [...row.supplierDocuments],
    }))
    .sort((left, right) => right.value - left.value)
}

const buildArchiveCards = () => {
  const archiveApInvoices = archiveContracts.reduce((total, contract) => total + money(contract.telemetry?.invoice?.invoice_rows), 0)
  const reviewContracts = archiveContracts.filter((contract) => ['review', 'watch'].includes(contract.review?.state))
  return [
    {
      detail: 'Historial y contexto separado del flujo de pago vivo.',
      icon: Archive,
      label: 'Archivo SECOP',
      value: `${formatNumber(archiveContracts.length)} contratos`,
    },
    {
      detail: 'Facturas públicas normalizadas en contratos históricos.',
      icon: FileSearch,
      label: 'Facturas históricas',
      value: `${formatNumber(archiveApInvoices)} facturas`,
    },
    {
      detail: 'Contratos donde la entidad del caso presta servicios o ejecuta recursos.',
      icon: Landmark,
      label: 'Proveedor directo',
      value: formatNumber(archiveContracts.filter((contract) => contract.role_keys?.includes('supplier_direct')).length),
    },
    {
      detail: 'Contratos donde la entidad del caso aparece dentro de una unión temporal.',
      icon: GitCompareArrows,
      label: 'UT participada',
      value: formatNumber(archiveContracts.filter((contract) => contract.role_keys?.includes('supplier_group_member')).length),
    },
    {
      detail: 'Contratos en revisar o vigilar por señales internas.',
      icon: ShieldAlert,
      label: 'Riesgos de contexto',
      tone: 'warning',
      value: formatNumber(reviewContracts.length),
    },
  ]
}

const requestMessageForDecision = (decision) => {
  const missingLines = decision.missing.length
    ? decision.missing.map((item) => `- ${item.label} (${requirementOwner(item)})`).join('\n')
    : '- Sin faltantes materiales'

  return [
    `Asunto: Soportes requeridos para ${decision.procurement.reference} - ${decision.gate.label}`,
    '',
    `Para revisar el pago de ${formatMoney(decision.gate.amount)}, Shiimain marca la compuerta como: ${decision.action}.`,
    '',
    'Falta cargar o confirmar:',
    missingLines,
    '',
    `Fundamento: ${decision.gate.reason}`,
    '',
    'Mientras la evidencia no esté completa, la recomendación operativa es no liberar el pago.',
  ].join('\n')
}

const fieldChecklistForContract = (contract) => {
  const assets = (contract.asset_ledger || [])
    .map((asset) => `- ${asset.item}: ${formatNumber(asset.required_quantity)} ${asset.unit}; prueba: ${asset.proof_required}`)
    .join('\n')

  return [
    `Checklist territorial - ${contract.reference}`,
    `Lugar: ${contract.terms?.delivery_place || contract.location}`,
    '',
    assets || '- Sin activos cargados',
    '',
    '- Registrar UEP/comunidad beneficiaria',
    '- Adjuntar foto y GPS por lote o activo',
    '- Capturar firma de supervisor y responsable comunitario',
    '- Validar serial, garantía o ficha técnica cuando aplique',
  ].join('\n')
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

function PatternSignal({ signal }) {
  const Icon = signal.severity === 'high' || signal.severity === 'critical' ? OctagonAlert : CircleAlert
  return (
    <span className={`pattern-signal ${signal.severity || 'medium'}`}>
      <Icon size={15} />
      {signal.title}
    </span>
  )
}

function AuditFlag({ children }) {
  return <span className="audit-flag">{children}</span>
}

function AuditMiniMetric({ detail, icon: Icon, label, value }) {
  return (
    <article className="audit-mini-metric">
      <span>
        <Icon size={18} />
      </span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
        {detail ? <em>{detail}</em> : null}
      </div>
    </article>
  )
}

function DemoHeader() {
  return (
    <header className="demo-header">
      <a className="demo-brand" href="#home" aria-label="Volver al inicio de Shiimain">
        <img src={logo} alt="Shiimain" />
      </a>
      <nav aria-label="Navegación del demo">
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
    <nav className="demo-page-nav" aria-label="Secciones del demo">
      {pageTabs.map(({ description, icon: Icon, key, label }) => (
        <button className={activePage === key ? 'active' : ''} key={key} type="button" onClick={() => onChange(key)}>
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

function PaymentsPage({ decisionRows }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [packet, setPacket] = useState(() => requestMessageForDecision(decisionRows[0]))
  const [activeKey, setActiveKey] = useState(decisionRows[0]?.key)

  const filteredRows = useMemo(() => {
    const needle = normalize(query)
    return decisionRows.filter((row) => {
      const filterMatch = filter === 'all' || row.gate.status === filter || (filter === 'ready' && row.tone === 'ready')
      const queryMatch =
        !needle ||
        normalize([row.procurement.reference, row.procurement.short_title, row.procurement.supplier_name, row.action].join(' ')).includes(needle)
      return filterMatch && queryMatch
    })
  }, [decisionRows, filter, query])

  const openItems = decisionRows.reduce((total, row) => total + row.missing.length, 0)
  const evidenceTasks = buildEvidenceTaskRows(decisionRows)
  const supplierRows = buildSupplierRows()
  const matchRows = buildMatchRows(decisionRows)

  return (
    <>
      <section className="demo-grid-page">
        <div className="demo-panel decision-list-panel">
          <div className="demo-panel-head">
            <div>
              <span className="eyebrow">Bandeja de pagos</span>
              <h2>{formatNumber(decisionRows.length)} compuertas bajo control</h2>
              <p>{formatNumber(openItems)} evidencias pendientes antes de liberar recursos.</p>
            </div>
            <label className="demo-search">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar contrato, proveedor o acción" />
            </label>
          </div>
          <div className="demo-filter-row">
            {paymentFilters.map(([key, label]) => (
              <button className={filter === key ? 'active' : ''} key={key} type="button" onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
          <div className="decision-list">
            {filteredRows.map((row) => (
              <motion.article
                className={`decision-card ${row.tone} ${activeKey === row.key ? 'active' : ''}`}
                key={row.key}
                layout
                onClick={() => {
                  setActiveKey(row.key)
                  setPacket(requestMessageForDecision(row))
                }}
                whileHover={{ y: -4 }}
              >
                <div>
                  <StatusPill tone={row.tone}>{row.action}</StatusPill>
                  <strong>{row.procurement.short_title}</strong>
                  <p>{row.procurement.reference}</p>
                </div>
                <div>
                  <b>{formatMoney(row.gate.amount)}</b>
                  <small>{row.gate.label}</small>
                </div>
                <ul>
                  {(row.missing.length ? row.missing : [{ label: 'Sin faltantes materiales', status: 'present' }]).slice(0, 4).map((item) => (
                    <li key={`${row.key}-${item.label}`}>
                      <span className={`dot ${gateTone(item.status)}`} />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
        <aside className="demo-panel packet-panel">
          <span className="eyebrow">Salida operativa</span>
          <h2>Solicitud lista para enviar</h2>
          <p>El demo convierte faltantes de evidencia en instrucciones accionables para proveedor, campo y finanzas.</p>
          <textarea readOnly value={packet} />
        </aside>
      </section>
      <section className="payment-ops-grid">
        <div className="demo-panel">
          <div className="demo-panel-head compact">
            <span className="eyebrow">Solicitudes de evidencia</span>
            <h2>Tareas concretas por responsable</h2>
          </div>
          <div className="evidence-task-list">
            {evidenceTasks.map((task) => (
              <article className={`evidence-task ${task.tone}`} key={task.key}>
                <StatusPill tone={task.tone}>{task.owner}</StatusPill>
                <strong>{task.label}</strong>
                <p>{task.reference} · {task.gate}</p>
                <small>{task.evidence}</small>
              </article>
            ))}
          </div>
        </div>
        <div className="demo-panel">
          <div className="demo-panel-head compact">
            <span className="eyebrow">Control de proveedores</span>
            <h2>Exposición, garantías y riesgo</h2>
          </div>
          <div className="supplier-control-list">
            {supplierRows.map((row) => (
              <article className="supplier-control-card" key={row.procurement.contract_id}>
                <div>
                  <strong>{row.procurement.supplier_name}</strong>
                  <small>{row.procurement.supplier_document || 'Sin documento'}</small>
                </div>
                <span><b>{formatMoney(row.blockedAmount)}</b><small>retenido</small></span>
                <span><b>{formatNumber(row.missingGuarantees)}</b><small>garantías faltantes</small></span>
                <span><b>{formatNumber(row.riskCount)}</b><small>riesgos</small></span>
                <span><b>{formatNumber(row.relatedContracts.length)}</b><small>contratos relacionados</small></span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="demo-panel match-panel-demo">
        <div className="demo-panel-head compact">
          <span className="eyebrow">Cruce de pago en cuatro pasos</span>
          <h2>Contrato/TDR + factura + garantías + evidencia de entrega</h2>
        </div>
        <div className="match-list">
          {matchRows.map((row) => (
            <article className="match-card" key={row.decision.key}>
              <header>
                <strong>{row.decision.procurement.reference}</strong>
                <small>{row.decision.gate.label}</small>
              </header>
              <div className="match-grid">
                {row.checks.map(([label, ok, detail]) => (
                  <span className={ok ? 'ok' : 'missing'} key={`${row.decision.key}-${label}`}>
                    {ok ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                    <b>{label}</b>
                    <small>{detail}</small>
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function ContractsPage({ selectedContract, setSelectedContract }) {
  const [query, setQuery] = useState('')
  const [checklist, setChecklist] = useState(() => fieldChecklistForContract(selectedContract))

  const filteredContracts = useMemo(() => {
    const needle = normalize(query)
    return procurementRows.filter((contract) =>
      normalize([contract.reference, contract.short_title, contract.title, contract.supplier_name, contract.project].join(' ')).includes(needle),
    )
  }, [query])

  const handleSelect = (contract) => {
    setSelectedContract(contract.contract_id)
    setChecklist(fieldChecklistForContract(contract))
  }

  return (
    <section className="contract-workbench">
      <aside className="demo-panel contract-list-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Contratos vivos</span>
            <h2>{formatNumber(procurementRows.length)} compras críticas</h2>
          </div>
          <label className="demo-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar contrato o proveedor" />
          </label>
        </div>
        <div className="contract-list">
          {filteredContracts.map((contract) => (
            <button
              className={selectedContract.contract_id === contract.contract_id ? 'active' : ''}
              key={contract.contract_id}
              type="button"
              onClick={() => handleSelect(contract)}
            >
              <strong>{contract.short_title}</strong>
              <span>{contract.reference}</span>
              <small>{contract.supplier_name}</small>
            </button>
          ))}
        </div>
      </aside>
      <div className="demo-panel contract-detail-panel">
        <div className="contract-detail-title">
          <div>
            <span className="eyebrow">Ficha contractual</span>
            <h2>{selectedContract.title}</h2>
            <p>{selectedContract.project}</p>
          </div>
          <StatusPill tone="warning">{selectedContract.status}</StatusPill>
        </div>
        <div className="contract-detail-metrics">
          <MetricCard icon={Landmark} label="Valor contractual" value={formatMoney(selectedContract.value)} />
          <MetricCard icon={PackageCheck} label={selectedContract.beneficiaries?.direct_label || 'Beneficiarios'} value={formatNumber(selectedContract.beneficiaries?.direct_count)} />
          <MetricCard icon={ShieldAlert} label="Garantías faltantes" tone="danger" value={formatNumber((selectedContract.guarantees || []).filter((item) => item.status !== 'present').length)} />
        </div>
        <div className="contract-columns">
          <section>
            <h3>Compuertas de pago</h3>
            {(selectedContract.payment_gates || []).map((gate) => (
              <article className="mini-row" key={gate.key}>
                <div>
                  <strong>{gate.label}</strong>
                  <span>{gate.reason}</span>
                </div>
                <StatusPill tone={gateTone(gate.status)}>{statusCopy[gate.status] || gate.status}</StatusPill>
              </article>
            ))}
          </section>
          <section>
            <h3>Ledger de activos</h3>
            {(selectedContract.asset_ledger || []).map((asset) => (
              <article className="asset-row" key={asset.item}>
                <div>
                  <strong>{asset.item}</strong>
                  <span>{asset.proof_required}</span>
                </div>
                <b>
                  {formatNumber(asset.verified_quantity)} / {formatNumber(asset.required_quantity)}
                </b>
              </article>
            ))}
          </section>
        </div>
        <div className="contract-columns contract-extra">
          <section>
            <h3>Riesgos de compra</h3>
            {(selectedContract.risk_signals || []).map((risk) => (
              <article className="mini-row" key={risk.label}>
                <div>
                  <strong>{risk.label}</strong>
                  <span>Severidad {risk.severity}</span>
                </div>
                <StatusPill tone={risk.severity === 'high' ? 'danger' : 'warning'}>{risk.severity}</StatusPill>
              </article>
            ))}
          </section>
          <section>
            <h3>Términos extraídos del contrato</h3>
            {(selectedContract.source_documents || []).slice(0, 5).map((source) => (
              <a className="mini-row mini-row-link" href={source.url || '#'} key={source.document_id} rel="noreferrer" target="_blank">
                <div>
                  <strong>{source.label}</strong>
                  <span>{[source.type, source.document_id, formatDate(source.date)].filter(Boolean).join(' · ')}</span>
                </div>
                <StatusPill tone={source.status === 'found' ? '' : 'warning'}>{statusCopy[source.status] || source.status}</StatusPill>
              </a>
            ))}
          </section>
        </div>
        <div className="checklist-box">
          <div>
            <ClipboardCheck size={20} />
            <strong>Checklist de campo generado</strong>
          </div>
          <textarea readOnly value={checklist} />
        </div>
      </div>
    </section>
  )
}

function IntelligencePage({ categoryRows }) {
  const maxCategory = Math.max(...categoryRows.map((row) => row.value), 1)
  const foodContractsMissingQuantity = controlContracts.filter(
    (contract) => contract.service_category === 'food_service' && contract.telemetry?.price_monitor?.status === 'missing_public_quantity',
  ).length
  const contractorRows = useMemo(() => buildContractorRows(), [])
  const patternSummary = corruptionPatterns.summary || {}
  const territoryAudit = secopAuditPatterns.corruption_hunger || {}
  const territorySummary = territoryAudit.summary || {}
  const fulfillmentAudit = secopAuditPatterns.food_fulfillment || {}
  const fulfillmentSummary = fulfillmentAudit.summary || {}
  const fulfillmentRows = [
    ...(fulfillmentAudit.urgent_contracts || []),
    ...(fulfillmentAudit.top_contracts || []),
  ].filter((contract, index, rows) => rows.findIndex((item) => item.id === contract.id || item.reference === contract.reference) === index).slice(0, 5)

  return (
    <section className="intelligence-layout intelligence-expanded">
      <div className="demo-panel pattern-demo-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Patrones de corrupción</span>
            <h2>{formatNumber(patternSummary.total_signals)} señales determinísticas</h2>
            <p>Priorizan auditoría con evidencia pública. No acusan; muestran contratos que necesitan revisión.</p>
          </div>
        </div>
        <div className="corruption-metrics">
          <span><strong>{formatNumber(patternSummary.contracts_flagged)}</strong> contratos con patrón</span>
          <span><strong>{formatNumber(patternSummary.high_signals)}</strong> señales altas</span>
          <span><strong>{formatNumber(patternSummary.supplier_clusters)}</strong> grupos de proveedor</span>
          <span><strong>{formatNumber(patternSummary.buyer_supplier_clusters)}</strong> pares entidad-proveedor</span>
        </div>
        <div className="pattern-ledger-list">
          {riskRows.slice(0, 6).map((contract) => (
            <article className={`pattern-ledger-row ${contract.top_severity}`} key={contract.contract_id}>
              <span className="pattern-score">{formatNumber(contract.risk_score)}</span>
              <div className="pattern-ledger-main">
                <div>
                  <strong>{contract.reference || contract.contract_id}</strong>
                  <small>{shortText(contract.supplier_name, 88)}</small>
                </div>
                <p>{contract.signals?.[0]?.reason || 'Señal de auditoría disponible para revisión.'}</p>
                <div className="pattern-signal-list">
                  {(contract.signals || []).slice(0, 3).map((signal) => (
                    <PatternSignal key={`${contract.contract_id}-${signal.id}-${signal.title}`} signal={signal} />
                  ))}
                </div>
              </div>
              <div className="pattern-ledger-meta">
                <span>{patternSeverityCopy[contract.top_severity] || contract.top_severity}</span>
                <strong>{formatNumber(contract.signal_count)} señales</strong>
                <small>{formatNumber(contract.evidence_ref_count)} evidencias</small>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="demo-panel territory-audit-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Corrupción-hambre territorial</span>
            <h2>Municipios donde el riesgo contractual cruza con necesidad alimentaria</h2>
            <p>Esta capa no declara culpables: ubica contratos y municipios donde el hambre, la contratación directa, las modificaciones y la concentración justifican revisión prioritaria.</p>
          </div>
        </div>
        <div className="audit-mini-grid">
          <AuditMiniMetric detail="Filas únicas consultadas" icon={Database} label="Registros SECOP" value={formatNumber(territorySummary.fetched_unique_rows)} />
          <AuditMiniMetric detail="Contratos mapeados a municipio" icon={MapPin} label="Cruce territorial" value={formatNumber(territorySummary.matched_contract_count)} />
          <AuditMiniMetric detail="Gasto alimentario y adyacente" icon={WalletCards} label="Valor revisado" value={territorySummary.total_value_label || formatMoney(territorySummary.total_value)} />
          <AuditMiniMetric detail={`${formatPercent(territorySummary.direct_contract_value_pct)} del valor revisado`} icon={ShieldAlert} label="Contratación directa" value={territorySummary.direct_contract_value_label || formatMoney(territorySummary.direct_contract_value)} />
          <AuditMiniMetric detail="Sin contrato alimentario mapeado" icon={FileWarning} label="Vacíos municipales" value={formatNumber(territorySummary.municipalities_without_contracts)} />
          <AuditMiniMetric detail="Hambre alta con brecha contractual" icon={OctagonAlert} label="Municipios críticos" value={formatNumber(territorySummary.high_hunger_gap_municipalities)} />
        </div>
        <div className="territory-audit-grid">
          <div>
            <div className="audit-subhead">
              <Network size={18} />
              <strong>Prioridad municipal</strong>
            </div>
            <div className="territory-priority-list">
              {(territoryAudit.top_municipalities || []).slice(0, 5).map((municipality) => (
                <article className="territory-priority-card" key={`${municipality.department}-${municipality.name}`}>
                  <span className="pattern-score">{formatNumber(municipality.audit_priority_score)}</span>
                  <div>
                    <header>
                      <strong>{municipality.name}, {municipality.department}</strong>
                      <small>{municipality.total_value_label} · {formatNumber(municipality.contract_count)} contratos</small>
                    </header>
                    <div className="municipality-risk-line">
                      <span>Hambre {formatNumber(municipality.hunger_score)}</span>
                      <span>Riesgo SECOP {formatNumber(municipality.procurement_risk_score)}</span>
                      <span>{formatPercent(municipality.direct_contract_value_pct)} directo</span>
                    </div>
                    <p>Proveedor principal: {municipality.top_supplier || 'Sin dato'} · {formatNumber(municipality.supplier_count)} proveedores.</p>
                    <div className="audit-flag-list">
                      {(municipality.flags || []).slice(0, 4).map((flag) => <AuditFlag key={`${municipality.name}-${flag}`}>{auditFlag(flag)}</AuditFlag>)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div>
            <div className="audit-subhead">
              <ListChecks size={18} />
              <strong>Frecuencia de banderas</strong>
            </div>
            <div className="flag-frequency-list">
              {(territoryAudit.flag_counts || []).slice(0, 8).map((row) => (
                <article key={row.flag}>
                  <span>{formatNumber(row.count)}</span>
                  <strong>{auditFlag(row.flag)}</strong>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="audit-subhead audit-subhead-spaced">
          <OctagonAlert size={18} />
          <strong>Contratos que suben a revisión</strong>
        </div>
        <div className="red-flag-contract-grid">
          {(territoryAudit.top_red_flags || []).slice(0, 4).map((contract) => (
            <article className="red-flag-contract-card" key={`${contract.id}-${contract.reference}`}>
              <header>
                <span className="pattern-score">{formatNumber(contract.audit_score)}</span>
                <div>
                  <strong>{contract.reference}</strong>
                  <small>{contract.municipality || contract.city} · {auditCategory(contract.category) || 'Contrato alimentario'}</small>
                </div>
              </header>
              <p>{shortText(contract.object, 150)}</p>
              <div className="contract-audit-meta">
                <span><b>{contract.value_label || formatMoney(contract.value)}</b><small>valor</small></span>
                <span><b>{formatMoney(contract.paid_value)}</b><small>pagado</small></span>
                <span><b>{shortText(contract.supplier_name, 34)}</b><small>proveedor</small></span>
              </div>
              <div className="audit-flag-list">
                {(contract.flags || []).slice(0, 4).map((flag) => <AuditFlag key={`${contract.reference}-${flag}`}>{auditFlag(flag)}</AuditFlag>)}
              </div>
              {contract.place_hits?.length ? <small className="place-hit-line">Lugares nombrados: {contract.place_hits.join(', ')}</small> : null}
            </article>
          ))}
        </div>
      </div>
      <div className="demo-panel delivery-audit-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Cumplimiento y entrega</span>
            <h2>La evidencia financiera no reemplaza la prueba de campo</h2>
            <p>El detector separa factura, archivos, supervisión y evidencia pública de ejecución para no tratar un pago como entrega confirmada.</p>
          </div>
        </div>
        <div className="audit-mini-grid fulfillment">
          <AuditMiniMetric detail="Contratos alimentarios revisados" icon={FileSearch} label="Muestra auditada" value={formatNumber(fulfillmentSummary.contracts_checked)} />
          <AuditMiniMetric detail="Entrega confirmada en fuente pública" icon={CheckCircle2} label="Confirmados" value={formatNumber(fulfillmentSummary.confirmed_count)} />
          <AuditMiniMetric detail="Sin fila pública de ejecución" icon={Ban} label="Ejecución no visible" value={formatNumber(fulfillmentSummary.no_public_execution_count)} />
          <AuditMiniMetric detail="Con ejecución financiera" icon={WalletCards} label="Movimiento financiero" value={formatNumber(fulfillmentSummary.contracts_with_financial_execution)} />
          <AuditMiniMetric detail="Facturas o anexos detectados" icon={Archive} label="Facturas" value={formatNumber(fulfillmentSummary.invoice_rows)} />
          <AuditMiniMetric detail="Archivos SECOP revisados" icon={FolderCheck} label="Soportes" value={formatNumber(fulfillmentSummary.file_rows_checked)} />
        </div>
        <div className="fulfillment-contract-list">
          {fulfillmentRows.map((contract) => (
            <article className={`fulfillment-contract-card ${contract.arrival_state === 'revisar_urgente' ? 'urgent' : ''}`} key={`${contract.id}-${contract.reference}`}>
              <header>
                <StatusPill tone={contract.arrival_state === 'revisar_urgente' ? 'danger' : 'warning'}>{contract.state || 'Soporte documental'}</StatusPill>
                <strong>{contract.reference}</strong>
                <small>{contract.municipality || contract.city} · {shortText(contract.supplier_name, 70)}</small>
              </header>
              <p>{shortText(contract.object, 160)}</p>
              <div className="fulfillment-metrics">
                <span><b>{formatNumber(contract.audit_score)}</b><small>riesgo</small></span>
                <span><b>{formatMoney(contract.value)}</b><small>valor</small></span>
                <span><b>{formatNumber(contract.invoice_rows)}</b><small>facturas</small></span>
                <span><b>{formatNumber(contract.delivery_evidence_file_rows)}</b><small>archivos entrega</small></span>
                <span><b>{formatPercent(contract.financial_execution_percent)}</b><small>ejecución financiera</small></span>
              </div>
              <div className="audit-flag-list">
                {(contract.flags || []).slice(0, 5).map((flag) => <AuditFlag key={`${contract.reference}-${flag}`}>{auditFlag(flag)}</AuditFlag>)}
              </div>
              {contract.candidate_reasons?.length ? (
                <small className="place-hit-line">Motivo: {contract.candidate_reasons.map(candidateReason).join(' / ')}</small>
              ) : null}
            </article>
          ))}
        </div>
      </div>
      <div className="demo-panel detector-backlog-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Próximas pruebas de control</span>
            <h2>Patrones que el demo ya deja definidos sin fingir evidencia</h2>
            <p>Estos detectores quedan visibles como cola de trabajo: se activan cuando la fuente externa o el OCR necesario esté conectado.</p>
          </div>
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
      <div className="demo-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Radar de precios</span>
            <h2>Valores, cantidades públicas y exposición</h2>
            <p>Cuando SECOP no publica cantidad suficiente, Shiimain deja explícita la brecha en vez de inventar precio unitario.</p>
          </div>
        </div>
        <div className="price-bars">
          {categoryRows.map((row) => (
            <article key={row.key}>
              <div>
                <strong>{categoryCopy[row.key] || row.key}</strong>
                <span>
                  {formatNumber(row.contracts)} contratos · {formatMoney(row.value)}
                </span>
              </div>
              <i style={{ '--bar-width': `${Math.max(8, (row.value / maxCategory) * 100)}%` }} />
            </article>
          ))}
        </div>
        <div className="intelligence-callout">
          <Ban size={20} />
          <div>
            <strong>{formatNumber(foodContractsMissingQuantity)} contratos de alimentos sin cantidad pública suficiente</strong>
            <span>Eso bloquea una comparación honesta de precio por ración y se vuelve una tarea de evidencia.</span>
          </div>
        </div>
      </div>
      <div className="demo-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Términos extraídos</span>
            <h2>Contratos leídos y organizados</h2>
            <p>Objeto, valor, estado, supervisor, pólizas, hitos de pago, facturas y documentos fuente.</p>
          </div>
        </div>
        <div className="risk-list extracted-term-list">
          {controlContracts.slice(0, 6).map((contract) => (
            <article key={contract.id}>
              <div>
                <StatusPill tone={['review', 'watch'].includes(contract.review?.state) ? 'warning' : ''}>
                  {roleCopy[contract.role_keys?.[0]] || contract.role_label || 'SECOP'}
                </StatusPill>
                <strong>{contract.reference || contract.id}</strong>
                <span>{shortText(contract.counterparty || contract.supplier_name || contract.entity_name, 82)}</span>
              </div>
              <p>
                {formatMoney(contract.value)} · {formatNumber(contract.telemetry?.invoice?.invoice_rows)} facturas ·{' '}
                {formatNumber(contract.telemetry?.guarantee_count)} garantías/pólizas
              </p>
            </article>
          ))}
        </div>
      </div>
      <div className="demo-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Contratistas</span>
            <h2>Historial de contrapartes</h2>
            <p>Historial interno de SECOP; sanciones externas quedan como verificación obligatoria.</p>
          </div>
        </div>
        <div className="contractor-dossier-list">
          {contractorRows.slice(0, 5).map((row) => (
            <article className="contractor-dossier-card" key={row.name}>
              <header>
                <div>
                  <strong>{row.name}</strong>
                  <small>{row.supplierDocuments.join(' / ') || 'NIT no disponible en SECOP'}</small>
                </div>
                <StatusPill tone={row.riskCount ? 'warning' : ''}>{row.riskCount ? `${formatNumber(row.riskCount)} alertas` : 'Sin alerta interna'}</StatusPill>
              </header>
              <div className="dossier-metrics">
                <span><b>{formatNumber(row.contracts.length)}</b><small>contratos</small></span>
                <span><b>{formatMoney(row.value)}</b><small>valor histórico</small></span>
                <span><b>{formatMoney(row.invoices)}</b><small>facturado</small></span>
              </div>
              <p>{row.roles.map((role) => roleCopy[role] || role).join(' / ') || 'Sin rol'} · estados: {row.statuses.slice(0, 3).join(', ')}</p>
              <small><ShieldQuestion size={14} /> Fuentes a conectar: SIRI, Contraloría, RUES, SECOP proveedor.</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArchivePage() {
  const archiveCards = useMemo(() => buildArchiveCards(), [])
  const archiveRows = archiveContracts
    .slice()
    .sort((left, right) => money(right.value) - money(left.value))
    .slice(0, 12)

  return (
    <section className="sources-layout archive-layout">
      <div className="demo-panel">
        <span className="eyebrow">Archivo SECOP</span>
        <h2>Los otros contratos no se ignoran</h2>
        <p>El demo separa compras vivas, facturas históricas, contratos donde participa la entidad del caso y riesgos de contexto.</p>
        <div className="archive-card-grid">
          {archiveCards.map(({ detail, icon: Icon, label, tone = '', value }) => (
            <article className={`archive-card ${tone}`} key={label}>
              <span><Icon size={20} /></span>
              <strong>{value}</strong>
              <b>{label}</b>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="demo-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Contexto histórico</span>
            <h2>{formatNumber(archiveContracts.length)} contratos fuera del flujo vivo</h2>
          </div>
        </div>
        <div className="source-table archive-table">
          {archiveRows.map((contract) => (
            <a href={contract.url || '#'} key={contract.id} rel="noreferrer" target="_blank">
              <span>{roleCopy[contract.role_keys?.[0]] || contract.role_label || 'SECOP'}</span>
              <strong>{contract.reference || contract.id}</strong>
              <small>{formatMoney(contract.value)} · {formatNumber(contract.telemetry?.invoice?.invoice_rows)} facturas</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function SourcesPage({ sourceRows }) {
  return (
    <section className="sources-layout">
      <div className="demo-panel">
        <span className="eyebrow">Extracción documental</span>
        <h2>El tablero no es una maqueta vacía</h2>
        <p>
          Esta versión trae datos públicos del caso demo: contratos, archivos SECOP, facturas, actas y extracciones estructuradas.
        </p>
        <div className="source-summary-grid">
          <MetricCard icon={FileSearch} label="Documentos extraídos" value={formatNumber(apExtracts.summary?.extracted_documents)} />
          <MetricCard icon={CheckCircle2} label="Documentos legibles" value={formatNumber(apExtracts.summary?.readable_documents)} />
          <MetricCard icon={ShieldCheck} label="Soportes de entrega" value={formatNumber(apExtracts.summary?.model_delivery_confirmed_documents)} />
          <MetricCard icon={Archive} label="Filas de archivo" value={formatNumber(controlCenter.search_depth?.file_rows)} />
        </div>
      </div>
      <div className="demo-panel">
        <div className="demo-panel-head compact">
          <div>
            <span className="eyebrow">Documentos fuente</span>
            <h2>{formatNumber(sourceRows.length)} soportes clave</h2>
          </div>
        </div>
        <div className="source-table">
          {sourceRows.slice(0, 12).map((source) => (
            <a href={source.url || '#'} key={`${source.contract}-${source.document_id}`} rel="noreferrer" target="_blank">
              <span>{source.contract}</span>
              <strong>{source.label}</strong>
              <small>{statusCopy[source.status] || source.status || 'Sin estado'}</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function DemoDashboard() {
  const [activePage, setActivePage] = useState('payments')
  const [selectedContractId, setSelectedContractId] = useState(procurementRows[0]?.contract_id)

  const decisionRows = useMemo(() => buildPaymentRows(), [])
  const sourceRows = useMemo(() => buildSourceRows(), [])
  const categoryRows = useMemo(() => buildCategoryRows(), [])
  const selectedContract = procurementRows.find((contract) => contract.contract_id === selectedContractId) || procurementRows[0]
  const blockedRows = decisionRows.filter((row) => row.gate.status === 'blocked')
  const missingGuarantees = procurementRows.reduce(
    (total, contract) => total + (contract.guarantees || []).filter((guarantee) => guarantee.status !== 'present').length,
    0,
  )
  const auditSignalTotal =
    (corruptionPatterns.summary?.total_signals || 0) +
    (secopAuditPatterns.corruption_hunger?.red_flag_contract_count || 0) +
    (secopAuditPatterns.food_fulfillment?.summary?.contracts_checked || 0)
  const counts = {
    archive: formatNumber(archiveContracts.length),
    contracts: formatNumber(procurementRows.length),
    intelligence: formatNumber(
      (corruptionPatterns.summary?.high_priority_contracts || 0) +
        (secopAuditPatterns.corruption_hunger?.red_flag_contract_count || 0) +
        (secopAuditPatterns.food_fulfillment?.summary?.urgent_count || 0),
    ),
    payments: `${formatNumber(blockedRows.length)}/${formatNumber(decisionRows.length)}`,
    sources: formatNumber(sourceRows.length),
  }

  return (
    <>
      <DemoHeader />
      <main className="demo-shell">
        <section className="demo-hero">
          <div>
            <a className="demo-back-link" href="#home">
              <ArrowLeft size={17} />
              Volver al inicio
            </a>
            <span className="eyebrow eyebrow-dark">Demo Shiimain</span>
            <h1>Control de pagos, contratos y patrones públicos para La Guajira</h1>
            <p>
              Un tablero para decidir qué se paga, qué se retiene, qué evidencia falta y qué señales de auditoría priorizan revisión.
            </p>
          </div>
          <div className="demo-hero-card">
            <span>Actualizado {formatDate(controlCenter.generated_at)}</span>
            <strong>{formatMoney(procurementControl.summary?.total_value)}</strong>
            <small>valor controlado en compras críticas del caso público</small>
          </div>
        </section>
        <section className="demo-metrics-grid">
          <MetricCard detail={`${formatNumber(blockedRows.length)} bloqueos activos`} icon={WalletCards} label="Compuertas de pago" tone="danger" value={formatNumber(decisionRows.length)} />
          <MetricCard detail="Botes, motores, kits y seguridad" icon={PackageCheck} label="Activos por verificar" value={formatNumber(procurementControl.summary?.required_assets)} />
          <MetricCard detail="Anticipos, cumplimiento, calidad y RCE" icon={ShieldAlert} label="Garantías faltantes" tone="warning" value={formatNumber(missingGuarantees)} />
          <MetricCard detail="Caso público + corrupción-hambre + cumplimiento de entrega" icon={BarChart3} label="Señales y contratos auditados" value={formatNumber(auditSignalTotal)} />
        </section>
        <PageNav activePage={activePage} counts={counts} onChange={setActivePage} />
        {activePage === 'payments' ? <PaymentsPage decisionRows={decisionRows} /> : null}
        {activePage === 'contracts' ? (
          <ContractsPage selectedContract={selectedContract} setSelectedContract={setSelectedContractId} />
        ) : null}
        {activePage === 'intelligence' ? <IntelligencePage categoryRows={categoryRows} /> : null}
        {activePage === 'archive' ? <ArchivePage /> : null}
        {activePage === 'sources' ? <SourcesPage sourceRows={sourceRows} /> : null}
      </main>
    </>
  )
}
