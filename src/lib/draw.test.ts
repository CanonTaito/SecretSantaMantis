import { describe, expect, test } from 'vitest'
import {
  allowedReceivers,
  planReassign,
  buildDrawInput,
  explainImpossible,
  generateDraw,
  validateSetup,
  type DrawInput,
  type Pairs,
  type Rng,
} from './draw.ts'
import type { Household } from '../types.ts'

/** Small deterministic PRNG so failures are reproducible. */
function seeded(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function groups(...sizes: number[]): DrawInput {
  const people = sizes.flatMap((size, h) =>
    Array.from({ length: size }, (_, i) => ({ id: `h${h}p${i}`, householdId: `h${h}` })),
  )
  return { people, exclusions: [] }
}

function assertValid(input: DrawInput, pairs: Pairs | null) {
  expect(pairs).not.toBeNull()
  const p = pairs!
  const household = new Map(input.people.map((x) => [x.id, x.householdId]))
  const blocked = new Set(input.exclusions.map((e) => `${e.giverId}>${e.receiverId}`))

  expect(Object.keys(p).sort()).toEqual(input.people.map((x) => x.id).sort())
  expect(Object.values(p).sort()).toEqual(input.people.map((x) => x.id).sort())
  for (const [giver, receiver] of Object.entries(p)) {
    expect(receiver).not.toBe(giver)
    expect(household.get(receiver)).not.toBe(household.get(giver))
    expect(blocked.has(`${giver}>${receiver}`)).toBe(false)
  }
}

describe('generateDraw', () => {
  test('everyone gives and receives once, never within a household', () => {
    const input = groups(2, 3, 1, 2)
    assertValid(input, generateDraw(input, seeded(1)))
  })

  test('respects one-way exclusions', () => {
    const input = groups(1, 1, 1)
    input.exclusions = [{ giverId: 'h0p0', receiverId: 'h1p0' }]
    for (let s = 0; s < 50; s++) {
      const pairs = generateDraw(input, seeded(s))
      assertValid(input, pairs)
      expect(pairs!.h0p0).toBe('h2p0')
    }
  })

  test('one-way exclusion still lets the other person draw back', () => {
    const input = groups(1, 1, 1)
    input.exclusions = [{ giverId: 'h0p0', receiverId: 'h1p0' }]
    // With 3 singles the only valid cycle that avoids h0->h1 is h0->h2->h1->h0.
    const pairs = generateDraw(input, seeded(3))!
    expect(pairs.h1p0).toBe('h0p0')
  })

  test('mutual exclusions block both directions', () => {
    const hh: Household[] = [
      { id: 'a', name: 'A', people: [{ id: 'a1', name: 'A1', email: '', wishlist: '' }] },
      { id: 'b', name: 'B', people: [{ id: 'b1', name: 'B1', email: '', wishlist: '' }] },
      { id: 'c', name: 'C', people: [{ id: 'c1', name: 'C1', email: '', wishlist: '' }] },
      { id: 'd', name: 'D', people: [{ id: 'd1', name: 'D1', email: '', wishlist: '' }] },
    ]
    const input = buildDrawInput(hh, [{ id: 'x', giverId: 'a1', receiverId: 'b1', mutual: true }])
    expect(input.exclusions).toHaveLength(2)
    for (let s = 0; s < 50; s++) {
      const pairs = generateDraw(input, seeded(s))
      assertValid(input, pairs)
      expect(pairs!.a1).not.toBe('b1')
      expect(pairs!.b1).not.toBe('a1')
    }
  })

  test('returns null when a household is more than half the group', () => {
    expect(generateDraw(groups(5, 1, 2), seeded(1))).toBeNull()
  })

  test('exactly half in one household still works', () => {
    const input = groups(3, 2, 1)
    assertValid(input, generateDraw(input, seeded(9)))
  })

  test('returns null when exclusions leave someone with nobody', () => {
    const input = groups(1, 1, 1)
    input.exclusions = [
      { giverId: 'h0p0', receiverId: 'h1p0' },
      { giverId: 'h0p0', receiverId: 'h2p0' },
    ]
    expect(generateDraw(input, seeded(1))).toBeNull()
  })

  test('returns null for fewer than two people', () => {
    expect(generateDraw(groups(1), seeded(1))).toBeNull()
    expect(generateDraw(groups(), seeded(1))).toBeNull()
  })

  test('finds tight draws that random shuffles rarely hit', () => {
    // Two households of 10: the only valid draws send every gift across the divide.
    const input = groups(10, 10)
    assertValid(input, generateDraw(input, seeded(42)))
  })

  test('1,000 random groups are either drawn validly or truly impossible', () => {
    const rng = seeded(2026)
    for (let run = 0; run < 1000; run++) {
      const householdCount = 1 + Math.floor(rng() * 6)
      const sizes = Array.from({ length: householdCount }, () => 1 + Math.floor(rng() * 4))
      const input = groups(...sizes)
      const total = input.people.length
      const exclusionCount = Math.floor(rng() * 3)
      for (let e = 0; e < exclusionCount && total > 1; e++) {
        const g = input.people[Math.floor(rng() * total)]!
        const r = input.people[Math.floor(rng() * total)]!
        if (g.id !== r.id) input.exclusions.push({ giverId: g.id, receiverId: r.id })
      }

      const pairs = generateDraw(input, rng)
      const biggest = Math.max(0, ...sizes)
      if (pairs) {
        assertValid(input, pairs)
      } else if (input.exclusions.length === 0) {
        // Without exclusions, the only reasons to fail are size-based.
        expect(total < 2 || biggest > total / 2).toBe(true)
      }
    }
  })

  test('different seeds give different draws', () => {
    const input = groups(1, 1, 1, 1, 1, 1)
    const results = new Set(
      Array.from({ length: 20 }, (_, s) => JSON.stringify(generateDraw(input, seeded(s)))),
    )
    expect(results.size).toBeGreaterThan(5)
  })
})

describe('explainImpossible', () => {
  const names = { h0p0: 'Cruz', h1p0: 'Vegeta', h2p0: 'Rey' }

  test('names an oversized household', () => {
    const msg = explainImpossible(groups(5, 1, 2), {}, { h0: 'The Ottos' })
    expect(msg).toContain('The Ottos are 5 of 8 people')
  })

  test('names a person with nobody to draw', () => {
    const input = groups(1, 1, 1)
    input.exclusions = [
      { giverId: 'h0p0', receiverId: 'h1p0' },
      { giverId: 'h0p0', receiverId: 'h2p0' },
    ]
    expect(explainImpossible(input, names, {})).toContain('Cruz has nobody left to draw')
  })

  test('names a person nobody can draw', () => {
    const input = groups(1, 1, 1)
    input.exclusions = [
      { giverId: 'h0p0', receiverId: 'h2p0' },
      { giverId: 'h1p0', receiverId: 'h2p0' },
    ]
    expect(explainImpossible(input, names, {})).toContain('Nobody is allowed to draw Rey')
  })
})

describe('validateSetup', () => {
  const person = (id: string, name: string) => ({ id, name, email: '', wishlist: '' })

  test('needs at least three people', () => {
    const hh: Household[] = [{ id: 'a', name: 'A', people: [person('1', 'Cruz'), person('2', 'Rey')] }]
    expect(validateSetup(hh)[0]).toContain('at least 3 people')
  })

  test('flags blank and duplicate names, ignoring case and spaces', () => {
    const hh: Household[] = [
      { id: 'a', name: 'A', people: [person('1', 'Cruz'), person('2', ' cruz ')] },
      { id: 'b', name: 'B', people: [person('3', '')] },
      { id: 'c', name: 'C', people: [] },
    ]
    const problems = validateSetup(hh)
    expect(problems).toContain('One person is missing a name.')
    expect(problems.some((p) => p.includes('"Cruz"'))).toBe(true)
  })

  test('passes a good setup', () => {
    const hh: Household[] = [
      { id: 'a', name: 'A', people: [person('1', 'Cruz'), person('2', 'Rey')] },
      { id: 'b', name: 'B', people: [person('3', 'Vegeta')] },
    ]
    expect(validateSetup(hh)).toEqual([])
  })
})

describe('planReassign', () => {
  // Four people living alone, drawn in a loop a->b->c->d->a.
  const input = groups(1, 1, 1, 1)
  const pairs = { h0p0: 'h1p0', h1p0: 'h2p0', h2p0: 'h3p0', h3p0: 'h0p0' }

  test('trades receivers with whoever has the new one', () => {
    const plan = planReassign(pairs, allowedReceivers(input), 'h0p0', 'h2p0')
    expect(plan).toEqual({ otherGiverId: 'h1p0', otherNewReceiverId: 'h1p0', ok: false })
  })

  test('is ok when both sides of the trade are allowed', () => {
    const plan = planReassign(pairs, allowedReceivers(input), 'h0p0', 'h3p0')
    expect(plan).toEqual({ otherGiverId: 'h2p0', otherNewReceiverId: 'h1p0', ok: true })
  })

  test('blocks trades that break a household or exclusion rule', () => {
    const withRule: DrawInput = { ...input, exclusions: [{ giverId: 'h2p0', receiverId: 'h1p0' }] }
    expect(planReassign(pairs, allowedReceivers(withRule), 'h0p0', 'h3p0')!.ok).toBe(false)
    const housemates = groups(2, 1, 1)
    const hp = { h0p0: 'h1p0', h1p0: 'h0p1', h0p1: 'h2p0', h2p0: 'h0p0' }
    expect(planReassign(hp, allowedReceivers(housemates), 'h0p0', 'h0p1')!.ok).toBe(false)
  })

  test('returns null when nothing would change', () => {
    expect(planReassign(pairs, allowedReceivers(input), 'h0p0', 'h1p0')).toBeNull()
  })
})
