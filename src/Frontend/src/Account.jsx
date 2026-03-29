import React, { useEffect, useState } from 'react'

export default function Account({ token, lang = 'en', onRequestLogin, onRequestSignup }){
  const t = {
    fr: {
      title: 'Mon compte',
      firstName: 'Prénom', lastName: 'Nom', phone: 'Téléphone', email: 'Email',
      save: 'Enregistrer', reset: 'Changer le mot de passe', loading: 'Chargement…', notSigned: 'Vous n’êtes pas connecté.',
      loginCta: 'Se connecter', signupCta: 'Créer un compte',
      saved: 'Enregistré', promptOld: 'Mot de passe actuel', promptNew: 'Nouveau mot de passe (min. 6 caractères)',
    },
    en: {
      title: 'Account',
      firstName: 'First name', lastName: 'Last name', phone: 'Phone', email: 'Email',
      save: 'Save', reset: 'Change password', loading: 'Loading…', notSigned: 'You are not signed in.',
      loginCta: 'Sign in', signupCta: 'Create account',
      saved: 'Saved', promptOld: 'Current password', promptNew: 'New password (min 6 chars)',
    },
  }[lang || 'en']

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [messageKind, setMessageKind] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      const tok = token || localStorage.getItem('msim_token')
      if (!tok) { setUserId(null); setLoading(false); return }
      try{
        const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + tok } })
        if (!res.ok) { setUserId(null); setLoading(false); return }
        const j = await res.json()
        setUserId(j.id)
        setEmail(j.email || '')
        setFirstName(j.firstName || j.username || '')
        setLastName(j.lastName || '')
        setPhone(j.phone || '')
      }catch{
        setMessage('Error loading user data')
        setMessageKind('err')
      }finally{ setLoading(false) }
    }
    load()
  }, [token])

  const save = async () => {
    setMessage(null)
    if (!userId) { setMessage(t.notSigned); setMessageKind('err'); return }
    try{
      const tok = token || localStorage.getItem('msim_token')
      const dto = { Id: userId, Username: (firstName || lastName) ? `${firstName} ${lastName}`.trim() : email, Email: email, FirstName: firstName, LastName: lastName, Phone: phone }
      const res = await fetch('/api/user/' + userId, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify(dto) })
      if (!res.ok) throw new Error('Update failed')
      setMessage(t.saved)
      setMessageKind('ok')
    } catch (e) {
      setMessage('Error: ' + e.message)
      setMessageKind('err')
    }
  }

  const resetPassword = async () => {
    const oldp = window.prompt(t.promptOld)
    if (oldp == null || oldp === '') return
    const newp = window.prompt(t.promptNew)
    if (newp == null || newp === '') return
    if (newp.length < 6) { setMessage('Password must be at least 6 characters'); setMessageKind('err'); return }
    try{
      const tok = token || localStorage.getItem('msim_token')
      const res = await fetch('/api/user/' + userId + '/password', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify({ oldPassword: oldp, newPassword: newp }) })
      if (!res.ok) throw new Error('Password change failed')
      setMessage('Password updated')
      setMessageKind('ok')
    }catch(e){ setMessage('Error: ' + e.message); setMessageKind('err') }
  }

  if (loading) {
    return <div className="page-panel"><div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>{t.loading}</div></div>
  }

  if (!userId) {
    return (
      <div className="page-panel">
        <div className="page-panel-card">
          <h1 className="page-panel-title">{t.title}</h1>
          <p className="page-panel-desc">{t.notSigned}</p>
          <div className="page-panel-actions">
            <button type="button" className="btn-primary-custom" onClick={() => onRequestLogin?.()}>{t.loginCta}</button>
            <button type="button" className="btn-ghost" onClick={() => onRequestSignup?.()}>{t.signupCta}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-panel">
      <div className="page-panel-card">
        <h1 className="page-panel-title">{t.title}</h1>
        <p className="page-panel-desc" style={{ marginBottom: 20 }}>{email}</p>

        <div className="field-group" style={{ marginBottom: 14 }}>
          <label className="field-label" htmlFor="acc-fn">{t.firstName}</label>
          <input id="acc-fn" className="field-input" value={firstName} onChange={e=>setFirstName(e.target.value)} />
        </div>
        <div className="field-group" style={{ marginBottom: 14 }}>
          <label className="field-label" htmlFor="acc-ln">{t.lastName}</label>
          <input id="acc-ln" className="field-input" value={lastName} onChange={e=>setLastName(e.target.value)} />
        </div>
        <div className="field-group" style={{ marginBottom: 14 }}>
          <label className="field-label" htmlFor="acc-ph">{t.phone}</label>
          <input id="acc-ph" className="field-input" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div className="field-group" style={{ marginBottom: 14 }}>
          <label className="field-label" htmlFor="acc-em">{t.email}</label>
          <input id="acc-em" className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>

        <div className="page-panel-actions">
          <button type="button" className="btn-primary-custom" onClick={save}>{t.save}</button>
          <button type="button" className="btn-ghost" onClick={resetPassword}>{t.reset}</button>
        </div>
        {message && (
          <div className={`page-panel-message${messageKind === 'ok' ? ' page-panel-message--ok' : ''}${messageKind === 'err' ? ' page-panel-message--err' : ''}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
