import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Translations
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const T = {
  fr: {
    inputsTitle: 'Paramètres',
    brutAnnuel: 'Salaire brut annuel', brutPlaceholder: 'ex: 36 000',
    caAnnuel: 'Chiffre d\'affaires annuel HT', caPlaceholder: 'ex: 60 000',
    caMensuel: 'CA mensuel HT', caMensuelPlaceholder: 'ex: 5 000',
    statut: 'Type de contrat / Statut',
    revenusAnnexes: 'Revenus annexes', primes: 'Primes / Bonus',
    avantagesTitle: 'Transports, titres-restaurant & frais',
    transportLabel: 'Transports',
    transportHint: 'Montant mensuel pris en charge par l’employeur (intègre la base brute).',
    ticketRestoLabel: 'Titres-restaurant',
    ticketMontant: 'Montant mensuel (€)',
    ticketEmployeurPct: 'Part employeur',
    ticketPartSalariale: 'Part salariale (déduite du net)',
    teletravailLabel: 'Forfait télétravail',
    teletravailHint: 'Forfait mensuel (€), intègre la base brute.',
    mutuelleLabel: 'Mutuelle',
    mutuelleHint: 'Montant prélevé sur le net après impôt (part salariale).',
    simulate: 'Calculer', reset: 'Réinitialiser',
    resultsTitle: 'Résultats', empty: 'Remplissez le formulaire et cliquez sur Calculer.',
    fixFieldsHint: 'Corrigez les champs indiqués ci-dessus, puis cliquez à nouveau sur Calculer.',
    netMonthly: 'Net mensuel', netAnnual: 'Net annuel',
    employerCost: 'Coût employeur', socialCont: 'Cotisations sociales',
    withholding: 'Retenue à la source', breakdown: 'Répartition salariale',
    errBrut: 'Entrez un brut annuel valide (> 0)',
    errCA: 'Entrez un CA annuel valide (> 0)',
    errCAM: 'Entrez un CA mensuel valide (> 0)',
    fiscalMode: 'Mode fiscal',
    retenueLabel: 'Retenue à la source',
    retenueAdjust: 'Taux de retenue appliqué',
    retenueHint: 'Taux ajusté automatiquement selon le brut annuel. Vous pouvez le modifier directement.',
    structureType: 'Structure juridique',
    portageCompany: 'Société de portage',
    portagePercent: 'Frais portage (%)',
    portagePercentHint: 'Part prélevée par la société (généralement 8–15%)',
    fraisPro: 'Frais professionnels',
    microRegime: 'Régime micro-social (22% services)',
    regimeReel: 'Régime réel',
    freelanceSASU: 'SASU — IS + dividendes',
    freelanceEURL: 'EURL — IR ou IS',
    freelanceME: 'Micro-entreprise',
  },
  en: {
    inputsTitle: 'Parameters',
    brutAnnuel: 'Gross annual salary', brutPlaceholder: 'e.g. 36000',
    caAnnuel: 'Annual revenue (excl. tax)', caPlaceholder: 'e.g. 60000',
    caMensuel: 'Monthly revenue (excl. tax)', caMensuelPlaceholder: 'e.g. 5000',
    statut: 'Contract / Status type',
    revenusAnnexes: 'Additional income', primes: 'Bonuses',
    avantagesTitle: 'Transport, meal vouchers & deductions',
    transportLabel: 'Transport',
    transportHint: 'Monthly amount paid by the employer (included in gross base).',
    ticketRestoLabel: 'Meal vouchers',
    ticketMontant: 'Monthly amount (€)',
    ticketEmployeurPct: 'Employer share',
    ticketPartSalariale: 'Employee share (deducted from net)',
    teletravailLabel: 'Remote work allowance',
    teletravailHint: 'Monthly allowance (€), included in gross base.',
    mutuelleLabel: 'Health insurance',
    mutuelleHint: 'Amount taken from net after tax (employee share).',
    simulate: 'Calculate', reset: 'Reset',
    resultsTitle: 'Results', empty: 'Fill in the form and click Calculate.',
    fixFieldsHint: 'Fix the highlighted fields above, then click Calculate again.',
    netMonthly: 'Monthly net', netAnnual: 'Annual net',
    employerCost: 'Employer cost', socialCont: 'Social contributions',
    withholding: 'Withholding tax', breakdown: 'Pay breakdown',
    errBrut: 'Enter a valid gross annual salary (> 0)',
    errCA: 'Enter a valid annual revenue (> 0)',
    errCAM: 'Enter a valid monthly revenue (> 0)',
    fiscalMode: 'Tax mode',
    retenueLabel: 'Withholding tax',
    retenueAdjust: 'Applied withholding rate',
    retenueHint: 'Rate automatically adjusted from annual gross. You can edit it directly.',
    structureType: 'Legal structure',
    portageCompany: 'Portage company',
    portagePercent: 'Portage fee (%)',
    portagePercentHint: 'Fee charged by the company (usually 8–15%)',
    fraisPro: 'Professional expenses',
    microRegime: 'Micro-social regime (22% services)',
    regimeReel: 'Standard regime',
    freelanceSASU: 'SASU — Corporate tax + dividends',
    freelanceEURL: 'EURL — Income tax or corporate',
    freelanceME: 'Micro-enterprise',
  }
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Helpers
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fmt = (v, lang) =>
  typeof v === 'number'
    ? v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

const fmtPct = (v, lang) =>
  typeof v === 'number'
    ? v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 })
    : '—'

