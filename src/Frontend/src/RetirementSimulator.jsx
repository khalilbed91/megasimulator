import React, { useState, useRef } from 'react'

/* ─── Translations ─────────────────────────────────────────── */
const T = {
  fr: {
    title: 'Simulation Retraite',
    subtitle: 'Estimez votre pension selon votre départ et votre carrière (modèle pédagogique simplifié)',
    anneeNaissance: 'Année de naissance',
    anneeNaissancePlaceholder: 'ex : 1991',
    ageDepart: 'Âge de départ à la retraite',
    ageDepartHint: 'Sert à afficher l’année de départ. Le montant suit surtout vos trimestres et votre SAM.',
    sam: 'Salaire annuel moyen (SAM)',
    samPlaceholder: 'ex : 40 000',
    samHint: 'Moyenne de vos 25 meilleures années brutes (hypothèse pour toute la carrière dans ce MVP)',
    anneesCotisees: 'Années d’activité cotisée (optionnel)',
    anneesCotiseesPlaceholder: 'ex : 5',
    anneesCotiseesHint: '≈ 4 trimestres validés par an. Si renseigné, ce nombre remplace la saisie des trimestres pour le calcul.',
    trimValides: 'Trimestres validés',
    trimValidesPl: 'ex : 20',
    trimRequis: 'Trimestres requis',
    trimRequisHint: 'Pré-rempli selon votre génération',
    points: 'Points Agirc-Arrco',
    pointsPlaceholder: 'ex : 8 000',
    pointsHint: 'Relevé de points sur agirc-arrco.fr — 0 si inconnu',
    objectifPension: 'Objectif pension nette / mois (optionnel)',
    objectifPensionPlaceholder: 'ex : 1 200',
    objectifPensionHint: 'Ex. viser le « taux plein » : recopiez la pension mensuelle de la colonne de droite.',
    revenusActuels: 'Revenus annuels actuels',
    revenusActuelsPlaceholder: 'ex : 48 000',
    revenusActuelsHint: 'Pour le taux de remplacement',
    calculate: 'Calculer',
    reset: 'Réinitialiser',
    resultsTitle: 'Résultats',
    empty: 'Remplissez le formulaire et cliquez sur Calculer.',
    scenarioTitle: 'Votre scénario',
    scenarioLine: 'Né(e) en {birth} · Départ à {age} ans → année {year}',
    ageLegalPivot: 'Âge légal / pivot (simplifié) pour votre génération : {age} ans',
    modelNote: 'Ce simulateur ne fait pas varier le montant selon l’âge de départ : il met en avant l’année de départ et surtout les trimestres.',
    compareTitle: 'À quoi vous attendre ?',
    colCurrent: 'Avec votre situation actuelle',
    colFull: 'Si vous validez tous les trimestres requis',
    colFullSub: 'Taux plein « au compte » (sans surcote)',
    pensionMensuelle: 'Pension mensuelle nette',
    pensionAnnuelle: 'Pension annuelle nette',
    gapVersPlein: 'Écart vers le taux plein (trimestres)',
    gapVersPleinPos: '+{amount} € / mois de potentiel si vous complétez votre carrière',
    yearsToFull: 'Il manque {q} trimestres — soit environ {y} an(s) d’activité à ~4 trimestres/an.',
    atFullAlready: 'Vous avez déjà au moins le nombre de trimestres requis : pas de décote liée aux trimestres.',
    aboveFullSurcote: 'Vous dépassez le nombre requis : la surcote améliore déjà votre pension par rapport au palier « tous trimestres requis ».',
    objectifSection: 'Vers votre objectif',
    objectifAt0: 'Vous atteignez déjà cet objectif avec la situation actuelle.',
    objectifNeed: 'Il faudrait environ {q} trimestre(s) de plus (~{y} an(s)) pour atteindre {target} € / mois net, avec les mêmes hypothèses SAM et points.',
    objectifFail: 'Objectif très élevé : dans ce modèle simplifié, il n’est pas atteignable en ajoutant seulement des trimestres (vérifiez SAM, points ou l’objectif).',
    pensionBrute: 'Pension brute totale',
    pensionBase: 'Pension de base CNAV',
    pensionCompl: 'Pension complémentaire Agirc-Arrco',
    tauxRemplacement: 'Taux de remplacement',
    decote: 'Décote',
    surcote: 'Surcote',
    trimManquants: 'Trimestres manquants',
    trimSummary: 'Détail trimestres',
    valeurPoint: 'Valeur du point',
    errAnnee: 'Entrez une année de naissance valide (1940–2012)',
    errSam: 'Entrez un salaire annuel moyen valide (> 0)',
    errTrim: 'Entrez des trimestres valides (1–250) ou des années cotisées',
    errPoints: 'Entrez un nombre de points valide (≥ 0)',
    errObjectif: 'Objectif invalide (nombre positif)',
    warningRegime: 'Seul le régime général est calculé en V1. Les régimes spéciaux (fonctionnaire, libéral) sont indicatifs.',
    validationSummary: 'Vérifiez les champs en erreur ci-dessus, puis cliquez à nouveau sur Calculer.',
  },
  en: {
    title: 'Retirement Simulator',
    subtitle: 'Estimate your pension by retirement age and career (simplified educational model)',
    anneeNaissance: 'Year of birth',
    anneeNaissancePlaceholder: 'e.g. 1991',
    ageDepart: 'Retirement age',
    ageDepartHint: 'Used to show your retirement year. Amount mainly depends on quarters and average salary.',
    sam: 'Average annual salary (SAM)',
    samPlaceholder: 'e.g. 40 000',
    samHint: 'Average of your best 25 gross years (assumed flat for this MVP)',
    anneesCotisees: 'Years of covered work (optional)',
    anneesCotiseesPlaceholder: 'e.g. 5',
    anneesCotiseesHint: '≈ 4 validated quarters per year. If set, this replaces the quarters field for the calculation.',
    trimValides: 'Validated quarters',
    trimValidesPl: 'e.g. 20',
    trimRequis: 'Required quarters',
    trimRequisHint: 'Pre-filled from your generation',
    points: 'Agirc-Arrco points',
    pointsPlaceholder: 'e.g. 8 000',
    pointsHint: 'Statement on agirc-arrco.fr — use 0 if unknown',
    objectifPension: 'Target net pension / month (optional)',
    objectifPensionPlaceholder: 'e.g. 1 200',
    objectifPensionHint: 'e.g. aim for “full rate”: copy the monthly pension from the right column.',
    revenusActuels: 'Current annual income',
    revenusActuelsPlaceholder: 'e.g. 48 000',
    revenusActuelsHint: 'For replacement rate',
    calculate: 'Calculate',
    reset: 'Reset',
    resultsTitle: 'Results',
    empty: 'Fill in the form and click Calculate.',
    scenarioTitle: 'Your scenario',
    scenarioLine: 'Born {birth} · Retiring at age {age} → year {year}',
    ageLegalPivot: 'Simplified legal/pivot age for your cohort: {age}',
    modelNote: 'This simulator does not change the amount by retirement age; it highlights the departure year and especially quarters.',
    compareTitle: 'What to expect',
    colCurrent: 'With your current situation',
    colFull: 'If you validate all required quarters',
    colFullSub: 'Full rate at required quarters (no bonus quarters)',
    pensionMensuelle: 'Monthly net pension',
    pensionAnnuelle: 'Annual net pension',
    gapVersPlein: 'Gap to full rate (quarters)',
    gapVersPleinPos: '+{amount} € / month potential if you complete your career',
    yearsToFull: '{q} quarters short — about {y} year(s) at ~4 quarters/year.',
    atFullAlready: 'You already meet the required quarters: no quarter-related reduction.',
    aboveFullSurcote: 'You exceed the required amount: the bonus already improves pension vs. the “all required quarters” baseline.',
    objectifSection: 'Toward your target',
    objectifAt0: 'You already meet this target with your current situation.',
    objectifNeed: 'About {q} more quarters (~{y} years) to reach {target} € / month net, same SAM and points.',
    objectifFail: 'Very high target: not reachable by quarters alone in this simplified model (check SAM, points, or the target).',
    pensionBrute: 'Total gross pension',
    pensionBase: 'CNAV base pension',
    pensionCompl: 'Agirc-Arrco supplementary',
    tauxRemplacement: 'Replacement rate',
    decote: 'Reduction',
    surcote: 'Bonus',
    trimManquants: 'Missing quarters',
    trimSummary: 'Quarters detail',
    valeurPoint: 'Point value',
    errAnnee: 'Enter a valid birth year (1940–2012)',
    errSam: 'Enter a valid average salary (> 0)',
    errTrim: 'Enter valid quarters (1–250) or years worked',
    errPoints: 'Enter a valid point count (≥ 0)',
    errObjectif: 'Invalid target (positive number)',
    warningRegime: 'Only the general regime is calculated in V1. Special regimes are indicative only.',
    validationSummary: 'Fix the fields marked in red above, then click Calculate again.',
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

const fmtInt = (v, lang) =>
  typeof v === 'number'
    ? v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 0 })
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

