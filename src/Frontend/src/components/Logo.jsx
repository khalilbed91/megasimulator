import React from 'react'

/**
 * Site mark: `public/brand-mark.png` (wide monogram, transparent).
 * `size` = display height in CSS pixels; width follows intrinsic aspect ratio.
 */
export default function Logo({ size = 44, ariaLabel = 'Mega simulateur', className = '' }) {
  return (
    <img
      src="/brand-mark.png?v=3"
      alt={ariaLabel}
      className={`logo-mark${className ? ` ${className}` : ''}`}
      style={{ height: size, width: 'auto', maxWidth: '100%' }}
      decoding="async"
    />
  )
}
