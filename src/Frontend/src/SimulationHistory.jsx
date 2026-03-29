import React, { useEffect, useState, useCallback } from 'react'

const T = {
  fr: {
    title: 'Historique des simulations',
    empty: 'Aucune simulation trouvée.',
    emptyHint: 'Lancez une simulation de paie pour la retrouver ici.',
    loading: 'Chargement…',
    error: 'Impossible de charger l\'historique.',
    colDate: 'Date',
    colStatut: 'Statut',
    colBrut: 'Brut mensuel',
    colNet: 'Net mensuel',
    colRetenue: 'Retenue',
    colParts: 'Parts',
    deleteBtn: 'Supprimer',
    deleteConfirm: 'Supprimer cette simulation ?',
    statuts: { 'non-cadre': 'Non-cadre', 'cadre': 'Cadre', 'freelance': 'Freelance', 'portage': 'Portage', '': '—' },
    loginRequired: 'Connectez-vous pour voir votre historique.',
  },
  en: {
    title: 'Simulation history',
    empty: 'No simulations found.',
    emptyHint: 'Run a payroll simulation to see it here.',
    loading: 'Loading…',
    error: 'Could not load history.',
    colDate: 'Date',
    colStatut: 'Status',
    colBrut: 'Monthly gross',
    colNet: 'Monthly net',
    colRetenue: 'Withholding',
    colParts: 'Parts',
    deleteBtn: 'Delete',
    deleteConfirm: 'Delete this simulation?',
    statuts: { 'non-cadre': 'Non-exec', 'cadre': 'Exec', 'freelance': 'Freelance', 'portage': 'Portage', '': '—' },
    loginRequired: 'Sign in to view your history.',
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

export default function SimulationHistory({ token, lang }) {
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
      .then(data => { setItems(data); setLoading(false) })
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
      <div className="sim-result-empty" style={{ marginTop: 60 }}>
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 6v6m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{tr.loginRequired}</div>
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
      <div className="sim-result-empty" style={{ marginTop: 60 }}>
        <svg viewBox="0 0 24 24" fill="none"><path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M13 21l2-2m0 0 4-4m-4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{tr.empty}</div>
        <div style={{ fontSize: 14 }}>{tr.emptyHint}</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{tr.title}</h2>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{items.length} simulation{items.length > 1 ? 's' : ''}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(sim => {
          const { req, res } = parsePayload(sim.payload)
          const statut = req.Statut ?? req.statut ?? ''
          const brut = req.Brut ?? req.brut ?? null
          const parts = req.Parts ?? req.parts ?? null
          const net = res.NetMonthly ?? res.netMonthly ?? res.Net ?? res.net ?? null
          const retenuePct = res.RetenuePct ?? res.retenuePct ?? null
          const retenueAmt = res.RetenueAmount ?? res.retenueAmount ?? null

          return (
            <div key={sim.id} className="history-card">
              {/* Left: date + statut badge */}
              <div className="history-card-left">
                <div className="history-date">{fmtDate(sim.createdAt)}</div>
                <span className={`history-badge history-badge--${statut || 'non-cadre'}`}>
                  {tr.statuts[statut] ?? statut ?? '—'}
                </span>
              </div>

              {/* Center: key figures */}
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

              {/* Right: delete */}
              <div className="history-card-actions">
                <button
                  className="history-delete-btn"
                  onClick={() => handleDelete(sim.id)}
                  disabled={deletingId === sim.id}
                  aria-label={tr.deleteBtn}
                  title={tr.deleteBtn}
                >
                  {deletingId === sim.id
                    ? <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{animation:'spin 1s linear infinite'}}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10"/></svg>
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
