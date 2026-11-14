import { downloadText } from './download.ts'
import type { Draw, EventDetails, Exclusion, Household, Person, SantaState, Step } from '../types.ts'

export const STORAGE_KEY = 'secret-santa-v1'
const BACKUP_APP = 'secret-santa-mantis'

export function newId(): string {
  return crypto.randomUUID()
}

export function newPerson(): Person {
  return { id: newId(), name: '', email: '', wishlist: '', isChild: false, age: '' }
}

export function newHousehold(): Household {
  return { id: newId(), name: '', people: [newPerson()] }
}

export function createInitialState(): SantaState {
  return {
    version: 1,
    step: 'setup',
    event: { name: '', budget: '', date: '' },
    households: [newHousehold(), newHousehold()],
    exclusions: [],
    draw: null,
  }
}

// ---------- validation ----------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const STEPS: Step[] = ['setup', 'draw', 'share']

function parsePerson(v: unknown): Person | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.name)) return null
  return {
    id: v.id,
    name: v.name,
    email: isStr(v.email) ? v.email : '',
    wishlist: isStr(v.wishlist) ? v.wishlist : '',
    isChild: v.isChild === true,
    age: v.isChild === true && isStr(v.age) ? v.age : '',
  }
}

function parseHousehold(v: unknown): Household | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.name) || !Array.isArray(v.people)) return null
  const people = v.people.map(parsePerson)
  if (people.some((p) => p === null)) return null
  return { id: v.id, name: v.name, people: people as Person[] }
}

function parseExclusion(v: unknown): Exclusion | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.giverId) || !isStr(v.receiverId)) return null
  return { id: v.id, giverId: v.giverId, receiverId: v.receiverId, mutual: v.mutual === true }
}

function parseEvent(v: unknown): EventDetails | null {
  if (!isObj(v)) return null
  return {
    name: isStr(v.name) ? v.name : '',
    budget: isStr(v.budget) ? v.budget : '',
    date: isStr(v.date) ? v.date : '',
  }
}

function parseDraw(v: unknown, personIds: Set<string>): Draw | null | undefined {
  if (v === null) return null
  if (!isObj(v) || !isStr(v.createdAt) || !isObj(v.pairs)) return undefined
  const pairs: Record<string, string> = {}
  const receivers = new Set<string>()
  for (const [giver, receiver] of Object.entries(v.pairs)) {
    if (!isStr(receiver) || !personIds.has(giver) || !personIds.has(receiver)) return undefined
    if (giver === receiver || receivers.has(receiver)) return undefined
    receivers.add(receiver)
    pairs[giver] = receiver
  }
  if (Object.keys(pairs).length !== personIds.size) return undefined
  const sent: Record<string, boolean> = {}
  if (isObj(v.sent)) {
    for (const [giver, value] of Object.entries(v.sent)) {
      if (personIds.has(giver) && value === true) sent[giver] = true
    }
  }
  return { createdAt: v.createdAt, pairs, sent }
}

/** Validate untrusted data (localStorage or an uploaded file) into a SantaState, or null. */
export function parseState(v: unknown): SantaState | null {
  if (!isObj(v) || v.version !== 1) return null
  if (!Array.isArray(v.households) || !Array.isArray(v.exclusions)) return null

  const event = parseEvent(v.event)
  const households = v.households.map(parseHousehold)
  const exclusions = v.exclusions.map(parseExclusion)
  if (!event || households.some((h) => h === null) || exclusions.some((e) => e === null)) return null

  const hh = households as Household[]
  const ids = hh.flatMap((h) => h.people.map((p) => p.id))
  const personIds = new Set(ids)
  if (personIds.size !== ids.length) return null

  const draw = parseDraw(v.draw ?? null, personIds)
  if (draw === undefined) return null

  const step: Step = STEPS.includes(v.step as Step) ? (v.step as Step) : 'setup'
  return {
    version: 1,
    step: draw ? 'share' : step === 'share' ? 'setup' : step,
    event,
    households: hh,
    exclusions: (exclusions as Exclusion[]).filter((e) => personIds.has(e.giverId) && personIds.has(e.receiverId)),
    draw,
  }
}

// ---------- localStorage ----------

export function loadState(): SantaState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseState(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function saveState(state: SantaState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be full or blocked (private mode). The app still works for this visit.
  }
}

// ---------- backup files ----------

export function serializeBackup(state: SantaState, now = new Date()): string {
  return JSON.stringify({ app: BACKUP_APP, exportedAt: now.toISOString(), state }, null, 2)
}

/** Accepts our backup wrapper (or a bare state object). Returns null for anything else. */
export function parseBackup(text: string): SantaState | null {
  try {
    const data: unknown = JSON.parse(text)
    if (isObj(data) && data.app === BACKUP_APP) return parseState(data.state)
    return parseState(data)
  } catch {
    return null
  }
}

export function backupFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `secret-santa-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`
}

export function exportBackup(state: SantaState): void {
  downloadText(backupFileName(), serializeBackup(state), 'application/json')
}
