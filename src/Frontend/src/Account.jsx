import React, { useEffect, useState } from 'react'

export default function Account({ token, lang = 'en' }){
  const t = {
    fr: { title: 'Compte', firstName: 'Prénom', lastName: 'Nom', phone: 'Téléphone', email: 'Email', save: 'Enregistrer', reset: 'Réinitialiser le mot de passe', loading: 'Chargement...', notSigned: "Non connecté" },
    en: { title: 'Account', firstName: 'First name', lastName: 'Last name', phone: 'Phone', email: 'Email', save: 'Save', reset: 'Reset password', loading: 'Loading...', notSigned: 'Not signed in' }
  }[lang || 'en']
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      const t = token || localStorage.getItem('msim_token')
      if (!t) { setLoading(false); return }
      try{
        const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + t } })
        if (!res.ok) { setLoading(false); return }
        const j = await res.json()
        setUserId(j.id)
        setEmail(j.email || '')
        setFirstName(j.firstName || j.username || '')
        setLastName(j.lastName || '')
        setPhone(j.phone || '')
      }catch(e){
        setMessage('Error loading user data')
      }finally{ setLoading(false) }
    }
    load()
  }, [])

  const save = async () => {
    setMessage(null)
    if (!userId) { setMessage('Not signed in'); return }
    try{
      const t = token || localStorage.getItem('msim_token')
      const dto = { Id: userId, Username: (firstName || lastName) ? `${firstName} ${lastName}`.trim() : email, Email: email, FirstName: firstName, LastName: lastName, Phone: phone }
      const res = await fetch('/api/user/' + userId, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify(dto) })
      if (!res.ok) throw new Error('Update failed')
      setMessage('Saved')
    } catch (e) {
      setMessage('Error: ' + e.message)
    }
  }

  const resetPassword = async () => {
    const oldp = prompt('Enter current password (leave empty to cancel)')
    if (!oldp) return
    const newp = prompt('Enter new password (min 6 chars)')
    if (!newp) return
    if (newp.length < 6) { alert('Password must be at least 6 characters'); return }
    try{
      const t = token || localStorage.getItem('msim_token')
      const res = await fetch('/api/user/' + userId + '/password', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ oldPassword: oldp, newPassword: newp }) })
      if (!res.ok) throw new Error('Password change failed')
      setMessage('Password updated')
    }catch(e){ setMessage('Error: ' + e.message) }
  }

  if (loading) return <div className="p-4">{t.loading}</div>
  if (!userId) return <div className="p-4">{t.notSigned}</div>

  return (
    <div className="d-flex justify-content-center p-4">
      <div className="card p-3" style={{width:640}}>
        <h4>{t.title}</h4>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label">{t.firstName}</label>
            <input className="form-control" value={firstName} onChange={e=>setFirstName(e.target.value)} />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label">{t.lastName}</label>
            <input className="form-control" value={lastName} onChange={e=>setLastName(e.target.value)} />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label">{t.phone}</label>
            <input className="form-control" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label">{t.email}</label>
            <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
        </div>
        <div className="mt-2">
          <button className="btn btn-primary" onClick={save}>{t.save}</button>
          <button className="btn btn-secondary ms-2" onClick={resetPassword}>{t.reset}</button>
          {message && <span className="ms-3 text-muted">{message}</span>}
        </div>
      </div>
    </div>
  )
}
