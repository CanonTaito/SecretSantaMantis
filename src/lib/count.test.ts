import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { countEvent, countUnwrapOnce, shouldCount } from './count.ts'
import { parseCountEvent } from './countEvents.ts'

const SITE = 'secretsanta.taitoapps.com'

describe('counting', () => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })))

  beforeEach(() => {
    localStorage.clear()
    fetchMock.mockClear()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  const sentBodies = () => fetchMock.mock.calls.map((call) => (call as unknown as [string, RequestInit])[1].body as string)

  test('only the real site counts', () => {
    expect(shouldCount(SITE)).toBe(true)
    expect(shouldCount('localhost')).toBe(false)
    expect(shouldCount('canontaito.github.io')).toBe(false)
    expect(shouldCount('secretsantamantis.canon-taito.workers.dev')).toBe(false)

    countEvent({ e: 'draw', n: 6 }, 'localhost')
    countUnwrapOnce('#/r/abc', 'localhost')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('a draw sends only the event and the number of people', () => {
    countEvent({ e: 'draw', n: 6 }, SITE)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe('/api/event')
    expect(sentBodies()).toEqual(['{"e":"draw","n":6}'])
    expect(parseCountEvent(sentBodies()[0]!)).toEqual({ e: 'draw', n: 6 })
  })

  test('an unwrap counts once per link, and never sends the link', () => {
    countUnwrapOnce('#/r/first-link', SITE)
    countUnwrapOnce('#/r/first-link', SITE)
    countUnwrapOnce('#/r/second-link', SITE)
    expect(sentBodies()).toEqual(['{"e":"unwrap"}', '{"e":"unwrap"}'])
    expect(localStorage.getItem('secret-santa-unwrapped')).not.toContain('first-link')
  })

  test('a failed request never throws', () => {
    fetchMock.mockImplementationOnce(() => Promise.reject(new Error('offline')))
    expect(() => countEvent({ e: 'unwrap' }, SITE)).not.toThrow()
  })
})
