import React, { useState } from 'react'

/* ─── Translations ─────────────────────────────────────────── */
const T = {
  fr: {
    title: 'Simulation Retraite',
    subtitle: 'Estimez votre pension de retraite 2026',
    anneeNaissance: 'Année de naissance',
    anneeNaissancePlaceholder: 'ex : 1968',
    ageDepart: 'Âge de départ à la retraite',
    sam: 'Salaire annuel moyen (SAM)',
    samPlaceholder: 'ex : 40 000',
    samHint: 'Moyenne de vos 25 meilleures années brutes',
    trimValides: 'Trimestres validés',
    trimValidesPl: 'ex : 162',
    trimRequis: 'Trimestres requis',
    trimRequisHint: 'Pré-rempli selon votre génération',
    points: 'Points Agirc-Arrco',
    pointsPlaceholder: 'ex : 8 000',
    pointsHint: 'Relevé de points disponible sur agirc-arrco.fr',
    revenusActuels: 'Revenus annuels actuels',
    revenusActuelsPlaceholder: 'ex : 48 000',
    revenusActuelsHint: 'Pour calculer le taux de remplacement',
    calculate: 'Calculer',
    reset: 'Réinitialiser',
    resultsTitle: 'Résultats',
    empty: 'Remplissez le formulaire et cliquez sur Calculer.',
    pensionMensuelle: 'Pension mensuelle nette',
    pensionAnnuelle: 'Pension annuelle nette',
    pensionBrute: 'Pension brute totale',
    pensionBase: 'Pension de base CNAV',
    pensionCompl: 'Pension complémentaire Agirc-Arrco',
    tauxRemplacement: 'Taux de remplacement',
    decote: 'Décote',
    surcote: 'Surcote',
    trimManquants: 'Trimestres manquants',
    trimSummary: 'Situation trimestres',
    valeurPoint: 'Valeur du point',
    errAnnee: 'Entrez une année de naissance valide (1940–2000)',
    errSam: 'Entrez un salaire annuel moyen valide (> 0)',
    errTrim: 'Entrez un nombre de trimestres valide (1–250)',
    errPoints: 'Entrez un nombre de points valide (≥ 0)',
    warningRegime: 'Seul le régime général est calculé en V1. Les régimes spéciaux (fonctionnaire, libéral) sont indicatifs.',
  },
  en: {
    title: 'Retirement Simulator',
    subtitle: 'Estimate your 2026 retirement pension',
    anneeNaissance: 'Year of birth',
    anneeNaissancePlaceholder: 'e.g. 1968',
    ageDepart: 'Retirement age',
    sam: 'Average annual salary (SAM)',
    samPlaceholder: 'e.g. 40 000',
    samHint: 'Average of your best 25 gross salary years',
    trimValides: 'Validated quarters',
    trimValidesPl: 'e.g. 162',
    trimRequis: 'Required quarters',
    trimRequisHint: 'Pre-filled based on your generation',
    points: 'Agirc-Arrco points',
    pointsPlaceholder: 'e.g. 8 000',
    pointsHint: 'Point balance available on agirc-arrco.fr',
    revenusActuels: 'Current annual income',
    revenusActuelsPlaceholder: 'e.g. 48 000',
    revenusActuelsHint: 'To compute replacement rate',
    calculate: 'Calculate',
    reset: 'Reset',
    resultsTitle: 'Results',
    empty: 'Fill in the form and click Calculate.',
    pensionMensuelle: 'Monthly net pension',
    pensionAnnuelle: 'Annual net pension',
    pensionBrute: 'Total gross pension',
    pensionBase: 'CNAV base pension',
    pensionCompl: 'Agirc-Arrco supplementary',
    tauxRemplacement: 'Replacement rate',
    decote: 'Reduction',
    surcote: 'Bonus',
    trimManquants: 'Missing quarters',
    trimSummary: 'Quarters status',
    valeurPoint: 'Point value',
    errAnnee: 'Enter a valid birth year (1940–2000)',
    errSam: 'Enter a valid average salary (> 0)',
    errTrim: 'Enter a valid quarter count (1–250)',
    errPoints: 'Enter a valid point count (≥ 0)',
    warningRegime: 'Only the general regime is calculated in V1. Special regimes (civil servant, liberal) are indicative only.',
  }
}

/* ─── Helpers ──────────────────────────────────────────────── */
const fmt = (v, lang) =>
  typeof v === 'number'
    ? v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

const fmtPct = (v, lang) =>
  typeof v === 'number'
    ? v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %'
    : '—'

function getTrimestresRequis(annee) {
  if (annee <= 1952) return 164
  if (annee <= 1954) return 165
  if (annee <= 1956) return 166
  if (annee <= 1958) return 167
  if (annee <= 1960) return 168
  if (annee <= 1962) return 169
  return 170
}

/* ─── KPI Card ─────────────────────────────────────────────── */
function KpiCard({ label, value, unit, color, accent }) {
  return (
    <div className={`kpi-card ${color || ''}`} style={accent ? { borderTop: `3px solid ${accent}` } : {}}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {unit && <div className="kpi-unit">{unit}</div>}
    </div>
  )
}

