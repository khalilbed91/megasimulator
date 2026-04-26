import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import PayrollSimulator from './PayrollSimulator'
import Account from './Account'
import Contact from './Contact'
import SimulationHistory from './SimulationHistory'
import RetirementSimulator from './RetirementSimulator'
import SavingsSimulator from './SavingsSimulator'
import LoanSimulator from './LoanSimulator'
import InsuranceSimulator from './InsuranceSimulator'
import { PATH, pathToTab, pathForTab, pathToLegalPage } from './seo/paths'
import { pathToGuideId, PATH_GUIDES } from './seo/guidePaths'
import SeoHead from './seo/SeoHead'
import SeoHeadGuide from './seo/SeoHeadGuide'
import SeoIntro from './seo/SeoIntro'
import { GUIDE_PAGES } from './guides/guideContent.jsx'
import GuideHub from './guides/GuideHub'
import GuideArticle from './guides/GuideArticle'
import LegalPageView from './legal/LegalPages'
import './styles.css'
import Logo from './components/Logo'

const T = {
  fr: {
    appName: 'Mega simulateur', subtitle: 'Paie & Finance',
    navPayroll: 'Simulateur paie', navRetirement: 'Retraite', navLoans: 'Prêts', navSavings: 'Épargne', navInsurance: 'Assurance',
    navAccount: 'Mon compte', navContact: 'Contact', navSignIn: 'Se connecter', navSignOut: 'Se déconnecter',
    navHistory: 'Historique',
    sectionSim: 'Simulations', sectionUser: 'Espace personnel',
    comingSoon: 'Prochainement', comingSoonDesc: 'Ce module est en cours de développement.',
    tabPayroll: 'Paie', tabRetirement: 'Retraite', tabLoans: 'Prêts', tabSavings: 'Épargne', tabInsurance: 'Assurance',
    guest: 'Invité', topbarPayroll: 'Simulateur de paie', topbarRetirement: 'Simulation retraite',
    topbarLoans: 'Simulation prêts', topbarSavings: 'Simulation épargne', topbarInsurance: 'Simulation assurance', topbarAccount: 'Mon compte', topbarContact: 'Contact',
    topbarHistory: 'Historique des simulations',
    topMentions: 'Mentions légales',
    topPrivacy: 'Politique de confidentialité',
    navLegalMentions: 'Mentions légales',
    navPrivacy: 'Confidentialité',
    navGuides: 'Guides',
    footerGuides: 'Guides',
    footerNavAria: 'Liens du pied de page',
  },
  en: {
    appName: 'Mega simulateur', subtitle: 'Payroll & Finance',
    navPayroll: 'Payroll sim', navRetirement: 'Retirement', navLoans: 'Loans', navSavings: 'Savings', navInsurance: 'Insurance',
    navAccount: 'My account', navContact: 'Contact', navSignIn: 'Sign in', navSignOut: 'Sign out',
    navHistory: 'History',
    sectionSim: 'Simulators', sectionUser: 'Account',
    comingSoon: 'Coming soon', comingSoonDesc: 'This module is under development.',
    tabPayroll: 'Payroll', tabRetirement: 'Retirement', tabLoans: 'Loans', tabSavings: 'Savings', tabInsurance: 'Insurance',
    guest: 'Guest', topbarPayroll: 'Payroll simulator', topbarRetirement: 'Retirement planner',
    topbarLoans: 'Loan simulator', topbarSavings: 'Savings simulator', topbarInsurance: 'Insurance simulator', topbarAccount: 'My account', topbarContact: 'Contact',
    topbarHistory: 'Simulation history',
    topMentions: 'Legal notices',
    topPrivacy: 'Privacy policy',
    navLegalMentions: 'Legal notices',
    navPrivacy: 'Privacy',
    navGuides: 'Guides',
    footerGuides: 'Guides',
    footerNavAria: 'Footer links',
  }
}

const topbarTitles = (t, tab) => ({
  payroll: t.topbarPayroll, retirement: t.topbarRetirement,
  loans: t.topbarLoans, savings: t.topbarSavings, insurance: t.topbarInsurance, account: t.topbarAccount, contact: t.topbarContact,
  history: t.topbarHistory
})[tab] || t.topbarPayroll

