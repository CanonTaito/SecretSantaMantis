/** Price bands for gift ideas, cheapest first. */
export const BANDS = ['under20', '20to50', '50to100', '100plus'] as const
export type Band = (typeof BANDS)[number]

export type Audience = 'adult' | 'kids0to3' | 'kids4to7' | 'kids8to12' | 'teen'

export interface GiftIdea {
  /** Short name shown in the list. */
  name: string
  /** One line in our own words (Amazon requires original content alongside search links). */
  blurb: string
  /** What to search for on amazon.com.au. */
  query: string
  /** The price band this idea usually fits in. */
  band: Band
}

/** The budget in dollars, from free text like "$50", "50 AUD", "$20-30". Null if none. */
export function parseBudget(text: string | undefined): number | null {
  const numbers = (text ?? '').replace(/,/g, '').match(/\d+(\.\d+)?/g)
  if (!numbers) return null
  const max = Math.max(...numbers.map(Number))
  return max > 0 ? max : null
}

/** Which band a budget falls in. With no budget, assume a typical $20–50 Secret Santa. */
export function bandFor(budget: number | null): Band {
  if (budget === null) return '20to50'
  if (budget < 20) return 'under20'
  if (budget <= 50) return '20to50'
  if (budget <= 100) return '50to100'
  return '100plus'
}

/** Adults, or children grouped by age. A child with no age gets the 4–7 list. */
export function audienceFor(isChild: boolean, age: string | undefined): Audience {
  if (!isChild) return 'adult'
  const years = parseFloat(age ?? '')
  if (Number.isNaN(years)) return 'kids4to7'
  if (years < 4) return 'kids0to3'
  if (years < 8) return 'kids4to7'
  if (years < 13) return 'kids8to12'
  return 'teen'
}

/** Up to `limit` ideas within budget: the budget's own band first, then cheaper (never pricier). */
export function pickIdeas(ideas: readonly GiftIdea[], band: Band, limit = 5): GiftIdea[] {
  const top = BANDS.indexOf(band)
  return ideas
    .filter((idea) => BANDS.indexOf(idea.band) <= top)
    .sort((a, b) => BANDS.indexOf(b.band) - BANDS.indexOf(a.band))
    .slice(0, limit)
}

/** An amazon.com.au search link carrying the Associates tracking tag. */
export function amazonSearchUrl(query: string, tag: string): string {
  return `https://www.amazon.com.au/s?k=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}`
}
