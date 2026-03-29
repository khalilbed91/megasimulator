import React, { useState, useMemo, useEffect } from 'react'

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
    simulate: 'Calculer', reset: 'Réinitialiser',
    resultsTitle: 'Résultats', empty: 'Remplissez le formulaire et cliquez sur Calculer.',
    technical: 'Vue JSON technique',
    netMonthly: 'Net mensuel', netAnnual: 'Net annuel',
    employerCost: 'Coût employeur', socialCont: 'Cotisations sociales',
    withholding: 'Retenue à la source', breakdown: 'Répartition salariale',
    errBrut: 'Entrez un brut annuel valide (> 0)',
    errCA: 'Entrez un CA annuel valide (> 0)',
    errCAM: 'Entrez un CA mensuel valide (> 0)',
    fiscalMode: 'Mode fiscal',
    partsLabel: 'Foyer fiscal (parts)',
    retenueLabel: 'Retenue à la source',
    partsCount: 'Nombre de parts',
    retenueSuggested: 'Taux suggéré selon le revenu',
    retenueAdjust: 'Ajuster le taux',
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
    situationFam: 'Situation familiale',
    celibataire: 'Célibataire', marie: 'Marié(e) / Pacsé(e)', divorce: 'Divorcé(e)', veuf: 'Veuf/Veuve',
    enfants: 'Enfants à charge',
  },
  en: {
    inputsTitle: 'Parameters',
    brutAnnuel: 'Gross annual salary', brutPlaceholder: 'e.g. 36000',
    caAnnuel: 'Annual revenue (excl. tax)', caPlaceholder: 'e.g. 60000',
    caMensuel: 'Monthly revenue (excl. tax)', caMensuelPlaceholder: 'e.g. 5000',
    statut: 'Contract / Status type',
    revenusAnnexes: 'Additional income', primes: 'Bonuses',
    simulate: 'Calculate', reset: 'Reset',
    resultsTitle: 'Results', empty: 'Fill in the form and click Calculate.',
    technical: 'Technical JSON view',
    netMonthly: 'Monthly net', netAnnual: 'Annual net',
    employerCost: 'Employer cost', socialCont: 'Social contributions',
    withholding: 'Withholding tax', breakdown: 'Pay breakdown',
    errBrut: 'Enter a valid gross annual salary (> 0)',
    errCA: 'Enter a valid annual revenue (> 0)',
    errCAM: 'Enter a valid monthly revenue (> 0)',
    fiscalMode: 'Tax mode',
    partsLabel: 'Household (tax parts)',
    retenueLabel: 'Withholding tax',
    partsCount: 'Tax parts',
    retenueSuggested: 'Suggested rate by income',
    retenueAdjust: 'Adjust rate',
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
    situationFam: 'Marital status',
    celibataire: 'Single', marie: 'Married / Civil union', divorce: 'Divorced', veuf: 'Widowed',
    enfants: 'Dependent children',
  }
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Helpers
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fmt = (v, lang) =>
  typeof v === 'number'
    ? v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

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

/* Preset avantages chips */
const AVANTAGE_PRESETS = [
  { id: 'resto',    labelFr: 'Ticket restaurant', labelEn: 'Meal voucher',    amount: 220, hintFr: '11€ × 20j × 60%',     hintEn: '11€ × 20d × 60%' },
  { id: 'ttx',      labelFr: 'Forfait télétravail', labelEn: 'Remote work',   amount: 60,  hintFr: '3€/j × 20j',           hintEn: '3€/d × 20d' },
  { id: 'tel',      labelFr: 'Forfait téléphone', labelEn: 'Phone allowance', amount: 25,  hintFr: 'Usage pro',             hintEn: 'Pro usage' },
  { id: 'transport',labelFr: 'Transports', labelEn: 'Transport',              amount: 82,  hintFr: '50% carte Navig. ~82€', hintEn: '50% transit pass' },
  { id: 'prime',    labelFr: 'Prime mensuelle', labelEn: 'Monthly bonus',     amount: 100, hintFr: 'Prime variable',        hintEn: 'Variable bonus' },
]

