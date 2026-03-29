import React, { useState } from 'react'

export default function Contact(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try{
      // Best-effort: call backend contact endpoint if exists, otherwise show success
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, email, message }) })
      if (!res.ok) throw new Error('Server error')
      setStatus('sent')
      setName(''); setEmail(''); setMessage('')
    }catch(e){
      // fallback: open mail client
      window.location.href = `mailto:support@m-simulator.com?subject=${encodeURIComponent('Contact from ' + name)}&body=${encodeURIComponent(message + '\n\nFrom: ' + email)}`
      setStatus('fallback')
    }
  }

  return (
    <div className="d-flex justify-content-center p-4">
      <div className="card p-3" style={{maxWidth:720}}>
        <h4>Contact</h4>
        <p className="text-muted">Need help or found an issue? Send us a message and we'll reply shortly.</p>
        <form onSubmit={submit}>
          <div className="mb-2">
            <label className="form-label">Name</label>
            <input className="form-control" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="mb-2">
            <label className="form-label">Email</label>
            <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div className="mb-2">
            <label className="form-label">Message</label>
            <textarea className="form-control" rows={6} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe your request or issue"></textarea>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-primary" type="submit">Send message</button>
            {status === 'sending' && <div className="text-muted small">Sending…</div>}
            {status === 'sent' && <div className="text-success small">Message sent — thanks!</div>}
            {status === 'fallback' && <div className="text-warning small">Opened mail client as fallback.</div>}
          </div>
        </form>
      </div>
    </div>
  )
}
