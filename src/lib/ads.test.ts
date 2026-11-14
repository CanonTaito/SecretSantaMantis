import { describe, expect, test } from 'vitest'
import { localToday, pickAd, type Ad } from './ads.ts'
import { detectRegion, regionFromTimeZone } from './region.ts'

describe('regions', () => {
  test('maps time zones to regions', () => {
    expect(regionFromTimeZone('Pacific/Auckland')).toBe('NZ')
    expect(regionFromTimeZone('Pacific/Chatham')).toBe('NZ')
    expect(regionFromTimeZone('Australia/Brisbane')).toBe('QLD')
    expect(regionFromTimeZone('Australia/Sydney')).toBe('OTHER')
    expect(regionFromTimeZone('Europe/London')).toBe('OTHER')
    expect(regionFromTimeZone(undefined)).toBe('OTHER')
  })

  test('a ?region= override wins, in any case', () => {
    expect(detectRegion('?region=nz', 'Europe/London')).toBe('NZ')
    expect(detectRegion('?region=QLD', 'Pacific/Auckland')).toBe('QLD')
    expect(detectRegion('?region=mars', 'Pacific/Auckland')).toBe('NZ')
    expect(detectRegion('', 'Australia/Brisbane')).toBe('QLD')
  })
})

describe('pickAd', () => {
  const base = { title: 'T', text: 't', cta: 'Go', url: 'https://example.com' }
  const ads: Ad[] = [
    { ...base, id: 'qld-dec', regions: ['QLD'], start: '2026-12-01', end: '2026-12-31' },
    { ...base, id: 'nz', regions: ['NZ'] },
    { ...base, id: 'qld-later', regions: ['QLD'], start: '2027-01-01' },
  ]

  test('matches region', () => {
    expect(pickAd(ads, 'NZ', '2026-11-14')?.id).toBe('nz')
    expect(pickAd(ads, 'OTHER', '2026-11-14')).toBeNull()
  })

  test('respects start and end dates, inclusive', () => {
    expect(pickAd(ads, 'QLD', '2026-11-30')).toBeNull()
    expect(pickAd(ads, 'QLD', '2026-12-01')?.id).toBe('qld-dec')
    expect(pickAd(ads, 'QLD', '2026-12-31')?.id).toBe('qld-dec')
    expect(pickAd(ads, 'QLD', '2027-01-01')?.id).toBe('qld-later')
  })

  test('localToday uses the local calendar date', () => {
    expect(localToday(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
