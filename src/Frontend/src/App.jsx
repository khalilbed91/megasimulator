import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Signup from './Signup'
import Home from './Home'
import { PATH } from './seo/paths'
import './styles.css'

function AppShell() {
  const [token, setToken] = useState(() => localStorage.getItem('msim_token'))
  const [authScreen, setAuthScreen] = useState(null)
  const [dark, setDark] = useState(localStorage.getItem('msim_dark') === '1')
  const [lang, setLang] = useState(localStorage.getItem('msim_lang') || 'fr')

  useEffect(() => {
    try {
      const qp = new URLSearchParams(window.location.search)
      const t = qp.get('token')
      if (t) {
        localStorage.setItem('msim_token', t)
        setToken(t)
        setAuthScreen(null)
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, document.title, url.toString())
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('app-dark', dark)
    localStorage.setItem('msim_dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    localStorage.setItem('msim_lang', lang)
  }, [lang])

  const onLoginSuccess = (t) => {
    if (t) localStorage.setItem('msim_token', t)
    setToken(t || localStorage.getItem('msim_token'))
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
        onClick={() => setDark((d) => !d)}
        title={dark ? 'Light mode' : 'Dark mode'}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? (
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

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
            onSignupSuccess={onLoginSuccess}
            switchToLogin={() => setAuthScreen('login')}
            onDismiss={() => setAuthScreen(null)}
          />
        </div>
      )}
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
