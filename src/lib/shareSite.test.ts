import { afterEach, describe, expect, test, vi } from 'vitest'
import { SITE_SHARE, shareSite } from './shareSite.ts'

function mockClipboard(ok: boolean) {
  const writeText = vi.fn(() => (ok ? Promise.resolve() : Promise.reject(new Error('blocked'))))
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  return writeText
}

function mockShare(impl?: () => Promise<void>) {
  Object.defineProperty(navigator, 'share', { value: impl ? vi.fn(impl) : undefined, configurable: true })
  return navigator.share as unknown as ReturnType<typeof vi.fn>
}

describe('shareSite', () => {
  afterEach(() => {
    mockShare()
    vi.restoreAllMocks()
  })

  test('always shares the main address', () => {
    expect(SITE_SHARE.url).toBe('https://secretsanta.taitoapps.com/')
  })

  test('uses the share sheet when the phone has one', async () => {
    const share = mockShare(() => Promise.resolve())
    expect(await shareSite()).toBe('shared')
    expect(share).toHaveBeenCalledWith(SITE_SHARE)
  })

  test('closing the share sheet is not an error', async () => {
    mockShare(() => Promise.reject(new DOMException('cancelled', 'AbortError')))
    const writeText = mockClipboard(true)
    expect(await shareSite()).toBe('cancelled')
    expect(writeText).not.toHaveBeenCalled()
  })

  test('copies the text and address when there is no share sheet', async () => {
    mockShare()
    const writeText = mockClipboard(true)
    expect(await shareSite()).toBe('copied')
    expect(writeText).toHaveBeenCalledWith(`${SITE_SHARE.text} ${SITE_SHARE.url}`)
  })

  test('falls back to copying when the share sheet is refused', async () => {
    mockShare(() => Promise.reject(new DOMException('not allowed', 'NotAllowedError')))
    mockClipboard(true)
    expect(await shareSite()).toBe('copied')
  })

  test('reports failure when copying is blocked too', async () => {
    mockShare()
    mockClipboard(false)
    document.execCommand = vi.fn(() => false)
    expect(await shareSite()).toBe('failed')
  })
})
