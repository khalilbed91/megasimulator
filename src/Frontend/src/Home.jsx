import React, { useEffect, useState } from 'react'
import PayrollSimulator from './PayrollSimulator'
import Login from './Login'
import Account from './Account'
import Contact from './Contact'
import SimulationHistory from './SimulationHistory'
import RetirementSimulator from './RetirementSimulator'
import './styles.css'
import Logo from './components/Logo'

const T = {
  fr: {
    appName: 'Mega Simulator', subtitle: 'Paie & Finance',
    navPayroll: 'Simulateur paie', navRetirement: 'Retraite', navLoans: 'Prêts',
    navAccount: 'Mon compte', navContact: 'Contact', navSignIn: 'Se connecter', navSignOut: 'Se déconnecter',
    navHistory: 'Historique',
    sectionSim: 'Simulations', sectionUser: 'Utilisateur',
    comingSoon: 'Prochainement', comingSoonDesc: 'Ce module est en cours de développement.',
    tabPayroll: 'Paie', tabRetirement: 'Retraite', tabLoans: 'Prêts',
    guest: 'Invité', topbarPayroll: 'Simulateur de paie', topbarRetirement: 'Simulation retraite',
    topbarLoans: 'Simulation prêts', topbarAccount: 'Mon compte', topbarContact: 'Contact',
    topbarHistory: 'Historique des simulations',
  },
  en: {
    appName: 'Mega Simulator', subtitle: 'Payroll & Finance',
    navPayroll: 'Payroll sim', navRetirement: 'Retirement', navLoans: 'Loans',
    navAccount: 'My account', navContact: 'Contact', navSignIn: 'Sign in', navSignOut: 'Sign out',
    navHistory: 'History',
    sectionSim: 'Simulators', sectionUser: 'User',
    comingSoon: 'Coming soon', comingSoonDesc: 'This module is under development.',
    tabPayroll: 'Payroll', tabRetirement: 'Retirement', tabLoans: 'Loans',
    guest: 'Guest', topbarPayroll: 'Payroll simulator', topbarRetirement: 'Retirement planner',
    topbarLoans: 'Loan simulator', topbarAccount: 'My account', topbarContact: 'Contact',
    topbarHistory: 'Simulation history',
  }
}

const topbarTitles = (t, tab) => ({
  payroll: t.topbarPayroll, retirement: t.topbarRetirement,
  loans: t.topbarLoans, account: t.topbarAccount, contact: t.topbarContact,
  history: t.topbarHistory
})[tab] || t.topbarPayroll

export default function Home({ token, onSignOut, onRequestLogin, onLoginSuccess, lang, onLangChange }){
  const [tab, setTab] = useState('payroll')
  const [showLogin, setShowLogin] = useState(false)
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
  }, [token, showLogin])

  const navItem = (id, label, icon, badge) => (
    <button key={id} className={`nav-item${tab === id ? ' active' : ''}`} onClick={()=>setTab(id)}>
      {icon}
      <span>{label}</span>
      {badge && <span className="nav-item-badge">{badge}</span>}
    </button>
  )

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Logo size={34} />
          <div>
            <div className="sidebar-brand-name">{tr.appName}</div>
            <div className="sidebar-brand-sub">{tr.subtitle}</div>
          </div>
        </div>

        <div className="nav-section-label">{tr.sectionSim}</div>

        {navItem('payroll', tr.navPayroll,
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 7h6M9 11h6M9 15h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        )}
        {navItem('retirement', tr.navRetirement,
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
          lang === 'fr' ? 'Bientôt' : 'Soon'
        )}
        {navItem('loans', tr.navLoans,
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 12h5l2 5 4-10 2 5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
          lang === 'fr' ? 'Bientôt' : 'Soon'
        )}

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
          <button className="nav-item" onClick={()=>{ if (typeof onRequestLogin === 'function') onRequestLogin(); else setShowLogin(true) }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M10 17l5-5-5-5v3H4v4h6v3zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
            <span>{tr.navSignIn}</span>
          </button>
        )}
      </aside>

      {/* ── Main area ── */}
      <div className="main-content">
        {/* Top bar */}
        <div className="top-bar">
          {/* Hamburger for mobile */}
          <button className="hamburger" onClick={()=>setSidebarOpen(o=>!o)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className="top-bar-title">{topbarTitles(tr, tab)}</div>
        </div>

        <div className="page-body">
          {/* Simulator sub-tabs */}
          {['payroll','retirement','loans'].includes(tab) && (
            <div className="tab-bar" role="tablist">
              <button role="tab" aria-selected={tab==='payroll'} className={`tab-btn${tab==='payroll'?' active':''}`} onClick={()=>setTab('payroll')}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M9 7h6M9 11h6M9 15h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {tr.tabPayroll}
              </button>
              <button role="tab" aria-selected={tab==='retirement'} className={`tab-btn${tab==='retirement'?' active':''}`} onClick={()=>setTab('retirement')}>
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {tr.tabRetirement}
              </button>
              <button role="tab" aria-selected={tab==='loans'} className={`tab-btn${tab==='loans'?' active':''}`} onClick={()=>setTab('loans')}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 12h5l2 5 4-10 2 5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {tr.tabLoans}
              </button>
            </div>
          )}

          {/* Tab content */}
          {tab === 'payroll' && <PayrollSimulator lang={lang} onLangChange={onLangChange} />}

          {tab === 'retirement' && <RetirementSimulator lang={lang} />}

          {tab === 'loans' && (
            <div className="sim-result-empty" style={{marginTop:40}}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 6v6m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div style={{fontWeight:700,fontSize:18,color:'var(--text)'}}>{tr.comingSoon}</div>
              <div style={{fontSize:14}}>{tr.comingSoonDesc}</div>
            </div>
          )}

          {tab === 'history' && <SimulationHistory token={token} lang={lang} />}
          {tab === 'account' && <Account token={token} lang={lang} />}
          {tab === 'contact' && <Contact lang={lang} />}
        </div>
      </div>

      {showLogin && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,backdropFilter:'blur(4px)'}}>
          <Login onLoginSuccess={(t)=>{ if (typeof onLoginSuccess === 'function') onLoginSuccess(t); setShowLogin(false) }} onClose={()=>setShowLogin(false)} />
        </div>
      )}
    </div>
  )
}
