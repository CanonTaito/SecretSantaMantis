import type { Dispatch } from 'react'
import type { Household } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import { householdLabel } from '../../lib/labels.ts'
import { PersonRow } from './PersonRow.tsx'

const STRIPES = ['bg-berry-500', 'bg-pine-500', 'bg-gold-400', 'bg-pine-700', 'bg-berry-700']

interface Props {
  household: Household
  index: number
  dispatch: Dispatch<SantaAction>
  locked: boolean
  onRemove: () => void
}

export function HouseholdCard({ household, index, dispatch, locked, onRemove }: Props) {
  const label = householdLabel(household, index)
  return (
    <section className="card overflow-hidden" aria-label={label}>
      <div className={`h-1.5 ${STRIPES[index % STRIPES.length]}`} aria-hidden />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🏠
          </span>
          <input
            className="input border-transparent bg-transparent font-display text-lg font-bold focus:bg-white"
            placeholder={`Household ${index + 1} (e.g. The Smiths)`}
            aria-label={`Name of household ${index + 1}`}
            value={household.name}
            onChange={(e) => dispatch({ type: 'renameHousehold', householdId: household.id, name: e.target.value })}
            disabled={locked}
            maxLength={60}
          />
          {!locked && (
            <button type="button" className="icon-btn" aria-label={`Remove ${label}`} title="Remove household" onClick={onRemove}>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        <ul className="mt-3 space-y-2">
          {household.people.map((person, i) => (
            <PersonRow
              key={person.id}
              person={person}
              index={i}
              dispatch={dispatch}
              locked={locked}
              canRemove={household.people.length > 1}
            />
          ))}
        </ul>

        {!locked && (
          <button
            type="button"
            className="btn-ghost mt-2"
            onClick={() => dispatch({ type: 'addPerson', householdId: household.id })}
          >
            + Add person
          </button>
        )}
      </div>
    </section>
  )
}
