// Makes the Facebook video "Secret Santa sorted in 30 seconds" from the real app.
//
//   npm run video
//
// It serves the site locally with Vite (where nothing is counted), records each scene in
// headless Chrome with a made-up family, adds big captions, a title card and an end card,
// and writes two files to marketing/videos/:
//   secret-santa-30s-4x5.mp4   1080×1350, for group posts and the feed
//   secret-santa-30s-9x16.mp4  1080×1920, for Reels and Stories
//
// Needs Google Chrome (set CHROME_PATH if it's somewhere else) and ffmpeg (on PATH, or FFMPEG_PATH).
// Text uses fonts installed on this computer (Georgia and Segoe UI).
import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { Resvg } from '@resvg/resvg-js'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'marketing', 'videos')
const work = mkdtempSync(join(tmpdir(), 'santa-video-'))
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const FFMPEG = process.env.FFMPEG_PATH ?? 'ffmpeg'
const FFPROBE = process.env.FFPROBE_PATH ?? FFMPEG.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1')
const PORT = 4173
const BASE = `http://localhost:${PORT}/`

// ---------- layout (4:5) ----------
const W = 1080
const H = 1350
const CREAM = '#fbf7ef'
const PINE = '#183c2e'
const BERRY = '#c8323b'
// The browser window, and where its recording sits on the 4:5 canvas.
const VIEW = { width: 420, height: 560, scale: 2 }
const SCREEN = { x: 120, y: 210, w: VIEW.width * VIEW.scale, h: VIEW.height * VIEW.scale, r: 28 }

const FAMILY = ['Mum', 'Dad', 'Mia', 'Leo', 'Nana', 'Uncle Tom']

