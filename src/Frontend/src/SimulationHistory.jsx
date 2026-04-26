import React, { useEffect, useState, useCallback } from 'react'

const T = {
  fr: {
    title: 'Historique des simulations',
    empty: 'Aucune simulation trouvée.',
    emptyHint: 'Lancez une simulation de paie, retraite, prêt, épargne ou assurance pour la retrouver ici.',
    loading: 'Chargement…',
    error: 'Impossible de charger l\'historique.',
    colDate: 'Date',
    colStatut: 'Statut',
    colBrut: 'Brut mensuel',
    colNet: 'Net mensuel',
    colRetenue: 'Retenue',
    colParts: 'Parts',
    colBirthYear: 'Année de naissance',
    colSam: 'SAM',
    colPensionNet: 'Pension nette / mois',
    colPensionGross: 'Brut annuel',
    colTaux: 'Taux rempl.',
    colLoanCat: 'Type prêt',
    colLoanRate: 'Taux nominal',
    colLoanMonthly: 'Mensualité totale',
    colLoanTotalRepaid: 'Total remb. banque (estim.)',
    colLoanTotalRepaidHint: 'Capital + intérêts + assurance sur la durée',
    colSavingsTarget: 'Objectif',
    colSavingsMonthly: 'Épargne / mois requise',
    colHorizonMonths: 'Mois',
    colInsuranceProduct: 'Produit',
    colInsuranceMonthly: 'Prime / mois',
    colInsuranceAnnual: 'Prime / an',
    colInsuranceCoverage: 'Formule',
    typePayroll: 'Paie',
    typeRetirement: 'Retraite',
    typeLoan: 'Prêt',
    typeSavings: 'Épargne',
    typeInsurance: 'Assurance',
    typeOther: 'Simulation',
    deleteBtn: 'Supprimer',
    deleteConfirm: 'Supprimer cette simulation ?',
    statuts: { 'non-cadre': 'Non-cadre', 'cadre': 'Cadre', 'freelance': 'Freelance', 'portage': 'Portage', '': '—' },
    notSigned: 'Vous n’êtes pas connecté.',
    loginCta: 'Se connecter',
    signupCta: 'Créer un compte',
    limitHint: 'Les 10 simulations les plus récentes sont conservées ; au-delà, les plus anciennes sont supprimées automatiquement.',
  },
  en: {
    title: 'Simulation history',
    empty: 'No simulations found.',
    emptyHint: 'Run a payroll, retirement, loan, savings, or insurance simulation to see it here.',
    loading: 'Loading…',
    error: 'Could not load history.',
    colDate: 'Date',
    colStatut: 'Status',
    colBrut: 'Monthly gross',
    colNet: 'Monthly net',
    colRetenue: 'Withholding',
    colParts: 'Parts',
    colBirthYear: 'Birth year',
    colSam: 'Avg. salary (SAM)',
    colPensionNet: 'Net pension / mo.',
    colPensionGross: 'Gross annual',
    colTaux: 'Repl. rate',
    colLoanCat: 'Loan type',
    colLoanRate: 'Nominal rate',
    colLoanMonthly: 'Total monthly',
    colLoanTotalRepaid: 'Total repaid, bank (est.)',
    colLoanTotalRepaidHint: 'Principal + interest + insurance over term',
    colSavingsTarget: 'Target',
    colSavingsMonthly: 'Required monthly',
    colHorizonMonths: 'Months',
    colInsuranceProduct: 'Product',
    colInsuranceMonthly: 'Premium / mo.',
    colInsuranceAnnual: 'Premium / yr',
    colInsuranceCoverage: 'Coverage',
    typePayroll: 'Payroll',
    typeRetirement: 'Retirement',
    typeLoan: 'Loan',
    typeSavings: 'Savings',
    typeInsurance: 'Insurance',
    typeOther: 'Simulation',
    deleteBtn: 'Delete',
    deleteConfirm: 'Delete this simulation?',
    statuts: { 'non-cadre': 'Non-exec', 'cadre': 'Exec', 'freelance': 'Freelance', 'portage': 'Portage', '': '—' },
    notSigned: 'You are not signed in.',
    loginCta: 'Sign in',
    signupCta: 'Create account',
    limitHint: 'Only your 10 most recent simulations are kept; older ones are removed automatically when you save a new one.',
  },
}

function normalizeToken(t) {
  if (t == null) return null
  const s = String(t).trim()
  return s || null
}

