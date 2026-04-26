import React from 'react'
import { Helmet } from 'react-helmet-async'
import { PATH } from './paths'

const BRAND = 'MegaSimulator'

const PAGE_PATH = {
  payroll: PATH.payroll,
  retirement: PATH.retirement,
  loans: PATH.loans,
  savings: PATH.savings,
  insurance: PATH.insurance,
  contact: PATH.contact,
  history: PATH.history,
  account: PATH.account,
  mentions: PATH.legalMentions,
  privacy: PATH.privacy,
}

/** Tabs that expose interactive financial simulators — JSON-LD WebApplication + FinanceApplication. */
const SIMULATOR_PAGE_KEYS = new Set(['payroll', 'retirement', 'loans', 'savings', 'insurance'])

const META = {
  fr: {
    payroll: {
      title: `Simulateur salaire brut net & portage salarial | ${BRAND}`,
      description:
        'Convertissez salaire brut en net, estimez cotisations, prélèvement à la source et coût employeur. Simulation portage salarial et statuts non-cadre / cadre — modèle pédagogique France.',
      keywords:
        'salaire brut net, simulateur paie, simulation portage salarial, brut vers net, prélèvement à la source, coût employeur',
      schemaFeatures: [
        'Calcul salaire brut vers net et coût employeur',
        'Statuts non-cadre, cadre, freelance et portage salarial',
        'Prélèvement à la source et quotient familial (parts)',
        'Avantages en nature (tickets restaurant, transports, télétravail)',
      ],
    },
    retirement: {
      title: `Simulation retraite & pension nette | ${BRAND}`,
      description:
        'Estimez votre pension retraite nette (base + complémentaire), trimestres, décote et surcôte. Outil pédagogique pour projeter votre départ et votre niveau de vie.',
      keywords:
        'simulation retraite, pension retraite, simulateur retraite france, taux plein, trimestres retraite',
      schemaFeatures: [
        'Estimation pension nette (régime de base et complémentaire)',
        'Trimestres, décote et surcôte (modèle pédagogique)',
        'Projection indicative du niveau de vie à la retraite',
      ],
    },
    loans: {
      title: `Simulateur crédit immobilier & prêt consommation | ${BRAND}`,
      description:
        'Simulation de prêt immo (mensualités, notaire, PTZ, TVA réduite, Action Logement), auto et crédit conso. Indicateurs HCSF et coût total — usage pédagogique 2026.',
      keywords:
        'simulation crédit, simulateur prêt immobilier, PTZ, prêt conso, mensualités prêt',
      schemaFeatures: [
        'Prêt immobilier : mensualités, frais de notaire, PTZ, TVA réduite',
        'Prêts auto et consommation',
        'Coût total du crédit et indicateurs HCSF (pédagogique)',
      ],
    },
    savings: {
      title: `Objectif d’épargne & projet | ${BRAND}`,
      description:
        'Calculez le versement mensuel pour un objectif (inflation, Livret A), écart vs votre épargne actuelle et leviers budgétaires indicatifs — modèle pédagogique 2026.',
      keywords: 'simulation épargne, objectif épargne, livret a, inflation, budget',
      schemaFeatures: [
        'Versement mensuel pour atteindre un objectif d’épargne',
        'Hypothèses inflation et rendement type Livret A',
        'Écart par rapport à l’épargne actuelle et leviers budgétaires indicatifs',
      ],
    },
    insurance: {
      title: `Simulateur assurance habitation auto moto | ${BRAND}`,
      description:
        'Estimez une prime indicative d’assurance habitation, auto ou moto en France : obligations légales, responsabilité civile, garanties, franchise et bonus-malus.',
      keywords: 'simulateur assurance, assurance habitation, assurance auto, assurance moto, bonus malus',
      schemaFeatures: [
        'Habitation : risques locatifs, responsabilité civile, MRH',
        'Auto : tiers, tiers étendu, tous risques et bonus-malus',
        'Moto : responsabilité civile, vol/incendie, équipement et contrôle technique',
      ],
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
    mentions: {
      title: `Mentions légales | ${BRAND}`,
      description: 'Informations éditeur, hébergement et limitation de responsabilité — Mega simulateur.',
      keywords: 'mentions légales, éditeur, hébergement',
    },
    privacy: {
      title: `Politique de confidentialité | ${BRAND}`,
      description:
        'Traitement des données personnelles, cookies, droits RGPD et contact — Mega simulateur (megasimulateur.org).',
      keywords: 'politique confidentialité, rgpd, données personnelles',
    },
  },
  en: {
    payroll: {
      title: `Gross-to-net payroll & umbrella company simulator | ${BRAND}`,
      description:
        'Estimate net salary from gross, social contributions, withholding and employer cost. Includes umbrella / portage-style scenarios — educational model.',
      keywords: 'gross to net, payroll simulator, france salary calculator',
      schemaFeatures: [
        'Gross-to-net salary and employer cost',
        'Non-executive, executive, freelance and umbrella (portage) scenarios',
        'Withholding tax and household parts (quotient familial)',
        'Benefits in kind (meal vouchers, commuting, remote work)',
      ],
    },
    retirement: {
      title: `Retirement & pension estimator | ${BRAND}`,
      description:
        'Project net pension, quarters, and replacement rate with a simplified educational model.',
      keywords: 'retirement simulator, pension estimate',
      schemaFeatures: [
        'Net pension estimate (base + complementary)',
        'Quarters, discount and premium (simplified model)',
        'Indicative retirement income projection',
      ],
    },
    loans: {
      title: `Mortgage & consumer loan simulator | ${BRAND}`,
      description:
        'Mortgage (fees, PTZ, Action Logement hints), car and personal loans — educational tool.',
      keywords: 'loan simulator, mortgage calculator',
      schemaFeatures: [
        'Mortgage: payments, notary fees, PTZ, reduced VAT where applicable',
        'Car and personal loans',
        'Total borrowing cost and HCSF-style indicators (educational)',
      ],
    },
    savings: {
      title: `Savings goal & project planner | ${BRAND}`,
      description:
        'Monthly savings needed for a target (inflation, regulated yield), gap vs current savings and indicative budget levers — 2026 educational model.',
      keywords: 'savings goal, savings calculator, inflation, budget',
      schemaFeatures: [
        'Monthly savings needed to reach a goal',
        'Inflation and regulated-savings yield assumptions',
        'Gap vs current savings and indicative budget levers',
      ],
    },
    insurance: {
      title: `Home, car and motorcycle insurance simulator | ${BRAND}`,
      description:
        'Indicative insurance premium estimate for France: home, car and motorcycle obligations, liability cover, deductibles and no-claim coefficient.',
      keywords: 'insurance simulator france, home insurance, car insurance, motorcycle insurance',
      schemaFeatures: [
        'Home insurance obligations and coverage levels',
        'Car insurance third-party / extended / all-risk scenarios',
        'Motorcycle insurance, theft/fire and rider equipment',
      ],
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
    mentions: {
      title: `Legal notices | ${BRAND}`,
      description: 'Publisher information, hosting, disclaimer — Mega simulateur.',
      keywords: 'legal notices, imprint',
    },
    privacy: {
      title: `Privacy policy | ${BRAND}`,
      description: 'How we process personal data, cookies, and your GDPR rights.',
      keywords: 'privacy policy, gdpr',
    },
  },
}

function schemaAppName(title) {
  const suffix = ` | ${BRAND}`
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title
}

export default function SeoHead({ pageKey, lang }) {
  const L = lang === 'en' ? 'en' : 'fr'
  const m = META[L][pageKey] || META[L].payroll
  const path = PAGE_PATH[pageKey] || PATH.payroll
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const canonical = origin && path ? `${origin}${path}` : ''

  const isLegal = pageKey === 'mentions' || pageKey === 'privacy'
  const isFinanceSimulator = SIMULATOR_PAGE_KEYS.has(pageKey)

  let jsonLd
  if (isLegal) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: m.title,
      description: m.description,
    }
  } else if (isFinanceSimulator) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': ['WebApplication', 'SoftwareApplication'],
      name: schemaAppName(m.title),
      description: m.description,
      inLanguage: L === 'en' ? 'en' : 'fr',
      applicationCategory: 'https://schema.org/FinanceApplication',
      applicationSubCategory: 'Payroll and financial calculator',
      operatingSystem: 'Web browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      featureList: m.schemaFeatures || [],
    }
    if (origin) jsonLd.image = `${origin}/brand-mark.png?v=3`
  } else {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: m.title,
      description: m.description,
    }
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
      {origin ? <meta property="og:image" content={`${origin}/brand-mark.png?v=3`} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      {origin ? <meta name="twitter:image" content={`${origin}/brand-mark.png?v=3`} /> : null}
      <meta name="twitter:title" content={m.title} />
      <meta name="twitter:description" content={m.description} />
      <meta name="robots" content="index, follow" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
