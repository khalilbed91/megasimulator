import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITEMAP_PATHS } from './src/seo/paths.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function sitemapPriority(p) {
  if (p === '/' || p.includes('paie')) return '1.0'
  if (p.startsWith('/guides')) return '0.9'
  return '0.8'
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'megasimulator-seo-files',
      closeBundle() {
        const isProd = process.env.NODE_ENV === 'production'
        const fallbackBase = isProd ? 'https://megasimulateur.org' : 'http://localhost:5173'
        const rawBase = (process.env.VITE_PUBLIC_SITE_URL || fallbackBase).replace(/\/+$/, '')

        // Guardrail: never publish HTTP URLs for the real production domain.
        // If you want HTTP for local dev, keep using localhost.
        let base = rawBase
        if (/^http:\/\/megasimulateur\.org$/i.test(base) || /^http:\/\/www\.megasimulateur\.org$/i.test(base)) {
          base = base.replace(/^http:\/\//i, 'https://')
        }
        if (isProd && /^http:\/\//i.test(base) && !/^http:\/\/localhost(?::\d+)?$/i.test(base)) {
          throw new Error(
            `VITE_PUBLIC_SITE_URL must be https in production (got "${rawBase}"). ` +
              `Set VITE_PUBLIC_SITE_URL=https://megasimulateur.org (no trailing slash) when building the frontend.`
          )
        }
        const lastmod = new Date().toISOString().slice(0, 10)
        const urls = SITEMAP_PATHS.map(
          (p) =>
            `  <url><loc>${base}${p}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${sitemapPriority(p)}</priority></url>`
        ).join('\n')
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
        const outDir = path.join(__dirname, 'dist')
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml, 'utf8')
        const txt = SITEMAP_PATHS.map((p) => `${base}${p}`).join('\n') + '\n'
        fs.writeFileSync(path.join(outDir, 'sitemap.txt'), txt, 'utf8')
        fs.writeFileSync(
          path.join(outDir, 'robots.txt'),
          [
            'User-agent: *',
            'Allow: /',
            '',
            'User-agent: Googlebot',
            'Allow: /',
            '',
            `Sitemap: ${base}/sitemap.xml`,
            '',
          ].join('\n'),
          'utf8'
        )
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
