import { beforeEach, describe, expect, test } from 'vitest'
import type { SantaState } from '../types.ts'
import { STORAGE_KEY, backupFileName, createInitialState, loadState, parseBackup, saveState, serializeBackup } from './storage.ts'
import { santaReducer } from '../hooks/santaReducer.ts'

function sample(): SantaState {
  return {
    version: 1,
    step: 'share',
    event: { name: 'Family Xmas', budget: '$50', date: '2026-12-24' },
    households: [
      {
        id: 'h1',
        name: 'The Taitos',
        people: [
          { id: 'a', name: 'Cruz', email: 'cruz@example.com', wishlist: 'Books', isChild: false, age: '' },
          { id: 'b', name: 'Rey', email: '', wishlist: '', isChild: false, age: '' },
        ],
      },
      { id: 'h2', name: 'The Lees', people: [{ id: 'c', name: 'Vegeta', email: '', wishlist: '', isChild: false, age: '' }] },
      { id: 'h3', name: 'Gran', people: [{ id: 'd', name: 'Gran', email: '', wishlist: 'Tea', isChild: false, age: '' }] },
    ],
    useHouseholds: true,
    exclusions: [{ id: 'x', giverId: 'a', receiverId: 'c', mutual: true }],
    draw: { createdAt: '2026-11-14T00:00:00.000Z', pairs: { a: 'd', b: 'c', c: 'a', d: 'b' }, sent: { a: true } },
  }
}

describe('backups', () => {
  test('round-trip keeps setup, matches and sent ticks', () => {
    expect(parseBackup(serializeBackup(sample()))).toEqual(sample())
  })

  test('accepts a bare state object', () => {
    expect(parseBackup(JSON.stringify(sample()))).toEqual(sample())
  })

  test('rejects non-JSON, other apps and wrong versions', () => {
    expect(parseBackup('not json')).toBeNull()
    expect(parseBackup('{"hello":"world"}')).toBeNull()
    expect(parseBackup(JSON.stringify({ ...sample(), version: 2 }))).toBeNull()
    expect(parseBackup(JSON.stringify({ app: 'secret-santa-mantis', state: { version: 1 } }))).toBeNull()
  })

  test('rejects draws that point at missing people or repeat a receiver', () => {
    const missing = sample()
    missing.draw!.pairs.a = 'zzz'
    expect(parseBackup(JSON.stringify(missing))).toBeNull()

    const repeated = sample()
    repeated.draw!.pairs = { a: 'c', b: 'c', c: 'a', d: 'b' }
    expect(parseBackup(JSON.stringify(repeated))).toBeNull()

    const partial = sample()
    delete partial.draw!.pairs.d
    expect(parseBackup(JSON.stringify(partial))).toBeNull()
  })

  test('rejects duplicate person ids', () => {
    const s = sample()
    s.households[1]!.people[0]!.id = 'a'
    expect(parseBackup(JSON.stringify(s))).toBeNull()
  })

  test('file name includes the date', () => {
    expect(backupFileName(new Date(2026, 11, 3))).toBe('secret-santa-backup-2026-12-03.json')
  })
})

describe('localStorage', () => {
  beforeEach(() => localStorage.clear())

  test('saves and loads', () => {
    saveState(sample())
    expect(loadState()).toEqual(sample())
  })

  test('ignores corrupt data', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    expect(loadState()).toBeNull()
  })
})

