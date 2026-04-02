import React, { useState, useMemo, useRef } from 'react'

/** Aligné sur defaults API / params (affichage avant 1er calcul) */
const DEFAULT_SWITCH_PRESETS = {
  navigo_to_bike: 60,
  telecom_optimize: 30,
  meal_prep: 200,
  subscriptions_bundle: 25,
}

const T = {
  fr: {
    title: 'Objectif d’épargne & projet',
    subtitle:
      'Estimez le versement mensuel pour un montant cible (inflation simplifiée, taux nominal). Les cases « leviers » montrent des gains budgétaires indicatifs : elles réduisent l’écart à combler, pas l’effort théorique du placement.',
    objective: 'Montant cible (€)',
    months: 'Horizon (mois)',
    initial: 'Déjà épargné / placé aujourd’hui (€)',
    currentMonthly: 'Versements déjà prévus / mois (€)',
    inflation: 'Inflation annuelle (%)',
    inflationHint: 'Défaut fichier params (~1,8 %)',
    yield: 'Rendement nominal annuel (%)',
    yieldHint: 'Ex. Livret A 1,5 % au 1er fév. 2026',
    presetLivretA: 'Livret A (1,5 %)',
    presetLep: 'LEP indicatif (2,5 %)',
    presetCustom: 'Personnalisé',
    netAnnual: 'Revenu net annuel (€, optionnel)',
    netAnnualHint: 'Sert uniquement au budget vêtements indicatif (5 % du net annuel ÷ 12). Sans ce champ, la ligne « vêtements » reste vide.',
    switchesTitle: 'Leviers budgétaires (indicatifs, € / mois)',
    switchesExpl:
      'Cochez ce que vous pourriez réellement économiser chaque mois. L’« écart après leviers » = écart de base − somme des cases cochées (mis à jour tout de suite après un calcul).',
    calc: 'Calculer',
    reset: 'Réinitialiser',
    results: 'Résultats',
    empty: 'Renseignez l’objectif puis calculez.',
    staleBanner: 'Les champs ont changé depuis ce calcul. Cliquez sur « Calculer » pour actualiser objectif indexé, effort mensuel et écart de base.',
    indexed: 'Objectif indexé (inflation)',
    required: 'Effort mensuel requis',
    gap: 'Écart (effort requis − épargne actuelle)',
    gapAfter: 'Écart après leviers cochés',
    gapFormula: '= écart − somme des gains cochés',
    daily: 'Équivalent par jour (÷ 30)',
    clothing: 'Budget vêtements indicatif / mois',
    clothingEmpty: 'Renseignez le revenu net annuel à gauche pour estimer un plafond vêtements (5 % du net / an).',
    leverDetail: 'Détail des leviers',
    perMonth: '/ mois',
    secTarget: 'Objectif',
    secEachMonth: 'Versement à prévoir',
    secVersusSavings: 'Par rapport à votre épargne actuelle',
    secAfterLevers: 'Après vos leviers budgétaires',
    rowIndexed: 'Cible indexée (inflation)',
    rowRequired: 'Effort total requis',
    rowDaily: 'Équivalent par jour',
    rowYouSave: 'Moins : épargne déjà prévue / mois',
    rowGapLine: '= Écart à combler',
    rowGapSub: '(effort requis − épargne actuelle)',
    rowLeversApplied: 'Gains des leviers cochés',
    rowRemain: 'Écart restant',
    rowRemainSub: 'écart − gains leviers',
    warnings: 'Remarques',
    disclaimer:
      'Simulation simplifiée (versements en fin de mois, taux constant). Pas de conseil en investissement. Taux Livret A / LEP : réglementation en vigueur — vérifier auprès de votre établissement.',
    paramsNote: 'Sources paramètres',
    lepNote: 'LEP : sous conditions de ressources ; taux indicatif au 1er fév. 2026.',
    useFileParams: 'Utiliser inflation & rendement du fichier params (recommandé)',
    swNavigo: 'Transport : Navigo (~90 €) → vélo (~30 €) → ~60 €/mois gagnés',
    swTelecom: 'Télécom : forfait optimisé',
    swMeal: 'Alimentation : meal prep vs livraisons',
    swSubs: 'Abonnements : regroupement / arbitrage',
  },
  en: {
    title: 'Savings goal & project',
    subtitle:
      'Monthly savings for a target amount (simplified inflation, nominal yield). Lever checkboxes are indicative budget wins: they shrink the gap to close, not the theoretical savings math.',
    objective: 'Target amount (€)',
    months: 'Horizon (months)',
    initial: 'Already saved / invested today (€)',
    currentMonthly: 'Current planned monthly savings (€)',
    inflation: 'Annual inflation (%)',
    inflationHint: 'Default from params (~1.8%)',
    yield: 'Annual nominal yield (%)',
    yieldHint: 'e.g. Livret A 1.5% from 1 Feb 2026',
    presetLivretA: 'Livret A (1.5%)',
    presetLep: 'LEP indicative (2.5%)',
    presetCustom: 'Custom',
    netAnnual: 'Annual net income (€, optional)',
    netAnnualHint: 'Only used for the indicative clothing budget (5% of annual net ÷ 12). Leave empty if you do not need that line.',
    switchesTitle: 'Budget levers (indicative € / month)',
    switchesExpl:
      'Tick what you could realistically save each month. “Gap after levers” = base gap − sum of ticked gains (updates live after you have run Calculate once).',
    calc: 'Calculate',
    reset: 'Reset',
    results: 'Results',
    empty: 'Enter a target amount and calculate.',
    staleBanner: 'Inputs changed since this run. Click Calculate to refresh indexed target, required monthly, and base gap.',
    indexed: 'Inflation-indexed target',
    required: 'Required monthly contribution',
    gap: 'Gap (required − current savings)',
    gapAfter: 'Gap after selected levers',
    gapFormula: '= gap − sum of ticked gains',
    daily: 'Per-day equivalent (÷ 30)',
    clothing: 'Indicative clothing budget / month',
    clothingEmpty: 'Enter annual net income on the left to estimate a clothing envelope (5% of annual net).',
    leverDetail: 'Lever breakdown',
    perMonth: '/ month',
    secTarget: 'Target',
    secEachMonth: 'Monthly amount',
    secVersusSavings: 'Versus your current savings',
    secAfterLevers: 'After budget levers',
    rowIndexed: 'Inflation-indexed target',
    rowRequired: 'Total required effort',
    rowDaily: 'Per day (÷30)',
    rowYouSave: 'Less: planned monthly savings',
    rowGapLine: '= Gap to close',
    rowGapSub: '(required − current savings)',
    rowLeversApplied: 'Ticked levers total gain',
    rowRemain: 'Remaining gap',
    rowRemainSub: 'gap − lever gains',
    warnings: 'Notes',
    disclaimer:
      'Simplified model (end-of-month contributions, flat rate). Not investment advice. Regulated savings rates — confirm with your bank.',
    paramsNote: 'Parameter sources',
    lepNote: 'LEP: income conditions apply; indicative Feb 2026 rate.',
    useFileParams: 'Use inflation & yield from params file (recommended)',
    swNavigo: 'Transit: pass (~€90) → bike (~€30) → ~€60/mo saved',
    swTelecom: 'Phone & fiber optimized bundle',
    swMeal: 'Food: meal prep vs delivery',
    swSubs: 'Subscriptions bundle / trim',
  },
}

