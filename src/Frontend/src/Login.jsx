import React, { useState } from 'react'
import './login.css'
import Logo from './components/Logo'

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
        // persist token for app flow
        localStorage.setItem('msim_token', j.token)
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
              <Logo size={84} />
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
