import React, { useEffect, useState, useCallback } from 'react'

const T = {
  fr: {
    title: 'Historique des simulations',
    empty: 'Aucune simulation trouvée.',
    emptyHint: 'Lancez une simulation de paie, retraite ou prêt pour la retrouver ici.',
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
    typePayroll: 'Paie',
    typeRetirement: 'Retraite',
    typeLoan: 'Prêt',
    typeOther: 'Simulation',
    deleteBtn: 'Supprimer',
    deleteConfirm: 'Supprimer cette simulation ?',
    statuts: { 'non-cadre': 'Non-cadre', 'cadre': 'Cadre', 'freelance': 'Freelance', 'portage': 'Portage', '': '—' },
    loginRequired: 'Connectez-vous pour voir votre historique.',
    loginCta: 'Se connecter',
    signupCta: 'Créer un compte',
    limitHint: 'Les 10 simulations les plus récentes sont conservées ; au-delà, les plus anciennes sont supprimées automatiquement.',
  },
  en: {
    title: 'Simulation history',
    empty: 'No simulations found.',
    emptyHint: 'Run a payroll, retirement, or loan simulation to see it here.',
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
    colLoanMonthly: 'Total monthly',
    typePayroll: 'Payroll',
    typeRetirement: 'Retirement',
    typeLoan: 'Loan',
    typeOther: 'Simulation',
    deleteBtn: 'Delete',
    deleteConfirm: 'Delete this simulation?',
    statuts: { 'non-cadre': 'Non-exec', 'cadre': 'Exec', 'freelance': 'Freelance', 'portage': 'Portage', '': '—' },
    loginRequired: 'Sign in to view your history.',
    loginCta: 'Sign in',
    signupCta: 'Create account',
    limitHint: 'Only your 10 most recent simulations are kept; older ones are removed automatically when you save a new one.',
  },
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
  return t || 'other'
}

export default function SimulationHistory({ token, lang, onRequestLogin, onRequestSignup }) {
  const tr = T[lang] || T.fr
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    fetch('/api/simulation/mine', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); setError(null) })
      .catch(() => { setError(tr.error); setLoading(false) })
  }, [token, tr.error])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm(tr.deleteConfirm)) return
    setDeletingId(id)
    await fetch(`/api/simulation/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    })
    setDeletingId(null)
    setItems(prev => prev.filter(s => s.id !== id))
  }

  if (!token) {
    return (
      <div className="page-panel">
        <div className="sim-result-empty" style={{ marginTop: 40 }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 6v6m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{tr.loginRequired}</div>
          <div className="page-panel-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button type="button" className="btn-primary-custom" onClick={() => onRequestLogin?.()}>{tr.loginCta}</button>
            <button type="button" className="btn-ghost" onClick={() => onRequestSignup?.()}>{tr.signupCta}</button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 15 }}>{tr.loading}</div>
  }

  if (error) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--danger)', fontSize: 15 }}>{error}</div>
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
            const bankK = res.BankPrincipal ?? res.bankPrincipal ?? null
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
                  {bankK != null && !isNaN(Number(bankK)) && (
                    <>
                      <div className="history-figure-sep">·</div>
                      <div className="history-figure">
                        <div className="history-figure-label">Capital</div>
                        <div className="history-figure-value">{fmt(bankK)}</div>
                      </div>
                    </>
                  )}
                  <div className="history-figure-sep">→</div>
                  <div className="history-figure">
                    <div className="history-figure-label">{tr.colLoanMonthly}</div>
                    <div className="history-figure-value history-figure-value--accent">{fmt(monthly)}</div>
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

          const label = kind === 'loan' ? tr.typeLoan : tr.typeOther
          return (
            <div key={sim.id} className="history-card">
              <div className="history-card-left">
                <div className="history-date">{fmtDate(sim.createdAt)}</div>
                <span className={`history-badge history-badge--${kind === 'loan' ? 'loan' : 'other'}`}>{label}</span>
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
