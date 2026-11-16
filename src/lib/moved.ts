import { REVEAL_PREFIX } from './revealLink.ts'
import type { SantaState } from '../types.ts'

/** The site's main address. The old GitHub Pages copy sends visitors here. */
export const NEW_HOME = 'https://secretsanta.taitoapps.com/'

/** Old addresses that should move people to NEW_HOME. */
const OLD_HOSTS = ['canontaito.github.io']

export function isOldHost(hostname: string): boolean {
  return OLD_HOSTS.includes(hostname.toLowerCase())
}

/** True when this browser holds anything the organiser typed in, which the new address can't see. */
export function hasSavedWork(state: SantaState | null): boolean {
  if (!state) return false
  if (state.draw) return true
  const { name, budget, date } = state.event
  if (name.trim() || budget.trim() || date.trim()) return true
  return state.households.some((h) => h.people.some((p) => p.name.trim()))
}

export type MovePlan = { kind: 'stay' } | { kind: 'redirect'; url: string } | { kind: 'notice' }

/**
 * What the old address should do:
 * - reveal links always go straight to the new address, keeping the match after `#`;
 * - organisers with saved work stay and see a "we've moved" notice so they can download a backup first;
 * - everyone else goes straight to the new address.
 */
export function planMove(where: { hostname: string; search: string; hash: string }, saved: boolean): MovePlan {
  if (!isOldHost(where.hostname)) return { kind: 'stay' }
  const url = NEW_HOME + where.search + where.hash
  if (where.hash.startsWith(REVEAL_PREFIX)) return { kind: 'redirect', url }
  return saved ? { kind: 'notice' } : { kind: 'redirect', url }
}
