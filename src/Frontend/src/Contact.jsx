import React, { useState } from 'react'

export default function Contact({ lang = 'en' }){
  const t = {
    fr: {
      title: 'Contact',
      help: "Besoin d'aide ou un problème ? Envoyez-nous un message.",
      name: 'Nom', email: 'Email', message: 'Message', send: 'Envoyer',
      sending: 'Envoi…', sent: 'Message envoyé, merci !',
      errorSend: "L'envoi a échoué. Réessayez dans quelques instants. Il n'y a pas d'e-mail de secours : le formulaire doit fonctionner.",
    },
    en: {
      title: 'Contact',
      help: 'Need help or found an issue? Send us a message.',
      name: 'Name', email: 'Email', message: 'Message', send: 'Send message',
      sending: 'Sending…', sent: 'Message sent — thanks!', fallback: 'Opened mail client as fallback.',
    },
  }[lang || 'en']
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try{
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, email, message }) })
      if (!res.ok) throw new Error('Server error')
      setStatus('sent')
      setName(''); setEmail(''); setMessage('')
    }catch{
      setStatus('error')
    }
  }

  return (
    <div className="page-panel">
      <div className="page-panel-card">
        <h1 className="page-panel-title">{t.title}</h1>
        <p className="page-panel-desc">{t.help}</p>
        <form onSubmit={submit}>
          <div className="field-group" style={{ marginBottom: 14 }}>
            <label className="field-label" htmlFor="ct-name">{t.name}</label>
            <input id="ct-name" className="field-input" value={name} onChange={e=>setName(e.target.value)} placeholder={t.name} required />
          </div>
          <div className="field-group" style={{ marginBottom: 14 }}>
            <label className="field-label" htmlFor="ct-email">{t.email}</label>
            <input id="ct-email" className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.email} required />
          </div>
          <div className="field-group" style={{ marginBottom: 14 }}>
            <label className="field-label" htmlFor="ct-msg">{t.message}</label>
            <textarea id="ct-msg" className="field-input" rows={6} value={message} onChange={e=>setMessage(e.target.value)} placeholder={t.message} required style={{ resize: 'vertical', minHeight: 120 }} />
          </div>
          <div className="page-panel-actions">
            <button type="submit" className="btn-primary-custom">{t.send}</button>
            {status === 'sending' && <span className="page-panel-message">{t.sending}</span>}
            {status === 'sent' && <span className="page-panel-message page-panel-message--ok">{t.sent}</span>}
            {status === 'error' && <span className="page-panel-message page-panel-message--err">{t.errorSend}</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