function parseNum(s) {
  if (s == null || s === '') return NaN
  return parseFloat(String(s).replace(/\s/g, '').replace(',', '.'))
}

/** Fusionne champs camelCase et PascalCase (vieux clients / proxies) pour un seul objet stable. */
function normalizeRetirementResponse(raw) {
  if (!raw || typeof raw !== 'object') return raw
  const p = (camel, pascal) => {
    const v = raw[camel]
    if (v !== undefined && v !== null) return v
    return raw[pascal]
  }
  return {
    ...raw,
    pensionBaseAnnuelle: p('pensionBaseAnnuelle', 'PensionBaseAnnuelle'),
    pensionComplementaireAnnuelle: p('pensionComplementaireAnnuelle', 'PensionComplementaireAnnuelle'),
    pensionBruteTotaleAnnuelle: p('pensionBruteTotaleAnnuelle', 'PensionBruteTotaleAnnuelle'),
    pensionNetteAnnuelle: p('pensionNetteAnnuelle', 'PensionNetteAnnuelle'),
    pensionNetteMensuelle: p('pensionNetteMensuelle', 'PensionNetteMensuelle'),
    tauxRemplacement: p('tauxRemplacement', 'TauxRemplacement'),
    trimestresValides: p('trimestresValides', 'TrimestresValides'),
    trimestresRequis: p('trimestresRequis', 'TrimestresRequis'),
    trimestresManquants: p('trimestresManquants', 'TrimestresManquants'),
    decotePct: p('decotePct', 'DecotePct'),
    surcotePct: p('surcotePct', 'SurcotePct'),
    sam: p('sam', 'Sam'),
    valeurPoint: p('valeurPoint', 'ValeurPoint'),
    ageDepart: p('ageDepart', 'AgeDepart'),
    anneeDepartRetraite: p('anneeDepartRetraite', 'AnneeDepartRetraite'),
    ageLegalPivot: p('ageLegalPivot', 'AgeLegalPivot'),
    pensionNetteMensuelleTauxPleinTrimestres: p(
      'pensionNetteMensuelleTauxPleinTrimestres',
      'PensionNetteMensuelleTauxPleinTrimestres'
    ),
    pensionNetteAnnuelleTauxPleinTrimestres: p(
      'pensionNetteAnnuelleTauxPleinTrimestres',
      'PensionNetteAnnuelleTauxPleinTrimestres'
    ),
    potentielMensuelVersTauxPlein: p('potentielMensuelVersTauxPlein', 'PotentielMensuelVersTauxPlein'),
    anneesIndicativesPourTauxPlein: p('anneesIndicativesPourTauxPlein', 'AnneesIndicativesPourTauxPlein'),
    trimestresAdditionnelsPourObjectif: p('trimestresAdditionnelsPourObjectif', 'TrimestresAdditionnelsPourObjectif'),
    anneesIndicativesPourObjectif: p('anneesIndicativesPourObjectif', 'AnneesIndicativesPourObjectif'),
    objectifAtteignable: p('objectifAtteignable', 'ObjectifAtteignable'),
  }
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
  const [anneesCotisees, setAnneesCotisees] = useState('')
  const [trimValides, setTrimValides] = useState('')
  const [trimRequis, setTrimRequis] = useState('')
  const [points, setPoints] = useState('0')
  const [objectifPension, setObjectifPension] = useState('')
  const [revenusActuels, setRevenusActuels] = useState('')
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const retirementRunRef = useRef(0)

  function handleAnneeChange(val) {
    setAnneeNaissance(val)
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1940 && n <= 2012) {
      setTrimRequis(String(getTrimestresRequis(n)))
    }
  }

  function resolveTrimestresForSubmit() {
    const y = parseNum(anneesCotisees)
    if (!isNaN(y) && y > 0) {
      const q = Math.min(250, Math.max(1, Math.round(y * 4)))
      return { trim: q, fromYears: true }
    }
    const tv = parseInt(trimValides, 10)
    return { trim: tv, fromYears: false }
  }

  function validate() {
    const errs = {}
    const n = parseInt(anneeNaissance, 10)
    if (isNaN(n) || n < 1940 || n > 2012) errs.annee = t.errAnnee
    const s = parseNum(sam)
    if (isNaN(s) || s <= 0) errs.sam = t.errSam
    const { trim, fromYears } = resolveTrimestresForSubmit()
    if (isNaN(trim) || trim < 1 || trim > 250) errs.trimValides = t.errTrim
    const pts = parseNum(points)
    if (isNaN(pts) || pts < 0) errs.points = t.errPoints
    const obj = parseNum(objectifPension)
    if (objectifPension.trim() !== '' && (isNaN(obj) || obj <= 0)) errs.objectif = t.errObjectif
    setErrors(errs)
    return { ok: Object.keys(errs).length === 0, trimUsed: fromYears ? trim : null }
  }

  async function simulate() {
    const { ok, trimUsed } = validate()
    if (!ok) {
      setApiError(t.validationSummary)
      return
    }
    setApiError('')
    const { trim } = resolveTrimestresForSubmit()
    if (trimUsed != null) setTrimValides(String(trimUsed))

    const run = ++retirementRunRef.current
    setLoading(true)
    setApiError('')
    try {
      const tok = localStorage.getItem('msim_token')
      const objVal = parseNum(objectifPension)
      const payload = {
        anneeNaissance: parseInt(anneeNaissance, 10),
        ageDepart: parseInt(ageDepart, 10) || 64,
        salaireAnnuelMoyen: parseNum(sam),
        trimestresValides: trim,
        trimestresRequis: parseInt(trimRequis, 10) || 170,
        pointsComplementaires: parseNum(points) || 0,
        regime: 'general',
        revenusAnnuelsActuels: parseNum(revenusActuels) || 0,
        ...(objectifPension.trim() !== '' && !isNaN(objVal) && objVal > 0
          ? { objectifPensionMensuelleNet: objVal }
          : {})
      }
      const res = await fetch('/api/retirement/simulate', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...(tok ? { Authorization: 'Bearer ' + tok } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (run !== retirementRunRef.current) return
      setResult(normalizeRetirementResponse(data))
    } catch (e) {
      if (run === retirementRunRef.current) setApiError(e.message || 'Erreur inattendue')
    } finally {
      if (run === retirementRunRef.current) setLoading(false)
    }
  }

  function reset() {
    setAnneeNaissance('')
    setAgeDepart('64')
    setSam('')
    setAnneesCotisees('')
    setTrimValides('')
    setTrimRequis('')
    setPoints('0')
    setObjectifPension('')
    setRevenusActuels('')
    setResult(null)
    setErrors({})
    setApiError('')
  }

  const trimVal = result?.trimestresValides ?? (parseInt(trimValides, 10) || 0)
  const trimReq = parseInt(trimRequis, 10) || 170

  const r = result || {}
  const anneeDepart = r.anneeDepartRetraite ?? (parseInt(anneeNaissance, 10) + (parseInt(ageDepart, 10) || 64))
  const ageDep = r.ageDepart ?? (parseInt(ageDepart, 10) || 64)
  const ageLegal = r.ageLegalPivot
  const pleinM = r.pensionNetteMensuelleTauxPleinTrimestres
  const pleinA = r.pensionNetteAnnuelleTauxPleinTrimestres
  const potentiel = r.potentielMensuelVersTauxPlein
  const anneesPourPlein = r.anneesIndicativesPourTauxPlein

  return (
    <div className="sim-shell">
      <div className="sim-col sim-inputs">
        <div className="sim-section-title">{lang === 'fr' ? 'Paramètres' : 'Parameters'}</div>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t.subtitle}</p>

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

        <div className="field-group">
          <label className="field-label">{t.ageDepart}</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[62, 63, 64, 65, 67].map(a => (
              <button
                key={a}
                type="button"
                className={`parts-chip${parseInt(ageDepart, 10) === a ? ' active' : ''}`}
                onClick={() => setAgeDepart(String(a))}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="field-hint">{t.ageDepartHint}</div>
        </div>

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

        <div className="field-group">
          <label className="field-label">{t.anneesCotisees}</label>
          <input
            className="field-input"
            inputMode="decimal"
            placeholder={t.anneesCotiseesPlaceholder}
            value={anneesCotisees}
            onChange={e => setAnneesCotisees(e.target.value)}
          />
          <div className="field-hint">{t.anneesCotiseesHint}</div>
        </div>

        <div className="field-group">
          <label className="field-label">{t.trimValides}</label>
          <input
            className="field-input"
            inputMode="numeric"
            placeholder={t.trimValidesPl}
            value={trimValides}
            onChange={e => setTrimValides(e.target.value)}
            disabled={parseNum(anneesCotisees) > 0}
          />
          {parseNum(anneesCotisees) > 0 && (
            <div className="field-hint" style={{ color: 'var(--accent)' }}>
              {lang === 'fr' ? `→ ${Math.round(parseNum(anneesCotisees) * 4)} trimestres utilisés pour le calcul` : `→ ${Math.round(parseNum(anneesCotisees) * 4)} quarters used`}
            </div>
          )}
          {trimVal > 0 && parseNum(anneesCotisees) <= 0 && <TrimProgress valides={trimVal} requis={trimReq} />}
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

        <div className="field-group">
          <label className="field-label">{t.objectifPension}</label>
          <div style={{ position: 'relative' }}>
            <input
              className="field-input"
              inputMode="decimal"
              placeholder={t.objectifPensionPlaceholder}
              value={objectifPension}
              onChange={e => setObjectifPension(e.target.value)}
              style={{ paddingRight: 36 }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>€</span>
          </div>
          <div className="field-hint">{t.objectifPensionHint}</div>
          {errors.objectif && <div className="field-error">{errors.objectif}</div>}
        </div>

        <div className="field-group">
          <label className="field-label">{t.revenusActuels} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12 }}>({lang === 'fr' ? 'optionnel' : 'optional'})</span></label>
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

      <div className="sim-col sim-results">
        <div className="sim-section-title">{t.resultsTitle}</div>

        {!result && !loading && <div className="sim-empty">{t.empty}</div>}

        {result && (
          <>
            <div
              style={{
                background: 'var(--card-el)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                marginBottom: 16
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 8 }}>{t.scenarioTitle}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', lineHeight: 1.45 }}>
                {t.scenarioLine
                  .replace('{birth}', fmtInt(parseInt(anneeNaissance, 10), lang))
                  .replace('{age}', String(ageDep))
                  .replace('{year}', String(anneeDepart))}
              </div>
              {ageLegal != null && (
                <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>
                  {t.ageLegalPivot.replace('{age}', String(ageLegal))}
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.modelNote}</div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>{t.compareTitle}</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 16
              }}
            >
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  borderTop: '3px solid var(--accent)'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>{t.colCurrent}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{t.pensionMensuelle}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{fmt(r.pensionNetteMensuelle, lang)} €</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{t.pensionAnnuelle}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(r.pensionNetteAnnuelle, lang)} €</div>
              </div>
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  borderTop: '3px solid var(--success)'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{t.colFull}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>{t.colFullSub}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{t.pensionMensuelle}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>{fmt(pleinM, lang)} €</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{t.pensionAnnuelle}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(pleinA, lang)} €</div>
              </div>
            </div>

            {typeof potentiel === 'number' && potentiel > 0 && r.trimestresManquants > 0 && (
              <div
                style={{
                  padding: '12px 14px',
                  background: 'rgba(var(--accent-rgb), 0.08)',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 13,
                  lineHeight: 1.55
                }}
              >
                <strong>{t.gapVersPlein}</strong>
                <div style={{ marginTop: 6 }}>
                  {t.gapVersPleinPos.replace('{amount}', fmt(potentiel, lang))}
                </div>
                <div style={{ marginTop: 6 }}>
                  {t.yearsToFull
                    .replace('{q}', String(r.trimestresManquants))
                    .replace('{y}', String(anneesPourPlein ?? '—'))}
                </div>
              </div>
            )}

            {r.trimestresManquants === 0 && r.surcotePct === 0 && (
              <div style={{ padding: '12px 14px', background: 'var(--card-el)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--muted)' }}>
                {t.atFullAlready}
              </div>
            )}

            {typeof potentiel === 'number' && potentiel < 0 && (
              <div style={{ padding: '12px 14px', background: 'var(--card-el)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--muted)' }}>
                {t.aboveFullSurcote}
              </div>
            )}

            {objectifPension.trim() !== '' && r.objectifAtteignable === true && r.trimestresAdditionnelsPourObjectif != null && (
              <div className="results-breakdown" style={{ marginBottom: 16 }}>
                <div className="breakdown-title">{t.objectifSection}</div>
                {r.trimestresAdditionnelsPourObjectif === 0 ? (
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted)' }}>{t.objectifAt0}</p>
                ) : (
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>
                    {t.objectifNeed
                      .replace('{q}', String(r.trimestresAdditionnelsPourObjectif))
                      .replace('{y}', String(r.anneesIndicativesPourObjectif ?? '—'))
                      .replace('{target}', fmt(parseNum(objectifPension), lang))}
                  </p>
                )}
              </div>
            )}

            {objectifPension.trim() !== '' && r.objectifAtteignable === false && (
              <div style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--danger)' }}>
                {t.objectifFail}
              </div>
            )}

            <div className="kpi-grid">
              {r.tauxRemplacement > 0 && (
                <KpiCard
                  label={t.tauxRemplacement}
                  value={fmtPct(r.tauxRemplacement, lang)}
                  color="kpi-tertiary"
                />
              )}
            </div>

            <div className="results-breakdown">
              <div className="breakdown-title">{lang === 'fr' ? 'Décomposition' : 'Breakdown'}</div>
              <div className="results-row">
                <span className="results-row-label">{t.pensionBase}</span>
                <span className="results-row-value">{fmt(r.pensionBaseAnnuelle, lang)} €/an</span>
              </div>
              <div className="results-row">
                <span className="results-row-label">{t.pensionCompl}</span>
                <span className="results-row-value accent">{fmt(r.pensionComplementaireAnnuelle, lang)} €/an</span>
              </div>
              <div className="results-row results-row--total">
                <span className="results-row-label">{t.pensionBrute}</span>
                <span className="results-row-value">{fmt(r.pensionBruteTotaleAnnuelle, lang)} €/an</span>
              </div>
            </div>

            <div className="results-breakdown" style={{ marginTop: 12 }}>
              <div className="breakdown-title">{t.trimSummary}</div>
              {trimVal > 0 && <TrimProgress valides={r.trimestresValides} requis={r.trimestresRequis} />}
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {r.trimestresManquants > 0 && (
                  <div className="results-row">
                    <span className="results-row-label">{t.trimManquants}</span>
                    <span className="results-row-value" style={{ color: 'var(--danger)' }}>{r.trimestresManquants}</span>
                  </div>
                )}
                {r.decotePct > 0 && (
                  <div className="results-row">
                    <span className="results-row-label">{t.decote}</span>
                    <span className="results-row-value" style={{ color: 'var(--danger)' }}>{fmtPct(r.decotePct, lang)}</span>
                  </div>
                )}
                {r.surcotePct > 0 && (
                  <div className="results-row">
                    <span className="results-row-label">{t.surcote}</span>
                    <span className="results-row-value" style={{ color: 'var(--success)' }}>+{fmtPct(r.surcotePct, lang)}</span>
                  </div>
                )}
                <div className="results-row">
                  <span className="results-row-label">{t.valeurPoint}</span>
                  <span className="results-row-value">{fmt(r.valeurPoint, lang)} €</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--warning-bg, #fef9c3)', borderRadius: 8, fontSize: 12, color: 'var(--warning-text, #92400e)', lineHeight: 1.5 }}>
              ⚠️ {t.warningRegime}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
