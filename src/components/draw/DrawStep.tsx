import { useEffect, useRef, useState, type Dispatch } from 'react'
import type { SantaState } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import { buildDrawInput, explainImpossible, generateDraw, validateSetup } from '../../lib/draw.ts'
import { formatDate, householdNames, personNames } from '../../lib/labels.ts'

interface Props {
  state: SantaState
  dispatch: Dispatch<SantaAction>
}

const SHUFFLE_MS = 1600

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function DrawStep({ state, dispatch }: Props) {
  const problems = validateSetup(state.households)
  const names = personNames(state.households)
  const allNames = Object.values(names)
  const peopleCount = allNames.length
  const [shuffling, setShuffling] = useState(false)
  const [shownName, setShownName] = useState('')
  const [impossible, setImpossible] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), [])

  const finish = () => {
    const input = buildDrawInput(state.households, state.exclusions)
    const pairs = generateDraw(input)
    setShuffling(false)
    if (pairs) dispatch({ type: 'setDraw', pairs })
    else setImpossible(explainImpossible(input, names, householdNames(state.households)))
  }

  const draw = () => {
    setImpossible(null)
    if (prefersReducedMotion()) return finish()
    setShuffling(true)
    // Flick through names, slowing down like a wheel.
    let elapsed = 0
    let delay = 50
    while (elapsed < SHUFFLE_MS) {
      const at = elapsed
      timers.current.push(
        window.setTimeout(() => setShownName(allNames[Math.floor(Math.random() * allNames.length)] ?? ''), at),
      )
      elapsed += delay
      delay = Math.min(delay * 1.12, 220)
    }
    timers.current.push(window.setTimeout(finish, SHUFFLE_MS + 150))
  }

  const back = (
    <button type="button" className="btn-secondary" onClick={() => dispatch({ type: 'goTo', step: 'setup' })}>
      ← Back to setup
    </button>
  )

  if (problems.length > 0) {
    return (
      <section className="card p-6">
        <h2 className="text-xl font-bold">Almost there</h2>
        <p className="mt-1 text-sm text-pine-800/75">Fix these and you're ready to draw:</p>
        <ul className="mt-4 space-y-2">
          {problems.map((p) => (
            <li key={p} className="flex gap-2 rounded-xl bg-berry-50 px-3 py-2 text-sm text-berry-700">
              <span aria-hidden>⚠️</span>
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-6">{back}</div>
      </section>
    )
  }

  const { event } = state
  const details = [
    event.name && `🎄 ${event.name}`,
    event.budget && `💰 ${event.budget}`,
    event.date && `📅 ${formatDate(event.date)}`,
  ].filter(Boolean)

  return (
    <section className="card overflow-hidden text-center">
      <div className="px-6 pt-8 pb-6">
        <h2 className="text-2xl font-bold">Ready to draw</h2>
        <p className="mt-1 text-pine-800/75">
          {peopleCount} people · {state.households.length} households
          {state.exclusions.length > 0 &&
            ` · ${state.exclusions.length} extra ${state.exclusions.length === 1 ? 'rule' : 'rules'}`}
        </p>
        {details.length > 0 && (
          <p className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
            {details.map((d) => (
              <span key={d as string} className="rounded-full bg-pine-50 px-3 py-1 text-pine-800">
                {d}
              </span>
            ))}
          </p>
        )}

        <div
          className="mx-auto mt-8 flex h-28 max-w-sm items-center justify-center rounded-2xl border-2 border-dashed border-gold-400 bg-gold-300/15"
          aria-live="polite"
        >
          {shuffling ? (
            <span className="font-display text-3xl font-bold text-pine-800">{shownName}</span>
          ) : (
            <span className="text-5xl" aria-hidden>
              🎩
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-pine-800/60">
          You won't see who got whom — everyone finds out from their own link.
        </p>

        {impossible && (
          <div role="alert" className="mx-auto mt-6 max-w-lg rounded-xl bg-berry-50 px-4 py-3 text-left text-sm text-berry-700">
            <strong className="block">These names can't be drawn yet.</strong>
            {impossible}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-cream-300 bg-cream-100/60 px-6 py-4 sm:flex-row">
        {back}
        <button type="button" className="btn-primary px-8 py-3 text-base" onClick={draw} disabled={shuffling}>
          {shuffling ? 'Shuffling…' : '🎲 Draw names'}
        </button>
      </div>
    </section>
  )
}
