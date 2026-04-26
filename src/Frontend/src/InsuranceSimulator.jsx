import React, { useEffect, useMemo, useState } from 'react'

const T = {
  fr: {
    title: 'Simulateur assurance',
    subtitle: 'Habitation, auto et moto — estimation pédagogique France 2026 basée sur obligations légales, garanties, franchise et facteurs de risque.',
    product: 'Produit',
    home: 'Habitation',
    auto: 'Auto',
    moto: 'Moto',
    coverage: 'Formule',
    deductible: 'Franchise',
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    postalCode: 'Code postal',
    postalCodeHint: 'Saisissez 2 à 5 chiffres puis choisissez la commune.',
    zone: 'Facteur zone',
    zoneHint: '1 = standard ; augmentez si grande ville / sinistralité élevée.',
    occupant: 'Profil logement',
    tenant: 'Locataire',
    owner: 'Propriétaire occupant',
    landlord: 'Propriétaire bailleur',
    coOwner: 'Copropriétaire',
    housingType: 'Type de logement',
    apartment: 'Appartement',
    house: 'Maison',
    surface: 'Surface (m²)',
    rooms: 'Pièces',
    contents: 'Capital mobilier (€)',
    valuables: 'Objets de valeur (€)',
    alarm: 'Alarme / protection',
    secondHome: 'Résidence secondaire',
    furnished: 'Location meublée',
    homeHiddenAssumptions: 'Hypothèse simple : appartement locataire, mobilier standard estimé depuis la surface.',
    vehicleValue: 'Valeur véhicule (€)',
    vehicleAge: 'Âge véhicule (années)',
    fiscalHp: 'Puissance fiscale (CV)',
    usage: 'Usage',
    private: 'Privé',
    commute: 'Trajet domicile-travail',
    professional: 'Professionnel',
    mileage: 'Kilométrage annuel',
    parking: 'Stationnement',
    street: 'Rue',
    privateParking: 'Parking privé',
    garage: 'Garage fermé',
    driverAge: 'Âge conducteur',
    licenseYears: 'Années de permis',
    crm: 'Bonus-malus (CRM)',
    claims: 'Sinistres 36 mois',
    category: 'Catégorie',
    engine: 'Cylindrée (cm³)',
    antiTheft: 'Antivol',
    noAntiTheft: 'Aucun',
    approvedLock: 'Antivol homologué',
    tracker: 'Alarme / tracker',
    ct: 'Contrôle technique',
    ctNotRequired: 'Pas encore requis',
    ctValid: 'Valide',
    ctOverdue: 'En retard',
    ctUnknown: 'Inconnu',
    equipment: 'Équipement motard couvert (€)',
    crmApplicable: 'Bonus-malus applicable',
    calc: 'Calculer',
    reset: 'Réinitialiser',
    results: 'Résultats',
    empty: 'Choisissez une formule puis calculez.',
    monthly: 'Prime mensuelle',
    annual: 'Prime annuelle',
    legalMin: 'Socle obligatoire',
    addons: 'Garanties / capitaux',
    riskAdj: 'Ajustements risque',
    deductibleDiscount: 'Effet franchise',
    crmUsed: 'CRM utilisé',
    mandatory: 'Obligation',
    breakdown: 'Détail',
    warnings: 'Alertes',
    assumptions: 'Hypothèses',
    disclaimer: 'Estimation indicative non contractuelle. Les tarifs réels dépendent de l’assureur, de l’adresse exacte, des antécédents et des conditions du contrat.',
    yes: 'Oui',
    no: 'Non',
  },
  en: {
    title: 'Insurance simulator',
    subtitle: 'Home, car and motorcycle — 2026 France educational estimate based on legal obligations, coverage, deductible and risk factors.',
    product: 'Product',
    home: 'Home',
    auto: 'Car',
    moto: 'Motorcycle',
    coverage: 'Coverage',
    deductible: 'Deductible',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    postalCode: 'Postal code',
    postalCodeHint: 'Enter 2 to 5 digits, then choose the city.',
    zone: 'Zone factor',
    zoneHint: '1 = standard; increase for large city / higher claim area.',
    occupant: 'Housing profile',
    tenant: 'Tenant',
    owner: 'Owner occupier',
    landlord: 'Landlord',
    coOwner: 'Co-owner',
    housingType: 'Housing type',
    apartment: 'Apartment',
    house: 'House',
    surface: 'Surface (sqm)',
    rooms: 'Rooms',
    contents: 'Contents value (€)',
    valuables: 'Valuables (€)',
    alarm: 'Alarm / protection',
    secondHome: 'Secondary residence',
    furnished: 'Furnished rental',
    homeHiddenAssumptions: 'Simple assumption: tenant apartment, standard contents estimated from surface.',
    vehicleValue: 'Vehicle value (€)',
    vehicleAge: 'Vehicle age (years)',
    fiscalHp: 'Fiscal HP',
    usage: 'Usage',
    private: 'Private',
    commute: 'Commute',
    professional: 'Professional',
    mileage: 'Annual mileage',
    parking: 'Parking',
    street: 'Street',
    privateParking: 'Private parking',
    garage: 'Closed garage',
    driverAge: 'Driver age',
    licenseYears: 'License years',
    crm: 'No-claim coefficient',
    claims: 'Claims last 36 months',
    category: 'Category',
    engine: 'Engine cc',
    antiTheft: 'Anti-theft',
    noAntiTheft: 'None',
    approvedLock: 'Approved lock',
    tracker: 'Alarm / tracker',
    ct: 'Technical inspection',
    ctNotRequired: 'Not required yet',
    ctValid: 'Valid',
    ctOverdue: 'Overdue',
    ctUnknown: 'Unknown',
    equipment: 'Covered rider equipment (€)',
    crmApplicable: 'CRM applicable',
    calc: 'Calculate',
    reset: 'Reset',
    results: 'Results',
    empty: 'Choose coverage and calculate.',
    monthly: 'Monthly premium',
    annual: 'Annual premium',
    legalMin: 'Mandatory base',
    addons: 'Coverage / capital',
    riskAdj: 'Risk adjustments',
    deductibleDiscount: 'Deductible effect',
    crmUsed: 'CRM used',
    mandatory: 'Obligation',
    breakdown: 'Breakdown',
    warnings: 'Warnings',
    assumptions: 'Assumptions',
    disclaimer: 'Indicative non-contractual estimate. Real prices depend on insurer, exact address, claims history and policy terms.',
    yes: 'Yes',
    no: 'No',
  }
}

