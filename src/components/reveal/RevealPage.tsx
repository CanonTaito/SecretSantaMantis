import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { RevealPayload } from '../../lib/revealLink.ts'
import { formatDate } from '../../lib/labels.ts'
import { GiftBox, type GiftPhase } from './GiftBox.tsx'
import { AdBanner } from '../ads/AdBanner.tsx'
import { GiftIdeas } from './GiftIdeas.tsx'
import { countUnwrapOnce } from '../../lib/count.ts'
import { InviteCard } from './InviteCard.tsx'

const COLORS = ['#c8323b', '#2f7a55', '#e3b341', '#fffdf8']

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function celebrate() {
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 50 }
  void confetti({ ...base, particleCount: 120, spread: 80, startVelocity: 45, origin: { y: 0.55 } })
  window.setTimeout(() => {
    void confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } })
    void confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } })
  }, 250)
}

function homeHref() {
  return window.location.pathname + window.location.search
}

export function RevealPage({ payload }: { payload: RevealPayload | null }) {
  const [phase, setPhase] = useState<GiftPhase>('wrapped')
  const timer = useRef<number | undefined>(undefined)
  const heading = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    document.title = payload ? `🎁 ${payload.g}'s Secret Santa` : 'Secret Santa Mantis'
    return () => clearTimeout(timer.current)
  }, [payload])

  useEffect(() => {
    if (phase !== 'open') return
    heading.current?.focus()
    countUnwrapOnce(window.location.hash)
  }, [phase])

  if (!payload) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl" aria-hidden>
          🧦
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-pine-800">This link looks broken</h1>
        <p className="mt-2 text-pine-800/75">
          It may have been cut off when it was copied. Ask your organizer to send it again.
        </p>
        <a className="btn-secondary mt-8" href={homeHref()}>
          Start your own Secret Santa
        </a>
      </main>
    )
  }

  const open = () => {
    if (phase !== 'wrapped') return
    if (prefersReducedMotion()) {
      setPhase('open')
      return
    }
    setPhase('opening')
    timer.current = window.setTimeout(() => {
      setPhase('open')
      celebrate()
    }, 900)
  }

  const kidChip = payload.k === '1' ? (payload.a ? `🧒🏾 Age ${payload.a}` : '🧒🏾 Child') : ''
  const chips = [kidChip, payload.b && `💰 Budget: ${payload.b}`, payload.d && `📅 ${formatDate(payload.d)}`].filter(
    (c): c is string => !!c,
  )

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-4 pt-10 pb-12 text-center sm:pt-16">
      {payload.e && (
        <p className="rounded-full bg-pine-700 px-4 py-1 text-sm font-semibold text-cream-50 shadow-sm">🎄 {payload.e}</p>
      )}
      <h1 className="mt-4 text-4xl font-extrabold text-pine-800 sm:text-5xl">Hi {payload.g}!</h1>

      {phase !== 'open' ? (
        <>
          <p className="mt-3 text-pine-800/75">
            Your Secret Santa match is wrapped up below.
            <br />
            Make sure nobody's peeking 👀
          </p>
          <div className="mt-10 mb-4">
            <GiftBox phase={phase} onOpen={open} />
          </div>
          <p className="text-sm font-semibold text-berry-600" aria-hidden={phase !== 'wrapped'}>
            {phase === 'wrapped' ? 'Tap the present to unwrap' : 'Unwrapping…'}
          </p>
        </>
      ) : (
        <div className="reveal-card card mt-8 w-full overflow-hidden">
          <div className="bg-berry-500 py-2 text-sm font-semibold tracking-widest text-cream-50 uppercase">
            You're buying for
          </div>
          <div className="px-6 pt-6 pb-7">
            <p
              ref={heading}
              tabIndex={-1}
              className="font-display text-5xl font-extrabold break-words text-berry-600 outline-none sm:text-6xl"
            >
              {payload.r}
            </p>

            {payload.w && (
              <div className="mt-5 rounded-xl bg-gold-300/20 px-4 py-3 text-left">
                <p className="text-xs font-semibold tracking-wide text-pine-700/80 uppercase">🎁 Their gift hint</p>
                <p className="mt-1 whitespace-pre-line text-pine-900">{payload.w}</p>
              </div>
            )}

            {chips.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                {chips.map((c) => (
                  <span key={c} className="rounded-full bg-pine-50 px-3 py-1 text-pine-800">
                    {c}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-6 text-sm text-pine-800/70">Keep it secret! 🤫</p>
            <button type="button" className="btn-secondary mt-4" onClick={() => setPhase('wrapped')}>
              🙈 Hide it again
            </button>
          </div>
        </div>
      )}

      {phase === 'open' && (
        <>
          <GiftIdeas receiver={payload.r} budget={payload.b} hint={payload.w} isChild={payload.k === '1'} age={payload.a} />
          <InviteCard homeHref={homeHref()} />
        </>
      )}

      <AdBanner className="mt-12 w-full" />

      {phase !== 'open' && (
        <a className="mt-auto pt-10 text-sm text-pine-700/60 underline-offset-4 hover:underline" href={homeHref()}>
          Organizing your own? Start a Secret Santa
        </a>
      )}
    </main>
  )
}
