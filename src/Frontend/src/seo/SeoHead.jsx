import React from 'react'
import { Helmet } from 'react-helmet-async'
import { pathForTab } from './paths'

const BRAND = 'MegaSimulator'

const META = {
  fr: {
    payroll: {
      title: `Simulateur salaire brut net & portage salarial | ${BRAND}`,
      description:
        'Convertissez salaire brut en net, estimez cotisations, prélèvement à la source et coût employeur. Simulation portage salarial et statuts non-cadre / cadre — modèle pédagogique France.',
      keywords:
        'salaire brut net, simulateur paie, simulation portage salarial, brut vers net, prélèvement à la source, coût employeur',
    },
    retirement: {
      title: `Simulation retraite & pension nette | ${BRAND}`,
      description:
        'Estimez votre pension retraite nette (base + complémentaire), trimestres, décote et surcôte. Outil pédagogique pour projeter votre départ et votre niveau de vie.',
      keywords:
        'simulation retraite, pension retraite, simulateur retraite france, taux plein, trimestres retraite',
    },
    loans: {
      title: `Simulateur crédit immobilier & prêt consommation | ${BRAND}`,
      description:
        'Simulation de prêt immo (mensualités, notaire, PTZ, TVA réduite, Action Logement), auto et crédit conso. Indicateurs HCSF et coût total — usage pédagogique 2026.',
      keywords:
        'simulation crédit, simulateur prêt immobilier, PTZ, prêt conso, mensualités prêt',
    },
    savings: {
      title: `Simulation épargne (à venir) | ${BRAND}`,
      description:
        'Module épargne et placements en préparation — suivez MegaSimulator pour livrets, assurance-vie et projet patrimonial.',
      keywords: 'simulation épargne, livret, placement, patrimoine',
    },
    contact: {
      title: `Contact | ${BRAND}`,
      description:
        'Écrivez à l’équipe MegaSimulator : questions sur les simulateurs paie, retraite ou prêts, ou suggestions produit.',
      keywords: 'contact megasimulator, aide simulateur',
    },
    history: {
      title: `Historique de vos simulations | ${BRAND}`,
      description:
        'Retrouvez vos simulations de paie, retraite et prêts enregistrées lorsque vous êtes connecté.',
      keywords: 'historique simulation, compte utilisateur',
    },
    account: {
      title: `Mon compte | ${BRAND}`,
      description:
        'Gérez votre profil MegaSimulator : coordonnées et préférences liées à votre compte.',
      keywords: 'compte megasimulator, profil utilisateur',
    },
  },
  en: {
    payroll: {
      title: `Gross-to-net payroll & umbrella company simulator | ${BRAND}`,
      description:
        'Estimate net salary from gross, social contributions, withholding and employer cost. Includes umbrella / portage-style scenarios — educational model.',
      keywords: 'gross to net, payroll simulator, france salary calculator',
    },
    retirement: {
      title: `Retirement & pension estimator | ${BRAND}`,
      description:
        'Project net pension, quarters, and replacement rate with a simplified educational model.',
      keywords: 'retirement simulator, pension estimate',
    },
    loans: {
      title: `Mortgage & consumer loan simulator | ${BRAND}`,
      description:
        'Mortgage (fees, PTZ, Action Logement hints), car and personal loans — educational tool.',
      keywords: 'loan simulator, mortgage calculator',
    },
    savings: {
      title: `Savings module (coming soon) | ${BRAND}`,
      description: 'Savings and investment simulation module coming soon to MegaSimulator.',
      keywords: 'savings simulator',
    },
    contact: {
      title: `Contact | ${BRAND}`,
      description: 'Contact the MegaSimulator team for product questions or feedback.',
      keywords: 'contact',
    },
    history: {
      title: `Your simulation history | ${BRAND}`,
      description: 'View saved payroll, retirement and loan simulations when signed in.',
      keywords: 'history',
    },
    account: {
      title: `My account | ${BRAND}`,
      description: 'Manage your MegaSimulator profile and preferences.',
      keywords: 'account',
    },
  },
}

export default function SeoHead({ tab, lang }) {
  const L = lang === 'en' ? 'en' : 'fr'
  const m = META[L][tab] || META[L].payroll
  const path = pathForTab(tab)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const canonical = origin && path ? `${origin}${path}` : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: BRAND,
    description: m.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }
  if (canonical) jsonLd.url = canonical

  return (
    <Helmet prioritizeSeoTags htmlAttributes={{ lang: L }}>
      <title>{m.title}</title>
      <meta name="description" content={m.description} />
      {m.keywords ? <meta name="keywords" content={m.keywords} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={m.title} />
      <meta property="og:description" content={m.description} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={m.title} />
      <meta name="twitter:description" content={m.description} />
      <meta name="robots" content="index, follow" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