/* ─── Progress bar ─────────────────────────────────────────── */
function TrimProgress({ valides, requis }) {
  const pct = Math.min(100, Math.round((valides / requis) * 100))
  const color = pct >= 100 ? 'var(--success)' : pct >= 80 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
        <span>{valides} / {requis}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--surface-alt)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 8, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

/* ─── Main Component ───────────────────────────────────────── */
export default function RetirementSimulator({ lang = 'fr' }) {
  const t = T[lang] || T.fr

  const [anneeNaissance, setAnneeNaissance] = useState('')
  const [ageDepart, setAgeDepart] = useState('64')
  const [sam, setSam] = useState('')
  const [trimValides, setTrimValides] = useState('')
  const [trimRequis, setTrimRequis] = useState('')
  const [points, setPoints] = useState('')
  const [revenusActuels, setRevenusActuels] = useState('')
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // Auto-fill trimestres requis when birth year changes
  function handleAnneeChange(val) {
    setAnneeNaissance(val)
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1940 && n <= 2000) {
      setTrimRequis(String(getTrimestresRequis(n)))
    }
  }

  function validate() {
    const errs = {}
    const n = parseInt(anneeNaissance)
    if (isNaN(n) || n < 1940 || n > 2000) errs.annee = t.errAnnee
    const s = parseFloat(sam.replace(/\s/g, '').replace(',', '.'))
    if (isNaN(s) || s <= 0) errs.sam = t.errSam
    const tv = parseInt(trimValides)
    if (isNaN(tv) || tv < 1 || tv > 250) errs.trimValides = t.errTrim
    const pts = parseFloat(points.replace(/\s/g, '').replace(',', '.'))
    if (isNaN(pts) || pts < 0) errs.points = t.errPoints
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function simulate() {
    if (!validate()) return
    setLoading(true)
    setApiError('')
    try {
      const tok = localStorage.getItem('msim_token')
      const payload = {
        anneeNaissance: parseInt(anneeNaissance),
        ageDepart: parseInt(ageDepart) || 64,
        salaireAnnuelMoyen: parseFloat(sam.replace(/\s/g, '').replace(',', '.')),
        trimestresValides: parseInt(trimValides),
        trimestresRequis: parseInt(trimRequis) || 170,
        pointsComplementaires: parseFloat(points.replace(/\s/g, '').replace(',', '.')) || 0,
        regime: 'general',
        revenusAnnuelsActuels: parseFloat((revenusActuels || '0').replace(/\s/g, '').replace(',', '.')) || 0,
      }
      const res = await fetch('/api/retirement/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tok ? { Authorization: 'Bearer ' + tok } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setApiError(e.message || 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setAnneeNaissance('')
    setAgeDepart('64')
    setSam('')
    setTrimValides('')
    setTrimRequis('')
    setPoints('')
    setRevenusActuels('')
    setResult(null)
    setErrors({})
    setApiError('')
  }

  const trimVal = parseInt(trimValides) || 0
  const trimReq = parseInt(trimRequis) || 170

  return (
    <div className="sim-shell">
      {/* ── Inputs ── */}
      <div className="sim-col sim-inputs">
        <div className="sim-section-title">{lang === 'fr' ? 'Paramètres' : 'Parameters'}</div>

        {/* Birth year */}
        <div className="field-group">
          <label className="field-label">{t.anneeNaissance}</label>
          <input
            className="field-input"
            inputMode="numeric"
            placeholder={t.anneeNaissancePlaceholder}
            value={anneeNaissance}
            onChange={e => handleAnneeChange(e.target.value)}
          />
          {errors.annee && <div className="field-error">{errors.annee}</div>}
        </div>

        {/* Retirement age */}
        <div className="field-group">
          <label className="field-label">{t.ageDepart}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[62, 63, 64, 65, 67].map(a => (
              <button
                key={a}
                type="button"
                className={`parts-chip${parseInt(ageDepart) === a ? ' active' : ''}`}
                onClick={() => setAgeDepart(String(a))}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* SAM */}
        <div className="field-group">
          <label className="field-label">{t.sam}</label>
          <div style={{ position: 'relative' }}>
            <input
              className="field-input"
              inputMode="decimal"
              placeholder={t.samPlaceholder}
              value={sam}
              onChange={e => setSam(e.target.value)}
              style={{ paddingRight: 36 }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>€</span>
          </div>
          <div className="field-hint">{t.samHint}</div>
          {errors.sam && <div className="field-error">{errors.sam}</div>}
        </div>

        {/* Trimestres */}
        <div className="field-group">
          <label className="field-label">{t.trimValides}</label>
          <input
            className="field-input"
            inputMode="numeric"
            placeholder={t.trimValidesPl}
            value={trimValides}
            onChange={e => setTrimValides(e.target.value)}
          />
          {trimVal > 0 && <TrimProgress valides={trimVal} requis={trimReq} />}
          {errors.trimValides && <div className="field-error">{errors.trimValides}</div>}
        </div>

        <div className="field-group">
          <label className="field-label">{t.trimRequis}</label>
          <input
            className="field-input"
            inputMode="numeric"
            value={trimRequis}
            onChange={e => setTrimRequis(e.target.value)}
          />
          <div className="field-hint">{t.trimRequisHint}</div>
        </div>

        {/* Points complémentaires */}
        <div className="field-group">
          <label className="field-label">{t.points}</label>
          <input
            className="field-input"
            inputMode="decimal"
            placeholder={t.pointsPlaceholder}
            value={points}
            onChange={e => setPoints(e.target.value)}
          />
          <div className="field-hint">{t.pointsHint}</div>
          {errors.points && <div className="field-error">{errors.points}</div>}
        </div>

        {/* Revenus actuels (optionnel) */}
        <div className="field-group">
          <label className="field-label">{t.revenusActuels} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12 }}>(optionnel)</span></label>
          <div style={{ position: 'relative' }}>
            <input
              className="field-input"
              inputMode="decimal"
              placeholder={t.revenusActuelsPlaceholder}
              value={revenusActuels}
              onChange={e => setRevenusActuels(e.target.value)}
              style={{ paddingRight: 36 }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>€</span>
          </div>
          <div className="field-hint">{t.revenusActuelsHint}</div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary-custom" onClick={simulate} disabled={loading} style={{ flex: '1 1 160px', justifyContent: 'center' }}>
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, marginRight: 8, display: 'inline-block', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{lang === 'fr' ? 'Calcul…' : 'Calculating…'}</>
              : t.calculate}
          </button>
          <button type="button" className="btn-ghost" onClick={reset} style={{ flex: '0 0 auto' }}>
            {t.reset}
          </button>
        </div>

        {apiError && <div className="field-error" style={{ marginTop: 10 }}>{apiError}</div>}
      </div>

      {/* ── Results ── */}
      <div className="sim-col sim-results">
        <div className="sim-section-title">{t.resultsTitle}</div>

        {!result && !loading && (
          <div className="sim-empty">{t.empty}</div>
        )}

        {result && (
          <>
            {/* Main KPI cards */}
            <div className="kpi-grid">
              <KpiCard
                label={t.pensionMensuelle}
                value={`${fmt(result.pensionNetteMensuelle, lang)} €`}
                color="kpi-primary"
                accent="var(--accent)"
              />
              <KpiCard
                label={t.pensionAnnuelle}
                value={`${fmt(result.pensionNetteAnnuelle, lang)} €`}
                color="kpi-secondary"
              />
              {result.tauxRemplacement > 0 && (
                <KpiCard
                  label={t.tauxRemplacement}
                  value={fmtPct(result.tauxRemplacement, lang)}
                  color="kpi-tertiary"
                />
              )}
            </div>

            {/* Breakdown */}
            <div className="results-breakdown">
              <div className="breakdown-title">{lang === 'fr' ? 'Décomposition' : 'Breakdown'}</div>
              <div className="results-row">
                <span className="results-row-label">{t.pensionBase}</span>
                <span className="results-row-value">{fmt(result.pensionBaseAnnuelle, lang)} €/an</span>
              </div>
              <div className="results-row">
                <span className="results-row-label">{t.pensionCompl}</span>
                <span className="results-row-value accent">{fmt(result.pensionComplementaireAnnuelle, lang)} €/an</span>
              </div>
              <div className="results-row results-row--total">
                <span className="results-row-label">{t.pensionBrute}</span>
                <span className="results-row-value">{fmt(result.pensionBruteTotaleAnnuelle, lang)} €/an</span>
              </div>
            </div>

            {/* Trimestres + décote */}
            <div className="results-breakdown" style={{ marginTop: 12 }}>
              <div className="breakdown-title">{t.trimSummary}</div>
              {trimVal > 0 && <TrimProgress valides={result.trimestresValides} requis={result.trimestresRequis} />}
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.trimestresManquants > 0 && (
                  <div className="results-row">
                    <span className="results-row-label">{t.trimManquants}</span>
                    <span className="results-row-value" style={{ color: 'var(--danger)' }}>{result.trimestresManquants}</span>
                  </div>
                )}
                {result.decotePct > 0 && (
                  <div className="results-row">
                    <span className="results-row-label">{t.decote}</span>
                    <span className="results-row-value" style={{ color: 'var(--danger)' }}>{fmtPct(result.decotePct, lang)}</span>
                  </div>
                )}
                {result.surcotePct > 0 && (
                  <div className="results-row">
                    <span className="results-row-label">{t.surcote}</span>
                    <span className="results-row-value" style={{ color: 'var(--success)' }}>+{fmtPct(result.surcotePct, lang)}</span>
                  </div>
                )}
                <div className="results-row">
                  <span className="results-row-label">{t.valeurPoint}</span>
                  <span className="results-row-value">{fmt(result.valeurPoint, lang)} €</span>
                </div>
              </div>
            </div>

            {/* Warning for non-general regimes */}
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--warning-bg, #fef9c3)', borderRadius: 8, fontSize: 12, color: 'var(--warning-text, #92400e)', lineHeight: 1.5 }}>
              ⚠️ {t.warningRegime}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
