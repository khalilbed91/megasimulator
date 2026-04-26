import React from 'react'
import { getGeoFaq } from './geoFaq'

export default function GeoFaqBlock({ tab, lang }) {
  const L = lang === 'en' ? 'en' : 'fr'
  const items = getGeoFaq(tab, L)
  if (!items.length) return null

  return (
    <section className="geo-faq" aria-label={L === 'en' ? 'Frequently asked questions' : 'Questions fréquentes'}>
      <div className="geo-faq-eyebrow">{L === 'en' ? 'Quick answers' : 'Réponses rapides'}</div>
      <h2 className="geo-faq-title">
        {L === 'en' ? 'What to know before using this simulator' : 'À savoir avant d’utiliser ce simulateur'}
      </h2>
      <div className="geo-faq-grid">
        {items.map((item) => (
          <article key={item.question} className="geo-faq-card">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
