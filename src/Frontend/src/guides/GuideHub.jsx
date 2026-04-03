import React from 'react'
import { Link } from 'react-router-dom'
import { PATH } from '../seo/paths'
import { GUIDE_PAGES, GUIDE_ARTICLE_IDS } from './guideContent.jsx'

export default function GuideHub({ lang }) {
  const L = lang === 'en' ? 'en' : 'fr'
  const hub = GUIDE_PAGES.index[L]

  return (
    <div className="guide-wrap">
      <article className="page-panel-card guide-article">
        <h2 className="page-panel-title guide-article-title">{hub.headline}</h2>
        <p className="page-panel-desc guide-article-lead">{hub.lead}</p>

        <ul className="guide-hub-list">
          {GUIDE_ARTICLE_IDS.map((id) => {
            const g = GUIDE_PAGES[id][L]
            return (
              <li key={id}>
                <Link to={GUIDE_PAGES[id].path} className="guide-hub-card">
                  <span className="guide-hub-card-title">{g.headline}</span>
                  <span className="guide-hub-card-desc">{g.description}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="guide-hub-footer">
          <Link to={PATH.payroll} className="btn-primary guide-hub-cta">
            {L === 'en' ? 'Open payroll simulator' : 'Ouvrir le simulateur de paie'}
          </Link>
        </p>
      </article>
    </div>
  )
}
