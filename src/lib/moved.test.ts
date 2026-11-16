import { describe, expect, test } from 'vitest'
import { NEW_HOME, hasSavedWork, isOldHost, planMove } from './moved.ts'
import { createInitialState } from './storage.ts'

const OLD = 'canontaito.github.io'

describe('planMove', () => {
  test('stays put on the new address and locally', () => {
    expect(planMove({ hostname: 'secretsanta.taitoapps.com', search: '', hash: '' }, false)).toEqual({ kind: 'stay' })
    expect(planMove({ hostname: 'localhost', search: '', hash: '#/r/abc' }, true)).toEqual({ kind: 'stay' })
  })

  test('reveal links always redirect, keeping the match and query', () => {
    const where = { hostname: OLD, search: '?region=NZ', hash: '#/r/E01bSlUc' }
    const url = `${NEW_HOME}?region=NZ#/r/E01bSlUc`
    expect(planMove(where, false)).toEqual({ kind: 'redirect', url })
    expect(planMove(where, true)).toEqual({ kind: 'redirect', url })
  })

  test('visitors with nothing saved redirect to the home page', () => {
    expect(planMove({ hostname: OLD, search: '', hash: '' }, false)).toEqual({ kind: 'redirect', url: NEW_HOME })
  })

  test('organisers with saved work see the notice instead', () => {
    expect(planMove({ hostname: OLD, search: '', hash: '' }, true)).toEqual({ kind: 'notice' })
  })

  test('host check ignores case', () => {
    expect(isOldHost('CanonTaito.github.io')).toBe(true)
    expect(isOldHost('someone-else.github.io')).toBe(false)
  })
})

describe('hasSavedWork', () => {
  test('a fresh, empty setup is not saved work', () => {
    expect(hasSavedWork(null)).toBe(false)
    expect(hasSavedWork(createInitialState())).toBe(false)
  })

  test('a typed name or event detail counts', () => {
    const named = createInitialState()
    named.households[0]!.people[0]!.name = 'Cruz'
    expect(hasSavedWork(named)).toBe(true)

    const event = createInitialState()
    event.event.budget = '$50'
    expect(hasSavedWork(event)).toBe(true)
  })

  test('a draw counts', () => {
    const drawn = createInitialState()
    drawn.draw = { createdAt: '2026-11-16T00:00:00.000Z', pairs: {}, sent: {} }
    expect(hasSavedWork(drawn)).toBe(true)
  })
})
