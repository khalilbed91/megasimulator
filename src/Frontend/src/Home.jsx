import React, { useEffect, useState } from 'react'
import PayrollSimulator from './PayrollSimulator'
import Login from './Login'
import Signup from './Signup'
import Account from './Account'
import Contact from './Contact'
import './styles.css'
import Logo from './components/Logo'

export default function Home({ token, onSignOut, onRequestLogin }){
  const [tab, setTab] = React.useState('payroll')
  const [showLogin, setShowLogin] = React.useState(false)
  const [user, setUser] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      if (!token) return setUser(null)
      try{
        const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
        if (!res.ok) return setUser(null)
        const j = await res.json()
        setUser(j)
      }catch(e){ setUser(null) }
    }
    load()
  }, [token, showLogin])

  return (
    <div className="app-shell d-flex">
      <div className="sidebar p-3">
        <div className="d-flex align-items-center mb-4">
          <Logo size={36} />
          <div style={{marginLeft:10}}>
            <div className="brand">Mega Simulator</div>
            <div className="text-muted small">Payroll & Finance</div>
          </div>
        </div>

        <div className="nav d-flex flex-column mb-4">
          <button className={`btn btn-link text-start ${tab==='account' ? 'text-danger fw-bold' : 'text-muted'}`} onClick={()=>setTab('account')}>Account</button>
          <button className={`btn btn-link text-start ${tab==='contact' ? 'text-danger fw-bold' : 'text-muted'}`} onClick={()=>setTab('contact')}>Contact</button>
        </div>

        <div className="account-area mt-auto">
          {user ? (
            <div className="d-flex flex-column">
              <div className="fw-bold">{user.username || user.firstName || user.email}</div>
              <div className="small text-muted">{user.email}</div>
              <div className="mt-2">
                <button className="btn btn-outline-secondary btn-sm me-2" onClick={()=>setTab('account')}>Account</button>
                <button className="btn btn-outline-danger btn-sm" onClick={()=>{ if (typeof onSignOut === 'function') return onSignOut(); }}>Sign out</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-outline-primary" onClick={()=>{ if (typeof onRequestLogin === 'function') return onRequestLogin(); setShowLogin(true); }}>Sign in</button>
          )}
        </div>
      </div>

      <div className="main flex-grow-1 p-4">
        <div className="topbar mb-3 d-flex justify-content-between align-items-center">
          <h2 className="m-0">{tab === 'payroll' ? 'Payroll simulator' : tab}</h2>
          <div className="small text-muted">Welcome to MegaSimulator</div>
        </div>

        <div className="content">
          {/* central swapper for payroll / retirement / loans */}
          <div className="d-flex justify-content-center mb-4">
            <div className="btn-group" role="group" aria-label="Main selector">
              <button className={`btn btn-outline-light ${tab==='payroll' ? 'active' : ''}`} onClick={()=>setTab('payroll')}>Payroll</button>
              <button className={`btn btn-outline-light ${tab==='retirement' ? 'active' : ''}`} onClick={()=>setTab('retirement')}>Retirement</button>
              <button className={`btn btn-outline-light ${tab==='loans' ? 'active' : ''}`} onClick={()=>setTab('loans')}>Loans</button>
            </div>
          </div>

          {tab === 'payroll' && <PayrollSimulator />}
          {tab === 'retirement' && <div className="card"><h2>Retirement</h2><p>Coming soon</p></div>}
          {tab === 'loans' && <div className="card"><h2>Loans</h2><p>Coming soon</p></div>}
          {tab === 'account' && <Account token={token} />}
          {tab === 'contact' && <Contact />}
        </div>
      </div>

      {showLogin && <div className="modal-overlay"><Login onClose={()=>setShowLogin(false)} /></div>}
    </div>
  )
}
