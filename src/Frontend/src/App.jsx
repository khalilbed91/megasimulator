import React, { useEffect, useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import Home from './Home'
import './styles.css'

export default function App(){
  const [view, setView] = useState('login') // 'login' | 'signup' | 'app'
  const [token, setToken] = useState(localStorage.getItem('msim_token'))
  const [dark, setDark] = useState(localStorage.getItem('msim_dark') === '1')

  useEffect(()=>{
    // parse token from URL if present
    try{
      const qp = new URLSearchParams(window.location.search)
      const t = qp.get('token')
      if (t){
        localStorage.setItem('msim_token', t)
        setToken(t)
        setView('app')
        // remove token from url
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, document.title, url.toString())
      } else if (localStorage.getItem('msim_token')){
        setToken(localStorage.getItem('msim_token'))
        setView('app')
      }
    }catch(e){}
  }, [])

  useEffect(()=>{
    if (dark) document.body.classList.add('app-dark'); else document.body.classList.remove('app-dark')
    localStorage.setItem('msim_dark', dark ? '1' : '0')
  }, [dark])

  const onLoginSuccess = (t) => {
    setToken(t)
    setView('app')
  }

  const signOut = () => {
    localStorage.removeItem('msim_token')
    setToken(null)
    setView('login')
  }

  if (view === 'login') return <Login onLoginSuccess={onLoginSuccess} switchToSignup={()=>setView('signup')} />
  if (view === 'signup') return <Signup onSignupSuccess={onLoginSuccess} switchToLogin={()=>setView('login')} />

  return (
    <>
      <button className="dark-toggle" onClick={()=>setDark(d=>!d)}>{dark? 'Light' : 'Dark'}</button>
      <Home onSignOut={signOut} onRequestLogin={()=>setView('login')} />
    </>
  )
}
