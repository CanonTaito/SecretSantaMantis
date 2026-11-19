/**
 * The anonymous counts the site keeps: someone reached the Draw step ("ready"), a draw was made
 * (and how many people were in it), or a gift was unwrapped. No names, links or matches are
 * ever part of these. Shared by the page (src/lib/count.ts) and the Cloudflare Worker (worker/index.ts).
 */
export type CountEvent = { e: 'ready' } | { e: 'draw'; n: number } | { e: 'unwrap' }

/** Where the page posts counts. Handled by worker/index.ts. */
export const COUNT_PATH = '/api/event'

const MIN_PEOPLE = 3
const MAX_PEOPLE = 500
const MAX_BODY = 100

/** Validates an untrusted request body. Anything unexpected is dropped, extra fields included. */
export function parseCountEvent(body: string): CountEvent | null {
  if (body.length > MAX_BODY) return null
  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
  const { e, n } = data as { e?: unknown; n?: unknown }
  if (e === 'unwrap') return { e: 'unwrap' }
  if (e === 'ready') return { e: 'ready' }
  if (e === 'draw' && typeof n === 'number' && Number.isInteger(n) && n >= MIN_PEOPLE && n <= MAX_PEOPLE) {
    return { e: 'draw', n }
  }
  return null
}

/** The calendar day in Brisbane (the site owner's time zone), as YYYY-MM-DD. */
export function dayKey(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Brisbane',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}
