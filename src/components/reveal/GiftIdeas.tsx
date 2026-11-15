import { GIFT_IDEAS } from '../../gifts/gifts.ts'
import { amazonSearchUrl, audienceFor, bandFor, hintQuery, parseBudget, pickIdeas } from '../../lib/gifts.ts'

export const AMAZON_TAG = (import.meta.env.VITE_AMAZON_TAG ?? '').trim()

interface Props {
  receiver: string
  budget?: string
  /** Their own gift hint, searched on Amazon as the first idea. */
  hint?: string
  isChild: boolean
  age?: string
}

/** Amazon gift ideas matched to the budget and the receiver's age. Hidden without an Associates tag. */
export function GiftIdeas({ receiver, budget, hint, isChild, age }: Props) {
  if (!AMAZON_TAG) return null
  const ideas = pickIdeas(GIFT_IDEAS[audienceFor(isChild, age)], bandFor(parseBudget(budget)))
  const fromHint = hintQuery(hint)
  if (ideas.length === 0 && !fromHint) return null

  return (
    <section className="card mt-6 w-full overflow-hidden text-left" aria-labelledby="gift-ideas-heading">
      <div className="px-5 pt-4 pb-2">
        <h2 id="gift-ideas-heading" className="text-lg font-bold">
          🎁 Gift ideas for {receiver}
        </h2>
        <p className="text-sm text-pine-800/70">
          {budget ? `Ideas that usually fit a ${budget} budget` : 'A few ideas to get you started'}
          {isChild ? (age ? `, for around age ${age}.` : ', for kids.') : '.'}
        </p>
      </div>
      <ul className="divide-y divide-cream-200">
        {fromHint && (
          <li>
            <a
              href={amazonSearchUrl(fromHint, AMAZON_TAG)}
              target="_blank"
              rel="noopener sponsored nofollow"
              className="flex items-center gap-3 bg-gold-300/15 px-5 py-3 transition hover:bg-gold-300/30"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-pine-900">Search for “{fromHint}”</span>
                <span className="block text-sm text-pine-800/70">Their own gift hint, searched on Amazon.</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-pine-600">Search ↗</span>
            </a>
          </li>
        )}
        {ideas.map((idea) => (
          <li key={idea.name}>
            <a
              href={amazonSearchUrl(idea.query, AMAZON_TAG)}
              target="_blank"
              rel="noopener sponsored nofollow"
              className="flex items-center gap-3 px-5 py-3 transition hover:bg-pine-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-pine-900">{idea.name}</span>
                <span className="block text-sm text-pine-800/70">{idea.blurb}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-pine-600">Browse ↗</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="border-t border-cream-200 bg-cream-100/60 px-5 py-2 text-xs text-pine-800/60">
        Links open amazon.com.au. As an Amazon Associate we earn from qualifying purchases.
      </p>
    </section>
  )
}
