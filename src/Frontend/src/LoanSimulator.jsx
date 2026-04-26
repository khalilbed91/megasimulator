import React, { useState } from 'react'
import ExternalNextStep from './components/ExternalNextStep'

const T = {
  fr: {
    title: 'Simulateur de prêts',
    subtitle: 'Immobilier (PTZ, TVA réduite, Action Logement), auto et consommation — modèle pédagogique 2026.',
    category: 'Type de projet',
    catImmo: 'Immobilier',
    catAuto: 'Automobile',
    catPerso: 'Crédit conso / perso',
    tvaRegime: 'Régime fiscal du bien',
    tvaAncien: 'Ancien (droits ~7,5 %)',
    tvaNeuf20: 'Neuf — TVA 20 %',
    tvaNeuf10: 'Neuf — TVA réduite 10 % (certains cas)',
    tvaNeuf55: 'Neuf — TVA réduite 5,5 % (QPV / ANRU…)',
    priceTtc: 'Prix du bien TTC (€)',
    priceHt: 'Ou prix HT (€) — recalcul TTC avec TVA du régime',
    amount: 'Montant emprunté (€)',
    down: 'Apport personnel (€)',
    rate: 'Taux nominal annuel (%)',
    months: 'Durée (mois)',
    insurance: 'Assurance emprunteur (%/an du capital)',
    fileFees: 'Frais de dossier (€)',
    guarantee: 'Garantie / caution (€)',
    income: 'Revenus nets mensuels foyer (€)',
    otherLoans: 'Autres mensualités crédits (€)',
    ptzOn: 'Inclure un PTZ (prêt à taux zéro)',
    ptzZone: 'Zone PTZ',
    ptzHousehold: 'Personnes au foyer',
    ptzIncome: 'Revenu fiscal de réf. (N-2) (€)',
    ptzAmount: 'Montant PTZ demandé (€)',
    ptzDefer: 'Différé PTZ (mois, puis remboursement sans intérêt)',
    palOn: 'Prêt Action Logement',
    palAmount: 'Montant PAL (€, max 40 000)',
    palRate: 'Taux PAL annuel (%)',
    boosterOn: 'Tranche « booster » à 0 % (banque)',
    boosterAmount: 'Montant booster 0 % (€)',
    boosterHint: 'Ex. offre type Crédit Agricole : partie du prêt au taux 0 %, même durée que l’emprunt principal (modèle pédagogique).',
    mainBankK: 'Capital au taux nominal',
    boosterApplied: 'Booster 0 % appliqué',
    calc: 'Calculer',
    reset: 'Réinitialiser',
    results: 'Résultats',
    empty: 'Renseignez les champs puis calculez.',
    monthlyBank: 'Mensualité banque (hors assurance)',
    monthlyIns: 'Assurance',
    monthlyPal: 'Action Logement',
    monthlyPtz: 'PTZ (phase amortissement)',
    monthlyTotal: 'Total mensuel régime établi',
    notary: 'Frais de notaire estimés',
    bankK: 'Capital banque',
    hcsf: 'Endettement HCSF (35 % max)',
    rav: 'Reste à vivre',
    taeg: 'TAEG approximatif',
    usury: 'Seuil usure indicatif',
    warnings: 'Alertes',
    schedule: 'Aperçu amortissement (24 premiers mois)',
    disclaimer: 'Données PTZ / TVA / PAL : valeurs indicatives. Vérifiez éligibilité réelle (notaire, banque, Action Logement).',
    nextTitle: 'Comparer avec une banque',
    nextDesc: 'Après cette simulation, vous pouvez vérifier les conditions réelles auprès d’un acteur bancaire externe.',
    nextLabel: 'Voir une offre bancaire',
    nextNote: 'Lien externe non sponsorisé — MegaSimulator ne transmet aucune donnée.',
  },
  en: {
    title: 'Loan simulator',
    subtitle: 'Mortgage (PTZ, reduced VAT, Action Logement), car and personal — 2026 educational model.',
    category: 'Project type',
    catImmo: 'Real estate',
    catAuto: 'Car',
    catPerso: 'Personal loan',
    tvaRegime: 'Property tax regime',
    tvaAncien: 'Resale (notary ~7.5%)',
    tvaNeuf20: 'New — 20% VAT',
    tvaNeuf10: 'New — reduced 10% (some cases)',
    tvaNeuf55: 'New — reduced 5.5% (QPV/ANRU…)',
    priceTtc: 'Price incl. tax (€)',
    priceHt: 'Or excl. tax (€) — TTC from regime VAT',
    amount: 'Loan amount (€)',
    down: 'Down payment (€)',
    rate: 'Annual nominal rate (%)',
    months: 'Term (months)',
    insurance: 'Borrower insurance (%/yr of principal)',
    fileFees: 'File fees (€)',
    guarantee: 'Guarantee (€)',
    income: 'Household net monthly income (€)',
    otherLoans: 'Other loan payments/mo (€)',
    ptzOn: 'Include PTZ (zero-interest loan)',
    ptzZone: 'PTZ zone',
    ptzHousehold: 'Household size',
    ptzIncome: 'Tax reference income Y-2 (€)',
    ptzAmount: 'PTZ amount requested (€)',
    ptzDefer: 'PTZ deferral (months)',
    palOn: 'Action Logement loan',
    palAmount: 'PAL amount (€, max 40k)',
    palRate: 'PAL annual rate (%)',
    boosterOn: '0% “booster” tranche (bank)',
    boosterAmount: 'Booster amount at 0% (€)',
    boosterHint: 'e.g. bank promo: part of the loan at 0%, same term as the main mortgage (educational model).',
    mainBankK: 'Principal at nominal rate',
    boosterApplied: '0% booster applied',
    calc: 'Calculate',
    reset: 'Reset',
    results: 'Results',
    empty: 'Fill in and calculate.',
    monthlyBank: 'Bank principal+interest',
    monthlyIns: 'Insurance',
    monthlyPal: 'Action Logement',
    monthlyPtz: 'PTZ (after deferral)',
    monthlyTotal: 'Total monthly (steady state)',
    notary: 'Estimated notary fees',
    bankK: 'Bank principal',
    hcsf: 'Debt ratio (35% max)',
    rav: 'Residual income',
    taeg: 'Approx. APR',
    usury: 'Indicative usury cap',
    warnings: 'Warnings',
    schedule: 'Amortization preview (24 mo)',
    disclaimer: 'PTZ/VAT/PAL: indicative only. Confirm with bank and advisors.',
    nextTitle: 'Compare with a bank',
    nextDesc: 'After this simulation, you can check real conditions with an external banking provider.',
    nextLabel: 'View banking offer',
    nextNote: 'External non-sponsored link — MegaSimulator does not transmit any data.',
  }
}

