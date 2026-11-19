import { describe, expect, test } from 'vitest'
import type { Household, SantaState } from '../types.ts'
import { createInitialState } from '../lib/storage.ts'
import { santaReducer } from './santaReducer.ts'

const person = (id: string, name: string) => ({ id, name, email: '', wishlist: '', isChild: false, age: '' })

function state(households: Household[], useHouseholds: boolean): SantaState {
  return {
    ...createInitialState(),
    households,
    useHouseholds,
    exclusions: [{ id: 'x', giverId: 'a', receiverId: 'c', mutual: true }],
  }
}

const grouped = () =>
  state(
    [
      { id: 'h1', name: 'The Harpers', people: [person('a', 'Anna'), person('b', 'Ben')] },
      { id: 'h2', name: '', people: [person('c', 'Cleo')] },
    ],
    true,
  )

const simple = () =>
  state(
    [
      { id: 'h1', name: '', people: [person('a', 'Anna')] },
      { id: 'h2', name: '', people: [person('b', 'Ben')] },
      { id: 'h3', name: '', people: [person('c', 'Cleo')] },
      { id: 'h4', name: '', people: [person('d', '  ')] },
    ],
    false,
  )

describe('switching between a simple list and households', () => {
  test('turning households off gives everyone their own unnamed household and keeps rules', () => {
    const next = santaReducer(grouped(), { type: 'setUseHouseholds', on: false })
    expect(next.useHouseholds).toBe(false)
    expect(next.households.map((h) => h.people.map((p) => p.id))).toEqual([['a'], ['b'], ['c']])
    expect(next.households.every((h) => h.name === '')).toBe(true)
    expect(next.households[0]!.id).toBe('h1')
    expect(next.exclusions).toHaveLength(1)
  })

  test('turning households on keeps everyone, without the empty rows', () => {
    const next = santaReducer(simple(), { type: 'setUseHouseholds', on: true })
    expect(next.useHouseholds).toBe(true)
    expect(next.households.map((h) => h.id)).toEqual(['h1', 'h2', 'h3'])
  })

  test('an import that groups people turns households on', () => {
    const next = santaReducer(simple(), {
      type: 'setHouseholds',
      households: [{ id: 'h9', name: 'The Lees', people: [person('e', 'Eli'), person('f', 'Fay')] }],
    })
    expect(next.useHouseholds).toBe(true)
  })

  test('an import of single people keeps the simple list', () => {
    const next = santaReducer(simple(), {
      type: 'setHouseholds',
      households: [{ id: 'h9', name: '', people: [person('e', 'Eli')] }],
    })
    expect(next.useHouseholds).toBe(false)
  })
})

describe('movePerson', () => {
  test('moves someone into another household and drops the one left empty', () => {
    const s = santaReducer(simple(), { type: 'setUseHouseholds', on: true })
    const next = santaReducer(s, { type: 'movePerson', personId: 'b', to: 'h1' })
    expect(next.households.map((h) => h.people.map((p) => p.id))).toEqual([['a', 'b'], ['c']])
  })

  test('can start a new household, and ignores unknown or same targets', () => {
    const next = santaReducer(grouped(), { type: 'movePerson', personId: 'b', to: 'new' })
    expect(next.households.map((h) => h.people.map((p) => p.id))).toEqual([['a'], ['c'], ['b']])
    const g = grouped()
    expect(santaReducer(g, { type: 'movePerson', personId: 'b', to: 'nope' })).toBe(g)
    expect(santaReducer(g, { type: 'movePerson', personId: 'b', to: 'h1' })).toBe(g)
  })
})

describe('dropBlankPeople', () => {
  test('removes only rows without a name', () => {
    const next = santaReducer(simple(), { type: 'dropBlankPeople' })
    expect(next.households.map((h) => h.id)).toEqual(['h1', 'h2', 'h3'])
    const clean = grouped()
    expect(santaReducer(clean, { type: 'dropBlankPeople' })).toBe(clean)
  })
})

test('none of these change a list that has been drawn', () => {
  const drawn = { ...grouped(), step: 'share' as const, draw: { createdAt: '', pairs: { a: 'c', b: 'a', c: 'b' }, sent: {} } }
  expect(santaReducer(drawn, { type: 'setUseHouseholds', on: false })).toBe(drawn)
  expect(santaReducer(drawn, { type: 'movePerson', personId: 'b', to: 'new' })).toBe(drawn)
  expect(santaReducer(drawn, { type: 'dropBlankPeople' })).toBe(drawn)
})
