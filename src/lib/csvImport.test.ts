import { describe, expect, test } from 'vitest'
import type { Household } from '../types.ts'
import { CSV_TEMPLATE, importPeopleCsv, mergeImport, parseCsv } from './csvImport.ts'

describe('parseCsv', () => {
  test('handles quotes, escaped quotes, commas and newlines in cells', () => {
    const text = 'a,"b, c","say ""hi""","line1\nline2"\r\nx,y,,z'
    expect(parseCsv(text)).toEqual([
      ['a', 'b, c', 'say "hi"', 'line1\nline2'],
      ['x', 'y', '', 'z'],
    ])
  })

  test('strips a byte-order mark and ignores a trailing newline', () => {
    expect(parseCsv('﻿Name\nSam\n')).toEqual([['Name'], ['Sam']])
  })
})

describe('importPeopleCsv', () => {
  test('reads the template into households', () => {
    const result = importPeopleCsv(CSV_TEMPLATE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.warnings).toEqual([])
    expect(result.households.map((h) => [h.name, h.people.map((p) => p.name)])).toEqual([
      ['The Taitos', ['Sam', 'Jo']],
      ['The Ottos', ['Alex', 'Priya']],
      ['Grandma Rose', ['Grandma Rose']],
    ])
    expect(result.households[1]!.people[0]).toEqual({
      name: 'Alex',
      email: 'alex@example.com',
      wishlist: 'Coffee, tea or anything cosy',
    })
  })

  test('accepts headers in any order, case and common wording', () => {
    const result = importPeopleCsv('Gift Hint (optional),E-mail,NAME,Family\nBooks,jo@x.test,Jo,the taitos\n,,Sam,The Taitos')
    expect(result.ok && result.households).toEqual([
      {
        name: 'the taitos',
        people: [
          { name: 'Jo', email: 'jo@x.test', wishlist: 'Books' },
          { name: 'Sam', email: '', wishlist: '' },
        ],
      },
    ])
  })

  test('reads semicolon and tab separated files', () => {
    for (const d of [';', '\t']) {
      const result = importPeopleCsv(['Household', 'Name'].join(d) + '\n' + ['The Ottos', 'Alex'].join(d))
      expect(result.ok && result.households[0]!.people[0]!.name).toBe('Alex')
    }
  })

  test('without a header, reads columns as Household, Name, Email, Gift hint', () => {
    const result = importPeopleCsv('The Ottos,Alex,alex@x.test,Tea')
    expect(result.ok && result.households[0]).toEqual({
      name: 'The Ottos',
      people: [{ name: 'Alex', email: 'alex@x.test', wishlist: 'Tea' }],
    })
  })

  test('a blank household means the person lives on their own', () => {
    const result = importPeopleCsv('Household,Name\n,Tom\n,Gran')
    expect(result.ok && result.households.map((h) => h.people.length)).toEqual([1, 1])
  })

  test('skips rows without a name and says which', () => {
    const result = importPeopleCsv('Household,Name\nThe Ottos,\nThe Ottos,Alex\n,,\n')
    expect(result.ok && result.warnings).toEqual(['Row 2 has no name, so it was skipped.'])
  })

  test('explains files it cannot use', () => {
    expect(importPeopleCsv('')).toEqual({ ok: false, error: 'That file is empty.' })
    const noName = importPeopleCsv('Household,Email\nThe Ottos,a@b.c')
    expect(!noName.ok && noName.error).toContain('"Name" column')
    expect(importPeopleCsv('Household,Name\nThe Ottos,').ok).toBe(false)
  })
})

describe('mergeImport', () => {
  const person = (id: string, name: string) => ({ id, name, email: '', wishlist: '' })

  test('replaces empty placeholder households', () => {
    const blank: Household[] = [
      { id: 'h1', name: '', people: [person('p1', '')] },
      { id: 'h2', name: '', people: [person('p2', '')] },
    ]
    const result = mergeImport(blank, [{ name: 'The Ottos', people: [{ name: 'Alex', email: '', wishlist: '' }] }])
    expect(result.households).toHaveLength(1)
    expect(result.households[0]!.name).toBe('The Ottos')
    expect(result.added).toBe(1)
  })

  test('adds to a household with the same name and skips people already listed', () => {
    const current: Household[] = [{ id: 'h1', name: 'The Taitos', people: [person('p1', 'Sam'), person('p2', '')] }]
    const result = mergeImport(current, [
      {
        name: 'the taitos',
        people: [
          { name: 'sam', email: '', wishlist: '' },
          { name: 'Jo', email: '', wishlist: '' },
        ],
      },
    ])
    expect(result.households[0]!.people.map((p) => p.name)).toEqual(['Sam', 'Jo'])
    expect(result).toMatchObject({ added: 1, alreadyListed: 1 })
  })

  test('re-importing the same file adds nobody, including people with no household', () => {
    const parsed = importPeopleCsv(CSV_TEMPLATE + '\r\n,Uncle Tom,,')
    if (!parsed.ok) throw new Error('template should parse')
    const once = mergeImport([], parsed.households)
    expect(once.added).toBe(6)
    const twice = mergeImport(once.households, parsed.households)
    expect(twice).toMatchObject({ added: 0, alreadyListed: 6 })
    expect(twice.households).toHaveLength(once.households.length)
  })

  test('skips a name that is already in a different household', () => {
    const current: Household[] = [{ id: 'h1', name: 'The Taitos', people: [person('p1', 'Sam')] }]
    const result = mergeImport(current, [{ name: 'The Ottos', people: [{ name: 'Sam', email: '', wishlist: '' }] }])
    expect(result).toMatchObject({ added: 0, alreadyListed: 1 })
    expect(result.households).toHaveLength(1)
  })
})
