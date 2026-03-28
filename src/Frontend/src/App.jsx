import React, { useState } from 'react'

export default function App(){
  const [brut, setBrut] = useState(3000)
  const [statut, setStatut] = useState('non-cadre')
  const [result, setResult] = useState(null)
  const callPayroll = async () => {
    try{
      const res = await fetch('http://localhost:5000/api/payroll/brut-to-net', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Brut: brut, Statut: statut })
      })
      const json = await res.json()
      setResult(json)
    }catch(e){
      setResult({ error: e.message })
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Payroll Test</h2>
      <div>
        <label>Brut: </label>
        <input type="number" value={brut} onChange={e=>setBrut(Number(e.target.value))} />
      </div>
      <div>
        <label>Statut: </label>
        <select value={statut} onChange={e=>setStatut(e.target.value)}>
          <option value="non-cadre">non-cadre</option>
          <option value="cadre">cadre</option>
        </select>
      </div>
      <button onClick={callPayroll} style={{ marginTop: 10 }}>Compute Brut→Net</button>
      <pre style={{ marginTop: 10 }}>{result ? JSON.stringify(result, null, 2) : 'No result yet'}</pre>
    </div>
  )
}