const AUTO_RECALC_DELAY_MS = 450

function parseTicketEmployeurPct(raw) {
  if (raw === '' || raw == null) return 50
  const n = +raw
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 50
}

function clampRetenuePct(raw) {
  if (raw === '' || raw == null) return 0
  const n = +raw
  return Number.isFinite(n) ? Math.min(55, Math.max(0, n)) : 0
}

/** PAS 2026 suggestion from annual gross, without tax-parts inputs. */
function suggestRetenueFromAnnualGross(brutAnnuel) {
  if (!brutAnnuel || brutAnnuel <= 0) return 0
  const approxNetAnnuel = brutAnnuel * 0.78
  if (approxNetAnnuel <= 14_490) return 0
  if (approxNetAnnuel <= 21_917) return 2
  if (approxNetAnnuel <= 31_425) return 7.5
  if (approxNetAnnuel <= 58_360) return 14
  if (approxNetAnnuel <= 80_669) return 22
  if (approxNetAnnuel <= 177_106) return 30
  return 41
}

/** Aligné sur PayrollService.EmployerCost (fallback brut × (1 + ratio)) — masse salariale totale ≈ brut × ce facteur */
const EMPLOYER_COST_FACTOR = 1.45

/* ─────────────────────────────────────────────
   EuroInput — module-level so React never
   remounts it on re-render (fixes focus loss)
───────────────────────────────────────────── */
function EuroInput({ value, onChange, placeholder, error, unit }) {
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <input
          className="field-input"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ paddingRight: unit ? 54 : 36 }}
        />
        <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>
          {unit ? `€ ${unit}` : '€'}
        </span>
      </div>
      {error && <div className="field-error" style={{marginTop:4}}>{error}</div>}
    </div>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Sub-components
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function KpiCard({ label, value, unit, color, icon }){
  return (
    <div className={`kpi-card ${color}`}>
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {unit && <div className="kpi-unit">{unit}</div>}
    </div>
  )
}

