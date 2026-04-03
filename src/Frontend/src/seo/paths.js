/** French SEO-oriented paths (primary). Sync with App.jsx redirects and vite sitemap generation. */

import { GUIDE_SITEMAP_PATHS } from './guidePaths.js'

export const PATH = {
  payroll: '/simulateur-paie-brut-net',
  retirement: '/simulation-retraite',
  loans: '/simulation-credit-pret',
  savings: '/simulation-epargne',
  contact: '/contact',
  history: '/historique',
  account: '/mon-compte',
  legalMentions: '/mentions-legales',
  privacy: '/politique-de-confidentialite',
}

/**
 * Public URLs for sitemap.xml / sitemap.txt (indexable). Omit login-only pages (historique, mon-compte).
 */
export const SITEMAP_PATHS = [
  '/',
  PATH.payroll,
  PATH.retirement,
  PATH.loans,
  PATH.savings,
  PATH.contact,
  PATH.legalMentions,
  PATH.privacy,
  ...GUIDE_SITEMAP_PATHS,
]

export const TAB_TO_PATH = {
  payroll: PATH.payroll,
  retirement: PATH.retirement,
  loans: PATH.loans,
  savings: PATH.savings,
  contact: PATH.contact,
  history: PATH.history,
  account: PATH.account,
}

const _pathToTab = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, p]) => [normalizePath(p), tab])
)

function normalizePath(p) {
  if (!p || p === '/') return '/'
  return p.replace(/\/+$/, '') || '/'
}

const _legalPaths = {
  [normalizePath(PATH.legalMentions)]: 'mentions',
  [normalizePath(PATH.privacy)]: 'privacy',
}

/** Pages légales (hors onglets simulateur). */
export function pathToLegalPage(pathname) {
  return _legalPaths[normalizePath(pathname)] ?? null
}

export function pathToTab(pathname) {
  return _pathToTab[normalizePath(pathname)] ?? null
}

export function pathForTab(tab) {
  return TAB_TO_PATH[tab] ?? PATH.payroll
}
