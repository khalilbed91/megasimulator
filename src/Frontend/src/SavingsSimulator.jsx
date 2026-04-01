import React, { useState, useMemo, useCallback } from 'react'

/** Aligné sur defaults API / params (affichage avant 1er calcul) */
const DEFAULT_SWITCH_PRESETS = {
  navigo_to_bike: 130,
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
    warnings: 'Remarques',
    disclaimer:
      'Simulation simplifiée (versements en fin de mois, taux constant). Pas de conseil en investissement. Taux Livret A / LEP : réglementation en vigueur — vérifier auprès de votre établissement.',
    paramsNote: 'Sources paramètres',
    lepNote: 'LEP : sous conditions de ressources ; taux indicatif au 1er fév. 2026.',
    useFileParams: 'Utiliser inflation & rendement du fichier params (recommandé)',
    swNavigo: 'Transport : Navigo → vélo / Liberté+',
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
    warnings: 'Notes',
    disclaimer:
      'Simplified model (end-of-month contributions, flat rate). Not investment advice. Regulated savings rates — confirm with your bank.',
    paramsNote: 'Parameter sources',
    lepNote: 'LEP: income conditions apply; indicative Feb 2026 rate.',
    useFileParams: 'Use inflation & yield from params file (recommended)',
    swNavigo: 'Transit: pass → bike / lighter pass',
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

function monthlyGainForSwitch(id, result) {
  const list = result?.switches || result?.Switches || []
  const sw = list.find((x) => (x.id || x.Id) === id)
  if (sw != null) {
    const g = sw.monthlyGainEuros ?? sw.MonthlyGainEuros
    if (g != null && !isNaN(Number(g))) return Number(g)
  }
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
    if (swNavigo) s += monthlyGainForSwitch('navigo_to_bike', result)
    if (swTelecom) s += monthlyGainForSwitch('telecom_optimize', result)
    if (swMeal) s += monthlyGainForSwitch('meal_prep', result)
    if (swSubs) s += monthlyGainForSwitch('subscriptions_bundle', result)
    return s
  }, [result, swNavigo, swTelecom, swMeal, swSubs])

  const gapBase = result ? Number(result.gapEuros ?? result.GapEuros ?? 0) : 0
  const gapAfterLive = result ? Math.round((gapBase - selectedLeverSum) * 100) / 100 : 0

  const label = useCallback(
    (sw) => (lang === 'en' ? sw.labelEn ?? sw.LabelEn : sw.labelFr ?? sw.LabelFr),
    [lang]
  )

  function applyPreset(kind) {
    setUseDefaultParams(false)
    if (kind === 'livret') setYieldPct('1.5')
    if (kind === 'lep') setYieldPct('2.5')
  }

  async function simulate() {
    setErr('')
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
      setErr(e.message || 'Erreur')
    } finally {
      setLoading(false)
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
  const switches = r.switches || r.Switches || []
  const warnings = r.warnings || r.Warnings || []

  const leverRows = [
    ['navigo_to_bike', swNavigo, setSwNavigo],
    ['telecom_optimize', swTelecom, setSwTelecom],
    ['meal_prep', swMeal, setSwMeal],
    ['subscriptions_bundle', swSubs, setSwSubs],
  ]

  return (
    <div className="sim-shell">
      <div className="sim-col sim-inputs">
        <div className="sim-section-title">{t.title}</div>
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
              const gain = result ? monthlyGainForSwitch(id, result) : DEFAULT_SWITCH_PRESETS[id] ?? 0
              const sw = switches.find((x) => (x.id || x.Id) === id)
              const lab = sw ? label(sw) : switchStaticLabel(id, lang)
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

      <div className="sim-col sim-results">
        <div className="sim-section-title">{t.results}</div>
        {!result && <div className="sim-result-empty">{t.empty}</div>}
        {result && (
          <>
            {inputsStale && (
              <div
                style={{
                  marginBottom: 14,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.35)',
                  color: 'var(--text)',
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                {t.staleBanner}
              </div>
            )}

            <div className="result-block">
              <div className="result-kpi">
                <span className="result-kpi-label">{t.indexed}</span>
                <span className="result-kpi-value">{fmtEur(r.indexedObjectiveEuros ?? r.IndexedObjectiveEuros, lang)}</span>
              </div>
              <div className="result-kpi result-kpi--accent">
                <span className="result-kpi-label">{t.required}</span>
                <span className="result-kpi-value">{fmtEur(r.requiredMonthlyEuros ?? r.RequiredMonthlyEuros, lang)}</span>
              </div>
              <div className="result-kpi">
                <span className="result-kpi-label">{t.gap}</span>
                <span className="result-kpi-value">{fmtEur(r.gapEuros ?? r.GapEuros, lang)}</span>
              </div>
              <div className="result-kpi">
                <span className="result-kpi-label">{t.gapAfter}</span>
                <span className="result-kpi-value" style={{ color: gapAfterLive > 0 ? 'var(--warning)' : 'var(--success)' }}>
                  {fmtEur(gapAfterLive, lang)}
                </span>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{t.gapFormula}</div>
              </div>
              <div className="result-kpi">
                <span className="result-kpi-label">{t.daily}</span>
                <span className="result-kpi-value">{fmtEur(r.dailyEquivalentEuros ?? r.DailyEquivalentEuros, lang)}</span>
              </div>
              <div className="result-kpi">
                <span className="result-kpi-label">{t.clothing}</span>
                <span className="result-kpi-value">
                  {r.clothingBudgetMonthlyEuros != null || r.ClothingBudgetMonthlyEuros != null
                    ? fmtEur(r.clothingBudgetMonthlyEuros ?? r.ClothingBudgetMonthlyEuros, lang)
                    : '—'}
                </span>
                {!(r.clothingBudgetMonthlyEuros != null || r.ClothingBudgetMonthlyEuros != null) && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{t.clothingEmpty}</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="field-label" style={{ marginBottom: 8 }}>
                {t.leverDetail}
              </div>
              <div style={{ fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {leverRows.map(([id, checked]) => {
                  const gain = monthlyGainForSwitch(id, r)
                  const sw = switches.find((x) => (x.id || x.Id) === id)
                  const lab = sw ? label(sw) : switchStaticLabel(id, lang)
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