/** PAS 2026 rate suggestion based on estimated annual net */
function suggestRetenue(brutAnn) {
  if (!brutAnn || brutAnn <= 0) return 0
  const approxNet = brutAnn * 0.78
  if (approxNet <= 14_490)  return 0
  if (approxNet <= 21_917)  return 2
  if (approxNet <= 31_425)  return 7.5
  if (approxNet <= 58_360)  return 14
  if (approxNet <= 80_669)  return 22
  if (approxNet <= 177_106) return 30
  return 41
}

/** Parts suggest based on situation familiale + enfants */
function suggestParts(situation, enfants) {
  const base   = situation === 'marie' ? 2 : 1
  const extras = (en => {
    if (en <= 0) return 0
    if (en === 1) return 0.5
    if (en === 2) return 1
    return 1 + (en - 2) // +1 per extra child from 3rd
  })(+enfants || 0)
  return base + extras
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
    color: '#0ea5a4'
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

/** Fiscal toggle: parts OR retenue — mutually exclusive */
function FiscalToggle({ mode, onMode, parts, onParts, retenue, onRetenue, brutSuggested, lang, t }){
  const suggested = suggestRetenue(brutSuggested)
  return (
    <div className="fiscal-toggle-wrap">
      <div className="field-label" style={{marginBottom:10}}>{t.fiscalMode}</div>
      <div className="fiscal-pill-row">
        <button type="button" className={`fiscal-pill${mode==='parts'?' active':''}`} onClick={()=>onMode('parts')}>
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {t.partsLabel}
        </button>
        <button type="button" className={`fiscal-pill${mode==='retenue'?' active':''}`} onClick={()=>onMode('retenue')}>
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {t.retenueLabel}
        </button>
      </div>

      {mode === 'parts' && (
        <div style={{marginTop:14}}>
          <div className="field-label" style={{marginBottom:8}}>{t.partsCount}</div>
          <div className="parts-selector">
            {[1, 1.5, 2, 2.5, 3, 3.5, 4, 5].map(p => (
              <button key={p} type="button"
                className={`parts-chip${+parts === p ? ' active' : ''}`}
                onClick={() => onParts(p)}>
                {p}
              </button>
            ))}
          </div>
          <div className="field-hint" style={{marginTop:6}}>
            {lang === 'fr' ? `Sélectionné : ${parts} part${parts > 1 ? 's' : ''}` : `Selected: ${parts} part${parts > 1 ? 's' : ''}`}
          </div>
        </div>
      )}

      {mode === 'retenue' && (
        <div style={{marginTop:14}}>
          {suggested > 0 && (
            <div className="retenue-suggest" onClick={() => onRetenue(suggested)}>
              <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              {t.retenueSuggested}: <strong>{suggested}%</strong> — cliquer pour appliquer
            </div>
          )}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10,marginBottom:4}}>
            <div className="field-label">{t.retenueAdjust}</div>
            <div style={{fontSize:22,fontWeight:900,color:'var(--accent)',minWidth:52,textAlign:'right'}}>{retenue}%</div>
          </div>
          <input
            type="range" min={0} max={55} step={0.5}
            value={retenue}
            onChange={e => onRetenue(+e.target.value)}
            className="retenue-slider"
          />
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--muted)',marginTop:2}}>
            <span>0%</span><span>10%</span><span>20%</span><span>30%</span><span>41%</span><span>55%</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Main component
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function PayrollSimulator({ lang = 'fr' }){
  const t = useMemo(() => T[lang] || T['fr'], [lang])

  /* Common */
  const [brutAnnuel,     setBrutAnnuel]     = useState('')
  const [revenusAnnexes, setRevenusAnnexes] = useState('')
  const [avantagesActifs, setAvantagesActifs] = useState([])
  const [primes,         setPrimes]         = useState('')
  const [result,         setResult]         = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [showTech,       setShowTech]       = useState(false)

  /* Status */
  const [statut, setStatut] = useState('non-cadre')

  /* Fiscal toggle */
  const [fiscalMode, setFiscalMode] = useState('parts')  // 'parts' | 'retenue'
  const [parts,      setParts]      = useState(1)
  const [retenuePct, setRetenuePct] = useState(0)

  /* Fiscal — situation familiale (drives parts suggestion) */
  const [situationFam, setSituationFam] = useState('celibataire')
  const [enfants,      setEnfants]      = useState(0)

  /* Freelance-specific */
  const [freelanceType, setFreelanceType] = useState('me')   // 'me' | 'eurl' | 'sasu'
  const [caAnnuel,      setCaAnnuel]      = useState('')

  /* Portage-specific */
  const [caMensuel,       setCaMensuel]       = useState('')
  const [portagePercent,  setPortagePercent]  = useState(10)
  const [portageCompany,  setPortageCompany]  = useState('')
  const [fraisPro,        setFraisPro]        = useState('')

  /* Auto-suggest parts when situation/enfants changes */
  useEffect(() => {
    if (fiscalMode === 'parts') {
      setParts(suggestParts(situationFam, enfants))
    }
  }, [situationFam, enfants, fiscalMode])

  /* Auto-suggest retenue when brut changes */
  useEffect(() => {
    if (fiscalMode === 'retenue') {
      const s = suggestRetenue(+brutAnnuel || +caAnnuel || (+caMensuel * 12))
      if (s > 0) setRetenuePct(s)
    }
  }, [brutAnnuel, caAnnuel, caMensuel, fiscalMode])

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
  const computeEffectiveBrut = () => {
    if (isSalaried) return +brutAnnuel
    if (isFreelance) {
      const ca = +caAnnuel
      if (freelanceType === 'me') return ca * (1 - 0.22) // micro-social services
      if (freelanceType === 'eurl') return ca * 0.60     // simplified TNS
      if (freelanceType === 'sasu') return ca * 0.55     // simplified SASU président
      return ca * 0.60
    }
    if (isPortage) {
      const caAnn = +caMensuel * 12
      return caAnn * (1 - portagePercent / 100) * 0.78 // portage fees → brut salarié approx
    }
    return 0
  }

  const simulate = async () => {
    if (!isValid) return
    setLoading(true); setResult(null)
    try {
      const brutAnn = computeEffectiveBrut()
      const payload = {
        Brut: brutAnn / 12,
        BrutAnnuel: brutAnn,
        Statut: isSalaried ? statut : 'non-cadre',
        Parts: fiscalMode === 'parts' ? +parts : 1,
        RevenusAnnexes: +(revenusAnnexes || 0),
        Primes: +(primes || 0),
        RetenuePct: fiscalMode === 'retenue' ? +retenuePct : 0,
        /* Extra context for future backend enrichment */
        FreelanceType: isFreelance ? freelanceType : null,
        PortagePercent: isPortage ? portagePercent : null,
        CaAnnuel: isFreelance ? +caAnnuel : null,
        CaMensuel: isPortage  ? +caMensuel : null,
      }
      const tok  = localStorage.getItem('msim_token')
      const res  = await fetch('/api/payroll/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tok ? { Authorization: 'Bearer ' + tok } : {}),
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      setResult(json)
    } catch(e) { setResult({ error: e.message }) }
    finally { setLoading(false) }
  }

  const reset = () => {
    setBrutAnnuel(''); setCaAnnuel(''); setCaMensuel('')
    setRevenusAnnexes(''); setAvantagesActifs([]); setPrimes(''); setRetenuePct(0); setParts(1)
    setPortagePercent(10); setPortageCompany(''); setFraisPro('')
    setSituationFam('celibataire'); setEnfants(0)
    setResult(null); setFiscalMode('parts')
  }

  const isAdmin = () => {
    try {
      const tok = localStorage.getItem('msim_token')
      if (!tok) return false
      const p = JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      const r = p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || p['role'] || p['roles']
      if (!r) return false
      return Array.isArray(r) ? r.includes('admin') : r === 'admin'
    } catch { return false }
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
              <label className="field-label">{t.revenusAnnexes} <span className="field-hint" style={{display:'inline',marginLeft:4}}>(€/mois)</span></label>
              {/* Preset chips */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                {AVANTAGE_PRESETS.map(p => {
                  const active = avantagesActifs.includes(p.id)
                  return (
                    <button key={p.id} type="button"
                      className={`avantage-chip${active ? ' active' : ''}`}
                      onClick={() => {
                        if (active) {
                          setAvantagesActifs(a => a.filter(x => x !== p.id))
                          setRevenusAnnexes(v => String(Math.max(0, (+v || 0) - p.amount)))
                        } else {
                          setAvantagesActifs(a => [...a, p.id])
                          setRevenusAnnexes(v => String((+v || 0) + p.amount))
                        }
                      }}
                    >
                      <span style={{fontWeight:700}}>{lang === 'fr' ? p.labelFr : p.labelEn}</span>
                      <span style={{opacity:0.7, fontSize:11}}>+{p.amount}€</span>
                    </button>
                  )
                })}
              </div>
              <EuroInput value={revenusAnnexes} onChange={v => { setRevenusAnnexes(v); setAvantagesActifs([]) }} placeholder="0" unit="/mois" />
              {revenusAnnexes > 0 && (
                <div className="field-hint" style={{marginTop:4}}>≈ {fmt(+revenusAnnexes * 12, lang)} €/an · impact net estimé: +{fmt(+revenusAnnexes * 0.78, lang)} €/mois</div>
              )}
            </div>
            <div className="field-group">
              <label className="field-label">{t.primes} <span className="field-hint" style={{display:'inline',marginLeft:4}}>(€/mois)</span></label>
              <EuroInput value={primes} onChange={setPrimes} placeholder="0" unit="/mois" />
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
                    CA annuel ≈ {fmt(+caMensuel * 12, lang)} € · Net estimé ≈ {fmt(computeEffectiveBrut() / 12, lang)} € / mois
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

        {/* â”€â”€â”€ Situation familiale (for automatic parts suggestion) â”€â”€â”€ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="field-group">
            <label className="field-label">{t.situationFam}</label>
            <select className="field-select" value={situationFam} onChange={e => setSituationFam(e.target.value)}>
              <option value="celibataire">{t.celibataire}</option>
              <option value="marie">{t.marie}</option>
              <option value="divorce">{t.divorce}</option>
              <option value="veuf">{t.veuf}</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">{t.enfants}</label>
            <input className="field-input" type="number" min={0} max={10} value={enfants}
              onChange={e => setEnfants(+e.target.value)} />
          </div>
        </div>

        {/* â”€â”€â”€ Fiscal toggle â”€â”€â”€ */}
        <FiscalToggle
          mode={fiscalMode}   onMode={setFiscalMode}
          parts={parts}       onParts={setParts}
          retenue={retenuePct} onRetenue={setRetenuePct}
          brutSuggested={+brutAnnuel || +caAnnuel || (+caMensuel * 12)}
          lang={lang} t={t}
        />

        <div className="sim-divider" style={{ margin: '18px 0 14px' }} />

        {/* â”€â”€â”€ CTA buttons â”€â”€â”€ */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary-custom" onClick={simulate} disabled={!isValid || loading}>
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
          {isAdmin() && (
            <button className="btn-ghost" onClick={() => setShowTech(s => !s)} type="button" style={{ marginLeft: 'auto' }}>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {t.technical}
            </button>
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

            {fiscalMode === 'retenue' && retenuePct > 0 && netMonthly != null && (
              <div className="kpi-card danger" style={{ padding: '14px 18px', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <div>
                  <div className="kpi-label">{t.withholding}</div>
                  <div className="kpi-value" style={{ fontSize: 20 }}>{fmt(netMonthly * retenuePct / 100, lang)} €</div>
                  <div className="kpi-unit">prélevé / mois</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 900, color: 'var(--danger)' }}>−{retenuePct}%</div>
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

            {showTech && (
              <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '14px 16px', borderRadius: 'var(--radius-sm)', overflow: 'auto', marginTop: 4 }}>
                <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

