import type { Dispatch } from 'react'
import type { EventDetails } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'

interface Props {
  event: EventDetails
  dispatch: Dispatch<SantaAction>
  locked: boolean
  /** Inside a collapsible section that already has its own heading. */
  embedded?: boolean
}

export function EventDetailsForm({ event, dispatch, locked, embedded = false }: Props) {
  const set = (field: keyof EventDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'setEvent', field, value: e.target.value })

  return (
    <section className={embedded ? '' : 'card p-5'}>
      {!embedded && <h2 className="text-lg font-bold">The party</h2>}
      <p className="mt-0.5 text-sm text-pine-800/70">All optional. Shown on everyone's reveal page.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3 md:col-span-1">
          <label className="label" htmlFor="event-name">
            Name
          </label>
          <input
            id="event-name"
            className="input"
            placeholder="Family Christmas 2026"
            value={event.name}
            onChange={set('name')}
            disabled={locked}
            maxLength={80}
          />
        </div>
        <div>
          <label className="label" htmlFor="event-budget">
            Gift budget
          </label>
          <input
            id="event-budget"
            className="input"
            placeholder="$50"
            value={event.budget}
            onChange={set('budget')}
            disabled={locked}
            maxLength={40}
          />
        </div>
        <div>
          <label className="label" htmlFor="event-date">
            Exchange date
          </label>
          <input
            id="event-date"
            type="date"
            className="input"
            value={event.date}
            onChange={set('date')}
            disabled={locked}
          />
        </div>
      </div>
    </section>
  )
}
