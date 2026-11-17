import { renderToStaticMarkup } from 'react-dom/server'
import { NEW_HOME, OLD_HOSTS } from '../lib/moved.ts'
import { SeoLayout, type SeoPage } from './pages.tsx'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600;700&display=swap'
const FAVICON =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎁</text></svg>"

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function pageUrl(page: SeoPage): string {
  return `${NEW_HOME}${page.slug}/`
}

/** A whole HTML document for one search page. `cssHref` is the built stylesheet, relative to the page. */
export function renderSeoPage(page: SeoPage, { cssHref }: { cssHref: string }): string {
  const url = pageUrl(page)
  const title = escapeAttr(page.title)
  const description = escapeAttr(page.description)
  // The old GitHub Pages copy forwards visitors to the same page on the main address.
  const redirect = `if(${JSON.stringify(OLD_HOSTS)}.includes(location.hostname))location.replace(${JSON.stringify(url)})`
  const body = renderToStaticMarkup(<SeoLayout page={page} />)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#1f4d3a" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Secret Santa Mantis" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${NEW_HOME}og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="${FAVICON}" />
    <link rel="apple-touch-icon" href="../apple-touch-icon.png" />
    <script>${redirect}</script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${FONTS}" />
    <link rel="stylesheet" href="${cssHref}" />
  </head>
  <body>
    ${body}
  </body>
</html>
`
}
