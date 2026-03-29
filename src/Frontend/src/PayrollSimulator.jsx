import React, { useState, useMemo } from 'react'

const translations = {
  fr: {
    title: 'Simulateur de paie',
    brutAnnuel: 'Brut annuel',
    statut: 'Statut',
    nonCadre: 'Non-cadre',
    cadre: 'Cadre',
    parts: 'Nombre de parts fiscales',
    revenusAnnexes: 'Revenus annexes',
    primes: 'Primes/Bonus',
    retenue: 'Retenue à la source (%)',
    retenueToggle: "Afficher l'impact de la retenue",
    simulate: 'Calculer',
    result: 'Résultat',
    technical: 'Afficher JSON technique',
    explanations: 'Explications'
  },
  en: {
    title: 'Payroll simulator',
    brutAnnuel: 'Gross annual',
    statut: 'Status',
    nonCadre: 'Non-exec',
    cadre: 'Exec',
    parts: 'Tax parts',
    revenusAnnexes: 'Additional income',
    primes: 'Bonuses',
    retenue: 'Withholding (%)',
    retenueToggle: 'Show withholding effect',
    simulate: 'Simulate',
    result: 'Result',
    technical: 'Show technical JSON',
    explanations: 'Explanations'
  }
}

export default function PayrollSimulator(){
  const [lang, setLang] = useState('fr')
  const t = useMemo(()=>translations[lang], [lang])

  const [brutAnnuel, setBrutAnnuel] = useState('')
  const [statut, setStatut] = useState('non-cadre')
  const [parts, setParts] = useState(1)
  const [revenusAnnexes, setRevenusAnnexes] = useState('')
  const [primes, setPrimes] = useState('')
  const [retenuePct, setRetenuePct] = useState(0)
  const [showRetenue, setShowRetenue] = useState(true)
  const [result, setResult] = useState(null)
  const [showTechnical, setShowTechnical] = useState(false)

  const simulate = async () => {
    setResult(null)
    try{
      // backend expects `Brut` (monthly gross). Send both monthly `Brut` and annual `BrutAnnuel` for clarity.
      const brutAnn = Number(brutAnnuel || 0);
      const monthly = brutAnn / 12;
      const payload = {
        Brut: Number(monthly || 0),
        BrutAnnuel: brutAnn,
        Statut: statut,
        Parts: Number(parts),
        RevenusAnnexes: Number(revenusAnnexes || 0),
        Primes: Number(primes || 0),
        RetenuePct: Number(retenuePct || 0)
      }
      const res = await fetch('/api/payroll/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      setResult(json)
    }catch(e){
      setResult({ error: e.message })
    }
  }

  // Validation
  const errors = {};
  if (!brutAnnuel || isNaN(Number(brutAnnuel)) || Number(brutAnnuel) <= 0) errors.brutAnnuel = lang==='fr' ? 'Entrez un brut annuel valide' : 'Enter a valid gross annual';
  if (!parts || isNaN(Number(parts)) || Number(parts) < 1) errors.parts = lang==='fr' ? 'Parts fiscales invalides' : 'Invalid tax parts';
  if (retenuePct !== '' && (isNaN(Number(retenuePct)) || Number(retenuePct) < 0 || Number(retenuePct) > 100)) errors.retenue = lang==='fr' ? 'Pourcentage invalide' : 'Invalid percentage';
  const isValid = Object.keys(errors).length === 0;

  const formatted = (v) => typeof v === 'number' ? v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }) : v

  // determine admin from JWT token stored in localStorage (roles claim)
  const isAdmin = () => {
    try{
      const t = localStorage.getItem('msim_token');
      if (!t) return false;
      const parts = t.split('.');
      if (parts.length < 2) return false;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'] || payload['roles'];
      if (!roles) return false;
      if (Array.isArray(roles)) return roles.includes('admin');
      return roles === 'admin' || (typeof roles === 'string' && roles.split(',').includes('admin'));
    }catch{return false}
  }

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">{t.title}</h2>
        <div className="d-flex align-items-center">
          <label className="me-2 small text-muted">Lang</label>
          <select className="form-select form-select-sm" style={{width:80}} value={lang} onChange={e=>setLang(e.target.value)}>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">{t.brutAnnuel}</label>
              <input className="form-control" inputMode="numeric" value={brutAnnuel} onChange={e=>setBrutAnnuel(e.target.value)} placeholder={lang==='fr' ? 'ex: 36000' : 'e.g. 36000'} />
              {errors.brutAnnuel && <div className="text-danger small mt-1">{errors.brutAnnuel}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">{t.statut}</label>
              <select className="form-select" value={statut} onChange={e=>setStatut(e.target.value)}>
                <option value="non-cadre">{t.nonCadre}</option>
                <option value="cadre">{t.cadre}</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">{t.parts}</label>
              <input className="form-control" type="number" min={1} value={parts} onChange={e=>setParts(e.target.value)} />
              {errors.parts && <div className="text-danger small mt-1">{errors.parts}</div>}
            </div>

            <div className="col-md-4">
              <label className="form-label">{t.revenusAnnexes}</label>
              <input className="form-control" inputMode="numeric" value={revenusAnnexes} onChange={e=>setRevenusAnnexes(e.target.value)} placeholder="0" />
            </div>

            <div className="col-md-4">
              <label className="form-label">{t.primes}</label>
              <input className="form-control" inputMode="numeric" value={primes} onChange={e=>setPrimes(e.target.value)} placeholder="0" />
            </div>

            <div className="col-md-6">
              <label className="form-label">{t.retenue}</label>
              <div className="d-flex align-items-center gap-2">
                <input className="form-control" style={{width:120}} type="number" min={0} max={100} value={retenuePct} onChange={e=>setRetenuePct(e.target.value)} />
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="showRetenue" checked={showRetenue} onChange={e=>setShowRetenue(e.target.checked)} />
                  <label className="form-check-label small" htmlFor="showRetenue">{t.retenueToggle}</label>
                </div>
              </div>
              {errors.retenue && <div className="text-danger small mt-1">{errors.retenue}</div>}
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" onClick={simulate} disabled={!isValid}><i className="bi bi-play-fill me-1" /> {t.simulate}</button>
            <button className={`btn btn-outline-secondary ${isAdmin() ? '' : 'd-none'}`} onClick={()=>{ setShowTechnical(s=>!s) }}><i className="bi bi-code-slash me-1" /> {t.technical}</button>
          </div>

          <div className="mt-4">
            <h5>{t.result}</h5>
            {!result && <div className="text-muted small">{lang==='fr' ? 'Aucun résultat' : 'No result yet'}</div>}
            {result && result.error && <div className="text-danger">{result.error}</div>}

            {result && !result.error && (
              <div className="row g-3 mt-2">
                <div className="col-md-6">
                  <div className="p-3 border rounded">
                    <div className="mb-2"><strong>Net mensuel:</strong> {formatted(result.netMonthly ?? result.net ?? result.net)}</div>
                    <div className="mb-2"><strong>Net annuel:</strong> {formatted(result.netAnnual ?? (result.net ? result.net*12 : null))}</div>
                    <div className="mb-2"><strong>Coût employeur:</strong> {formatted(result.employerCost)}</div>
                    <div className="mb-2"><strong>Contributions sociales:</strong> {formatted(result.socialContribution)}</div>
                    {showRetenue && <div className="mb-2"><strong>{t.retenue}:</strong> {formatted(retenuePct)}%</div>}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 border rounded h-100">
                    <div className="fw-semibold mb-2">{t.explanations}</div>
                    <ul>
                      <li>{lang==='fr' ? 'Net: salaire après cotisations sociales' : 'Net: salary after social contributions'}</li>
                      <li>{lang==='fr' ? 'Coût employeur: charges patronales incluses' : 'Employer cost: includes employer contributions'}</li>
                      <li>{lang==='fr' ? 'CSG/CRDS: CSG assiette/déductible/non-déductible' : 'CSG/CRDS: base/deductible/non-deductible components'}</li>
                    </ul>
                  </div>
                </div>

                {showTechnical && (
                  <div className="col-12">
                    <div className="bg-dark text-white p-3 rounded"><pre className="m-0 small">{JSON.stringify(result, null, 2)}</pre></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
