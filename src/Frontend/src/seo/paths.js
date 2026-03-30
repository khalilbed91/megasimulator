/** French SEO-oriented paths (primary). Sync with App.jsx redirects and public/sitemap.xml. */

export const PATH = {
  payroll: '/simulateur-paie-brut-net',
  retirement: '/simulation-retraite',
  loans: '/simulation-credit-pret',
  savings: '/simulation-epargne',
  contact: '/contact',
  history: '/historique',
  account: '/mon-compte',
}

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

export function pathToTab(pathname) {
  return _pathToTab[normalizePath(pathname)] ?? null
}

export function pathForTab(tab) {
  return TAB_TO_PATH[tab] ?? PATH.payroll
}
