import { describe, expect, test } from 'vitest'
import { amazonSearchUrl, audienceFor, bandFor, BANDS, hintQuery, parseBudget, pickIdeas, type GiftIdea } from './gifts.ts'
import { GIFT_IDEAS } from '../gifts/gifts.ts'

describe('parseBudget', () => {
  test('reads the dollars out of free text', () => {
    expect(parseBudget('$50')).toBe(50)
    expect(parseBudget('50')).toBe(50)
    expect(parseBudget('under 30')).toBe(30)
    expect(parseBudget('$20-$30')).toBe(30)
    expect(parseBudget('$1,000')).toBe(1000)
    expect(parseBudget('')).toBeNull()
    expect(parseBudget(undefined)).toBeNull()
    expect(parseBudget('something nice')).toBeNull()
  })
})

describe('bands and audiences', () => {
  test('budget bands', () => {
    expect(bandFor(15)).toBe('under20')
    expect(bandFor(20)).toBe('20to50')
    expect(bandFor(50)).toBe('20to50')
    expect(bandFor(80)).toBe('50to100')
    expect(bandFor(150)).toBe('100plus')
    expect(bandFor(null)).toBe('20to50')
  })

  test('audiences by age', () => {
    expect(audienceFor(false, '40')).toBe('adult')
    expect(audienceFor(true, '2')).toBe('kids0to3')
    expect(audienceFor(true, '6')).toBe('kids4to7')
    expect(audienceFor(true, '10')).toBe('kids8to12')
    expect(audienceFor(true, '15')).toBe('teen')
    expect(audienceFor(true, '')).toBe('kids4to7')
    expect(audienceFor(true, undefined)).toBe('kids4to7')
  })
})

describe('pickIdeas', () => {
  const idea = (name: string, band: GiftIdea['band']): GiftIdea => ({ name, blurb: '', query: name, band })
  const ideas = [idea('cheap', 'under20'), idea('mid', '20to50'), idea('high', '50to100'), idea('lux', '100plus')]

  test('never suggests anything pricier than the budget, best fit first', () => {
    expect(pickIdeas(ideas, '20to50').map((i) => i.name)).toEqual(['mid', 'cheap'])
    expect(pickIdeas(ideas, 'under20').map((i) => i.name)).toEqual(['cheap'])
    expect(pickIdeas(ideas, '100plus', 2).map((i) => i.name)).toEqual(['lux', 'high'])
  })

  test('the curated lists give at least 3 ideas for every audience and budget', () => {
    for (const [audience, list] of Object.entries(GIFT_IDEAS)) {
      for (const band of BANDS) {
        expect(pickIdeas(list, band).length, `${audience} ${band}`).toBeGreaterThanOrEqual(3)
      }
    }
  })
})

test('amazon links go to amazon.com.au search with the tag', () => {
  const url = new URL(amazonSearchUrl('LEGO Classic & Duplo', 'secretsantama-22'))
  expect(url.origin).toBe('https://www.amazon.com.au')
  expect(url.pathname).toBe('/s')
  expect(url.searchParams.get('k')).toBe('LEGO Classic & Duplo')
  expect(url.searchParams.get('tag')).toBe('secretsantama-22')
})

describe('hintQuery', () => {
  test('tidies the hint into one search line', () => {
    expect(hintQuery('Batman')).toBe('Batman')
    expect(hintQuery('  Loves gardening\n gloves  ')).toBe('Loves gardening gloves')
    expect(hintQuery('')).toBeNull()
    expect(hintQuery('   ')).toBeNull()
    expect(hintQuery(undefined)).toBeNull()
  })

  test('caps long hints at a word boundary', () => {
    const long = 'word '.repeat(40)
    const q = hintQuery(long)!
    expect(q.length).toBeLessThanOrEqual(80)
    expect(q.endsWith('word')).toBe(true)
  })
})
