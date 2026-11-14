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
    expect(parseCsv('\uFEFFName\nCruz\n')).toEqual([['Name'], ['Cruz']])
  })
})

describe('importPeopleCsv', () => {
  test('reads the template into households', () => {
    const result = importPeopleCsv(CSV_TEMPLATE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.warnings).toEqual([])
    expect(result.households.map((h) => [h.name, h.people.map((p) => p.name)])).toEqual([
      ['The Taitos', ['Cruz', 'Rey']],
      ['The Ottos', ['Vegeta']],
      ['Grandma Lina', ['Grandma Lina']],
    ])
    expect(result.households[1]!.people[0]).toEqual({
      name: 'Vegeta',
      email: 'vegeta@example.com',
      wishlist: 'Batman',
      isChild: true,
      age: '2',
    })
    expect(result.households[0]!.people.map((p) => [p.name, p.isChild, p.age])).toEqual([
      ['Cruz', false, ''],
      ['Rey', true, '8'],
    ])
  })

  test('reads Child and Age, and drops an age for someone not marked as a child', () => {
    const result = importPeopleCsv('Name,Household,Child?,Age\nMia,The Ottos,y,6\nTom,,,40\nAva,,no,')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.households.flatMap((h) => h.people.map((p) => [p.name, p.isChild, p.age]))).toEqual([
      ['Mia', true, '6'],
      ['Tom', false, ''],
      ['Ava', false, ''],
    ])
    expect(result.warnings).toEqual(["Row 3 has an age but isn't marked as a child, so the age was left out."])
  })

  test('accepts headers in any order, case and common wording', () => {
    const result = importPeopleCsv('Gift Hint (optional),E-mail,NAME,Family\nBooks,rey@x.test,Rey,the taitos\n,,Cruz,The Taitos')
    expect(result.ok && result.households).toEqual([
      {
        name: 'the taitos',
        people: [
          { name: 'Rey', email: 'rey@x.test', wishlist: 'Books', isChild: false, age: '' },
          { name: 'Cruz', email: '', wishlist: '', isChild: false, age: '' },
        ],
      },
    ])
  })

  test('reads semicolon and tab separated files', () => {
    for (const d of [';', '\t']) {
      const result = importPeopleCsv(['Household', 'Name'].join(d) + '\n' + ['The Ottos', 'Vegeta'].join(d))
      expect(result.ok && result.households[0]!.people[0]!.name).toBe('Vegeta')
    }
  })

  test('without a header, reads columns as Household, Name, Email, Gift hint', () => {
    const result = importPeopleCsv('The Ottos,Vegeta,vegeta@x.test,Tea')
    expect(result.ok && result.households[0]).toEqual({
      name: 'The Ottos',
      people: [{ name: 'Vegeta', email: 'vegeta@x.test', wishlist: 'Tea', isChild: false, age: '' }],
    })
  })

  test('a blank household means the person lives on their own', () => {
    const result = importPeopleCsv('Household,Name\n,Tom\n,Gran')
    expect(result.ok && result.households.map((h) => h.people.length)).toEqual([1, 1])
  })

  test('skips rows without a name and says which', () => {
    const result = importPeopleCsv('Household,Name\nThe Ottos,\nThe Ottos,Vegeta\n,,\n')
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
  const person = (id: string, name: string) => ({ id, name, email: '', wishlist: '', isChild: false, age: '' })

  test('replaces empty placeholder households', () => {
    const blank: Household[] = [
      { id: 'h1', name: '', people: [person('p1', '')] },
      { id: 'h2', name: '', people: [person('p2', '')] },
    ]
    const result = mergeImport(blank, [{ name: 'The Ottos', people: [{ name: 'Vegeta', email: '', wishlist: '', isChild: false, age: '' }] }])
    expect(result.households).toHaveLength(1)
    expect(result.households[0]!.name).toBe('The Ottos')
    expect(result.added).toBe(1)
  })

  test('adds to a household with the same name and skips people already listed', () => {
    const current: Household[] = [{ id: 'h1', name: 'The Taitos', people: [person('p1', 'Cruz'), person('p2', '')] }]
    const result = mergeImport(current, [
      {
        name: 'the taitos',
        people: [
          { name: 'cruz', email: '', wishlist: '', isChild: false, age: '' },
          { name: 'Rey', email: '', wishlist: '', isChild: false, age: '' },
        ],
      },
    ])
    expect(result.households[0]!.people.map((p) => p.name)).toEqual(['Cruz', 'Rey'])
    expect(result).toMatchObject({ added: 1, alreadyListed: 1 })
  })

  test('re-importing the same file adds nobody, including people with no household', () => {
    const parsed = importPeopleCsv(CSV_TEMPLATE + '\r\n,Uncle Tom,,')
    if (!parsed.ok) throw new Error('template should parse')
    const once = mergeImport([], parsed.households)
    expect(once.added).toBe(5)
    const twice = mergeImport(once.households, parsed.households)
    expect(twice).toMatchObject({ added: 0, alreadyListed: 5 })
    expect(twice.households).toHaveLength(once.households.length)
  })

  test('skips a name that is already in a different household', () => {
    const current: Household[] = [{ id: 'h1', name: 'The Taitos', people: [person('p1', 'Cruz')] }]
    const result = mergeImport(current, [{ name: 'The Ottos', people: [{ name: 'Cruz', email: '', wishlist: '', isChild: false, age: '' }] }])
    expect(result).toMatchObject({ added: 0, alreadyListed: 1 })
    expect(result.households).toHaveLength(1)
  })
})
