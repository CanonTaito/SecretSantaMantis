// Runs after `vite build`: turns each search page in src/seo/pages.tsx into plain HTML at
// dist/<slug>/index.html, and copies its screenshot to dist/guides/. No JavaScript ships with them.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = `${root}dist/`

// The built stylesheet's name changes every build, so take it from the app's own page.
const css = readFileSync(`${dist}index.html`, 'utf8').match(/href="\.\/(assets\/[^"]+\.css)"/)?.[1]
if (!css) throw new Error('Could not find the built stylesheet in dist/index.html')

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { SEO_PAGES } = await vite.ssrLoadModule('/src/seo/pages.tsx')
  const { renderSeoPage } = await vite.ssrLoadModule('/src/seo/render.tsx')

  mkdirSync(`${dist}guides`, { recursive: true })
  for (const page of SEO_PAGES) {
    mkdirSync(`${dist}${page.slug}`, { recursive: true })
    writeFileSync(`${dist}${page.slug}/index.html`, renderSeoPage(page, { cssHref: `../${css}` }))
    copyFileSync(`${root}${page.screenshot.source}`, `${dist}guides/${page.screenshot.file}`)
    console.log(`wrote dist/${page.slug}/index.html`)
  }
} finally {
  await vite.close()
}