// ---------- helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ffmpeg = (args) => execFileSync(FFMPEG, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' })
const duration = (file) =>
  Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString())
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function png(svg, file) {
  const out = join(work, file)
  writeFileSync(out, new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Georgia' } }).render().asPng())
  return out
}

const santa = readFileSync(join(root, 'scripts', 'og-image.svg'), 'utf8').match(
  /<g id="santa"[^>]*>([\s\S]*?)\n  <\/g>/,
)?.[1]
if (!santa) throw new Error('Could not find <g id="santa"> in scripts/og-image.svg')

/** Centred lines of text: [text, size, colour, font, weight]. */
function lines(items, startY, gap = 1.25) {
  let y = startY
  return items
    .map(([text, size, colour = PINE, font = 'Georgia', weight = 700]) => {
      y += size
      const el = `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${font}" font-weight="${weight}" font-size="${size}" fill="${colour}">${escape(text)}</text>`
      y += size * (gap - 1)
      return el
    })
    .join('\n')
}

const caption = (name, textLines) =>
  png(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${SCREEN.y}">
      <rect width="${W}" height="${SCREEN.y}" fill="${CREAM}" />
      ${lines(
        textLines.map((t) => [t, textLines.length > 1 ? 58 : 66]),
        textLines.length > 1 ? 34 : 60,
        1.22,
      )}
    </svg>`,
    `${name}.png`,
  )

const card = (name, body) =>
  png(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="${CREAM}" />
      <rect width="${W}" height="16" fill="${BERRY}" />
      <rect y="${H - 16}" width="${W}" height="16" fill="#1f4d3a" />
      ${body}
    </svg>`,
    `${name}.png`,
  )

// ---------- the pieces ----------
function drawCards() {
  const titleCard = card(
    'title',
    `<g transform="translate(330 150) scale(3.5)">${santa}</g>
     ${lines(
       [
         ['Doing Secret Santa', 88],
         ['this year?', 88],
         ["Here's the easy way", 50, BERRY, 'Segoe UI', 600],
       ],
       600,
       1.3,
     )}`,
  )
  const endCard = card(
    'end',
    `<g transform="translate(360 170) scale(3)">${santa}</g>
     ${lines(
       [
         ['Secret Santa Mantis', 84],
         ['Free · No sign-up · Works on any phone', 40, '#183c2ecc', 'Segoe UI', 600],
       ],
       560,
       1.5,
     )}
     <rect x="110" y="860" width="${W - 220}" height="130" rx="65" fill="${BERRY}" />
     <text x="${W / 2}" y="944" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="52" fill="#ffffff">secretsanta.taitoapps.com</text>
     ${lines([['Households never draw each other. Kids draw kids.', 36, '#183c2ebb', 'Segoe UI', 400]], 1060)}`,
  )
  // Cream corners and a thin border, so the recording sits in a rounded "screen".
  const { x, y, w, h, r } = SCREEN
  const frame = png(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><mask id="hole"><rect width="${W}" height="${H}" fill="white" /><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="black" /></mask></defs>
      <rect width="${W}" height="${H}" fill="${CREAM}" mask="url(#hole)" />
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#e7d9bb" stroke-width="4" />
    </svg>`,
    'frame.png',
  )
  // The taller 9:16 version: the 4:5 video in the middle of this.
  const pad = png(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="1920">
      <rect width="${W}" height="1920" fill="${CREAM}" />
      <rect width="${W}" height="24" fill="${BERRY}" />
      <rect y="1896" width="${W}" height="24" fill="#1f4d3a" />
      ${lines([['Secret Santa Mantis', 54]], 150)}
    </svg>`,
    'pad.png',
  )
  return { titleCard, endCard, frame, pad }
}

/** Shows a small red ripple wherever the page is tapped, so viewers can follow along. */
const TAP_RIPPLES = `
  addEventListener('pointerdown', (e) => {
    const dot = document.createElement('div')
    dot.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(200,50,59,.35);border:3px solid rgba(200,50,59,.8);transition:transform .5s ease-out,opacity .5s ease-out;left:' + e.clientX + 'px;top:' + e.clientY + 'px'
    document.documentElement.appendChild(dot)
    requestAnimationFrame(() => { dot.style.transform = 'scale(1.8)'; dot.style.opacity = '0' })
    setTimeout(() => dot.remove(), 700)
  }, true)`

async function recordScenes() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    defaultViewport: { width: VIEW.width, height: VIEW.height, deviceScaleFactor: VIEW.scale },
  })
  await browser.defaultBrowserContext().overridePermissions(BASE.slice(0, -1), ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write'])
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(TAP_RIPPLES)

  const scenes = {}
  const record = async (name, act) => {
    const path = join(work, `${name}.webm`)
    const recorder = await page.screencast({ path, ffmpegPath: FFMPEG === 'ffmpeg' ? undefined : FFMPEG })
    await sleep(250)
    await act()
    await recorder.stop()
    scenes[name] = path
  }
  const tap = async (selector) => {
    const el = await page.waitForSelector(selector, { visible: true })
    await el.click({ delay: 120 })
  }

  // A fresh visitor: nothing saved.
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => {
    const el = document.querySelector('#people-heading')?.closest('section')
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 12)
  })
  await sleep(400)

  await record('names', async () => {
    await sleep(500)
    await tap('input[data-name]')
    for (const [i, name] of FAMILY.entries()) {
      await page.keyboard.type(name, { delay: 75 })
      if (i < FAMILY.length - 1) await page.keyboard.press('Enter')
      await sleep(180)
    }
    await sleep(700)
  })

  // Next: draw names, off camera, then start the scene on the "Ready to draw" card.
  await tap('.sticky .btn-primary')
  await sleep(700)
  await page.evaluate(() => {
    const card = [...document.querySelectorAll('h2')].find((h) => h.textContent.includes('Ready to draw'))?.closest('section')
    if (card) window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - 12)
  })
  await sleep(400)

  await record('draw', async () => {
    await sleep(600)
    const draw = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Draw names')))
    await draw.asElement().click({ delay: 120 })
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('secret-santa-v1') ?? '{}').draw, { timeout: 15000 })
    await sleep(300)
  })

  await record('share', async () => {
    await page.evaluate(() => {
      const el = [...document.querySelectorAll('h2')].find((h) => h.textContent.includes('Names drawn'))?.closest('section')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 8, behavior: 'smooth' })
    })
    await sleep(1400)
    await tap('button[aria-label="Copy Leo\'s link"]')
    await sleep(1800)
  })

  // Leo opens his link, built with the app's own code (the dev server serves src/ directly).
  const reveal = await page.evaluate(async () => {
    const { buildRevealUrl } = await import('/src/lib/revealLink.ts')
    const link = buildRevealUrl({
      v: 1, g: 'Leo', r: 'Mia', w: 'Art supplies and anything purple',
      e: 'Family Christmas', b: '$30', d: '2026-12-25', k: '', a: '',
    })
    return new URL(link).hash
  })
  await page.evaluate(() => localStorage.clear())
  await page.goto(BASE + reveal, { waitUntil: 'networkidle0' })
  await page.reload({ waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => window.scrollTo(0, 0))
  await sleep(300)

  await record('reveal', async () => {
    await sleep(900)
    await tap('[aria-label^="Unwrap your gift"]')
    await sleep(2600)
  })

  await browser.close()
  return scenes
}

