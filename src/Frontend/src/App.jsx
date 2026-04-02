import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Signup from './Signup'
import Home from './Home'
import CookieBanner from './legal/CookieBanner'
import { PATH } from './seo/paths'
import './styles.css'

/** Non-empty trimmed token, or null (clears junk whitespace in storage). */
function readStoredToken() {
  try {
    const raw = localStorage.getItem('msim_token')
    if (raw == null) return null
    const s = String(raw).trim()
    if (!s) {
      localStorage.removeItem('msim_token')
      return null
    }
    return s
  } catch {
    return null
  }
}

function AppShell() {
  const [token, setToken] = useState(() => readStoredToken())
  const [authScreen, setAuthScreen] = useState(null)
  const [lang, setLang] = useState(localStorage.getItem('msim_lang') || 'fr')

  useEffect(() => {
    document.body.classList.remove('app-dark')
    try {
      localStorage.removeItem('msim_dark')
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try {
      const qp = new URLSearchParams(window.location.search)
      const t = qp.get('token')
      if (t) {
        const clean = String(t).trim()
        if (clean) {
          localStorage.setItem('msim_token', clean)
          setToken(clean)
        }
        setAuthScreen(null)
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, document.title, url.toString())
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    localStorage.setItem('msim_lang', lang)
  }, [lang])

  const onLoginSuccess = (t) => {
    const fromArg = t != null && String(t).trim() !== '' ? String(t).trim() : null
    if (fromArg) localStorage.setItem('msim_token', fromArg)
    setToken(fromArg ?? readStoredToken())
    setAuthScreen(null)
  }

  const signOut = () => {
    localStorage.removeItem('msim_token')
    setToken(null)
  }

  const Controls = (
    <div className="controls-bar">
      <button
        className="icon-ctrl"
        title="Français"
        aria-label="Changer en français"
        onClick={() => setLang('fr')}
        style={lang === 'fr' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
      >
        <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" width="22" height="15" style={{ borderRadius: 2, display: 'block' }}>
          <rect width="1" height="2" x="0" fill="#0055A4" />
          <rect width="1" height="2" x="1" fill="#fff" />
          <rect width="1" height="2" x="2" fill="#EF4135" />
        </svg>
      </button>

      <button
        className="icon-ctrl"
        title="English"
        aria-label="Switch to English"
        onClick={() => setLang('en')}
        style={lang === 'en' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
      >
        <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" width="22" height="15" style={{ borderRadius: 2, display: 'block' }}>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" />
          <rect x="26" width="8" height="30" fill="#fff" />
          <rect y="11" width="60" height="8" fill="#fff" />
          <rect x="28" width="4" height="30" fill="#C8102E" />
          <rect y="13" width="60" height="4" fill="#C8102E" />
        </svg>
      </button>
    </div>
  )

  return (
    <>
      {Controls}
      <Home
        token={token}
        onSignOut={signOut}
        onRequestLogin={() => setAuthScreen('login')}
        onRequestSignup={() => setAuthScreen('signup')}
        lang={lang}
        onLangChange={setLang}
      />

      {authScreen === 'login' && (
        <div className="auth-fullscreen-overlay">
          <Login
            onLoginSuccess={onLoginSuccess}
            switchToSignup={() => setAuthScreen('signup')}
            onDismiss={() => setAuthScreen(null)}
          />
        </div>
      )}
      {authScreen === 'signup' && (
        <div className="auth-fullscreen-overlay">
          <Signup
            lang={lang}
            onSignupSuccess={onLoginSuccess}
            switchToLogin={() => setAuthScreen('login')}
            onDismiss={() => setAuthScreen(null)}
          />
        </div>
      )}
      <CookieBanner lang={lang} />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={PATH.payroll} replace />} />
      <Route path="/portage-salarial" element={<Navigate to={PATH.payroll} replace />} />
      <Route path="/salaire-brut-net" element={<Navigate to={PATH.payroll} replace />} />
      <Route path="/simulation-portage-salarial" element={<Navigate to={PATH.payroll} replace />} />
      <Route path="/simulateur-salaire" element={<Navigate to={PATH.payroll} replace />} />
      <Route path="/pret-immobilier" element={<Navigate to={PATH.loans} replace />} />
      <Route path="/credit-immobilier" element={<Navigate to={PATH.loans} replace />} />
      <Route path="/simulateur-pret" element={<Navigate to={PATH.loans} replace />} />
      <Route path="/simulation-retraite-bilan" element={<Navigate to={PATH.retirement} replace />} />
      <Route path="/*" element={<AppShell />} />
    </Routes>
  )
}
