import React from 'react'

/** Short visible copy for crawlers and users — does not replace simulator logic. */
const INTRO = {
  fr: {
    payroll:
      'Simulation salaire brut vers net, cadre ou non-cadre, avec option foyer fiscal ou taux de prélèvement. Inclut une approche pédagogique du portage salarial et du coût total employeur.',
    retirement:
      'Estimation indicative de pension nette à partir de votre année de naissance, trimestres cotisés et salaire de référence — utile pour comparer un départ à l’âge légal ou avec décote / surcôte.',
    loans:
      'Calculez mensualités et coût d’un projet : prêt immobilier (frais de notaire, TVA neuf, PTZ, Action Logement), crédit auto ou prêt personnel — repères HCSF inclus à titre pédagogique.',
    savings:
      'L’épargne réglementée et les placements seront prochainement intégrés sous forme de simulateurs pédagogiques.',
    default: '',
  },
  en: {
    payroll:
      'Educational gross-to-net calculator with French payroll rules, optional withholding and umbrella-style scenarios.',
    retirement:
      'Simplified retirement projection: net pension, quarters, and basic décote/surcote hints for planning.',
    loans:
      'Educational loan math for mortgages (fees, PTZ, Action Logement), auto and consumer loans.',
    savings: 'Savings tools are coming soon.',
    default: '',
  },
}

export default function SeoIntro({ tab, lang }) {
  const L = lang === 'en' ? 'en' : 'fr'
  if (tab === 'contact' || tab === 'history' || tab === 'account') return null

  const text = INTRO[L][tab] || INTRO[L].default
  if (!text) return null

  return (
    <section className="seo-intro" aria-label={L === 'fr' ? 'À propos de cette page' : 'About this page'}>
      <p>{text}</p>
    </section>
  )
}
