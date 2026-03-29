import React, { useState } from 'react'
import './login.css'
import Logo from './components/Logo'

export default function Login({ onLoginSuccess, switchToSignup, onClose }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({ username: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const validate = () => {
    const e = { username: '', password: '' }
    if (!username)
      e.username = 'Entrez votre email ou nom d\'utilisateur'
    else if (username.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username))
      e.username = 'Adresse email invalide'
    if (!password)          e.password = 'Entrez votre mot de passe'
    else if (password.length < 8) e.password = 'Minimum 8 caractères'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const errs = validate()
    setErrors(errs)
    if (errs.username || errs.password) { setLoading(false); return }
    try{
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: username, Password: password }),
      })
      if (!res.ok) throw new Error('Identifiants incorrects')
      const j = await res.json()
      if (j.token) localStorage.setItem('msim_token', j.token)
      onLoginSuccess?.(j.token)
    }catch(err){
      setError(err?.message || 'Connexion échouée')
    }finally{ setLoading(false) }
  }

  const google = () => { window.location.href = '/api/auth/google' }

  return (
    <div className="auth-page">
      {/* ── Brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <Logo size={52} />
        </div>
        <div className="auth-brand-title">Mega Simulator</div>
        <div className="auth-brand-subtitle">
          Simulez votre salaire net, estimez vos charges et planifiez votre retraite en quelques secondes.
        </div>

        <div className="auth-brand-stats">
          <div className="auth-stat">
            <div className="auth-stat-icon teal">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="auth-stat-label">Calcul instantané</div>
              <div className="auth-stat-value">Brut → Net en 1 clic</div>
            </div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-icon indigo">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M9 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2M9 17l3 3 3-3M12 17V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="auth-stat-label">Simulations sauvegardées</div>
              <div className="auth-stat-value">Retrouvez l'historique</div>
            </div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-icon amber">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="auth-stat-label">Paramètres 2026</div>
              <div className="auth-stat-value">Cotisations à jour</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <Logo size={44} />
            <div className="auth-form-title">Connexion</div>
            <div className="auth-form-desc">Connectez-vous pour accéder à vos simulations</div>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-username">Email ou nom d'utilisateur</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="17" height="17"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </span>
                <input id="login-username" className="auth-input" name="username" aria-label="Email or username"
                  autoComplete="username" placeholder="votre@email.com" type="text"
                  value={username} onChange={e=>setUsername(e.target.value)} />
              </div>
              {errors.username && <div className="auth-field-error" role="alert">{errors.username}</div>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Mot de passe</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="17" height="17"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>
                </span>
                <input id="login-password" className="auth-input" name="password" aria-label="Password"
                  autoComplete="current-password" placeholder="••••••••" type="password"
                  value={password} onChange={e=>setPassword(e.target.value)} />
              </div>
              {errors.password && <div className="auth-field-error" role="alert">{errors.password}</div>}
            </div>

            <button className="auth-btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{animation:'spin 0.8s linear infinite'}}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28 56" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M10 17l5-5-5-5v3H4v4h6v3zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/>
                </svg>
              )}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-divider">ou</div>

          <button className="auth-btn-google" type="button" onClick={google}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          {error && <div className="auth-error" role="alert" aria-live="polite">{error}</div>}

          <div className="auth-footer">
            Pas encore de compte ?{' '}
            <button className="auth-link" type="button"
              onClick={()=>{ if (typeof switchToSignup === 'function') return switchToSignup(); if (typeof onClose === 'function') return onClose() }}>
              Créer un compte
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
