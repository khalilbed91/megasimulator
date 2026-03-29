import React from 'react'
import PayrollSimulator from './PayrollSimulator'
import Login from './Login'
import Signup from './Signup'
import Account from './Account'
import './styles.css'

export default function Home({ onSignOut, onRequestLogin }){
  const [tab, setTab] = React.useState('payroll')
  const [showLogin, setShowLogin] = React.useState(false)

  return (
    <div className="app-shell d-flex">
      <div className="sidebar p-3">
        <div className="d-flex align-items-center mb-4">
          <img src="/logo.svg" alt="logo" style={{width:36,height:36,marginRight:10}} />
          <div>
            <div className="brand">Mega Simulator</div>
            <div className="text-muted small">Payroll & Finance</div>
          </div>
        </div>

        <div className="nav d-flex flex-column mb-4">
          <button className={`btn btn-link text-start ${tab==='payroll' ? 'text-danger fw-bold' : 'text-success'}`} onClick={()=>setTab('payroll')}>Payroll</button>
          <button className={`btn btn-link text-start ${tab==='retirement' ? 'text-danger fw-bold' : 'text-success'}`} onClick={()=>setTab('retirement')}>Retirement</button>
          <button className={`btn btn-link text-start ${tab==='loans' ? 'text-danger fw-bold' : 'text-success'}`} onClick={()=>setTab('loans')}>Loans</button>
          <hr />
          <button className={`btn btn-link text-start ${tab==='account' ? 'text-danger fw-bold' : 'text-muted'}`} onClick={()=>setTab('account')}>Account</button>
          <button className={`btn btn-link text-start ${tab==='contact' ? 'text-danger fw-bold' : 'text-muted'}`} onClick={()=>setTab('contact')}>Contact</button>
        </div>

        <div className="account-area mt-auto">
          <button className="btn btn-outline-primary" onClick={()=>{ if (typeof onRequestLogin === 'function') return onRequestLogin(); setShowLogin(true); }}>Sign in</button>
        </div>
      </div>

      <div className="main flex-grow-1 p-4">
        <div className="topbar mb-3 d-flex justify-content-between align-items-center">
          <h2 className="m-0">{tab === 'payroll' ? 'Payroll simulator' : tab}</h2>
          <div className="small text-muted">Welcome to MegaSimulator</div>
        </div>

        <div className="content">
          {tab === 'payroll' && <PayrollSimulator />}
          {tab === 'retirement' && <div className="card"><h2>Retirement</h2><p>Coming soon</p></div>}
          {tab === 'loans' && <div className="card"><h2>Loans</h2><p>Coming soon</p></div>}
          {tab === 'account' && <Account />}
          {tab === 'contact' && <Contact />}
        </div>
      </div>

      {showLogin && <div className="modal-overlay"><Login onClose={()=>setShowLogin(false)} /></div>}
    </div>
  )
}
