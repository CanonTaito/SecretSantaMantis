import type { Household } from '../types.ts'
import { newId } from './storage.ts'

/**
 * Import a guest list from CSV with columns: Household, Name, Email, Gift hint.
 * Email and Gift hint are optional. A header row is recommended; without one,
 * columns are read in that order.
 */

export interface ImportedPerson {
  name: string
  email: string
  wishlist: string
}

export interface ImportedHousehold {
  name: string
  people: ImportedPerson[]
}

export type CsvImportResult =
  | { ok: true; households: ImportedHousehold[]; warnings: string[] }
  | { ok: false; error: string }

export const CSV_TEMPLATE = [
  'Household,Name,Email,Gift hint',
  'The Taitos,Cruz,cruz@example.com,Loves online gaming',
  'The Taitos,Rey,,',
  'The Ottos,Vegeta,vegeta@example.com,Batman',
  'Grandma Lina,Grandma Lina,,Gardening',
].join('\r\n')

const LIMITS = { household: 60, name: 60, email: 120, wishlist: 300 }
const MAX_ROWS = 500

/** Parse CSV text into rows of cells. Handles quotes, escaped quotes, newlines in quotes and a BOM. */
export function parseCsv(text: string, delimiter = ','): string[][] {
  const src = text.replace(/^﻿/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

/** Spreadsheet apps in some regions save CSV with semicolons or tabs. */
function detectDelimiter(text: string): string {
  const firstLine = text.replace(/^﻿/, '').split(/\r?\n/, 1)[0] ?? ''
  const count = (d: string) => firstLine.split(d).length - 1
  const candidates = [',', ';', '\t'].map((d) => [d, count(d)] as const)
  candidates.sort((a, b) => b[1] - a[1])
  return candidates[0]![1] > 0 ? candidates[0]![0] : ','
}

type Column = 'household' | 'name' | 'email' | 'wishlist'

const HEADER_ALIASES: Record<string, Column> = {
  household: 'household',
  'household name': 'household',
  family: 'household',
  home: 'household',
  group: 'household',
  name: 'name',
  person: 'name',
  'full name': 'name',
  'first name': 'name',
  email: 'email',
  'e-mail': 'email',
  'email address': 'email',
  'gift hint': 'wishlist',
  hint: 'wishlist',
  wishlist: 'wishlist',
  'wish list': 'wishlist',
  'gift idea': 'wishlist',
  'gift ideas': 'wishlist',
  notes: 'wishlist',
}

const normalizeHeader = (h: string) =>
  h
    .trim()
    .toLowerCase()
    .replace(/\(optional\)/g, '')
    .replace(/[_\s]+/g, ' ')
    .trim()

export function importPeopleCsv(text: string): CsvImportResult {
  const rows = parseCsv(text, detectDelimiter(text)).filter((r) => r.some((c) => c.trim() !== ''))
  if (rows.length === 0) return { ok: false, error: 'That file is empty.' }

  // Header row: any cell that is a known column name.
  const header = rows[0]!.map(normalizeHeader)
  const hasHeader = header.some((h) => h in HEADER_ALIASES)
  const columns = new Map<Column, number>()
  if (hasHeader) {
    header.forEach((h, i) => {
      const col = HEADER_ALIASES[h]
      if (col && !columns.has(col)) columns.set(col, i)
    })
    if (!columns.has('name')) {
      return { ok: false, error: 'Couldn’t find a "Name" column. The first row should be: Household, Name, Email, Gift hint.' }
    }
  } else {
    ;(['household', 'name', 'email', 'wishlist'] as const).forEach((c, i) => columns.set(c, i))
  }

  const body = hasHeader ? rows.slice(1) : rows
  if (body.length > MAX_ROWS) return { ok: false, error: `That file has more than ${MAX_ROWS} people.` }

  const warnings: string[] = []
  const households = new Map<string, ImportedHousehold>()
  const loners: ImportedHousehold[] = []
  const get = (row: string[], col: Column) => {
    const i = columns.get(col)
    return i === undefined ? '' : (row[i] ?? '').trim().slice(0, LIMITS[col])
  }

  body.forEach((row, i) => {
    const line = i + (hasHeader ? 2 : 1)
    const name = get(row, 'name')
    if (!name) {
      warnings.push(`Row ${line} has no name, so it was skipped.`)
      return
    }
    const person = { name, email: get(row, 'email'), wishlist: get(row, 'wishlist') }
    const householdName = get(row, 'household')
    if (!householdName) {
      // No household given: they live on their own.
      loners.push({ name: '', people: [person] })
      return
    }
    const key = householdName.toLocaleLowerCase()
    const existing = households.get(key)
    if (existing) existing.people.push(person)
    else households.set(key, { name: householdName, people: [person] })
  })

  const all = [...households.values(), ...loners]
  if (all.length === 0) return { ok: false, error: 'No people found in that file.' }
  return { ok: true, households: all, warnings }
}

export interface MergeResult {
  households: Household[]
  added: number
  alreadyListed: number
}

const isBlankHousehold = (h: Household) => !h.name.trim() && h.people.every((p) => !p.name.trim())
const key = (s: string) => s.trim().toLocaleLowerCase()

/**
 * Add imported people to the current list. Households with the same name are combined,
 * anyone whose name is already on the list is skipped (so re-importing a file is safe),
 * and empty placeholder households are dropped.
 */
export function mergeImport(current: Household[], imported: ImportedHousehold[]): MergeResult {
  const households = current.filter((h) => !isBlankHousehold(h)).map((h) => ({ ...h, people: [...h.people] }))
  const listed = new Set(households.flatMap((h) => h.people.map((p) => key(p.name))).filter(Boolean))
  let added = 0
  let alreadyListed = 0

  for (const incoming of imported) {
    const fresh = incoming.people.filter((p) => {
      if (listed.has(key(p.name))) {
        alreadyListed++
        return false
      }
      listed.add(key(p.name))
      return true
    })
    if (fresh.length === 0) continue
    added += fresh.length

    const target = incoming.name.trim() ? households.find((h) => key(h.name) === key(incoming.name)) : undefined
    const people = fresh.map((p) => ({ id: newId(), ...p }))
    if (target) target.people = [...target.people.filter((p) => p.name.trim()), ...people]
    else households.push({ id: newId(), name: incoming.name, people })
  }

  return { households, added, alreadyListed }
}
