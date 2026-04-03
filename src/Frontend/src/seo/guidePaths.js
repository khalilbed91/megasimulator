/** Guides SEO longue traîne — URLs canoniques FR (contenu EN via langue UI). */

function normalizeGuidePath(p) {
  if (!p || p === '/') return '/'
  return p.replace(/\/+$/, '') || '/'
}

export const PATH_GUIDES = {
  index: '/guides',
  salarieFreelanceNet2026: '/guides/salarie-freelance-net-2026',
  portageVsMicro2026: '/guides/portage-salarial-vs-auto-entrepreneur-2026',
}

const _guidePathToId = {
  [normalizeGuidePath(PATH_GUIDES.index)]: 'index',
  [normalizeGuidePath(PATH_GUIDES.salarieFreelanceNet2026)]: 'salarieFreelanceNet2026',
  [normalizeGuidePath(PATH_GUIDES.portageVsMicro2026)]: 'portageVsMicro2026',
}

/** `index` | guide id | null */
export function pathToGuideId(pathname) {
  return _guidePathToId[normalizeGuidePath(pathname)] ?? null
}

/** URLs guide pour sitemap.xml */
export const GUIDE_SITEMAP_PATHS = [
  PATH_GUIDES.index,
  PATH_GUIDES.salarieFreelanceNet2026,
  PATH_GUIDES.portageVsMicro2026,
]
