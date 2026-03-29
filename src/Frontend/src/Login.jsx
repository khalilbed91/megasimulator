import React, { useState, useEffect, useRef } from 'react'
import './login.css'
import Logo from './components/Logo'

export default function Login({ onLoginSuccess, switchToSignup, onDismiss, embedded }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({ username: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const googleBtnRef = useRef(null)

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
  const GOOGLE_CLIENT_ID = String(rawClientId).trim() || '874107145454-8vao5905rvg7v56h6rustrk3dbbbul62.apps.googleusercontent.com'
  const clientIdLooksValid = /\.apps\.googleusercontent\.com$/.test(GOOGLE_CLIENT_ID)

  const handleGoogleCredential = async (response) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      })
      if (!res.ok) throw new Error('Connexion Google échouée')
      const data = await res.json()
      if (data.token) localStorage.setItem('msim_token', data.token)
      onLoginSuccess?.(data.token)
    } catch (err) {
      setError(err.message || 'Erreur Google')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        // Évite le flux FedCM « lite » sur Chrome quand la config console ne le supporte pas (sinon 401 invalid_client fréquent)
        use_fedcm_for_button: false,
      })
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: googleBtnRef.current.offsetWidth || 360,
          text: 'continue_with',
          locale: 'fr',
        })
      }
    }
    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      // Script is loaded async — poll until available (max ~3s)
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (window.google?.accounts?.id) { clearInterval(interval); initGoogle() }
        if (attempts > 30) clearInterval(interval)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  const validate = () => {    const e = { username: '', password: '' }
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

  return (
    <div className={embedded ? 'auth-page auth-page--embedded' : 'auth-page'}>
      {!embedded && (
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
      )}

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

          {/* Google Sign-In button rendered by the GSI library */}
          {!clientIdLooksValid && (
            <div className="auth-error" role="alert">
              Client Google invalide : définissez <code style={{ fontSize: 12 }}>VITE_GOOGLE_CLIENT_ID</code> dans <code style={{ fontSize: 12 }}>.env.local</code> (ID se terminant par .apps.googleusercontent.com).
            </div>
          )}
          <div ref={googleBtnRef} style={{ width: '100%', minHeight: 44, display: 'flex', justifyContent: 'center' }} />

          <p className="auth-google-hint" style={{ fontSize: 12, color: 'rgba(226,232,240,0.55)', lineHeight: 1.5, marginTop: 12, textAlign: 'center' }}>
            Si Google affiche <strong style={{ color: '#fca5a5' }}>401 invalid_client</strong> : dans Google Cloud Console → Identifiants → votre client de type <strong>Application Web</strong>, ajoutez exactement l’<strong>origine JavaScript</strong>{' '}
            <code style={{ fontSize: 11 }}>{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</code>
            {' '}(et <code style={{ fontSize: 11 }}>http://127.0.0.1:5173</code> si vous ouvrez le site avec 127.0.0.1). Pas d’espace, pas de slash final. Redémarrez Vite après modification de <code style={{ fontSize: 11 }}>.env.local</code>.
          </p>

          {error && <div className="auth-error" role="alert" aria-live="polite">{error}</div>}

          <div className="auth-footer">
            Pas encore de compte ?{' '}
            <button className="auth-link" type="button" onClick={() => switchToSignup?.()}>
              Créer un compte
            </button>
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
