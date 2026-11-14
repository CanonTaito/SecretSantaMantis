import type { Step } from '../types.ts'

const STEPS: { id: Step; label: string }[] = [
  { id: 'setup', label: 'Set up' },
  { id: 'draw', label: 'Draw' },
  { id: 'share', label: 'Share' },
]

interface Props {
  current: Step
  /** Steps the organizer may jump to right now. */
  reachable: Step[]
  onSelect: (step: Step) => void
}

export function Stepper({ current, reachable, onSelect }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.id === current)
  return (
    <nav aria-label="Progress" className="mb-6">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((step, i) => {
          const isCurrent = step.id === current
          const isDone = i < currentIndex
          const canGo = !isCurrent && reachable.includes(step.id)
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!canGo}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelect(step.id)}
                className={`flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-semibold transition ${
                  canGo ? 'cursor-pointer hover:bg-pine-50' : 'cursor-default'
                } ${isCurrent ? 'text-pine-900' : isDone ? 'text-pine-600' : 'text-pine-700/50'}`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs ${
                    isCurrent
                      ? 'bg-berry-500 text-white shadow'
                      : isDone
                        ? 'bg-pine-600 text-white'
                        : 'border border-cream-300 bg-white'
                  }`}
                  aria-hidden
                >
                  {isDone ? '✓' : i + 1}
                </span>
                {step.label}
              </button>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-cream-300" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
