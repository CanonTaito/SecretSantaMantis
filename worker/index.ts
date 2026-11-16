/**
 * The site's only server code. The pages themselves are static files that Cloudflare serves
 * without running this; it only handles two addresses:
 *
 *   POST /api/event   adds one to today's count of draws or unwraps (anonymous, see countEvents.ts)
 *   GET  /api/stats   the owner's totals, behind a password (the STATS_KEY secret)
 *
 * Counts live in one small Durable Object with a built-in SQLite table: one row per day.
 */
import { DurableObject } from 'cloudflare:workers'
import { COUNT_PATH, dayKey, parseCountEvent, type CountEvent } from '../src/lib/countEvents.ts'

interface Env {
  COUNTER: DurableObjectNamespace<Counter>
  /** Password for /api/stats. Set it as a secret in the Cloudflare dashboard; without it the page is off. */
  STATS_KEY?: string
}

interface DayRow extends Record<string, SqlStorageValue> {
  day: string
  draws: number
  people: number
  unwraps: number
}

export class Counter extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    ctx.storage.sql.exec(
      `CREATE TABLE IF NOT EXISTS daily (
         day TEXT PRIMARY KEY,
         draws INTEGER NOT NULL DEFAULT 0,
         people INTEGER NOT NULL DEFAULT 0,
         unwraps INTEGER NOT NULL DEFAULT 0
       )`,
    )
  }

  record(day: string, event: CountEvent): void {
    const sql = this.ctx.storage.sql
    if (event.e === 'draw') {
      sql.exec(
        `INSERT INTO daily (day, draws, people) VALUES (?, 1, ?)
         ON CONFLICT(day) DO UPDATE SET draws = draws + 1, people = people + excluded.people`,
        day,
        event.n,
      )
    } else {
      sql.exec(
        `INSERT INTO daily (day, unwraps) VALUES (?, 1)
         ON CONFLICT(day) DO UPDATE SET unwraps = unwraps + 1`,
        day,
      )
    }
  }

  days(): DayRow[] {
    return this.ctx.storage.sql
      .exec<DayRow>('SELECT day, draws, people, unwraps FROM daily ORDER BY day DESC LIMIT 400')
      .toArray()
  }
}

function counter(env: Env) {
  return env.COUNTER.get(env.COUNTER.idFromName('global'))
}

async function handleEvent(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } })
  // Only the site's own pages may count. Browsers always send Origin on a POST.
  if (request.headers.get('Origin') !== url.origin) return new Response('Forbidden', { status: 403 })
  const event = parseCountEvent(await request.text())
  if (!event) return new Response('Bad request', { status: 400 })
  await counter(env).record(dayKey(new Date()), event)
  return new Response(null, { status: 204 })
}

function passwordFrom(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? ''
  if (!header.startsWith('Basic ')) return null
  try {
    const decoded = atob(header.slice(6))
    return decoded.slice(decoded.indexOf(':') + 1)
  } catch {
    return null
  }
}

function statsPage(rows: DayRow[]): string {
  const total = rows.reduce(
    (t, r) => ({ draws: t.draws + r.draws, people: t.people + r.people, unwraps: t.unwraps + r.unwraps }),
    { draws: 0, people: 0, unwraps: 0 },
  )
  const average = (people: number, draws: number) => (draws ? (people / draws).toFixed(1) : '–')
  const row = (label: string, r: { draws: number; people: number; unwraps: number }, tag = 'td') =>
    `<tr><${tag}>${label}</${tag}><${tag}>${r.draws}</${tag}><${tag}>${r.people}</${tag}><${tag}>${average(r.people, r.draws)}</${tag}><${tag}>${r.unwraps}</${tag}></tr>`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Secret Santa Mantis – stats</title>
<style>
  body { font: 16px/1.5 system-ui, sans-serif; color: #10291f; background: #fbf7ef; margin: 0; padding: 24px 16px; }
  main { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 4px; }
  p { color: #183c2ecc; margin: 0 0 20px; font-size: .9rem; }
  .wrap { overflow-x: auto; background: #fffdf8; border: 1px solid #e7d9bb; border-radius: 16px; }
  table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
  th, td { padding: 10px 14px; text-align: right; white-space: nowrap; border-bottom: 1px solid #f3ead8; }
  th:first-child, td:first-child { text-align: left; }
  thead th { font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; color: #1f4d3acc; }
  tbody tr:first-child th { background: #eef6f1; }
  tr:last-child td { border-bottom: 0; }
</style>
</head>
<body>
<main>
<h1>🎅🏾 Secret Santa Mantis stats</h1>
<p>Anonymous counts only. Days are Brisbane time. A redraw counts as another draw.</p>
<div class="wrap">
<table>
<thead><tr><th>Day</th><th>Draws</th><th>People</th><th>Avg group</th><th>Unwraps</th></tr></thead>
<tbody>
${row('All time', total, 'th')}
${rows.map((r) => row(r.day, r)).join('\n')}
</tbody>
</table>
</div>
</main>
</body>
</html>`
}

async function handleStats(request: Request, env: Env): Promise<Response> {
  if (!env.STATS_KEY) return new Response('Not found', { status: 404 })
  if (passwordFrom(request) !== env.STATS_KEY) {
    return new Response('Password needed', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secret Santa Mantis stats", charset="UTF-8"' },
    })
  }
  const rows = await counter(env).days()
  return new Response(statsPage(rows), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === COUNT_PATH) return handleEvent(request, env, url)
    if (url.pathname === '/api/stats') return handleStats(request, env)
    return new Response('Not found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