export default function Home({ token, onSignOut, onRequestLogin, onRequestSignup, lang, onLangChange }){
  const navigate = useNavigate()
  const location = useLocation()
  const legalPage = pathToLegalPage(location.pathname)
  const guideId = pathToGuideId(location.pathname)
  const tab = legalPage ? null : guideId ? 'guide' : pathToTab(location.pathname) ?? 'payroll'
  const year = new Date().getFullYear()

  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const tr = T[lang] || T['en']

  useEffect(()=>{
    const load = async ()=>{
      if (!token) return setUser(null)
      try{
        const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
        if (!res.ok) return setUser(null)
        setUser(await res.json())
      }catch{ setUser(null) }
    }
    load()
  }, [token])

  useEffect(() => {
    if (pathToLegalPage(location.pathname)) return
    if (pathToGuideId(location.pathname)) return
    if (pathToTab(location.pathname) === null) {
      navigate(PATH.payroll, { replace: true })
    }
  }, [location.pathname, navigate])

  const goTab = (id) => {
    navigate(pathForTab(id))
    setSidebarOpen(false)
  }

  const navItem = (id, label, icon, badge) => (
    <button key={id} className={`nav-item${tab === id ? ' active' : ''}`} onClick={() => goTab(id)}>
      {icon}
      <span>{label}</span>
      {badge && <span className="nav-item-badge">{badge}</span>}
    </button>
  )

  const openLogin = () => {
    setSidebarOpen(false)
    if (typeof onRequestLogin === 'function') onRequestLogin()
  }

  const openSignup = () => {
    setSidebarOpen(false)
    if (typeof onRequestSignup === 'function') onRequestSignup()
  }

  return (
    <div className="app-shell">
      {guideId ? (
        <SeoHeadGuide guideId={guideId} lang={lang} />
      ) : (
        <SeoHead pageKey={legalPage || tab} lang={lang} />
      )}
      {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)} />}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <Link to={PATH.payroll} className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
          <Logo size={46} />
          <div>
            <div className="sidebar-brand-name">{tr.appName}</div>
            <div className="sidebar-brand-sub">{tr.subtitle}</div>
          </div>
        </Link>

        <div className="nav-section-label">{tr.sectionSim}</div>

        {navItem('payroll', tr.navPayroll,
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 7h6M9 11h6M9 15h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        )}
        {navItem('retirement', tr.navRetirement,
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        )}
        {navItem('loans', tr.navLoans,
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 12h5l2 5 4-10 2 5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
        )}
        {navItem('savings', tr.navSavings,
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
        {navItem('insurance', tr.navInsurance,
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}

        <div className="nav-divider" />
        <div className="nav-section-label">{tr.navGuides}</div>
        <Link
          to={PATH_GUIDES.index}
          className={`nav-item guide-nav-link${guideId ? ' active' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-current={guideId ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 7h8M8 11h8M8 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>{tr.navGuides}</span>
        </Link>

        <div className="nav-divider" />
        <div className="nav-section-label">{tr.sectionUser}</div>

        {navItem('history', tr.navHistory,
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
        {navItem('account', tr.navAccount,
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        )}
        {navItem('contact', tr.navContact,
          <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}

        <div className="nav-spacer" />
        <div className="nav-divider" />

        {user ? (
          <div style={{padding:'10px 12px'}}>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {user.firstName || user.username || user.email || tr.guest}
            </div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:10,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email || ''}</div>
            <button className="btn-ghost" style={{width:'100%',justifyContent:'center',fontSize:13,padding:'8px 12px'}}
              onClick={()=>{ if (typeof onSignOut === 'function') onSignOut() }}>
              <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
              {tr.navSignOut}
            </button>
          </div>
        ) : (
          <button className="nav-item" onClick={openLogin}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M10 17l5-5-5-5v3H4v4h6v3zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
            <span>{tr.navSignIn}</span>
          </button>
        )}
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <button className="hamburger" onClick={()=>setSidebarOpen(o=>!o)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <h1 className="top-bar-title">
            {legalPage === 'mentions'
              ? tr.topMentions
              : legalPage === 'privacy'
                ? tr.topPrivacy
                : guideId && GUIDE_PAGES[guideId]
                  ? GUIDE_PAGES[guideId][lang === 'en' ? 'en' : 'fr'].topbarTitle
                  : topbarTitles(tr, tab)}
          </h1>
        </header>

        <main className="page-body" id="main-content">
          {legalPage && <LegalPageView page={legalPage} lang={lang} />}

          {!legalPage && tab && ['payroll', 'retirement', 'loans', 'savings', 'insurance'].includes(tab) && (
            <div className="tab-bar" role="tablist">
              <button role="tab" aria-selected={tab==='payroll'} className={`tab-btn${tab==='payroll'?' active':''}`} onClick={()=>goTab('payroll')}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M9 7h6M9 11h6M9 15h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {tr.tabPayroll}
              </button>
              <button role="tab" aria-selected={tab==='retirement'} className={`tab-btn${tab==='retirement'?' active':''}`} onClick={()=>goTab('retirement')}>
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {tr.tabRetirement}
              </button>
              <button role="tab" aria-selected={tab==='loans'} className={`tab-btn${tab==='loans'?' active':''}`} onClick={()=>goTab('loans')}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 12h5l2 5 4-10 2 5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {tr.tabLoans}
              </button>
              <button role="tab" aria-selected={tab==='savings'} className={`tab-btn${tab==='savings'?' active':''}`} onClick={()=>goTab('savings')}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {tr.tabSavings}
              </button>
              <button role="tab" aria-selected={tab==='insurance'} className={`tab-btn${tab==='insurance'?' active':''}`} onClick={()=>goTab('insurance')}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {tr.tabInsurance}
              </button>
            </div>
          )}

          {!legalPage && tab && <SeoIntro tab={tab} lang={lang} />}

          {!legalPage && guideId === 'index' && <GuideHub lang={lang} />}
          {!legalPage && guideId && guideId !== 'index' && <GuideArticle guideId={guideId} lang={lang} />}

          {!legalPage && tab === 'payroll' && <PayrollSimulator lang={lang} onLangChange={onLangChange} />}

          {!legalPage && tab === 'retirement' && <RetirementSimulator lang={lang} />}

          {!legalPage && tab === 'loans' && <LoanSimulator lang={lang} />}

          {!legalPage && tab === 'savings' && <SavingsSimulator lang={lang} />}

          {!legalPage && tab === 'insurance' && <InsuranceSimulator lang={lang} />}

          {!legalPage && tab === 'history' && (
            <SimulationHistory token={token} lang={lang} onRequestLogin={openLogin} onRequestSignup={openSignup} />
          )}
          {!legalPage && tab === 'account' && <Account token={token} lang={lang} onRequestLogin={openLogin} onRequestSignup={openSignup} />}
          {!legalPage && tab === 'contact' && <Contact lang={lang} />}
        </main>

        <footer className="app-site-footer" role="contentinfo">
          <div className="app-site-footer-row">
            <span className="app-site-footer-copy">© {year} {tr.appName}</span>
            <span className="app-site-footer-sep" aria-hidden="true">·</span>
            <nav className="app-site-footer-nav" aria-label={tr.footerNavAria}>
              <Link to={PATH.legalMentions} onClick={() => setSidebarOpen(false)}>{tr.navLegalMentions}</Link>
              <span className="app-site-footer-sep" aria-hidden="true">·</span>
              <Link to={PATH.privacy} onClick={() => setSidebarOpen(false)}>{tr.navPrivacy}</Link>
              <span className="app-site-footer-sep" aria-hidden="true">·</span>
              <Link to={PATH_GUIDES.index} onClick={() => setSidebarOpen(false)}>{tr.footerGuides}</Link>
              <span className="app-site-footer-sep" aria-hidden="true">·</span>
              <Link to={PATH.contact} onClick={() => setSidebarOpen(false)}>{tr.navContact}</Link>
            </nav>
          </div>
        </footer>
      </div>

    </div>
  )
}
