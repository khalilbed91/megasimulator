import React, { useState } from 'react'
import './login.css'
import Logo from './components/Logo'

export default function Signup({ onSignupSuccess, switchToLogin }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // simple client-side validation
    const errs = { email: '', password: '', name: '' }
    if (!name) errs.name = 'Enter your full name'
    if (!email || !email.includes('@')) errs.email = 'Enter a valid email'
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters'
    setErrors(errs)
    if (errs.email || errs.password || errs.name) { setLoading(false); return }
    try{
      // If backend has a signup endpoint, this will call it. Otherwise show success locally.
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: email, Password: password, Name: name })
      })
      if (!res.ok) throw new Error('Signup failed')
      const j = await res.json()
      if (j.token) localStorage.setItem('msim_token', j.token)
      onSignupSuccess?.(j.token)
    }catch(err){
      setError(err.message)
    }finally{ setLoading(false) }
  }

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-wrap">
        <div className="login-card">
          <div className="card p-4" style={{width:480}}>
            <div className="d-flex align-items-center mb-3">
              <Logo size={40} />
              <div style={{marginLeft:12}}>
                <h4 className="m-0">Create account</h4>
                <div className="text-muted small">Quick signup to save and manage simulations</div>
              </div>
            </div>

            <form onSubmit={submit}>
              <div className="mb-2">
                <input className="form-control" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
                {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
              </div>
              <div className="mb-2">
                <input className="form-control" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
              </div>
              <div className="mb-2">
                <input className="form-control" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
              </div>
              <div>
                <button className="btn btn-success" type="submit" disabled={loading}>{loading? 'Creating...' : 'Create account'}</button>
              </div>
            </form>
            <div className="mt-3 text-center"><small>Have an account? <button className="btn btn-link p-0" onClick={switchToLogin}>Sign in</button></small></div>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
