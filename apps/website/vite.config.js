import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { publicPaths } from './src/routes.js'


/*
  Writes robots.txt on every build, and sitemap.xml when SITE_URL is set:
    SITE_URL=https://example.org npm run build
  Without SITE_URL no sitemap is generated, because it needs absolute URLs.
*/
function seoFiles() {
  return {
    name: 'saheli-seo-files',
    apply: 'build',
    generateBundle() {
      const siteUrl = process.env.SITE_URL?.replace(/\/$/, '')
      const robots = ['User-agent: *', 'Allow: /']
      if (siteUrl) robots.push('', `Sitemap: ${siteUrl}/sitemap.xml`)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })

      if (siteUrl) {
        const urls = publicPaths.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n')
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: {
      port: 3000,
      strictPort: true,
      proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true } },
    },
    plugins: [react(), tailwindcss(), seoFiles()],
  }
})
