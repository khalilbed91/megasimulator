import React from 'react'

export default function ExternalNextStep({ title, description, href, label, note }) {
  if (!href) return null

  return (
    <aside className="external-next-step" aria-label={title}>
      <div>
        <div className="external-next-step-title">{title}</div>
        {description && <p>{description}</p>}
        {note && <div className="external-next-step-note">{note}</div>}
      </div>
      <a className="external-next-step-link" href={href} target="_blank" rel="noopener noreferrer">
        {label}
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </aside>
  )
}
