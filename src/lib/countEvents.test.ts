import { describe, expect, test } from 'vitest'
import { dayKey, parseCountEvent } from './countEvents.ts'

describe('parseCountEvent', () => {
  test('accepts a draw with a sensible number of people', () => {
    expect(parseCountEvent('{"e":"draw","n":8}')).toEqual({ e: 'draw', n: 8 })
  })

  test('accepts an unwrap', () => {
    expect(parseCountEvent('{"e":"unwrap"}')).toEqual({ e: 'unwrap' })
  })

  test('accepts reaching the Draw step, with nothing else attached', () => {
    expect(parseCountEvent('{"e":"ready"}')).toEqual({ e: 'ready' })
    expect(parseCountEvent('{"e":"ready","n":12,"name":"Cruz"}')).toEqual({ e: 'ready' })
  })

  test('keeps only the known fields, so nothing extra can be stored', () => {
    expect(parseCountEvent('{"e":"draw","n":4,"name":"Cruz"}')).toEqual({ e: 'draw', n: 4 })
    expect(parseCountEvent('{"e":"unwrap","r":"Vegeta"}')).toEqual({ e: 'unwrap' })
  })

  test('rejects draws with impossible sizes', () => {
    expect(parseCountEvent('{"e":"draw","n":2}')).toBeNull()
    expect(parseCountEvent('{"e":"draw","n":501}')).toBeNull()
    expect(parseCountEvent('{"e":"draw","n":4.5}')).toBeNull()
    expect(parseCountEvent('{"e":"draw","n":"8"}')).toBeNull()
    expect(parseCountEvent('{"e":"draw"}')).toBeNull()
  })

  test('rejects anything else', () => {
    expect(parseCountEvent('')).toBeNull()
    expect(parseCountEvent('not json')).toBeNull()
    expect(parseCountEvent('null')).toBeNull()
    expect(parseCountEvent('[]')).toBeNull()
    expect(parseCountEvent('{"e":"visit"}')).toBeNull()
    expect(parseCountEvent(`{"e":"unwrap","pad":"${'x'.repeat(200)}"}`)).toBeNull()
  })
})

describe('dayKey', () => {
  test('uses the Brisbane calendar day (UTC+10, no daylight saving)', () => {
    expect(dayKey(new Date('2026-11-16T13:59:00Z'))).toBe('2026-11-16')
    expect(dayKey(new Date('2026-11-16T14:00:00Z'))).toBe('2026-11-17')
    expect(dayKey(new Date('2026-12-31T20:00:00Z'))).toBe('2027-01-01')
  })
})
