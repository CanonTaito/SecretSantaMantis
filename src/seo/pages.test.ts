import { describe, expect, it } from 'vitest'
import sitemap from '../../public/sitemap.xml?raw'
import { SEO_PAGES } from './pages.tsx'
import { pageUrl, renderSeoPage } from './render.tsx'

const html = (slug: string) => {
  const page = SEO_PAGES.find((p) => p.slug === slug)!
  return renderSeoPage(page, { cssHref: '../assets/index-test.css' })
}

describe('search pages', () => {
  it('have unique titles and descriptions that fit in Google results', () => {
    expect(new Set(SEO_PAGES.map((p) => p.title)).size).toBe(SEO_PAGES.length)
    expect(new Set(SEO_PAGES.map((p) => p.description)).size).toBe(SEO_PAGES.length)
    for (const page of SEO_PAGES) {
      expect(page.title.length, page.title).toBeLessThanOrEqual(60)
      expect(page.description.length, page.description).toBeLessThanOrEqual(155)
    }
  })

  it('are all in the sitemap', () => {
    for (const page of SEO_PAGES) expect(sitemap).toContain(`<loc>${pageUrl(page)}</loc>`)
  })

  for (const page of SEO_PAGES) {
    describe(page.slug, () => {
      const doc = html(page.slug)

      it('points search engines at its own address', () => {
        expect(doc).toContain(`<link rel="canonical" href="https://secretsanta.taitoapps.com/${page.slug}/" />`)
      })

      it('has one heading and a button into the app', () => {
        expect(doc.match(/<h1[\s>]/g)).toHaveLength(1)
        expect(doc).toContain('href="../"')
        expect(doc).toContain(page.cta.replace('→', '').trim())
      })

      it('uses the built stylesheet and its screenshot', () => {
        expect(doc).toContain('href="../assets/index-test.css"')
        expect(doc).toContain(`src="../guides/${page.screenshot.file}"`)
      })

      it('ships no script except the old-address redirect', () => {
        const scripts = doc.match(/<script>[^<]*<\/script>/g) ?? []
        expect(scripts).toHaveLength(1)
        expect(scripts[0]).toContain('canontaito.github.io')
        expect(doc.match(/<script/g)).toHaveLength(1)
      })
    })
  }
})