function parseDec(s) {
  if (s == null || s === '') return 0
  return parseFloat(String(s).replace(/\s/g, '').replace(',', '.')) || 0
}

function parseIntValue(s, fallback = 0) {
  const n = parseInt(String(s || ''), 10)
  return Number.isFinite(n) ? n : fallback
}

function fmt(n, lang, digits = 2) {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function eur(n, lang) {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function Kpi({ label, value, unit, color }) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {unit && <div className="kpi-unit">{unit}</div>}
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {children}
      {hint && <div className="field-hint" style={{ marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export default function InsuranceSimulator({ lang = 'fr' }) {
  const t = T[lang] || T.fr
  const [product, setProduct] = useState('home')
  const [coverage, setCoverage] = useState('standard_mrh')
  const [deductible, setDeductible] = useState('medium')
  const [postalCode, setPostalCode] = useState('')
  const [postalSuggestions, setPostalSuggestions] = useState([])
  const [selectedPostal, setSelectedPostal] = useState(null)
  const [zoneFactor, setZoneFactor] = useState('1')
  const [occupantStatus, setOccupantStatus] = useState('tenant')
  const [housingType, setHousingType] = useState('apartment')
  const [surface, setSurface] = useState('65')
  const [hasAlarm, setHasAlarm] = useState(false)
  const [isPrimaryResidence, setIsPrimaryResidence] = useState(true)
  const [isFurnishedRental, setIsFurnishedRental] = useState(false)
  const [vehicleValue, setVehicleValue] = useState('18000')
  const [vehicleAge, setVehicleAge] = useState('5')
  const [fiscalHp, setFiscalHp] = useState('6')
  const [usage, setUsage] = useState('private')
  const [mileage, setMileage] = useState('12000')
  const [parking, setParking] = useState('private_parking')
  const [driverAge, setDriverAge] = useState('35')
  const [licenseYears, setLicenseYears] = useState('10')
  const [crm, setCrm] = useState('0.95')
  const [claims, setClaims] = useState('0')
  const [category, setCategory] = useState('motorcycle')
  const [engineCc, setEngineCc] = useState('650')
  const [antiTheft, setAntiTheft] = useState('approved_lock')
  const [technicalInspectionStatus, setTechnicalInspectionStatus] = useState('valid')
  const [equipmentValue, setEquipmentValue] = useState('1200')
  const [crmApplicable, setCrmApplicable] = useState(true)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const productCoverage = useMemo(() => {
    if (product === 'home') {
      return [
        ['legal_minimum', occupantStatus === 'co_owner' ? 'RC copropriété' : 'Risques locatifs'],
        ['standard_mrh', 'MRH standard'],
        ['premium_mrh', 'MRH renforcée'],
      ]
    }
    if (product === 'moto') {
      return [
        ['third_party', 'Tiers moto'],
        ['theft_fire', 'Vol / incendie'],
        ['all_risk', 'Tous risques'],
      ]
    }
    return [
      ['third_party', 'Tiers simple'],
      ['third_party_plus', 'Tiers étendu'],
      ['all_risk', 'Tous risques'],
    ]
  }, [product, occupantStatus])

  useEffect(() => {
    if (product !== 'home') {
      setPostalSuggestions([])
      return undefined
    }
    const q = postalCode.trim()
    if (q.length < 2) {
      setPostalSuggestions([])
      setSelectedPostal(null)
      return undefined
    }
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/reference/postal-codes?q=${encodeURIComponent(q)}&limit=8`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        setPostalSuggestions(Array.isArray(data) ? data : [])
      } catch {
        setPostalSuggestions([])
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [postalCode, product])

  function switchProduct(next) {
    setProduct(next)
    setResult(null)
    if (next === 'home') setCoverage('standard_mrh')
    else setCoverage('third_party')
  }

  async function simulate() {
    setErr('')
    setLoading(true)
    try {
      const postal = selectedPostal || postalSuggestions.find(p => (p.postalCode || p.PostalCode) === postalCode.trim()) || null
      const payload = {
        product,
        coverageLevel: coverage,
        deductibleLevel: deductible,
        postalCode: product === 'home' ? postalCode.trim() : '',
        zoneFactor: product === 'home' ? Number(postal?.zoneFactor ?? postal?.ZoneFactor ?? 1) : (parseDec(zoneFactor) || 1),
        home: product === 'home' ? {
          occupantStatus,
          housingType,
          surfaceSqm: parseDec(surface),
          rooms: Math.max(1, Math.round(parseDec(surface) / 25)),
          contentsValue: Math.max(8000, parseDec(surface) * 300),
          valuableItemsValue: 0,
          hasAlarm,
          isPrimaryResidence,
          isFurnishedRental,
        } : null,
        vehicle: product !== 'home' ? {
          vehicleValue: parseDec(vehicleValue),
          vehicleAgeYears: parseIntValue(vehicleAge),
          powerFiscalHp: parseDec(fiscalHp),
          usage,
          annualMileage: parseIntValue(mileage, 12000),
          parking,
          driverAge: parseIntValue(driverAge, 35),
          licenseYears: parseIntValue(licenseYears, 10),
          crm: parseDec(crm) || 1,
          crmApplicable,
          claimsLast36Months: parseIntValue(claims),
          category: product === 'moto' ? category : 'car',
          engineCc: product === 'moto' ? parseIntValue(engineCc) : 0,
          antiTheftDevice: product === 'moto' ? antiTheft : 'approved_lock',
          technicalInspectionStatus: product === 'moto' ? technicalInspectionStatus : 'not_required_yet',
          equipmentValue: product === 'moto' ? parseDec(equipmentValue) : 0,
        } : null,
      }
      const tok = localStorage.getItem('msim_token')
      const res = await fetch('/api/insurance/simulate', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      setResult(await res.json())
    } catch (e) {
      setErr(e.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setProduct('home')
    setCoverage('standard_mrh')
    setDeductible('medium')
    setPostalCode('')
    setPostalSuggestions([])
    setSelectedPostal(null)
    setZoneFactor('1')
    setOccupantStatus('tenant')
    setHousingType('apartment')
    setSurface('65')
    setHasAlarm(false)
    setIsPrimaryResidence(true)
    setIsFurnishedRental(false)
    setVehicleValue('18000')
    setVehicleAge('5')
    setFiscalHp('6')
    setUsage('private')
    setMileage('12000')
    setParking('private_parking')
    setDriverAge('35')
    setLicenseYears('10')
    setCrm('0.95')
    setClaims('0')
    setCategory('motorcycle')
    setEngineCc('650')
    setAntiTheft('approved_lock')
    setTechnicalInspectionStatus('valid')
    setEquipmentValue('1200')
    setCrmApplicable(true)
    setResult(null)
    setErr('')
  }

  const r = result || {}
  const warnings = r.warnings || r.Warnings || []
  const assumptions = r.assumptions || r.Assumptions || []
  const breakdown = r.breakdown || r.Breakdown || []

  return (
    <div className="sim-shell">
      <div className="sim-form-card">
        <div className="section-header">{t.title}</div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t.subtitle}</p>

        <Field label={t.product}>
          <div className="status-picker">
            {[
              ['home', t.home],
              ['auto', t.auto],
              ['moto', t.moto],
            ].map(([value, label]) => (
              <button key={value} type="button" className={`status-card${product === value ? ' active' : ''}`} onClick={() => switchProduct(value)}>
                <span className="status-card-label">{label}</span>
                <span className="status-card-hint">{value === 'home' ? 'MRH / RC' : value === 'auto' ? 'Tiers / tous risques' : '2 roues / scooter'}</span>
              </button>
            ))}
          </div>
        </Field>

        {product !== 'home' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label={t.coverage}>
              <select className="field-select" value={coverage} onChange={(e) => setCoverage(e.target.value)}>
                {productCoverage.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label={t.deductible}>
              <select className="field-select" value={deductible} onChange={(e) => setDeductible(e.target.value)}>
                <option value="low">{t.low}</option>
                <option value="medium">{t.medium}</option>
                <option value="high">{t.high}</option>
              </select>
            </Field>
          </div>
        )}

        {product !== 'home' && (
          <Field label={t.zone} hint={t.zoneHint}>
            <input className="field-input" inputMode="decimal" value={zoneFactor} onChange={(e) => setZoneFactor(e.target.value)} />
          </Field>
        )}

        {product === 'home' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label={t.postalCode} hint={t.postalCodeHint}>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field-input"
                    inputMode="numeric"
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value.replace(/[^\d]/g, '').slice(0, 5))
                      setSelectedPostal(null)
                    }}
                    placeholder="92400 - Courbevoie"
                  />
                  {postalSuggestions.length > 0 && !selectedPostal && (
                    <div style={{
                      position: 'absolute',
                      zIndex: 20,
                      top: 'calc(100% + 6px)',
                      left: 0,
                      right: 0,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow)',
                      overflow: 'hidden'
                    }}>
                      {postalSuggestions.map((p) => {
                        const code = p.postalCode || p.PostalCode
                        const city = p.city || p.City
                        const dep = p.departmentCode || p.DepartmentCode
                        return (
                          <button
                            key={`${code}-${city}`}
                            type="button"
                            className="nav-item"
                            style={{ width: '100%', borderRadius: 0, justifyContent: 'flex-start' }}
                            onClick={() => {
                              setPostalCode(code)
                              setSelectedPostal(p)
                              setPostalSuggestions([])
                            }}
                          >
                            <span>{code} - {city}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{dep}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                {selectedPostal && (
                  <div className="field-hint" style={{ marginTop: 6 }}>
                    {(selectedPostal.postalCode || selectedPostal.PostalCode)} - {(selectedPostal.city || selectedPostal.City)} · {(selectedPostal.departmentName || selectedPostal.DepartmentName)}
                  </div>
                )}
              </Field>
              <Field label={t.surface}><input className="field-input" inputMode="decimal" value={surface} onChange={(e) => setSurface(e.target.value)} /></Field>
              <Field label={t.coverage}>
                <select className="field-select" value={coverage} onChange={(e) => setCoverage(e.target.value)}>
                  {productCoverage.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
              <Field label={t.deductible}>
                <select className="field-select" value={deductible} onChange={(e) => setDeductible(e.target.value)}>
                  <option value="low">{t.low}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="high">{t.high}</option>
                </select>
              </Field>
            </div>
            <div className="field-hint" style={{ marginTop: 6 }}>
              {t.homeHiddenAssumptions}
            </div>
          </>
        ) : (
          <>
            {product === 'moto' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label={t.category}>
                  <select className="field-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="moped_50">50 cm³</option>
                    <option value="scooter_125">Scooter 125</option>
                    <option value="motorcycle">Moto</option>
                    <option value="maxi_scooter">Maxi-scooter</option>
                    <option value="quad">Quad</option>
                  </select>
                </Field>
                <Field label={t.engine}><input className="field-input" inputMode="numeric" value={engineCc} onChange={(e) => setEngineCc(e.target.value)} /></Field>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label={t.vehicleValue}><input className="field-input" inputMode="decimal" value={vehicleValue} onChange={(e) => setVehicleValue(e.target.value)} /></Field>
              <Field label={t.vehicleAge}><input className="field-input" inputMode="numeric" value={vehicleAge} onChange={(e) => setVehicleAge(e.target.value)} /></Field>
              {product === 'auto' && <Field label={t.fiscalHp}><input className="field-input" inputMode="decimal" value={fiscalHp} onChange={(e) => setFiscalHp(e.target.value)} /></Field>}
              <Field label={t.usage}>
                <select className="field-select" value={usage} onChange={(e) => setUsage(e.target.value)}>
                  <option value="private">{t.private}</option>
                  <option value="commute">{t.commute}</option>
                  <option value="professional">{t.professional}</option>
                </select>
              </Field>
              <Field label={t.mileage}><input className="field-input" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} /></Field>
              <Field label={t.parking}>
                <select className="field-select" value={parking} onChange={(e) => setParking(e.target.value)}>
                  <option value="street">{t.street}</option>
                  <option value="private_parking">{t.privateParking}</option>
                  <option value="closed_garage">{t.garage}</option>
                </select>
              </Field>
              <Field label={t.driverAge}><input className="field-input" inputMode="numeric" value={driverAge} onChange={(e) => setDriverAge(e.target.value)} /></Field>
              <Field label={t.licenseYears}><input className="field-input" inputMode="numeric" value={licenseYears} onChange={(e) => setLicenseYears(e.target.value)} /></Field>
              <Field label={t.crm}><input className="field-input" inputMode="decimal" value={crm} onChange={(e) => setCrm(e.target.value)} /></Field>
              <Field label={t.claims}><input className="field-input" inputMode="numeric" value={claims} onChange={(e) => setClaims(e.target.value)} /></Field>
            </div>

            {product === 'moto' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label={t.antiTheft}>
                  <select className="field-select" value={antiTheft} onChange={(e) => setAntiTheft(e.target.value)}>
                    <option value="none">{t.noAntiTheft}</option>
                    <option value="approved_lock">{t.approvedLock}</option>
                    <option value="alarm_tracker">{t.tracker}</option>
                  </select>
                </Field>
                <Field label={t.ct}>
                  <select className="field-select" value={technicalInspectionStatus} onChange={(e) => setTechnicalInspectionStatus(e.target.value)}>
                    <option value="not_required_yet">{t.ctNotRequired}</option>
                    <option value="valid">{t.ctValid}</option>
                    <option value="overdue">{t.ctOverdue}</option>
                    <option value="unknown">{t.ctUnknown}</option>
                  </select>
                </Field>
                <Field label={t.equipment}><input className="field-input" inputMode="decimal" value={equipmentValue} onChange={(e) => setEquipmentValue(e.target.value)} /></Field>
                <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28 }}>
                  <input type="checkbox" checked={crmApplicable} onChange={(e) => setCrmApplicable(e.target.checked)} />
                  {t.crmApplicable}
                </label>
              </div>
            )}
          </>
        )}

        <div className="sim-divider" style={{ margin: '18px 0 14px' }} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary-custom" onClick={simulate} disabled={loading}>
            {loading ? (lang === 'fr' ? 'Calcul...' : 'Calculating...') : t.calc}
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>{t.reset}</button>
        </div>
      </div>

      <div className="sim-result-card">
        <div className="section-header">{t.results}</div>
        {!result && !loading && !err && (
          <div className="sim-result-empty">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" /></svg>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{t.results}</div>
            <div style={{ fontSize: 13 }}>{t.empty}</div>
          </div>
        )}
        {err && (
          <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 14 }}>
            {err}
          </div>
        )}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <Kpi label={t.monthly} value={eur(r.monthlyPremium ?? r.MonthlyPremium, lang)} color="success" />
              <Kpi label={t.annual} value={eur(r.annualPremium ?? r.AnnualPremium, lang)} color="accent" />
              <Kpi label={t.legalMin} value={eur(r.legalMinimumAnnualPremium ?? r.LegalMinimumAnnualPremium, lang)} unit="€ / an" color="indigo" />
              <Kpi label={t.crmUsed} value={fmt(r.crmUsed ?? r.CrmUsed, lang, 3)} color="warning" />
            </div>

            <div className="page-panel-card" style={{ padding: 14 }}>
              <div className="kpi-label">{t.mandatory}</div>
              <div style={{ fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                {(r.isMandatoryInsurance ?? r.IsMandatoryInsurance) ? t.yes : t.no}
              </div>
              <div className="field-hint" style={{ marginTop: 4 }}>{r.mandatoryCoverageLabel ?? r.MandatoryCoverageLabel}</div>
            </div>

            <div className="section-header" style={{ marginTop: 4 }}>{t.breakdown}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="breakdown-row"><div className="breakdown-name">{t.addons}</div><div className="breakdown-val">{eur(r.coverageAddonsAnnualPremium ?? r.CoverageAddonsAnnualPremium, lang)}</div></div>
              <div className="breakdown-row"><div className="breakdown-name">{t.riskAdj}</div><div className="breakdown-val">{eur(r.riskAdjustmentAmount ?? r.RiskAdjustmentAmount, lang)}</div></div>
              <div className="breakdown-row"><div className="breakdown-name">{t.deductibleDiscount}</div><div className="breakdown-val">-{eur(r.deductibleDiscountAmount ?? r.DeductibleDiscountAmount, lang)}</div></div>
              {breakdown.map((line, idx) => (
                <div key={`${line.label || line.Label}-${idx}`} className="breakdown-row">
                  <div className="breakdown-name">{line.label || line.Label}</div>
                  <div className="breakdown-val">{eur(line.amount ?? line.Amount, lang)}</div>
                </div>
              ))}
            </div>

            {warnings.length > 0 && (
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,.10)', border: '1px solid rgba(245,158,11,.25)' }}>
                <div className="kpi-label">{t.warnings}</div>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                  {warnings.map((w) => <li key={w} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{w}</li>)}
                </ul>
              </div>
            )}

            <div className="field-hint" style={{ lineHeight: 1.5 }}>
              <strong>{t.assumptions}.</strong> {assumptions.join(' ')} {t.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
