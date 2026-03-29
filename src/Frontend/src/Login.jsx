import React, { useState } from 'react'
import './login.css'

export default function Login({ onLoginSuccess, switchToSignup, onClose }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // client-side validation
    const errs = { username: '', password: '' }
    // basic validation: email-ish or non-empty username, and password length
    if (!username) errs.username = 'Please enter your email or username'
    else if (username.includes('@')) {
      // simple email regex
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!re.test(username)) errs.username = 'Please enter a valid email address'
    }
    if (!password) errs.password = 'Please enter your password'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    if (errs.username || errs.password) { setLoading(false); return }
    try{
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // use conventional lower-case keys; backend should prefer HttpOnly cookie where possible
        body: JSON.stringify({ username: username, password: password }),
        // if you configure backend with CORS and cookies, consider adding `credentials: 'include'` here
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const j = await res.json()
      // persist token
      if (j.token) {
        // store in sessionStorage (less persistent than localStorage). For best security,
        // set a HttpOnly secure cookie from the server instead of storing tokens in JS.
        sessionStorage.setItem('msim_token', j.token)
      }
      onLoginSuccess?.(j.token)
    }catch(err){
      // Map errors to user-friendly messages instead of showing raw exception text
      const msg = (err && err.message) ? err.message : 'Login failed'
      setError(msg)
    }finally{ setLoading(false) }
  }

  const google = () => {
    // Redirect to backend OAuth start (backend must implement /api/auth/google)
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-wrap">
        <div className="login-card">
          <div className="text-center mb-3">
            <div style={{display:'inline-block', width:84, height:84}} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84" width="84" height="84" role="img" aria-label="Mega Simulator logo">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0" stopColor="#60a5fa" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <rect width="84" height="84" rx="16" fill="url(#g1)" />
                {/* wallet body: dark body, flap, clasp */}
                <g transform="translate(10,22)" aria-hidden="true">
                  <rect x="0" y="6" width="56" height="28" rx="6" fill="#0b1220" />
                  <rect x="0" y="6" width="46" height="10" rx="5" fill="#0e1726" />
                  <rect x="44" y="14" width="8" height="8" rx="2" fill="#f59e0b" />
                  <path d="M6 22h34" stroke="#111827" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
                </g>
                {/* bill emerging from wallet */}
                <g transform="translate(34,6) rotate(-8 16 14)">
                  <rect x="2" y="8" width="36" height="20" rx="3" fill="#fff" opacity="0.95" />
                  <rect x="4" y="10" width="32" height="16" rx="2" fill="#e6f2ff" />
                  <text x="20" y="22" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="14" fill="#0b1220">$</text>
                </g>
              </svg>
            </div>
            <h3 className="logo mt-2">Mega Simulator</h3>
            <div className="text-muted small">Simulations rapides — connectez-vous pour enregistrer vos simulations</div>
          </div>

          <div className="card p-3" style={{width:420}}>
              <form onSubmit={submit}>
              <div className="mb-2">
                <label className="form-label">Email or username</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-person" /></span>
                  <input name="username" aria-label="Email or username" autoComplete="username" className="form-control" placeholder="Email or username" value={username} onChange={e=>setUsername(e.target.value)} />
                </div>
                {errors.username && <div className="text-danger small mt-1">{errors.username}</div>}
              </div>

              <div className="mb-2">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock" /></span>
                  <input name="password" aria-label="Password" autoComplete="current-password" className="form-control" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                </div>
                {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" type="submit" disabled={loading}><i className="bi bi-box-arrow-in-right me-1" />{loading? ' Signing in...' : ' Sign in'}</button>
                <button type="button" className="btn btn-outline-danger" onClick={google}><i className="bi bi-google me-1" /> Google</button>
              </div>
            </form>

            <div className="mt-3 text-center">
              <small>No account? <button className="btn btn-link p-0" onClick={()=>{ if (typeof switchToSignup === 'function') return switchToSignup(); if (typeof onClose === 'function') return onClose(); }}>{'Create one'}</button></small>
            </div>
            {error && <div className="alert alert-danger mt-3" role="alert" aria-live="polite">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
