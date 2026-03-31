import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PATH } from '../seo/paths'
import './legal.css'

const STORAGE_KEY = 'msim_cookie_info_ack_v1'

const COPY = {
  fr: {
    text: (
      <>
        Nous utilisons le stockage local nécessaire au fonctionnement du site (ex. session) et, si vous utilisez la connexion Google, des scripts Google (cookies techniques de session). Aucun cookie publicitaire ou de mesure d’audience non essentiel n’est déposé sans évolution ultérieure de cette politique.{' '}
        <Link to={PATH.privacy}>Politique de confidentialité</Link>.
      </>
    ),
    accept: 'J’ai compris',
    privacy: 'Confidentialité',
  },
  en: {
    text: (
      <>
        We use local storage needed for the site (e.g. session) and, if you use Google sign-in, Google scripts (session cookies). We do not use advertising or non-essential analytics cookies unless this policy changes.{' '}
        <Link to={PATH.privacy}>Privacy policy</Link>.
      </>
    ),
    accept: 'OK',
    privacy: 'Privacy',
  },
}

export default function CookieBanner({ lang = 'fr' }) {
  const [visible, setVisible] = useState(false)
  const t = COPY[lang === 'en' ? 'en' : 'fr']

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={lang === 'en' ? 'Privacy notice' : 'Information confidentialité'}>
      <div className="cookie-banner-inner">
        <div className="cookie-banner-text">{t.text}</div>
        <div className="cookie-banner-actions">
          <Link to={PATH.privacy} className="cookie-banner-more" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '10px 16px' }}>
            {t.privacy}
          </Link>
          <button type="button" className="cookie-banner-accept" onClick={acknowledge}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
