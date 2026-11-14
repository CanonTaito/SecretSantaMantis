/**
 * Reveal links carry one person's match inside the URL hash, so no server is needed.
 *
 * The payload is scrambled (XOR + base64url) so names aren't readable at a glance.
 * This is obfuscation, not encryption: anyone holding a link can open it.
 * The hash part of a URL is never sent to the web server.
 */

export interface RevealPayload {
  v: 1
  /** giver name */
  g: string
  /** receiver name */
  r: string
  /** receiver's wishlist hint */
  w?: string
  /** event name */
  e?: string
  /** budget */
  b?: string
  /** exchange date */
  d?: string
}

export const REVEAL_PREFIX = '#/r/'

const KEY = new TextEncoder().encode('ho-ho-ho-secret-santa')

function xor(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i]! ^ KEY[i % KEY.length]!
  return out
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

export function encodeReveal(payload: RevealPayload): string {
  // Drop empty optional fields to keep links short.
  const compact = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  )
  return toBase64Url(xor(new TextEncoder().encode(JSON.stringify(compact))))
}

const OPTIONAL_KEYS = ['w', 'e', 'b', 'd'] as const
const MAX_FIELD = 2000

/** Parse a scrambled payload. Returns null for anything malformed, so callers can show a friendly error. */
export function decodeReveal(encoded: string): RevealPayload | null {
  try {
    const json = new TextDecoder('utf-8', { fatal: true }).decode(xor(fromBase64Url(encoded)))
    const data: unknown = JSON.parse(json)
    if (typeof data !== 'object' || data === null) return null
    const d = data as Record<string, unknown>
    if (d.v !== 1) return null
    if (typeof d.g !== 'string' || typeof d.r !== 'string') return null
    if (d.g.trim() === '' || d.r.trim() === '') return null

    const payload: RevealPayload = { v: 1, g: d.g.slice(0, MAX_FIELD), r: d.r.slice(0, MAX_FIELD) }
    for (const key of OPTIONAL_KEYS) {
      const value = d[key]
      if (value === undefined) continue
      if (typeof value !== 'string') return null
      payload[key] = value.slice(0, MAX_FIELD)
    }
    return payload
  } catch {
    return null
  }
}

/** Read a payload out of a full hash like `#/r/abc123`, or null if this isn't a reveal link. */
export function revealFromHash(hash: string): RevealPayload | null | undefined {
  if (!hash.startsWith(REVEAL_PREFIX)) return undefined
  return decodeReveal(hash.slice(REVEAL_PREFIX.length))
}

export function buildRevealUrl(payload: RevealPayload, location: Pick<Location, 'origin' | 'pathname'> = window.location): string {
  return `${location.origin}${location.pathname}${REVEAL_PREFIX}${encodeReveal(payload)}`
}

/** A mailto: link that opens the organizer's own email app with a ready-to-send message. */
export function buildMailto(email: string, giverName: string, eventName: string, url: string): string {
  const event = eventName.trim() || 'Secret Santa'
  const subject = `🎁 Your ${event} match is ready`
  const body = [
    `Hi ${giverName},`,
    '',
    `Names have been drawn for ${event}! Open this private link to find out who you're buying for:`,
    '',
    url,
    '',
    "Keep it secret — don't share the link with anyone.",
  ].join('\n')
  return `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
