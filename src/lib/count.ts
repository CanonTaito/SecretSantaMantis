import { COUNT_PATH, type CountEvent } from './countEvents.ts'
import { NEW_HOME } from './moved.ts'

/** Counts are only sent from the real site, so local testing and other copies don't add to them. */
const COUNT_HOST = new URL(NEW_HOME).hostname
const UNWRAPPED_KEY = 'secret-santa-unwrapped'
const READY_KEY = 'secret-santa-ready-counted'
const MAX_REMEMBERED = 50

export function shouldCount(hostname = window.location.hostname): boolean {
  return hostname === COUNT_HOST
}

/** Adds one to the site's anonymous totals. Never blocks or breaks the page if it fails. */
export function countEvent(event: CountEvent, hostname = window.location.hostname): void {
  if (!shouldCount(hostname)) return
  try {
    void fetch(COUNT_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Counting is a nice-to-have.
  }
}

/**
 * Counts reaching the Draw step once per browser tab, so going back to fix a name and pressing
 * Next again doesn't count twice. A new visit (or tab) counts again.
 */
export function countReadyOnce(hostname = window.location.hostname): void {
  if (!shouldCount(hostname)) return
  try {
    if (sessionStorage.getItem(READY_KEY)) return
    sessionStorage.setItem(READY_KEY, '1')
  } catch {
    // Storage blocked (private mode): count anyway.
  }
  countEvent({ e: 'ready' }, hostname)
}

/** A short fingerprint of a link, so the link itself is never stored. */
function fingerprint(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

/**
 * Counts an unwrap once per link on this device, so re-opening a link to check the name
 * doesn't count again. The memory of which links were counted stays in this browser.
 */
export function countUnwrapOnce(link: string, hostname = window.location.hostname): void {
  if (!shouldCount(hostname)) return
  const id = fingerprint(link)
  try {
    const seen: unknown = JSON.parse(localStorage.getItem(UNWRAPPED_KEY) ?? '[]')
    const list = Array.isArray(seen) ? seen.filter((s): s is string => typeof s === 'string') : []
    if (list.includes(id)) return
    localStorage.setItem(UNWRAPPED_KEY, JSON.stringify([...list, id].slice(-MAX_REMEMBERED)))
  } catch {
    // Storage blocked (private mode): count anyway.
  }
  countEvent({ e: 'unwrap' }, hostname)
}
