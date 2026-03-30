import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Public routes (French SEO paths). Keep in sync with src/seo/paths.js */
const SEO_PATHS = [
  '/simulateur-paie-brut-net',
  '/simulation-retraite',
  '/simulation-credit-pret',
  '/simulation-epargne',
  '/contact',
  '/historique',
  '/mon-compte',
]

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'megasimulator-seo-files',
      closeBundle() {
        const base = (process.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '')
        const urls = SEO_PATHS.map(
          (p) =>
            `  <url><loc>${base}${p}</loc><changefreq>weekly</changefreq><priority>${p.includes('paie') ? '1.0' : '0.8'}</priority></url>`
        ).join('\n')
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
        const outDir = path.join(__dirname, 'dist')
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml, 'utf8')
        fs.writeFileSync(
          path.join(outDir, 'robots.txt'),
          `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
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