function switchStaticLabel(key, lang) {
  const tr = T[lang] || T.fr
  const m = {
    navigo_to_bike: tr.swNavigo,
    telecom_optimize: tr.swTelecom,
    meal_prep: tr.swMeal,
    subscriptions_bundle: tr.swSubs,
  }
  return m[key] || key
}

function parseDec(s) {
  if (s == null || s === '') return 0
  return parseFloat(String(s).replace(/\s/g, '').replace(',', '.')) || 0
}

function pctToFraction(p) {
  return parseDec(p) / 100
}

function fmtEur(n, lang) {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
}

function fmtNum(n, lang) {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Presets produit pour les 4 leviers connus — ne pas reprendre montants/libellés API (cache / vieille API / params désalignés). */
function leverMonthlyGain(id) {
  return DEFAULT_SWITCH_PRESETS[id] ?? 0
}

function buildPayload(state) {
  const {
    objective,
    months,
    initial,
    currentMonthly,
    useDefaultParams,
    inflationPct,
    yieldPct,
    netAnnual,
    swNavigo,
    swTelecom,
    swMeal,
    swSubs,
  } = state
  return {
    objectiveEuros: parseDec(objective),
    horizonMonths: parseInt(months, 10) || 24,
    initialSavingsEuros: parseDec(initial),
    currentMonthlySavingsEuros: parseDec(currentMonthly),
    inflationAnnual: useDefaultParams ? null : pctToFraction(inflationPct),
    nominalYieldAnnual: useDefaultParams ? null : pctToFraction(yieldPct),
    annualNetIncomeEuros: netAnnual.trim() ? parseDec(netAnnual) : null,
    switchNavigoToBike: swNavigo,
    switchTelecomOptimize: swTelecom,
    switchMealPrep: swMeal,
    switchSubscriptionsBundle: swSubs,
  }
}

/** Hors cases à cocher : sert à savoir si objectif / taux / épargne ont changé depuis le dernier calcul serveur */
function corePayloadSignature(state) {
  const p = buildPayload(state)
  return JSON.stringify({
    objectiveEuros: p.objectiveEuros,
    horizonMonths: p.horizonMonths,
    initialSavingsEuros: p.initialSavingsEuros,
    currentMonthlySavingsEuros: p.currentMonthlySavingsEuros,
    inflationAnnual: p.inflationAnnual,
    nominalYieldAnnual: p.nominalYieldAnnual,
    annualNetIncomeEuros: p.annualNetIncomeEuros,
  })
}

export default function SavingsSimulator({ lang = 'fr' }) {
  const t = T[lang] || T.fr
  const [objective, setObjective] = useState('12000')
  const [months, setMonths] = useState('24')
  const [initial, setInitial] = useState('0')
  const [currentMonthly, setCurrentMonthly] = useState('0')
  const [inflationPct, setInflationPct] = useState('1.8')
  const [yieldPct, setYieldPct] = useState('1.5')
  const [useDefaultParams, setUseDefaultParams] = useState(true)
  const [netAnnual, setNetAnnual] = useState('')
  const [swNavigo, setSwNavigo] = useState(false)
  const [swTelecom, setSwTelecom] = useState(false)
  const [swMeal, setSwMeal] = useState(false)
  const [swSubs, setSwSubs] = useState(false)
  const [result, setResult] = useState(null)
  const [lastCoreSig, setLastCoreSig] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const formState = useMemo(
    () => ({
      objective,
      months,
      initial,
      currentMonthly,
      useDefaultParams,
      inflationPct,
      yieldPct,
      netAnnual,
      swNavigo,
      swTelecom,
      swMeal,
      swSubs,
    }),
    [
      objective,
      months,
      initial,
      currentMonthly,
      useDefaultParams,
      inflationPct,
      yieldPct,
      netAnnual,
      swNavigo,
      swTelecom,
      swMeal,
      swSubs,
    ]
  )

  const currentCoreSig = useMemo(() => corePayloadSignature(formState), [formState])

  const inputsStale = Boolean(result && lastCoreSig && currentCoreSig !== lastCoreSig)

  const selectedLeverSum = useMemo(() => {
    if (!result) return 0
    let s = 0
    if (swNavigo) s += leverMonthlyGain('navigo_to_bike')
    if (swTelecom) s += leverMonthlyGain('telecom_optimize')
    if (swMeal) s += leverMonthlyGain('meal_prep')
    if (swSubs) s += leverMonthlyGain('subscriptions_bundle')
    return s
  }, [result, swNavigo, swTelecom, swMeal, swSubs])

  const gapBase = result ? Number(result.gapEuros ?? result.GapEuros ?? 0) : 0
  const gapAfterLive = result ? Math.round((gapBase - selectedLeverSum) * 100) / 100 : 0

  function applyPreset(kind) {
    setUseDefaultParams(false)
    if (kind === 'livret') setYieldPct('1.5')
    if (kind === 'lep') setYieldPct('2.5')
  }

  const savingsRunRef = useRef(0)

  async function simulate() {
    setErr('')
    const run = ++savingsRunRef.current
    setLoading(true)
    try {
      const tok = localStorage.getItem('msim_token')
      const payload = buildPayload(formState)
      const res = await fetch('/api/savings/simulate', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      if (run !== savingsRunRef.current) return
      setResult(data)
      setLastCoreSig(
        JSON.stringify({
          objectiveEuros: payload.objectiveEuros,
          horizonMonths: payload.horizonMonths,
          initialSavingsEuros: payload.initialSavingsEuros,
          currentMonthlySavingsEuros: payload.currentMonthlySavingsEuros,
          inflationAnnual: payload.inflationAnnual,
          nominalYieldAnnual: payload.nominalYieldAnnual,
          annualNetIncomeEuros: payload.annualNetIncomeEuros,
        })
      )
    } catch (e) {
      if (run === savingsRunRef.current) setErr(e.message || 'Erreur')
    } finally {
      if (run === savingsRunRef.current) setLoading(false)
    }
  }

  function reset() {
    setObjective('12000')
    setMonths('24')
    setInitial('0')
    setCurrentMonthly('0')
    setInflationPct('1.8')
    setYieldPct('1.5')
    setUseDefaultParams(true)
    setNetAnnual('')
    setSwNavigo(false)
    setSwTelecom(false)
    setSwMeal(false)
    setSwSubs(false)
    setResult(null)
    setLastCoreSig('')
    setErr('')
  }

  const r = result || {}
  const warnings = r.warnings || r.Warnings || []

  const leverRows = [
    ['navigo_to_bike', swNavigo, setSwNavigo],
    ['telecom_optimize', swTelecom, setSwTelecom],
    ['meal_prep', swMeal, setSwMeal],
    ['subscriptions_bundle', swSubs, setSwSubs],
  ]

  return (
    <div className="sim-shell">
      <div className="sim-form-card">
        <div className="section-header">{t.title}</div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t.subtitle}</p>

        <div className="field-group">
          <label className="field-label">{t.objective}</label>
          <input className="field-input" inputMode="decimal" value={objective} onChange={(e) => setObjective(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.months}</label>
          <input className="field-input" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.initial}</label>
          <input className="field-input" inputMode="decimal" value={initial} onChange={(e) => setInitial(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.currentMonthly}</label>
          <input className="field-input" inputMode="decimal" value={currentMonthly} onChange={(e) => setCurrentMonthly(e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input type="checkbox" checked={useDefaultParams} onChange={(e) => setUseDefaultParams(e.target.checked)} />
            <span>{t.useFileParams}</span>
          </label>
          {!useDefaultParams && (
            <>
              <label className="field-label" style={{ marginTop: 8 }}>
                {t.inflation}
              </label>
              <input className="field-input" inputMode="decimal" value={inflationPct} onChange={(e) => setInflationPct(e.target.value)} />
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.inflationHint}</div>
              <label className="field-label">{t.yield}</label>
              <input className="field-input" inputMode="decimal" value={yieldPct} onChange={(e) => setYieldPct(e.target.value)} />
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.yieldHint}</div>
            </>
          )}
          {useDefaultParams && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              <button type="button" className="parts-chip" onClick={() => applyPreset('livret')}>
                {t.presetLivretA}
              </button>
              <button type="button" className="parts-chip" onClick={() => applyPreset('lep')}>
                {t.presetLep}
              </button>
              <button type="button" className="parts-chip" onClick={() => setUseDefaultParams(false)}>
                {t.presetCustom}
              </button>
            </div>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">{t.netAnnual}</label>
          <input className="field-input" inputMode="decimal" value={netAnnual} onChange={(e) => setNetAnnual(e.target.value)} placeholder="optionnel" />
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.netAnnualHint}</div>
        </div>

        <div className="field-group">
          <div className="field-label">{t.switchesTitle}</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 10px', lineHeight: 1.5 }}>{t.switchesExpl}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {leverRows.map(([id, checked, setC]) => {
              const gain = leverMonthlyGain(id)
              const lab = switchStaticLabel(id, lang)
              return (
                <label key={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={checked} onChange={(e) => setC(e.target.checked)} style={{ marginTop: 3 }} />
                  <span style={{ flex: 1 }}>
                    {lab}{' '}
                    <strong style={{ color: 'var(--accent)' }}>
                      +{fmtEur(gain, lang)}
                      {t.perMonth}
                    </strong>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {err && <div style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 8 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <button type="button" className="btn-primary-custom" disabled={loading} onClick={simulate}>
            {loading ? '…' : t.calc}
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>
            {t.reset}
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16, lineHeight: 1.5 }}>{t.disclaimer}</p>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.lepNote}</p>
      </div>

      <div className="sim-result-card">
        <div className="section-header">{t.results}</div>
        {!result && !loading && (
          <div className="sim-result-empty">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M9 11l2 2 4-4M15 19l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{t.results}</div>
            <div style={{ fontSize: 13 }}>{t.empty}</div>
          </div>
        )}
        {result && (
          <>
            {inputsStale && (
              <div className="savings-stale-banner">{t.staleBanner}</div>
            )}

            <div className="savings-result-section">
              <div className="savings-result-section-title">{t.secTarget}</div>
              <div className="savings-result-card savings-result-card--muted">
                <div className="savings-result-row">
                  <span className="savings-result-row-label">{t.rowIndexed}</span>
                  <span className="savings-result-row-value">{fmtEur(r.indexedObjectiveEuros ?? r.IndexedObjectiveEuros, lang)}</span>
                </div>
              </div>
            </div>

            <div className="savings-result-section">
              <div className="savings-result-section-title">{t.secEachMonth}</div>
              <div className="savings-result-card savings-result-card--hero">
                <div className="savings-result-hero-value">{fmtEur(r.requiredMonthlyEuros ?? r.RequiredMonthlyEuros, lang)}</div>
                <div className="savings-result-hero-caption">{lang === 'fr' ? 'par mois pour atteindre la cible' : 'per month to hit the target'}</div>
                <div className="savings-result-row savings-result-row--tight savings-result-row--hero-footer">
                  <span className="savings-result-row-label">{t.rowDaily}</span>
                  <span className="savings-result-row-value savings-result-row-value--sm">{fmtEur(r.dailyEquivalentEuros ?? r.DailyEquivalentEuros, lang)}</span>
                </div>
              </div>
            </div>

            <div className="savings-result-section">
              <div className="savings-result-section-title">{t.secVersusSavings}</div>
              <div className="savings-result-card">
                <div className="savings-result-row">
                  <span className="savings-result-row-label">{t.rowRequired}</span>
                  <span className="savings-result-row-value">{fmtEur(r.requiredMonthlyEuros ?? r.RequiredMonthlyEuros, lang)}</span>
                </div>
                <div className="savings-result-row">
                  <span className="savings-result-row-label">{t.rowYouSave}</span>
                  <span className="savings-result-row-value savings-result-row-value--deduct">
                    {fmtEur(r.currentMonthlySavingsEuros ?? r.CurrentMonthlySavingsEuros, lang)}
                  </span>
                </div>
                <div className="savings-result-divider" />
                <div className="savings-result-row savings-result-row--emphasis">
                  <span className="savings-result-row-label">
                    {t.rowGapLine}
                    <span className="savings-result-row-hint">{t.rowGapSub}</span>
                  </span>
                  <span className="savings-result-row-value">{fmtEur(r.gapEuros ?? r.GapEuros, lang)}</span>
                </div>
              </div>
            </div>

            <div className="savings-result-section">
              <div className="savings-result-section-title">{t.secAfterLevers}</div>
              <div className="savings-result-card">
                <div className="savings-result-row">
                  <span className="savings-result-row-label">{t.rowLeversApplied}</span>
                  <span className="savings-result-row-value savings-result-row-value--deduct">−{fmtEur(selectedLeverSum, lang)}</span>
                </div>
                <div className="savings-result-divider" />
                <div className="savings-result-row savings-result-row--emphasis">
                  <span className="savings-result-row-label">
                    {t.rowRemain}
                    <span className="savings-result-row-hint">{t.rowRemainSub}</span>
                  </span>
                  <span
                    className={`savings-result-row-value${gapAfterLive > 0 ? ' savings-result-row-value--warn' : ' savings-result-row-value--ok'}`}
                  >
                    {fmtEur(gapAfterLive, lang)}
                  </span>
                </div>
              </div>
            </div>

            <div className="savings-result-section">
              <div className="savings-result-section-title">{t.clothing}</div>
              <div className="savings-result-card savings-result-card--muted">
                <div className="savings-result-row savings-result-row--tight">
                  <span className="savings-result-row-label" style={{ flex: 1 }}>
                    {r.clothingBudgetMonthlyEuros != null || r.ClothingBudgetMonthlyEuros != null
                      ? fmtEur(r.clothingBudgetMonthlyEuros ?? r.ClothingBudgetMonthlyEuros, lang)
                      : '—'}
                  </span>
                </div>
                {!(r.clothingBudgetMonthlyEuros != null || r.ClothingBudgetMonthlyEuros != null) && (
                  <p className="savings-result-footnote">{t.clothingEmpty}</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="field-label" style={{ marginBottom: 8 }}>
                {t.leverDetail}
              </div>
              <div style={{ fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {leverRows.map(([id, checked]) => {
                  const gain = leverMonthlyGain(id)
                  const lab = switchStaticLabel(id, lang)
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderBottom: '1px solid var(--border)',
                        background: checked ? 'rgba(16,185,129,0.06)' : 'transparent',
                        opacity: checked ? 1 : 0.75,
                      }}
                    >
                      <span>{lab}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        +{fmtEur(gain, lang)} {checked ? '✓' : '—'}
                      </span>
                    </div>
                  )
                })}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    fontWeight: 700,
                    background: 'var(--card-el)',
                  }}
                >
                  <span>{lang === 'fr' ? 'Total leviers cochés' : 'Total ticked levers'}</span>
                  <span>{fmtEur(selectedLeverSum, lang)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
              <div>
                {lang === 'fr' ? 'Inflation utilisée' : 'Inflation used'} :{' '}
                {fmtNum(((r.inflationAnnualUsed ?? r.InflationAnnualUsed) || 0) * 100, lang)} % / {lang === 'fr' ? 'an' : 'yr'} —{' '}
                {lang === 'fr' ? 'Rendement' : 'Yield'} :{' '}
                {fmtNum(((r.nominalYieldAnnualUsed ?? r.NominalYieldAnnualUsed) || 0) * 100, lang)} % / {lang === 'fr' ? 'an' : 'yr'}
              </div>
              {(r.paramsSourceNote || r.ParamsSourceNote) && (
                <div style={{ marginTop: 8, lineHeight: 1.45 }}>
                  <strong>{t.paramsNote} :</strong> {r.paramsSourceNote || r.ParamsSourceNote}
                </div>
              )}
            </div>

            {warnings.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="field-label">{t.warnings}</div>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--warning)' }}>
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
