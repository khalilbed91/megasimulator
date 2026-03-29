import React from 'react'

export default function Logo({ size = 84, ariaLabel = 'Mega Simulator', className='' }){
  const w = size
  const view = 84
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${view} ${view}`} width={w} height={w} role="img" aria-label={ariaLabel} className={className}>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width={view} height={view} rx="16" fill="url(#g1)" />
      {/* wallet body: dark body, flap, clasp */}
      <g transform="translate(10,22)" aria-hidden="true">
        <rect x="0" y="6" width="56" height="28" rx="6" fill="#0b1220" />
        <rect x="0" y="6" width="46" height="10" rx="5" fill="#0e1726" />
        <rect x="44" y="14" width="8" height="8" rx="2" fill="#f59e0b" />
        <path d="M6 22h34" stroke="#111827" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      </g>
      {/* bill emerging from wallet */}
      <g transform="translate(34,6) rotate(-8 16 14)">
        <rect x="2" y="8" width="36" height="20" rx="3" fill="#fff" opacity="0.95" />
        <rect x="4" y="10" width="32" height="16" rx="2" fill="#e6f2ff" />
        <text x="20" y="22" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="14" fill="#0b1220">$</text>
      </g>
    </svg>
  )
}
