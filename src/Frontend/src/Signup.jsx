import React, { useState } from 'react'
import './login.css'
import Logo from './components/Logo'

export default function Signup({ onSignupSuccess, switchToLogin, onDismiss, embedded }){
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [errors,   setErrors]   = useState({ email:'', password:'', name:'' })
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const errs = { email:'', password:'', name:'' }
    if (!name)                           errs.name     = 'Entrez votre nom complet'
    if (!email || !email.includes('@'))  errs.email    = 'Entrez une adresse email valide'
    if (!password || password.length < 6) errs.password = 'Minimum 6 caractères'
    setErrors(errs)
    if (errs.email || errs.password || errs.name) { setLoading(false); return }
    try{
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: email, Password: password, Name: name })
      })
      if (!res.ok) throw new Error('Inscription échouée')
      const j = await res.json()
      if (j.token) localStorage.setItem('msim_token', j.token)
      onSignupSuccess?.(j.token)
    }catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  return (
    <div className={embedded ? 'auth-page auth-page--embedded' : 'auth-page'}>
      {!embedded && (
      <div className="auth-brand">
        <div className="auth-brand-logo"><Logo size={52} /></div>
        <div className="auth-brand-title">Rejoignez Mega Simulator</div>
        <div className="auth-brand-subtitle">
          Créez votre compte gratuitement et commencez à simuler votre salaire net, vos retraites et vos prêts en quelques secondes.
        </div>
        <div className="auth-brand-stats">
          <div className="auth-stat">
            <div className="auth-stat-icon teal">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div className="auth-stat-label">Compte gratuit</div>
              <div className="auth-stat-value">Sans carte bancaire</div>
            </div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-icon indigo">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div className="auth-stat-label">Données sécurisées</div>
              <div className="auth-stat-value">Chiffrement end-to-end</div>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <Logo size={44} />
            <div className="auth-form-title">Créer un compte</div>
            <div className="auth-form-desc">Inscription rapide — moins de 30 secondes</div>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-name">Nom complet</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="17" height="17"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </span>
                <input id="signup-name" className="auth-input" placeholder="Jean Dupont" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              {errors.name && <div className="auth-field-error" role="alert">{errors.name}</div>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-email">Email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="17" height="17"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </span>
                <input id="signup-email" className="auth-input" type="email" autoComplete="email" placeholder="votre@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              {errors.email && <div className="auth-field-error" role="alert">{errors.email}</div>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-password">Mot de passe</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="17" height="17"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>
                </span>
                <input id="signup-password" className="auth-input" type="password" autoComplete="new-password" placeholder="Minimum 6 caractères" value={password} onChange={e=>setPassword(e.target.value)} />
              </div>
              {errors.password && <div className="auth-field-error" role="alert">{errors.password}</div>}
            </div>

            <button className="auth-btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{animation:'spin 0.8s linear infinite'}}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28 56" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          {error && <div className="auth-error" role="alert" aria-live="polite">{error}</div>}

          <div className="auth-footer">
            Déjà un compte ?{' '}
            <button className="auth-link" type="button" onClick={() => switchToLogin?.()}>Se connecter</button>
          </div>
          {onDismiss && (
            <div className="auth-dismiss-wrap">
              <button type="button" className="auth-link" onClick={onDismiss}>
                {embedded ? 'Fermer' : 'Retour aux simulations'}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
