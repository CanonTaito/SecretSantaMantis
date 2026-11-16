// Turns scripts/og-image.svg into the PNGs the site serves:
//   public/og-image.png         1200×630 link preview (Facebook, Messenger, WhatsApp…)
//   public/apple-touch-icon.png 180×180 icon for "Add to Home Screen"
// Run with `npm run og-image` after editing the SVG, then commit the PNGs.
// Text uses fonts installed on this computer (Georgia, Segoe UI or Arial).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = fileURLToPath(new URL('..', import.meta.url))
const svg = readFileSync(`${root}scripts/og-image.svg`, 'utf8')
const fonts = { loadSystemFonts: true, defaultFontFamily: 'Georgia' }

function render(source, width, out) {
  const png = new Resvg(source, { fitTo: { mode: 'width', value: width }, font: fonts }).render().asPng()
  writeFileSync(`${root}public/${out}`, png)
  console.log(`wrote public/${out} (${(png.length / 1024).toFixed(0)} KB)`)
}

render(svg, 1200, 'og-image.png')

// The icon reuses the Santa from the preview picture, centred on the cream background.
const santa = svg.match(/<g id="santa"[^>]*>([\s\S]*?)\n  <\/g>/)?.[1]
if (!santa) throw new Error('Could not find <g id="santa"> in og-image.svg')
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#fbf7ef" />
  <g transform="translate(15 12) scale(1.25)">${santa}</g>
</svg>`
render(icon, 180, 'apple-touch-icon.png')
