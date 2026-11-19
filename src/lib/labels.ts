import type { Household } from '../types.ts'

export function householdLabel(household: Household, index: number): string {
  return household.name.trim() || `Household ${index + 1}`
}

/** The household to show next to someone, or '' on a simple list, where households stay hidden. */
export function householdTag(household: Household, index: number, useHouseholds: boolean): string {
  return useHouseholds ? householdLabel(household, index) : ''
}

/** personId -> display name */
export function personNames(households: Household[]): Record<string, string> {
  return Object.fromEntries(households.flatMap((h) => h.people.map((p) => [p.id, p.name.trim() || 'Unnamed'])))
}

/** householdId -> display name */
export function householdNames(households: Household[]): Record<string, string> {
  return Object.fromEntries(households.map((h, i) => [h.id, householdLabel(h, i)]))
}

/** Show `2026-12-24` as a friendly date; leave anything else as typed. */
export function formatDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!m) return value
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** "🧒🏾 Child, 8" / "🧒🏾 Child" for children, empty for adults. */
export function childLabel(person: { isChild: boolean; age: string }): string {
  if (!person.isChild) return ''
  return person.age.trim() ? `🧒🏾 Child, ${person.age.trim()}` : '🧒🏾 Child'
}