function fmt(n) {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function fmtPct(n) {
  if (!n || n === 0) return '—'
  return `${Number(n).toFixed(1)} %`
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function parsePayload(payloadStr) {
  try {
    const p = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr
    const req = p?.Request ?? p?.request ?? {}
    const res = p?.Response ?? p?.response ?? {}
    return { req, res }
  } catch {
    return { req: {}, res: {} }
  }
}

function simTypeOf(sim) {
  const t = (sim.type ?? sim.Type ?? '').toString().toLowerCase()
  if (t === 'retirement') return 'retirement'
  if (t === 'payroll') return 'payroll'
  if (t === 'loan' || t === 'loans') return 'loan'
  if (t === 'savings') return 'savings'
  if (t === 'insurance') return 'insurance'
  return t || 'other'
}

export default function SimulationHistory({ token, lang, onRequestLogin, onRequestSignup }) {
  const tr = T[lang] || T.fr
  const effectiveToken = normalizeToken(token)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!!effectiveToken)
  const [error, setError] = useState(null)
  const [authRequired, setAuthRequired] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!effectiveToken) setAuthRequired(false)
  }, [effectiveToken])

  const load = useCallback(async () => {
    if (!effectiveToken) {
      setItems([])
      setLoading(false)
      setError(null)
      return
    }
    setAuthRequired(false)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/simulation/mine', {
        headers: { Authorization: 'Bearer ' + effectiveToken },
      })
      if (res.status === 401 || res.status === 403) {
        setItems([])
        setAuthRequired(true)
        return
      }
      if (!res.ok) {
        setError(tr.error)
        setItems([])
        return
      }
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setError(tr.error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [effectiveToken, tr.error])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm(tr.deleteConfirm)) return
    setDeletingId(id)
    await fetch(`/api/simulation/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + effectiveToken },
    })
    setDeletingId(null)
    setItems(prev => prev.filter(s => s.id !== id))
  }

  /* Même principe que Mon compte : pas connecté → carte + 2 boutons */
  if (!effectiveToken || authRequired) {
    return (
      <div className="page-panel">
        <div className="page-panel-card">
          <h1 className="page-panel-title">{tr.title}</h1>
          <p className="page-panel-desc">{tr.notSigned}</p>
          <div className="page-panel-actions">
            <button type="button" className="btn-primary-custom" onClick={() => onRequestLogin?.()}>
              {tr.loginCta}
            </button>
            <button type="button" className="btn-ghost" onClick={() => onRequestSignup?.()}>
              {tr.signupCta}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-panel">
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>{tr.loading}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-panel">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--danger)', fontSize: 15 }}>{error}</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-panel">
        <div className="sim-result-empty" style={{ marginTop: 60 }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M13 21l2-2m0 0 4-4m-4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{tr.empty}</div>
          <div style={{ fontSize: 14 }}>{tr.emptyHint}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-panel" style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{tr.title}</h2>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{items.length} / 10</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 18px', lineHeight: 1.5 }}>{tr.limitHint}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(sim => {
          const kind = simTypeOf(sim)
          const { req, res } = parsePayload(sim.payload)

          if (kind === 'retirement') {
            const birth = req.AnneeNaissance ?? req.anneeNaissance ?? null
            const sam = req.SalaireAnnuelMoyen ?? req.salaireAnnuelMoyen ?? null
            const netM = res.PensionNetteMensuelle ?? res.pensionNetteMensuelle ?? null
            const grossA = res.PensionBruteTotaleAnnuelle ?? res.pensionBruteTotaleAnnuelle ?? null
            const taux = res.TauxRemplacement ?? res.tauxRemplacement ?? null

            return (
              <div key={sim.id} className="history-card">
                <div className="history-card-left">
                  <div className="history-date">{fmtDate(sim.createdAt)}</div>
                  <span className="history-badge history-badge--retirement">{tr.typeRetirement}</span>
                </div>
                <div className="history-card-figures">
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colBirthYear}</div>
                    <div className="history-figure-value">{birth ?? '—'}</div>
                  </div>
                  <div className="history-figure-sep">·</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colSam}</div>
                    <div className="history-figure-value">{fmt(sam)}</div>
                  </div>
                  <div className="history-figure-sep">→</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colPensionNet}</div>
                    <div className="history-figure-value history-figure-value--accent">{fmt(netM)}</div>
                  </div>
                  {grossA != null && !isNaN(Number(grossA)) && (
                    <>
                      <div className="history-figure-sep">·</div>
                      <div className="history-figure">
                        <div className="history-figure-label">{tr.colPensionGross}</div>
                        <div className="history-figure-value">{fmt(grossA)}</div>
                      </div>
                    </>
                  )}
                  {taux > 0 && (
                    <>
                      <div className="history-figure-sep">·</div>
                      <div className="history-figure">
                        <div className="history-figure-label">{tr.colTaux}</div>
                        <div className="history-figure-value">{fmtPct(taux)}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="history-card-actions">
                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={() => handleDelete(sim.id)}
                    disabled={deletingId === sim.id}
                    aria-label={tr.deleteBtn}
                    title={tr.deleteBtn}
                  >
                    {deletingId === sim.id
                      ? <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </button>
                </div>
              </div>
            )
          }

          if (kind === 'loan') {
            const cat = (req.Category ?? req.category ?? '').toString()
            const monthly = res.MonthlyTotalSteadyState ?? res.monthlyTotalSteadyState ?? null
            const nominal = req.NominalRateAnnualPercent ?? req.nominalRateAnnualPercent ?? null
            const bankK = res.BankPrincipal ?? res.bankPrincipal ?? null
            const ti = res.TotalInterestBank ?? res.totalInterestBank ?? null
            const tins = res.TotalInsurance ?? res.totalInsurance ?? null
            let totalRepaid = null
            if (bankK != null && ti != null && tins != null && !isNaN(Number(bankK)) && !isNaN(Number(ti)) && !isNaN(Number(tins))) {
              totalRepaid = Number(bankK) + Number(ti) + Number(tins)
            }
            return (
              <div key={sim.id} className="history-card">
                <div className="history-card-left">
                  <div className="history-date">{fmtDate(sim.createdAt)}</div>
                  <span className="history-badge history-badge--loan">{tr.typeLoan}</span>
                </div>
                <div className="history-card-figures">
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colLoanCat}</div>
                    <div className="history-figure-value">{cat || '—'}</div>
                  </div>
                  {nominal != null && nominal !== '' && !isNaN(Number(nominal)) && (
                    <>
                      <div className="history-figure-sep">·</div>
                      <div className="history-figure">
                        <div className="history-figure-label">{tr.colLoanRate}</div>
                        <div className="history-figure-value">{fmtPct(Number(nominal))}</div>
                      </div>
                    </>
                  )}
                  <div className="history-figure-sep">→</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colLoanMonthly}</div>
                    <div className="history-figure-value history-figure-value--accent">{fmt(monthly)}</div>
                  </div>
                  {totalRepaid != null && (
                    <>
                      <div className="history-figure-sep">·</div>
                      <div className="history-figure" title={tr.colLoanTotalRepaidHint}>
                        <div className="history-figure-label">{tr.colLoanTotalRepaid}</div>
                        <div className="history-figure-value">{fmt(totalRepaid)}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="history-card-actions">
                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={() => handleDelete(sim.id)}
                    disabled={deletingId === sim.id}
                    aria-label={tr.deleteBtn}
                    title={tr.deleteBtn}
                  >
                    {deletingId === sim.id
                      ? <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </button>
                </div>
              </div>
            )
          }

          if (kind === 'savings') {
            const obj = req.ObjectiveEuros ?? req.objectiveEuros ?? null
            const reqM = res.RequiredMonthlyEuros ?? res.requiredMonthlyEuros ?? null
            const months = req.HorizonMonths ?? req.horizonMonths ?? null
            return (
              <div key={sim.id} className="history-card">
                <div className="history-card-left">
                  <div className="history-date">{fmtDate(sim.createdAt)}</div>
                  <span className="history-badge history-badge--savings">{tr.typeSavings}</span>
                </div>
                <div className="history-card-figures">
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colSavingsTarget}</div>
                    <div className="history-figure-value">{fmt(obj)}</div>
                  </div>
                  {months != null && !isNaN(Number(months)) && (
                    <>
                      <div className="history-figure-sep">·</div>
                      <div className="history-figure">
                        <div className="history-figure-label">{tr.colHorizonMonths}</div>
                        <div className="history-figure-value">{months}</div>
                      </div>
                    </>
                  )}
                  <div className="history-figure-sep">→</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colSavingsMonthly}</div>
                    <div className="history-figure-value history-figure-value--accent">{fmt(reqM)}</div>
                  </div>
                </div>
                <div className="history-card-actions">
                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={() => handleDelete(sim.id)}
                    disabled={deletingId === sim.id}
                    aria-label={tr.deleteBtn}
                    title={tr.deleteBtn}
                  >
                    {deletingId === sim.id
                      ? <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </button>
                </div>
              </div>
            )
          }

          if (kind === 'payroll') {
            const statut = req.Statut ?? req.statut ?? ''
            const brut = req.Brut ?? req.brut ?? null
            const parts = req.Parts ?? req.parts ?? null
            const net = res.NetMonthly ?? res.netMonthly ?? res.Net ?? res.net ?? null
            const retenuePct = res.RetenuePct ?? res.retenuePct ?? null
            const retenueAmt = res.RetenueAmount ?? res.retenueAmount ?? null

            return (
              <div key={sim.id} className="history-card">
                <div className="history-card-left">
                  <div className="history-date">{fmtDate(sim.createdAt)}</div>
                  <span className={`history-badge history-badge--${statut || 'non-cadre'}`} title={tr.typePayroll}>
                    {tr.typePayroll} · {tr.statuts[statut] ?? statut ?? '—'}
                  </span>
                </div>
                <div className="history-card-figures">
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colBrut}</div>
                    <div className="history-figure-value">{fmt(brut)}</div>
                  </div>
                  <div className="history-figure-sep">→</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colNet}</div>
                    <div className="history-figure-value history-figure-value--accent">{fmt(net)}</div>
                  </div>
                  {retenueAmt > 0 && (
                    <>
                      <div className="history-figure-sep">·</div>
                      <div className="history-figure">
                        <div className="history-figure-label">{tr.colRetenue}</div>
                        <div className="history-figure-value history-figure-value--warn">
                          -{fmt(retenueAmt)} <span style={{ fontSize: 11, color: 'var(--muted)' }}>({fmtPct(retenuePct)})</span>
                        </div>
                      </div>
                    </>
                  )}
                  {parts > 0 && (
                    <>
                      <div className="history-figure-sep">·</div>
                      <div className="history-figure">
                        <div className="history-figure-label">{tr.colParts}</div>
                        <div className="history-figure-value">{parts}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="history-card-actions">
                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={() => handleDelete(sim.id)}
                    disabled={deletingId === sim.id}
                    aria-label={tr.deleteBtn}
                    title={tr.deleteBtn}
                  >
                    {deletingId === sim.id
                      ? <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </button>
                </div>
              </div>
            )
          }

          if (kind === 'insurance') {
            const product = res.Product ?? res.product ?? req.Product ?? req.product ?? ''
            const coverage = res.CoverageLevel ?? res.coverageLevel ?? req.CoverageLevel ?? req.coverageLevel ?? ''
            const monthly = res.MonthlyPremium ?? res.monthlyPremium ?? null
            const annual = res.AnnualPremium ?? res.annualPremium ?? null
            const productLabel = product === 'home'
              ? (lang === 'en' ? 'Home' : 'Habitation')
              : product === 'moto'
                ? (lang === 'en' ? 'Motorcycle' : 'Moto')
                : product === 'auto'
                  ? (lang === 'en' ? 'Car' : 'Auto')
                  : product || '—'

            return (
              <div key={sim.id} className="history-card">
                <div className="history-card-left">
                  <div className="history-date">{fmtDate(sim.createdAt)}</div>
                  <span className="history-badge history-badge--insurance">{tr.typeInsurance}</span>
                </div>
                <div className="history-card-figures">
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colInsuranceProduct}</div>
                    <div className="history-figure-value">{productLabel}</div>
                  </div>
                  <div className="history-figure-sep">·</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colInsuranceCoverage}</div>
                    <div className="history-figure-value">{coverage || '—'}</div>
                  </div>
                  <div className="history-figure-sep">→</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colInsuranceMonthly}</div>
                    <div className="history-figure-value history-figure-value--accent">{fmt(monthly)}</div>
                  </div>
                  <div className="history-figure-sep">·</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colInsuranceAnnual}</div>
                    <div className="history-figure-value">{fmt(annual)}</div>
                  </div>
                </div>
                <div className="history-card-actions">
                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={() => handleDelete(sim.id)}
                    disabled={deletingId === sim.id}
                    aria-label={tr.deleteBtn}
                    title={tr.deleteBtn}
                  >
                    {deletingId === sim.id
                      ? <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </button>
                </div>
              </div>
            )
          }

          const label = kind === 'loan' ? tr.typeLoan : tr.typeOther
          const badgeClass = kind === 'loan' ? 'loan' : 'other'
          return (
            <div key={sim.id} className="history-card">
              <div className="history-card-left">
                <div className="history-date">{fmtDate(sim.createdAt)}</div>
                <span className={`history-badge history-badge--${badgeClass}`}>{label}</span>
              </div>
              <div className="history-card-figures" style={{ fontSize: 13, color: 'var(--muted)' }}>
                {sim.name || kind}
              </div>
              <div className="history-card-actions">
                <button
                  type="button"
                  className="history-delete-btn"
                  onClick={() => handleDelete(sim.id)}
                  disabled={deletingId === sim.id}
                  aria-label={tr.deleteBtn}
                  title={tr.deleteBtn}
                >
                  {deletingId === sim.id
                    ? <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
