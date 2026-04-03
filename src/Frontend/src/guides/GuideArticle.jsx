import React from 'react'
import { Link } from 'react-router-dom'
import { PATH } from '../seo/paths'
import { PATH_GUIDES } from '../seo/guidePaths'
import { GUIDE_PAGES } from './guideContent.jsx'

export default function GuideArticle({ guideId, lang }) {
  const L = lang === 'en' ? 'en' : 'fr'
  const page = GUIDE_PAGES[guideId]
  const meta = page?.[L]
  if (!page || !meta || guideId === 'index') return null

  return (
    <div className="guide-wrap">
      <article className="page-panel-card guide-article">
        <nav className="guide-breadcrumb" aria-label={L === 'en' ? 'Breadcrumb' : 'Fil d’Ariane'}>
          <Link to={PATH_GUIDES.index}>{L === 'en' ? 'Guides' : 'Guides'}</Link>
          <span aria-hidden="true"> / </span>
          <span className="guide-breadcrumb-current">{meta.topbarTitle}</span>
        </nav>

        <h2 className="page-panel-title guide-article-title">{meta.headline}</h2>

        {meta.sections.map((sec, i) => (
          <section key={i} className="guide-section">
            <h3 className="guide-section-title">{sec.h2}</h3>
            <div className="guide-prose">{sec.body}</div>
          </section>
        ))}

        <div className="guide-actions page-panel-actions">
          <Link to={page.simulatorPath || PATH.payroll} className="btn-primary">
            {meta.ctaSimulator ||
              (L === 'en' ? 'Run the payroll simulator' : 'Lancer le simulateur de paie')}
          </Link>
          <Link to={PATH_GUIDES.index} className="btn-ghost">
            {L === 'en' ? 'All guides' : 'Tous les guides'}
          </Link>
        </div>
      </article>
    </div>
  )
}
