import React, { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { PATH } from './paths'
import { PATH_GUIDES } from './guidePaths'
import { GUIDE_PAGES } from '../guides/guideContent.jsx'

const BRAND = 'MegaSimulator'

function financeWebAppNode(toolPath, toolUrl, L) {
  const id = `${toolUrl || toolPath}#tool`
  const common = {
    '@type': ['WebApplication', 'SoftwareApplication'],
    '@id': id,
    url: toolUrl || toolPath,
    applicationCategory: 'https://schema.org/FinanceApplication',
    operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }
  if (toolPath === PATH.retirement) {
    return {
      ...common,
      name: L === 'en' ? 'MegaSimulator retirement simulator' : 'Simulateur retraite MegaSimulator',
      applicationSubCategory: 'Retirement and pension calculator',
    }
  }
  if (toolPath === PATH.loans) {
    return {
      ...common,
      name: L === 'en' ? 'MegaSimulator loan simulator' : 'Simulateur prêt MegaSimulator',
      applicationSubCategory: 'Mortgage and loan calculator',
    }
  }
  if (toolPath === PATH.insurance) {
    return {
      ...common,
      name: L === 'en' ? 'MegaSimulator insurance simulator' : 'Simulateur assurance MegaSimulator',
      applicationSubCategory: 'Insurance premium calculator',
    }
  }
  return {
    ...common,
    name: L === 'en' ? 'MegaSimulator payroll simulator' : 'Simulateur de paie MegaSimulator',
    applicationSubCategory: 'Payroll and financial calculator',
  }
}

function articleAboutThing(toolPath, L) {
  if (toolPath === PATH.retirement) {
    return {
      '@type': 'Thing',
      name: L === 'en' ? 'French public retirement pension (simplified)' : 'Retraite et pension en France (modèle simplifié)',
    }
  }
  if (toolPath === PATH.loans) {
    return {
      '@type': 'Thing',
      name: L === 'en' ? 'French mortgage, PTZ and loan costs' : 'Crédit immobilier, PTZ et coût des prêts en France',
    }
  }
  if (toolPath === PATH.insurance) {
    return {
      '@type': 'Thing',
      name: L === 'en' ? 'Home, car and motorcycle insurance in France' : 'Assurance habitation, auto et moto en France',
    }
  }
  return {
    '@type': 'Thing',
    name: L === 'en' ? 'French payroll and freelance net pay' : 'Salaire net et statuts en France',
  }
}

export default function SeoHeadGuide({ guideId, lang }) {
  const L = lang === 'en' ? 'en' : 'fr'
  const page = GUIDE_PAGES[guideId]
  const meta = page?.[L]
  if (!page || !meta) return null

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const canonical = origin && page.path ? `${origin}${page.path}` : ''
  const toolPath = guideId !== 'index' && page.simulatorPath ? page.simulatorPath : PATH.payroll
  const toolUrl = origin ? `${origin}${toolPath}` : ''
  const homeCanonical = origin ? `${origin}/` : ''
  const guidesIndexUrl = origin ? `${origin}${PATH_GUIDES.index}` : PATH_GUIDES.index

  const jsonLd = useMemo(() => {
    const payrollCanonical = origin ? `${origin}${PATH.payroll}` : ''
    const payrollApp = financeWebAppNode(PATH.payroll, payrollCanonical || PATH.payroll, L)

    if (guideId === 'index') {
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: meta.metaTitle,
        description: meta.description,
        url: canonical || undefined,
        inLanguage: L === 'en' ? 'en' : 'fr',
        isPartOf: homeCanonical ? { '@type': 'WebSite', url: homeCanonical, name: BRAND } : undefined,
        about: payrollApp,
      }
    }

    const relatedApp = financeWebAppNode(toolPath, toolUrl || toolPath, L)

    const article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.headline,
      name: meta.metaTitle,
      description: meta.description,
      datePublished: page.datePublished || '2026-04-03',
      dateModified: page.datePublished || '2026-04-03',
      inLanguage: L === 'en' ? 'en' : 'fr',
      author: {
        '@type': 'Organization',
        name: BRAND,
        url: homeCanonical || undefined,
      },
      publisher: {
        '@type': 'Organization',
        name: BRAND,
        url: homeCanonical || undefined,
      },
      mainEntityOfPage: canonical ? { '@type': 'WebPage', '@id': canonical } : undefined,
      isRelatedTo: { '@id': relatedApp['@id'] },
      about: articleAboutThing(toolPath, L),
    }
    if (origin) article.image = `${origin}/brand-mark.png?v=3`

    const crumbs = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: L === 'en' ? 'Home' : 'Accueil', item: homeCanonical || '/' },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: guidesIndexUrl },
        { '@type': 'ListItem', position: 3, name: meta.headline, item: canonical || page.path },
      ],
    }

    return { '@context': 'https://schema.org', '@graph': [article, relatedApp, crumbs] }
  }, [L, canonical, guideId, meta, origin, page, homeCanonical, guidesIndexUrl, toolPath, toolUrl])

  return (
    <Helmet prioritizeSeoTags htmlAttributes={{ lang: L }}>
      <title>{meta.metaTitle}</title>
      <meta name="description" content={meta.description} />
      {meta.keywords ? <meta name="keywords" content={meta.keywords} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:type" content={guideId === 'index' ? 'website' : 'article'} />
      <meta property="og:title" content={meta.metaTitle} />
      <meta property="og:description" content={meta.description} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {origin ? <meta property="og:image" content={`${origin}/brand-mark.png?v=3`} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      {origin ? <meta name="twitter:image" content={`${origin}/brand-mark.png?v=3`} /> : null}
      <meta name="twitter:title" content={meta.metaTitle} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="robots" content="index, follow" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