describe('reducer', () => {
  test('setup is frozen while a draw exists, and unlocks after clearDraw', () => {
    const s = sample()
    expect(santaReducer(s, { type: 'renameHousehold', householdId: 'h1', name: 'X' })).toBe(s)
    const cleared = santaReducer(s, { type: 'clearDraw' })
    expect(cleared.draw).toBeNull()
    expect(cleared.step).toBe('setup')
    expect(santaReducer(cleared, { type: 'renameHousehold', householdId: 'h1', name: 'X' }).households[0]!.name).toBe('X')
  })

  test('removing a person also removes their exclusions', () => {
    const s = { ...sample(), draw: null, step: 'setup' as const }
    const next = santaReducer(s, { type: 'removePerson', personId: 'c' })
    expect(next.exclusions).toEqual([])
    expect(next.households[1]!.people).toEqual([])
  })

  test('markSent toggles a tick', () => {
    const s = sample()
    expect(santaReducer(s, { type: 'markSent', giverId: 'b', sent: true }).draw!.sent).toEqual({ a: true, b: true })
    expect(santaReducer(s, { type: 'markSent', giverId: 'a', sent: false }).draw!.sent).toEqual({})
  })

  test('duplicate and self exclusions are ignored', () => {
    const s = { ...sample(), draw: null, step: 'setup' as const }
    expect(santaReducer(s, { type: 'addExclusion', giverId: 'c', receiverId: 'a', mutual: false })).toBe(s)
    expect(santaReducer(s, { type: 'addExclusion', giverId: 'a', receiverId: 'a', mutual: false })).toBe(s)
  })
})

describe('swapReceivers', () => {
  test('swaps two matches and un-ticks both as sent', () => {
    const s = sample()
    const next = santaReducer(s, { type: 'swapReceivers', giverA: 'a', giverB: 'b' })
    expect(next.draw!.pairs).toEqual({ a: 'c', b: 'd', c: 'a', d: 'b' })
    expect(next.draw!.sent).toEqual({})
  })

  test('works while setup is locked, and ignores bad ids', () => {
    const s = sample()
    expect(santaReducer(s, { type: 'swapReceivers', giverA: 'a', giverB: 'zzz' })).toBe(s)
    expect(santaReducer(s, { type: 'swapReceivers', giverA: 'a', giverB: 'a' })).toBe(s)
  })
})

describe('children in backups', () => {
  test('keeps child and age, and fills them in for older backups', () => {
    const s = sample()
    s.households[0]!.people[1] = { ...s.households[0]!.people[1]!, isChild: true, age: '8' }
    expect(parseBackup(serializeBackup(s))!.households[0]!.people[1]).toMatchObject({ isChild: true, age: '8' })

    const old = JSON.parse(JSON.stringify(sample()))
    for (const h of old.households) for (const p of h.people) { delete p.isChild; delete p.age }
    expect(parseBackup(JSON.stringify(old))!.households[0]!.people[0]).toMatchObject({ isChild: false, age: '' })
  })
})

describe('simple list or households', () => {
  const single = (id: string, name: string) => ({
    id: `h-${id}`,
    name: '',
    people: [{ id, name, email: '', wishlist: '', isChild: false, age: '' }],
  })

  test('a new list starts as a simple list with three empty rows', () => {
    const s = createInitialState()
    expect(s.useHouseholds).toBe(false)
    expect(s.households).toHaveLength(3)
    expect(s.households.every((h) => h.people.length === 1 && h.name === '')).toBe(true)
  })

  test('older saves without the flag open the way they looked', () => {
    const grouped = JSON.parse(JSON.stringify(sample()))
    delete grouped.useHouseholds
    expect(parseBackup(JSON.stringify(grouped))!.useHouseholds).toBe(true)

    const singles = { ...grouped, draw: null, exclusions: [], households: [single('a', 'A'), single('b', 'B'), single('c', 'C')] }
    expect(parseBackup(JSON.stringify(singles))!.useHouseholds).toBe(false)
  })

  test('the flag survives a backup, but never hides real households', () => {
    const simple = { ...sample(), draw: null, exclusions: [], households: [single('a', 'A'), single('b', 'B'), single('c', 'C')], useHouseholds: false }
    expect(parseBackup(serializeBackup(simple))!.useHouseholds).toBe(false)
    expect(parseBackup(JSON.stringify({ ...sample(), useHouseholds: false }))!.useHouseholds).toBe(true)
  })
})
