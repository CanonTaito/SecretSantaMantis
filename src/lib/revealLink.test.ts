import { describe, expect, test } from 'vitest'
import {
  buildMailto,
  buildRevealUrl,
  decodeReveal,
  encodeReveal,
  revealFromHash,
  type RevealPayload,
} from './revealLink.ts'

describe('reveal links', () => {
  test('round-trips a full payload', () => {
    const p: RevealPayload = { v: 1, g: 'Cruz', r: 'Vegeta', w: 'Books', e: 'Family Xmas', b: '$50', d: '2026-12-24' }
    expect(decodeReveal(encodeReveal(p))).toEqual(p)
  })

  test('round-trips accents and emoji', () => {
    const p: RevealPayload = { v: 1, g: 'Zoë', r: 'José 🎅', w: 'Café crème ☕ & 日本の本' }
    expect(decodeReveal(encodeReveal(p))).toEqual(p)
  })

  test('drops empty optional fields', () => {
    const encoded = encodeReveal({ v: 1, g: 'Cruz', r: 'Vegeta', w: '', e: '' })
    expect(decodeReveal(encoded)).toEqual({ v: 1, g: 'Cruz', r: 'Vegeta' })
  })

  test('is URL-safe and does not contain the names in plain text', () => {
    const encoded = encodeReveal({ v: 1, g: 'Grandma Lina', r: 'Vegeta' })
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(encoded).not.toContain('Grandma Lina')
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    expect(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))).not.toContain('Vegeta')
  })

  test('rejects garbage', () => {
    for (const bad of ['', '!!!', 'abc', 'eyJ2IjoxfQ', encodeReveal({ v: 1, g: 'Cruz', r: 'Vegeta' }).slice(0, -4)]) {
      expect(decodeReveal(bad)).toBeNull()
    }
  })

  test('rejects wrong version and wrong field types', () => {
    const scramble = (obj: unknown) => encodeReveal(obj as RevealPayload)
    expect(decodeReveal(scramble({ v: 2, g: 'Cruz', r: 'Vegeta' }))).toBeNull()
    expect(decodeReveal(scramble({ v: 1, g: 'Cruz', r: 5 }))).toBeNull()
    expect(decodeReveal(scramble({ v: 1, g: 'Cruz', r: 'Vegeta', w: ['x'] }))).toBeNull()
    expect(decodeReveal(scramble({ v: 1, g: ' ', r: 'Vegeta' }))).toBeNull()
  })

  test('revealFromHash distinguishes non-reveal, broken and good hashes', () => {
    expect(revealFromHash('')).toBeUndefined()
    expect(revealFromHash('#/somewhere')).toBeUndefined()
    expect(revealFromHash('#/r/nonsense')).toBeNull()
    const good = '#/r/' + encodeReveal({ v: 1, g: 'Cruz', r: 'Vegeta' })
    expect(revealFromHash(good)).toEqual({ v: 1, g: 'Cruz', r: 'Vegeta' })
  })

  test('buildRevealUrl keeps the page path', () => {
    const url = buildRevealUrl({ v: 1, g: 'Cruz', r: 'Vegeta' }, { origin: 'https://me.github.io', pathname: '/SecretSantaMantis/' })
    expect(url).toMatch(/^https:\/\/me\.github\.io\/SecretSantaMantis\/#\/r\/[A-Za-z0-9_-]+$/)
  })

  test('buildMailto encodes subject and body', () => {
    const link = buildMailto('cruz@example.com', 'Cruz', 'Family & Friends', 'https://x.test/#/r/abc')
    expect(link.startsWith('mailto:cruz%40example.com?subject=')).toBe(true)
    const body = decodeURIComponent(link.split('&body=')[1]!)
    expect(body).toContain('Hi Cruz,')
    expect(body).toContain('https://x.test/#/r/abc')
    expect(decodeURIComponent(link.split('subject=')[1]!.split('&body=')[0]!)).toContain('Family & Friends')
  })

  test('buildMailto works without an email address', () => {
    expect(buildMailto('', 'Cruz', '', 'u').startsWith('mailto:?subject=')).toBe(true)
  })
})