function BreakdownBar({ net, social, employer }){
  const total = net + social + employer
  if (!total) return null
  const pNet      = ((net      / total) * 100).toFixed(1)
  const pSocial   = ((social   / total) * 100).toFixed(1)
  const pEmployer = ((employer / total) * 100).toFixed(1)
  return (
    <div className="breakdown-wrap">
      <div className="breakdown-bar-track">
        <div className="breakdown-bar-seg" style={{width:`${pNet}%`,      background:'var(--success)'}} />
        <div className="breakdown-bar-seg" style={{width:`${pSocial}%`,   background:'var(--warning)'}} />
        <div className="breakdown-bar-seg" style={{width:`${pEmployer}%`, background:'var(--indigo)'}} />
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[
          {label:'Net salarié',     pct: pNet,      color:'var(--success)'},
          {label:'Cotisations',     pct: pSocial,   color:'var(--warning)'},
          {label:'Charges patron.', pct: pEmployer, color:'var(--indigo)'},
        ].map(s=>(
          <div key={s.label} className="breakdown-row">
            <div className="breakdown-dot" style={{background:s.color}} />
            <div className="breakdown-name">{s.label}</div>
            <div className="breakdown-val">{s.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Horizontal pill-based status selector */
const STATUS_OPTIONS = [
  {
    value: 'non-cadre',
    icon: <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.8"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="1.8"/></svg>,
    labelFr: 'Non-cadre', labelEn: 'Non-exec',
    hintFr: 'Salarié régime général', hintEn: 'Standard employee',
    color: '#c026d3'
  },
  {
    value: 'cadre',
    icon: <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 2l2 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    labelFr: 'Cadre', labelEn: 'Executive',
    hintFr: 'Statut cadre AGIRC', hintEn: 'AGIRC executive',
    color: '#6366f1'
  },
  {
    value: 'freelance',
    icon: <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M9 8l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    labelFr: 'Freelance', labelEn: 'Freelance',
    hintFr: 'ME / EURL / SASU', hintEn: 'ME / EURL / SASU',
    color: '#f59e0b'
  },
  {
    value: 'portage',
    icon: <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    labelFr: 'Portage salarial', labelEn: 'Umbrella company',
    hintFr: 'Indépendant salarié', hintEn: 'Salaried freelancer',
    color: '#10b981'
  }
]

function StatusPicker({ value, onChange, lang }){
  return (
    <div className="status-picker">
      {STATUS_OPTIONS.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            className={`status-card${active ? ' active' : ''}`}
            style={active ? { borderColor: opt.color, background: `${opt.color}12` } : {}}
            onClick={() => onChange(opt.value)}
          >
            <span className="status-card-icon" style={active ? { color: opt.color } : {}}>{opt.icon}</span>
            <span className="status-card-label" style={active ? { color: opt.color } : {}}>{lang === 'fr' ? opt.labelFr : opt.labelEn}</span>
            <span className="status-card-hint">{lang === 'fr' ? opt.hintFr : opt.hintEn}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Fiscal mode: direct retenue à la source percentage. */
function FiscalToggle({ retenue, onRetenue, t }){
  return (
    <div className="fiscal-toggle-wrap">
      <div className="field-label" style={{marginBottom:10}}>{t.fiscalMode}</div>
      <div className="fiscal-pill-row">
        <button type="button" className="fiscal-pill active">
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {t.retenueLabel}
        </button>
      </div>

      <div style={{marginTop:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginTop:10,marginBottom:4}}>
          <div className="field-label">{t.retenueAdjust}</div>
          <div style={{position:'relative',width:112}}>
            <input
              className="field-input"
              type="number"
              min={0}
              max={55}
              step={0.5}
              inputMode="decimal"
              value={retenue}
              onChange={e => onRetenue(clampRetenuePct(e.target.value))}
              style={{paddingRight:28,textAlign:'right',fontWeight:800,color:'var(--accent)'}}
            />
            <span style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',fontSize:13,fontWeight:700}}>%</span>
          </div>
        </div>
        <input
          type="range" min={0} max={55} step={0.5}
          value={retenue}
          onChange={e => onRetenue(clampRetenuePct(e.target.value))}
          className="retenue-slider"
        />
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--muted)',marginTop:2}}>
          <span>0%</span><span>10%</span><span>20%</span><span>30%</span><span>41%</span><span>55%</span>
        </div>
        <div className="field-hint" style={{marginTop:6}}>{t.retenueHint}</div>
      </div>
    </div>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Main component
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function PayrollSimulator({ lang = 'fr' }){
  const t = useMemo(() => T[lang] || T['fr'], [lang])
  const requestSeqRef = useRef(0)

  /* Common */
  const [brutAnnuel,     setBrutAnnuel]     = useState('')
  const [revenusAnnexes, setRevenusAnnexes] = useState('')
  const [primes,         setPrimes]         = useState('')
  const [transportMensuel, setTransportMensuel] = useState('')
  const [teletravailMensuel, setTeletravailMensuel] = useState('')
  const [ticketRestoMensuel, setTicketRestoMensuel] = useState('')
  const [ticketEmployeurPct, setTicketEmployeurPct] = useState('50')
  const [mutuelleNet, setMutuelleNet] = useState('')
  const [result,         setResult]         = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  /* Status */
  const [statut, setStatut] = useState('non-cadre')

  /* Fiscal mode: direct percentage only */
  const [retenuePct, setRetenuePct] = useState(0)

  /* Freelance-specific */
  const [freelanceType, setFreelanceType] = useState('me')   // 'me' | 'eurl' | 'sasu'
  const [caAnnuel,      setCaAnnuel]      = useState('')

  /* Portage-specific */
  const [caMensuel,       setCaMensuel]       = useState('')
  const [portagePercent,  setPortagePercent]  = useState(10)
  const [portageCompany,  setPortageCompany]  = useState('')
  const [fraisPro,        setFraisPro]        = useState('')

  /* â”€â”€ Validation â”€â”€ */
  const errors = {}
  const isSalaried = statut === 'non-cadre' || statut === 'cadre'
  const isFreelance = statut === 'freelance'
  const isPortage   = statut === 'portage'

  if (isSalaried && (!brutAnnuel || isNaN(+brutAnnuel) || +brutAnnuel <= 0)) errors.brut = t.errBrut
  if (isFreelance && (!caAnnuel  || isNaN(+caAnnuel)  || +caAnnuel  <= 0)) errors.ca   = t.errCA
  if (isPortage   && (!caMensuel || isNaN(+caMensuel) || +caMensuel <= 0)) errors.cam  = t.errCAM
  const isValid = Object.keys(errors).length === 0

  /* â”€â”€ Compute effective brut for portage/freelance before API call â”€â”€ */
  const computeEffectiveBrut = useCallback(() => {
    if (isSalaried) return +brutAnnuel
    if (isFreelance) {
      const ca = +caAnnuel
      if (freelanceType === 'me') return ca * (1 - 0.22) // micro-social services
      if (freelanceType === 'eurl') return ca * 0.60     // simplified TNS
      if (freelanceType === 'sasu') return ca * 0.55     // simplified SASU président
      return ca * 0.60
    }
    if (isPortage) {
      // Enveloppe après frais de portage = ce que la société peut consacrer à brut + charges patronales.
      // brut × EMPLOYER_COST_FACTOR ≈ coût employeur API ; on borne pour éviter coût employeur > CA HT.
      const envelopeMonthly = +caMensuel * (1 - portagePercent / 100)
      const brutMonthly = envelopeMonthly / EMPLOYER_COST_FACTOR
      return brutMonthly * 12
    }
    return 0
  }, [brutAnnuel, caAnnuel, caMensuel, freelanceType, isFreelance, isPortage, isSalaried, portagePercent])

  const simulate = useCallback(async ({ persist = true, silent = false } = {}) => {
    if (!silent) setSubmitAttempted(true)
    if (!isValid) return
    const requestId = requestSeqRef.current + 1
    requestSeqRef.current = requestId
    if (!silent) {
      setLoading(true)
      setResult(null)
    }
    try {
      const brutAnn = computeEffectiveBrut()
      const payload = {
        Brut: brutAnn / 12,
        BrutAnnuel: brutAnn,
        Statut: isSalaried ? statut : 'non-cadre',
        Parts: 0,
        RevenusAnnexes: isSalaried ? 0 : +(revenusAnnexes || 0),
        Primes: isSalaried ? 0 : +(primes || 0),
        TransportMensuel: isSalaried ? +(transportMensuel || 0) : 0,
        TeletravailMensuel: isSalaried ? +(teletravailMensuel || 0) : 0,
        TicketRestoMensuel: isSalaried ? +(ticketRestoMensuel || 0) : 0,
        TicketRestoEmployeurPct: isSalaried ? parseTicketEmployeurPct(ticketEmployeurPct) : 0,
        MutuelleNetDeduction: isSalaried ? +(mutuelleNet || 0) : 0,
        RetenuePct: +retenuePct,
        /* Extra context for future backend enrichment */
        FreelanceType: isFreelance ? freelanceType : null,
        PortagePercent: isPortage ? portagePercent : null,
        CaAnnuel: isFreelance ? +caAnnuel : null,
        CaMensuel: isPortage  ? +caMensuel : null,
        Persist: persist,
      }
      const tok  = localStorage.getItem('msim_token')
      const res  = await fetch('/api/payroll/simulate', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...(tok ? { Authorization: 'Bearer ' + tok } : {}),
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (requestId !== requestSeqRef.current) return
      if (!res.ok) {
        setResult({ error: json?.message || json?.title || `HTTP ${res.status}` })
        return
      }
      setSubmitAttempted(false)
      setResult(json)
    } catch (e) {
      if (requestId === requestSeqRef.current) setResult({ error: e.message })
    } finally {
      if (requestId === requestSeqRef.current && !silent) setLoading(false)
    }
  }, [
    brutAnnuel,
    caAnnuel,
    caMensuel,
    computeEffectiveBrut,
    freelanceType,
    isFreelance,
    isPortage,
    isSalaried,
    isValid,
    mutuelleNet,
    portagePercent,
    primes,
    retenuePct,
    revenusAnnexes,
    statut,
    teletravailMensuel,
    ticketEmployeurPct,
    ticketRestoMensuel,
    transportMensuel,
  ])

  const hasValidSimulationInput = Boolean(
    isValid && (
      (isSalaried && brutAnnuel) ||
      (isFreelance && caAnnuel) ||
      (isPortage && caMensuel)
    )
  )

  useEffect(() => {
    if (!hasValidSimulationInput) {
      setRetenuePct(0)
      return
    }
    setRetenuePct(suggestRetenueFromAnnualGross(computeEffectiveBrut()))
  }, [computeEffectiveBrut, hasValidSimulationInput])

  useEffect(() => {
    if (!hasValidSimulationInput) return undefined
    const timer = window.setTimeout(() => {
      simulate({ persist: false, silent: true })
    }, AUTO_RECALC_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [hasValidSimulationInput, simulate])

  const reset = () => {
    setBrutAnnuel(''); setCaAnnuel(''); setCaMensuel('')
    setRevenusAnnexes(''); setPrimes('')
    setTransportMensuel(''); setTeletravailMensuel(''); setTicketRestoMensuel(''); setTicketEmployeurPct('50'); setMutuelleNet('')
    setRetenuePct(0)
    setPortagePercent(10); setPortageCompany(''); setFraisPro('')
    setResult(null); setSubmitAttempted(false)
  }

  const netMonthly   = result?.netMonthly   ?? result?.net ?? null
  const netAnnual    = result?.netAnnual    ?? (netMonthly != null ? netMonthly * 12 : null)
  const employerCost = result?.employerCost ?? null
  const socialCont   = result?.socialContribution ?? null


  return (
    <div className="sim-shell">
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• LEFT PANEL â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="sim-form-card">
        <div className="section-header">{t.inputsTitle}</div>

        {/* â”€â”€ Status picker â”€â”€ */}
        <div style={{ marginBottom: 22 }}>
          <div className="field-label" style={{ marginBottom: 10 }}>{t.statut}</div>
          <StatusPicker value={statut} onChange={v => { setStatut(v); setResult(null) }} lang={lang} />
        </div>

        {/* â•â•â• SALARIÃ‰ form â•â•â• */}
        {isSalaried && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label className="field-label">{t.brutAnnuel}</label>
              <EuroInput value={brutAnnuel} onChange={setBrutAnnuel} placeholder={t.brutPlaceholder} error={errors.brut} />
              {brutAnnuel && !errors.brut && (
                <div className="field-hint">≈ {fmt(+brutAnnuel / 12, lang)} € / mois brut</div>
              )}
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <div className="field-label" style={{ marginBottom: 10 }}>{t.avantagesTitle}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="field-label">{t.transportLabel}</label>
                  <EuroInput value={transportMensuel} onChange={setTransportMensuel} placeholder="0" unit="/mois" />
                  <div className="field-hint" style={{ marginTop: 4 }}>{t.transportHint}</div>
                </div>
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="field-label">{t.ticketRestoLabel}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
                    <div>
                      <div className="field-hint" style={{ marginBottom: 4 }}>{t.ticketMontant}</div>
                      <EuroInput value={ticketRestoMensuel} onChange={setTicketRestoMensuel} placeholder="0" unit="/mois" />
                    </div>
                    <div>
                      <div className="field-hint" style={{ marginBottom: 4 }}>{t.ticketEmployeurPct}</div>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="field-input"
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          inputMode="decimal"
                          value={ticketEmployeurPct}
                          onChange={e => setTicketEmployeurPct(e.target.value)}
                          style={{ paddingRight: 28 }}
                        />
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>%</span>
                      </div>
                    </div>
                  </div>
                  {+ticketRestoMensuel > 0 && (
                    <div className="field-hint" style={{ marginTop: 6 }}>
                      {t.ticketPartSalariale}:{' '}
                      {fmt(+ticketRestoMensuel * (1 - parseTicketEmployeurPct(ticketEmployeurPct) / 100), lang)} € / mois
                    </div>
                  )}
                </div>
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="field-label">{t.teletravailLabel}</label>
                  <EuroInput value={teletravailMensuel} onChange={setTeletravailMensuel} placeholder="0" unit="/mois" />
                  <div className="field-hint" style={{ marginTop: 4 }}>{t.teletravailHint}</div>
                </div>
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="field-label">{t.mutuelleLabel}</label>
                  <EuroInput value={mutuelleNet} onChange={setMutuelleNet} placeholder="0" unit="/mois" />
                  <div className="field-hint" style={{ marginTop: 4 }}>{t.mutuelleHint}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* â•â•â• FREELANCE form â•â•â• */}
        {isFreelance && (
          <div style={{ marginBottom: 16 }}>
            {/* Structure type */}
            <div className="field-group" style={{ marginBottom: 14 }}>
              <label className="field-label">{t.structureType}</label>
              <div className="struct-pills">
                {[
                  { v: 'me',   label: t.freelanceME },
                  { v: 'eurl', label: t.freelanceEURL },
                  { v: 'sasu', label: t.freelanceSASU },
                ].map(s => (
                  <button key={s.v} type="button"
                    className={`struct-pill${freelanceType === s.v ? ' active' : ''}`}
                    onClick={() => setFreelanceType(s.v)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="field-hint" style={{ marginTop: 6 }}>
                {freelanceType === 'me'   && (lang === 'fr' ? 'Abattement 22% charges sociales (régime micro-social services)' : '22% social levy on revenue (micro-social services)')}
                {freelanceType === 'eurl' && (lang === 'fr' ? 'Charges TNS estimées à ~40% du CA net' : 'Self-employed contributions ~40% of net revenue')}
                {freelanceType === 'sasu' && (lang === 'fr' ? 'Charges président estimées à ~45% du CA net' : 'President contributions ~45% of net revenue')}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label className="field-label">{t.caAnnuel}</label>
                <EuroInput value={caAnnuel} onChange={setCaAnnuel} placeholder={t.caPlaceholder} error={errors.ca} />
                {caAnnuel && !errors.ca && (
                  <div className="field-hint">
                    {lang === 'fr' ? 'Équivalent brut estimé' : 'Estimated gross equivalent'}: ≈ {fmt(computeEffectiveBrut() / 12, lang)} € / mois
                  </div>
                )}
              </div>
              <div className="field-group">
                <label className="field-label">{t.revenusAnnexes}</label>
                <EuroInput value={revenusAnnexes} onChange={setRevenusAnnexes} placeholder="0" />
              </div>
              <div className="field-group">
                <label className="field-label">{t.primes}</label>
                <EuroInput value={primes} onChange={setPrimes} placeholder="0" />
              </div>
            </div>
          </div>
        )}

        {/* â•â•â• PORTAGE form â•â•â• */}
        {isPortage && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label className="field-label">{t.caMensuel}</label>
                <EuroInput value={caMensuel} onChange={setCaMensuel} placeholder={t.caMensuelPlaceholder} error={errors.cam} />
                {caMensuel && !errors.cam && (
                  <div className="field-hint">
                    {lang === 'fr' ? 'CA annuel ≈' : 'Annual revenue ≈'} {fmt(+caMensuel * 12, lang)} € ·{' '}
                    {lang === 'fr' ? 'Brut équivalent ≈' : 'Equivalent gross ≈'} {fmt(computeEffectiveBrut() / 12, lang)} €{' '}
                    {lang === 'fr' ? '/ mois' : '/ month'}
                  </div>
                )}
              </div>

              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="field-label">{t.portagePercent}</label>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--warning)' }}>{portagePercent}%</span>
                </div>
                <input type="range" min={3} max={20} step={0.5} value={portagePercent}
                  onChange={e => setPortagePercent(+e.target.value)} className="retenue-slider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  <span>3%</span><span>8%</span><span>12%</span><span>16%</span><span>20%</span>
                </div>
                <div className="field-hint" style={{ marginTop: 4 }}>{t.portagePercentHint}</div>
                {caMensuel && (
                  <div className="portage-fee-badge">
                    {lang === 'fr' ? 'Frais mensuels portage' : 'Monthly portage fee'}: ~{fmt(+caMensuel * portagePercent / 100, lang)} €
                  </div>
                )}
              </div>

              <div className="field-group">
                <label className="field-label">{t.portageCompany}</label>
                <input className="field-input" placeholder="ex: Redtech, Comatch…" value={portageCompany} onChange={e => setPortageCompany(e.target.value)} />
              </div>

              <div className="field-group">
                <label className="field-label">{t.fraisPro}</label>
                <EuroInput value={fraisPro} onChange={setFraisPro} placeholder="0" />
              </div>
            </div>
          </div>
        )}

        <div className="sim-divider" />

        {/* â”€â”€â”€ Fiscal mode â”€â”€â”€ */}
        <FiscalToggle
          retenue={retenuePct} onRetenue={setRetenuePct}
          t={t}
        />

        <div className="sim-divider" style={{ margin: '18px 0 14px' }} />

        {/* â”€â”€â”€ CTA buttons â”€â”€â”€ */}
        <div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn-primary-custom" onClick={() => simulate()} disabled={loading}>
              {loading ? (
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28 56" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M5 3l14 9-14 9V3z" fill="currentColor" /></svg>
              )}
              {loading ? (lang === 'fr' ? 'Calcul...' : 'Calculating...') : t.simulate}
            </button>
            <button className="btn-ghost" onClick={reset} type="button">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {t.reset}
            </button>
          </div>
          {submitAttempted && !isValid && (
            <div className="field-error" style={{ marginTop: 10 }}>
              {t.fixFieldsHint}
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• RIGHT PANEL â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="sim-result-card">
        <div className="section-header">{t.resultsTitle}</div>

        {!result && !loading && (
          <div className="sim-result-empty">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M9 11l2 2 4-4M15 19l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{t.resultsTitle}</div>
            <div style={{ fontSize: 13 }}>{t.empty}</div>
          </div>
        )}

        {result?.error && (
          <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 14 }}>
            {result.error}
          </div>
        )}

        {result && !result.error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <KpiCard label={t.netMonthly} color="success" value={fmt(netMonthly, lang)} unit="€ / mois"
                icon={<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>} />
              <KpiCard label={t.netAnnual} color="accent" value={fmt(netAnnual, lang)} unit="€ / an"
                icon={<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>} />
              <KpiCard label={t.socialCont} color="warning" value={fmt(socialCont, lang)} unit="€ / mois"
                icon={<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
              <KpiCard label={t.employerCost} color="indigo" value={fmt(employerCost, lang)} unit="€ / mois"
                icon={<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
            </div>

            {retenuePct > 0 && netMonthly != null && (
              <div className="kpi-card danger" style={{ padding: '14px 18px', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <div>
                  <div className="kpi-label">{t.withholding}</div>
                  <div className="kpi-value" style={{ fontSize: 20 }}>{fmt(result.retenueAmount ?? 0, lang)} €</div>
                  <div className="kpi-unit">prélevé / mois</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 900, color: 'var(--danger)' }}>−{fmtPct(retenuePct, lang)}%</div>
              </div>
            )}

            {isPortage && (
              <div className="kpi-card warning" style={{ padding: '14px 18px', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <div>
                  <div className="kpi-label">Frais portage ({portagePercent}%)</div>
                  <div className="kpi-value" style={{ fontSize: 20 }}>{fmt(+caMensuel * portagePercent / 100, lang)} €</div>
                  <div className="kpi-unit">/ mois</div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" /></svg>
              </div>
            )}

            <div>
              <div className="section-header" style={{ marginTop: 8 }}>{t.breakdown}</div>
              <BreakdownBar
                net={netMonthly || 0}
                social={socialCont || 0}
                employer={Math.max(0, (employerCost || 0) - (netMonthly || 0) - (socialCont || 0))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