function parseDec(s) {
  if (s == null || s === '') return 0
  return parseFloat(String(s).replace(/\s/g, '').replace(',', '.')) || 0
}

function fmt(n, lang) {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function loanExternalUrl(category) {
  if (category === 'auto') return 'https://www.credit-agricole.fr/particulier/credit/consommation/credit-auto.html'
  if (category === 'perso') return 'https://www.credit-agricole.fr/particulier/credit/consommation.html'
  return 'https://www.credit-agricole.fr/particulier/credit/immobilier.html'
}

export default function LoanSimulator({ lang = 'fr' }) {
  const t = T[lang] || T.fr
  const [category, setCategory] = useState('immo')
  const [tvaRegime, setTvaRegime] = useState('ancien')
  const [priceTtc, setPriceTtc] = useState('')
  const [priceHt, setPriceHt] = useState('')
  const [amount, setAmount] = useState('')
  const [down, setDown] = useState('')
  const [rate, setRate] = useState('3.5')
  const [months, setMonths] = useState('240')
  const [insurance, setInsurance] = useState('0.20')
  const [fileFees, setFileFees] = useState('0')
  const [guarantee, setGuarantee] = useState('0')
  const [income, setIncome] = useState('')
  const [otherLoans, setOtherLoans] = useState('0')
  const [ptzOn, setPtzOn] = useState(false)
  const [ptzZone, setPtzZone] = useState('B2')
  const [ptzHousehold, setPtzHousehold] = useState('2')
  const [ptzIncome, setPtzIncome] = useState('')
  const [ptzAmount, setPtzAmount] = useState('')
  const [ptzDefer, setPtzDefer] = useState('120')
  const [palOn, setPalOn] = useState(false)
  const [palAmount, setPalAmount] = useState('30000')
  const [palRate, setPalRate] = useState('1')
  const [boosterOn, setBoosterOn] = useState(false)
  const [boosterAmount, setBoosterAmount] = useState('30000')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function simulate() {
    setErr('')
    setLoading(true)
    try {
      const tok = localStorage.getItem('msim_token')
      const payload = {
        category,
        tvaRegime: category === 'immo' ? tvaRegime : null,
        purchasePriceTtc: category === 'immo' ? parseDec(priceTtc) : 0,
        priceHt: category === 'immo' && priceHt.trim() ? parseDec(priceHt) : null,
        amount: category !== 'immo' ? parseDec(amount) : 0,
        downPayment: parseDec(down),
        nominalRateAnnualPercent: parseDec(rate),
        durationMonths: parseInt(months, 10) || 240,
        insuranceAnnualPercent: parseDec(insurance),
        fileFees: parseDec(fileFees),
        guaranteeFees: parseDec(guarantee),
        netMonthlyIncome: parseDec(income),
        otherMonthlyCredits: parseDec(otherLoans),
        includePtz: category === 'immo' && ptzOn,
        ptzZone: category === 'immo' && ptzOn ? ptzZone : null,
        householdPersons: parseInt(ptzHousehold, 10) || 1,
        fiscalReferenceIncome: parseDec(ptzIncome),
        ptzAmount: category === 'immo' && ptzOn ? parseDec(ptzAmount) : 0,
        ptzDefermentMonths: parseInt(ptzDefer, 10) || 0,
        includeActionLogement: category === 'immo' && palOn,
        actionLogementAmount: category === 'immo' && palOn ? parseDec(palAmount) : 0,
        actionLogementRateAnnualPercent: parseDec(palRate) || 1,
        boosterAmount: category === 'immo' && boosterOn ? parseDec(boosterAmount) : 0
      }
      const res = await fetch('/api/loan/simulate', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) },
        body: JSON.stringify(payload)
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
    setCategory('immo')
    setTvaRegime('ancien')
    setPriceTtc(''); setPriceHt(''); setAmount(''); setDown('')
    setRate('3.5'); setMonths('240'); setInsurance('0.20')
    setFileFees('0'); setGuarantee('0'); setIncome(''); setOtherLoans('0')
    setPtzOn(false); setPtzZone('B2'); setPtzHousehold('2'); setPtzIncome(''); setPtzAmount(''); setPtzDefer('120')
    setPalOn(false); setPalAmount('30000'); setPalRate('1')
    setBoosterOn(false); setBoosterAmount('30000')
    setResult(null); setErr('')
  }

  const r = result || {}
  const sched = r.schedulePreview || r.SchedulePreview || []

  return (
    <div className="sim-shell">
      <div className="sim-form-card">
        <div className="section-header">{t.title}</div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t.subtitle}</p>

        <div className="field-group">
          <label className="field-label">{t.category}</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['immo', t.catImmo],
              ['auto', t.catAuto],
              ['perso', t.catPerso]
            ].map(([v, lab]) => (
              <button key={v} type="button" className={`parts-chip${category === v ? ' active' : ''}`} onClick={() => setCategory(v)}>
                {lab}
              </button>
            ))}
          </div>
        </div>

        {category === 'immo' && (
          <div className="field-group">
            <label className="field-label">{t.tvaRegime}</label>
            <select className="field-input" value={tvaRegime} onChange={e => setTvaRegime(e.target.value)}>
              <option value="ancien">{t.tvaAncien}</option>
              <option value="neuf20">{t.tvaNeuf20}</option>
              <option value="neuf10">{t.tvaNeuf10}</option>
              <option value="neuf55">{t.tvaNeuf55}</option>
            </select>
          </div>
        )}

        {category === 'immo' ? (
          <>
            <div className="field-group">
              <label className="field-label">{t.priceTtc}</label>
              <input className="field-input" inputMode="decimal" value={priceTtc} onChange={e => setPriceTtc(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">{t.priceHt}</label>
              <input className="field-input" inputMode="decimal" value={priceHt} onChange={e => setPriceHt(e.target.value)} placeholder="optionnel" />
            </div>
          </>
        ) : (
          <div className="field-group">
            <label className="field-label">{t.amount}</label>
            <input className="field-input" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
        )}

        <div className="field-group">
          <label className="field-label">{t.down}</label>
          <input className="field-input" inputMode="decimal" value={down} onChange={e => setDown(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.rate}</label>
          <input className="field-input" inputMode="decimal" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.months}</label>
          <input className="field-input" inputMode="numeric" value={months} onChange={e => setMonths(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.insurance}</label>
          <input className="field-input" inputMode="decimal" value={insurance} onChange={e => setInsurance(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.fileFees}</label>
          <input className="field-input" inputMode="decimal" value={fileFees} onChange={e => setFileFees(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.guarantee}</label>
          <input className="field-input" inputMode="decimal" value={guarantee} onChange={e => setGuarantee(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.income} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 12 }}>(HCSF)</span></label>
          <input className="field-input" inputMode="decimal" value={income} onChange={e => setIncome(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">{t.otherLoans}</label>
          <input className="field-input" inputMode="decimal" value={otherLoans} onChange={e => setOtherLoans(e.target.value)} />
        </div>

        {category === 'immo' && (
          <>
            <div className="field-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="ptz" checked={ptzOn} onChange={e => setPtzOn(e.target.checked)} />
              <label htmlFor="ptz" className="field-label" style={{ margin: 0 }}>{t.ptzOn}</label>
            </div>
            {ptzOn && (
              <>
                <div className="field-group">
                  <label className="field-label">{t.ptzZone}</label>
                  <select className="field-input" value={ptzZone} onChange={e => setPtzZone(e.target.value)}>
                    <option value="AbisA">A bis / A</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">{t.ptzHousehold}</label>
                  <input className="field-input" inputMode="numeric" value={ptzHousehold} onChange={e => setPtzHousehold(e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="field-label">{t.ptzIncome}</label>
                  <input className="field-input" inputMode="decimal" value={ptzIncome} onChange={e => setPtzIncome(e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="field-label">{t.ptzAmount}</label>
                  <input className="field-input" inputMode="decimal" value={ptzAmount} onChange={e => setPtzAmount(e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="field-label">{t.ptzDefer}</label>
                  <input className="field-input" inputMode="numeric" value={ptzDefer} onChange={e => setPtzDefer(e.target.value)} />
                </div>
              </>
            )}
            <div className="field-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="pal" checked={palOn} onChange={e => setPalOn(e.target.checked)} />
              <label htmlFor="pal" className="field-label" style={{ margin: 0 }}>{t.palOn}</label>
            </div>
            {palOn && (
              <>
                <div className="field-group">
                  <label className="field-label">{t.palAmount}</label>
                  <input className="field-input" inputMode="decimal" value={palAmount} onChange={e => setPalAmount(e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="field-label">{t.palRate}</label>
                  <input className="field-input" inputMode="decimal" value={palRate} onChange={e => setPalRate(e.target.value)} />
                </div>
              </>
            )}
            <div className="field-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="booster" checked={boosterOn} onChange={e => setBoosterOn(e.target.checked)} />
              <label htmlFor="booster" className="field-label" style={{ margin: 0 }}>{t.boosterOn}</label>
            </div>
            {boosterOn && (
              <>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>{t.boosterHint}</p>
                <div className="field-group">
                  <label className="field-label">{t.boosterAmount}</label>
                  <input className="field-input" inputMode="decimal" value={boosterAmount} onChange={e => setBoosterAmount(e.target.value)} />
                </div>
              </>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary-custom" onClick={simulate} disabled={loading} style={{ flex: '1 1 140px', justifyContent: 'center' }}>
            {loading ? '…' : t.calc}
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>{t.reset}</button>
        </div>
        {err && <div className="field-error" style={{ marginTop: 10 }}>{err}</div>}
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
            <div className="kpi-grid" style={{ marginBottom: 14 }}>
              <div className="kpi-card kpi-primary" style={{ borderTop: '3px solid var(--accent)' }}>
                <div className="kpi-label">{t.monthlyTotal}</div>
                <div className="kpi-value">{fmt(r.monthlyTotalSteadyState ?? r.MonthlyTotalSteadyState, lang)} €</div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <ExternalNextStep
                title={t.nextTitle}
                description={t.nextDesc}
                href={loanExternalUrl(category)}
                label={t.nextLabel}
                note={t.nextNote}
              />
            </div>
            <div className="results-breakdown">
              <div className="results-row"><span className="results-row-label">{t.monthlyBank}</span><span>{fmt(r.monthlyBankPrincipalInterest ?? r.MonthlyBankPrincipalInterest, lang)} €</span></div>
              <div className="results-row"><span className="results-row-label">{t.monthlyIns}</span><span>{fmt(r.monthlyInsurance ?? r.MonthlyInsurance, lang)} €</span></div>
              {(r.monthlyActionLogement > 0 || r.MonthlyActionLogement > 0) && (
                <div className="results-row"><span className="results-row-label">{t.monthlyPal}</span><span>{fmt(r.monthlyActionLogement ?? r.MonthlyActionLogement, lang)} €</span></div>
              )}
              {(r.monthlyPtz > 0 || r.MonthlyPtz > 0) && (
                <div className="results-row"><span className="results-row-label">{t.monthlyPtz}</span><span>{fmt(r.monthlyPtz ?? r.MonthlyPtz, lang)} €</span></div>
              )}
              {category === 'immo' && (
                <>
                  <div className="results-row"><span className="results-row-label">{t.notary}</span><span>{fmt(r.notaryFees ?? r.NotaryFees, lang)} € ({fmt(r.notaryFeesPercent ?? r.NotaryFeesPercent, lang)} %)</span></div>
                  <div className="results-row"><span className="results-row-label">{t.bankK}</span><span>{fmt(r.bankPrincipal ?? r.BankPrincipal, lang)} €</span></div>
                  {(r.boosterAmountApplied > 0 || r.BoosterAmountApplied > 0) && (
                    <>
                      <div className="results-row"><span className="results-row-label">{t.boosterApplied}</span><span>{fmt(r.boosterAmountApplied ?? r.BoosterAmountApplied, lang)} €</span></div>
                      <div className="results-row"><span className="results-row-label">{t.mainBankK}</span><span>{fmt(r.mainBankPrincipal ?? r.MainBankPrincipal, lang)} €</span></div>
                    </>
                  )}
                </>
              )}
              <div className="results-row"><span className="results-row-label">{t.hcsf}</span><span>{fmt(r.debtRatio ?? r.DebtRatio, lang)} % {((r.hcsfDebtRatioOk ?? r.HcsfDebtRatioOk) ? '✓' : '⚠')}</span></div>
              <div className="results-row"><span className="results-row-label">{t.rav}</span><span>{fmt(r.resteAVivre ?? r.ResteAVivre, lang)} €</span></div>
              <div className="results-row"><span className="results-row-label">{t.taeg}</span><span>{fmt(r.taegApproximatePercent ?? r.TaegApproximatePercent, lang)} %</span></div>
              <div className="results-row"><span className="results-row-label">{t.usury}</span><span>{fmt(r.usuryThresholdPercent ?? r.UsuryThresholdPercent, lang)} % {(r.usuryOk ?? r.UsuryOk) ? '✓' : '⚠'}</span></div>
            </div>
            {(r.warnings?.length > 0 || r.Warnings?.length > 0) && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--card-el)', borderRadius: 8, fontSize: 13 }}>
                <strong>{t.warnings}</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                  {(r.warnings || r.Warnings || []).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            {sched.length > 0 && (
              <div style={{ marginTop: 16, overflowX: 'auto' }}>
                <div className="breakdown-title" style={{ marginBottom: 8 }}>{t.schedule}</div>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead><tr style={{ color: 'var(--muted)' }}>
                    <th style={{ textAlign: 'left', padding: 4 }}>#</th>
                    <th style={{ textAlign: 'right', padding: 4 }}>Cap.</th>
                    <th style={{ textAlign: 'right', padding: 4 }}>Int.</th>
                    <th style={{ textAlign: 'right', padding: 4 }}>Ass.</th>
                    <th style={{ textAlign: 'right', padding: 4 }}>CRD</th>
                  </tr></thead>
                  <tbody>
                    {sched.map(row => (
                      <tr key={row.month ?? row.Month}>
                        <td style={{ padding: 4 }}>{row.month ?? row.Month}</td>
                        <td style={{ textAlign: 'right', padding: 4 }}>{fmt(row.principalPart ?? row.PrincipalPart, lang)}</td>
                        <td style={{ textAlign: 'right', padding: 4 }}>{fmt(row.interestPart ?? row.InterestPart, lang)}</td>
                        <td style={{ textAlign: 'right', padding: 4 }}>{fmt(row.insurancePart ?? row.InsurancePart, lang)}</td>
                        <td style={{ textAlign: 'right', padding: 4 }}>{fmt(row.remainingPrincipal ?? row.RemainingPrincipal, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.disclaimer}</p>
          </>
        )}
      </div>
    </div>
  )
}