// ---------- putting it together ----------
const ENCODE = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30']
const FADE = 0.25

/** One scene: the recording in its rounded screen, with its caption above. */
function sceneClip(name, webm, captionPng, frame) {
  const out = join(work, `${name}.mp4`)
  // Chrome's screencast files don't record their length, so first turn each into a plain 30 fps clip.
  const steady = join(work, `${name}-raw.mp4`)
  ffmpeg(['-i', webm, '-vf', 'fps=30', ...ENCODE, steady])
  const d = duration(steady)
  ffmpeg([
    '-i', steady, '-loop', '1', '-i', captionPng, '-loop', '1', '-i', frame,
    '-f', 'lavfi', '-i', `color=c=${CREAM}:s=${W}x${H}:r=30`,
    '-filter_complex',
    `[0:v]fps=30,scale=${SCREEN.w}:${SCREEN.h}:flags=lanczos,setsar=1[rec];` +
      `[3:v][rec]overlay=${SCREEN.x}:${SCREEN.y}:shortest=1[a];[a][2:v]overlay=0:0[b];[b][1:v]overlay=0:0,` +
      `fade=t=in:st=0:d=${FADE}:color=${CREAM},fade=t=out:st=${(d - FADE).toFixed(2)}:d=${FADE}:color=${CREAM}[v]`,
    '-map', '[v]', '-t', d.toFixed(2), ...ENCODE, out,
  ])
  return out
}

function stillClip(name, image, seconds, { fadeIn = true } = {}) {
  const out = join(work, `${name}.mp4`)
  const fades = [fadeIn && `fade=t=in:st=0:d=${FADE}:color=${CREAM}`, `fade=t=out:st=${seconds - FADE}:d=${FADE}:color=${CREAM}`]
  ffmpeg(['-loop', '1', '-i', image, '-vf', `fps=30,setsar=1,${fades.filter(Boolean).join(',')}`, '-t', String(seconds), ...ENCODE, out])
  return out
}

function joinClips(clips, out) {
  const list = join(work, 'clips.txt')
  writeFileSync(list, clips.map((c) => `file '${c.replace(/\\/g, '/')}'`).join('\n'))
  // A silent soundtrack, because some uploaders expect one. Music can be added in Facebook.
  ffmpeg([
    '-f', 'concat', '-safe', '0', '-i', list, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '64k', '-shortest', '-movflags', '+faststart', out,
  ])
}

function makeTall(source, pad, out) {
  ffmpeg([
    '-loop', '1', '-i', pad, '-i', source,
    '-filter_complex', `[0:v][1:v]overlay=0:${(1920 - H) / 2}:shortest=1,fps=30[v]`,
    '-map', '[v]', '-map', '1:a', ...ENCODE, '-c:a', 'copy', '-movflags', '+faststart', out,
  ])
}

// ---------- run ----------
function serve() {
  return spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: root, shell: true, stdio: 'ignore' })
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return
    } catch {
      // not up yet
    }
    await sleep(500)
  }
  throw new Error(`The site didn't start on ${BASE}`)
}

const server = serve()
try {
  await waitForServer()
  const cards = drawCards()
  const scenes = await recordScenes()
  const clips = [
    stillClip('0-title', cards.titleCard, 2.5, { fadeIn: false }),
    sceneClip('1-names', scenes.names, caption('cap-names', ['Type everyone’s name']), cards.frame),
    sceneClip('2-draw', scenes.draw, caption('cap-draw', ['Tap Draw']), cards.frame),
    sceneClip('3-share', scenes.share, caption('cap-share', ['Everyone gets their', 'own secret link']), cards.frame),
    sceneClip('4-reveal', scenes.reveal, caption('cap-reveal', ['They unwrap it.', 'Nobody else knows.']), cards.frame),
    stillClip('5-end', cards.endCard, 3.5),
  ]
  mkdirSync(outDir, { recursive: true })
  const wide = join(outDir, 'secret-santa-30s-4x5.mp4')
  const tall = join(outDir, 'secret-santa-30s-9x16.mp4')
  joinClips(clips, wide)
  makeTall(wide, cards.pad, tall)
  for (const file of [wide, tall]) {
    console.log(`wrote ${file.slice(root.length)} (${duration(file).toFixed(1)} s, ${(statSync(file).size / 1e6).toFixed(1)} MB)`)
  }
} finally {
  server.kill()
  if (process.platform === 'win32' && server.pid) {
    try {
      execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' })
    } catch {
      // already gone
    }
  }
  rmSync(work, { recursive: true, force: true })
}
