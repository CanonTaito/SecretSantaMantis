import type { Exclusion, Household } from '../types.ts'

export type Rng = () => number

export interface DrawPerson {
  id: string
  householdId: string
}

export interface DrawInput {
  people: DrawPerson[]
  /** One-way rules: `giverId` may not draw `receiverId`. Mutual rules are already expanded. */
  exclusions: { giverId: string; receiverId: string }[]
}

/** giverId -> receiverId */
export type Pairs = Record<string, string>

const SHUFFLE_ATTEMPTS = 200

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

/** For each giver, the set of people they are allowed to draw. */
export function allowedReceivers(input: DrawInput): Map<string, Set<string>> {
  const blocked = new Set(input.exclusions.map((e) => `${e.giverId}\u0000${e.receiverId}`))
  const allowed = new Map<string, Set<string>>()
  for (const giver of input.people) {
    const set = new Set<string>()
    for (const receiver of input.people) {
      if (receiver.id === giver.id) continue
      if (receiver.householdId === giver.householdId) continue
      if (blocked.has(`${giver.id}\u0000${receiver.id}`)) continue
      set.add(receiver.id)
    }
    allowed.set(giver.id, set)
  }
  return allowed
}

/**
 * Find a perfect giver -> receiver matching with augmenting paths (Kuhn's algorithm).
 * Givers and candidates are visited in random order so the result varies between runs.
 * Returns null when no valid draw exists.
 */
function randomMatching(ids: string[], allowed: Map<string, Set<string>>, rng: Rng): Pairs | null {
  const candidates = new Map(ids.map((id) => [id, shuffled([...allowed.get(id)!], rng)]))
  const ownerOf = new Map<string, string>() // receiverId -> giverId

  const tryAssign = (giver: string, seen: Set<string>): boolean => {
    for (const receiver of candidates.get(giver)!) {
      if (seen.has(receiver)) continue
      seen.add(receiver)
      const current = ownerOf.get(receiver)
      if (current === undefined || tryAssign(current, seen)) {
        ownerOf.set(receiver, giver)
        return true
      }
    }
    return false
  }

  for (const giver of shuffled(ids, rng)) {
    if (!tryAssign(giver, new Set())) return null
  }

  const pairs: Pairs = {}
  for (const [receiver, giver] of ownerOf) pairs[giver] = receiver
  return pairs
}

/**
 * Draw names so everyone gives exactly one gift and receives exactly one gift,
 * never to themselves, someone in their household, or someone they're excluded from.
 *
 * Tries plain random shuffles first, which picks evenly among all valid draws.
 * If the rules are tight enough that shuffles keep failing, falls back to a
 * randomized matching that always finds a draw when one exists.
 */
export function generateDraw(input: DrawInput, rng: Rng = Math.random): Pairs | null {
  const ids = input.people.map((p) => p.id)
  if (ids.length < 2) return null
  const allowed = allowedReceivers(input)

  for (let attempt = 0; attempt < SHUFFLE_ATTEMPTS; attempt++) {
    const receivers = shuffled(ids, rng)
    if (ids.every((giver, i) => allowed.get(giver)!.has(receivers[i]!))) {
      return Object.fromEntries(ids.map((giver, i) => [giver, receivers[i]!]))
    }
  }

  return randomMatching(ids, allowed, rng)
}

/** A plain-English reason why `generateDraw` returned null for this input. */
export function explainImpossible(
  input: DrawInput,
  names: Record<string, string>,
  householdNames: Record<string, string>,
): string {
  const total = input.people.length
  const name = (id: string) => names[id] || 'Someone'

  const sizes = new Map<string, number>()
  for (const p of input.people) sizes.set(p.householdId, (sizes.get(p.householdId) ?? 0) + 1)
  for (const [householdId, size] of sizes) {
    if (size > total / 2) {
      const label = householdNames[householdId] || 'One household'
      return `${label} ${size === 1 ? 'is' : 'are'} ${size} of ${total} people, so someone would have to draw a housemate. Add more people from other households.`
    }
  }

  const allowed = allowedReceivers(input)
  for (const p of input.people) {
    if (allowed.get(p.id)!.size === 0) {
      return `${name(p.id)} has nobody left to draw — everyone else is in their household or excluded. Remove one of ${name(p.id)}'s exclusions.`
    }
  }
  for (const p of input.people) {
    const canBeDrawn = input.people.some((g) => allowed.get(g.id)!.has(p.id))
    if (!canBeDrawn) {
      return `Nobody is allowed to draw ${name(p.id)}. Remove an exclusion that involves ${name(p.id)}.`
    }
  }

  return 'The households and exclusions are too tight for everyone to get someone. Try removing an exclusion.'
}

/** Turn the organizer's setup into draw input: drop empty households, expand mutual exclusions. */
export function buildDrawInput(households: Household[], exclusions: Exclusion[]): DrawInput {
  const people = households.flatMap((h) => h.people.map((p) => ({ id: p.id, householdId: h.id })))
  const ids = new Set(people.map((p) => p.id))
  const rules = exclusions
    .filter((e) => ids.has(e.giverId) && ids.has(e.receiverId))
    .flatMap((e) => {
      const one = { giverId: e.giverId, receiverId: e.receiverId }
      return e.mutual ? [one, { giverId: e.receiverId, receiverId: e.giverId }] : [one]
    })
  return { people, exclusions: rules }
}

/** Problems that block a draw, in plain English. Empty when the setup is ready. */
export function validateSetup(households: Household[]): string[] {
  const problems: string[] = []
  const people = households.flatMap((h) => h.people)

  if (people.length < 3) {
    problems.push(`Add at least 3 people to draw names (you have ${people.length}).`)
  }

  const blank = people.filter((p) => p.name.trim() === '').length
  if (blank > 0) {
    problems.push(blank === 1 ? 'One person is missing a name.' : `${blank} people are missing a name.`)
  }

  const seen = new Map<string, string>()
  const dupes = new Set<string>()
  for (const p of people) {
    const key = p.name.trim().toLocaleLowerCase()
    if (key === '') continue
    if (seen.has(key)) dupes.add(seen.get(key)!)
    else seen.set(key, p.name.trim())
  }
  for (const d of dupes) {
    problems.push(`More than one person is called "${d}". Add a last initial so everyone knows who is who.`)
  }

  return problems
}
