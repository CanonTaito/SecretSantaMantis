import type { Dispatch } from 'react'
import type { Person } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'

interface Props {
  person: Person
  index: number
  dispatch: Dispatch<SantaAction>
  locked: boolean
  canRemove: boolean
}

export function PersonRow({ person, index, dispatch, locked, canRemove }: Props) {
  const update = (field: 'name' | 'email' | 'wishlist' | 'age') => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'updatePerson', personId: person.id, field, value: e.target.value })
  const who = person.name.trim() || `person ${index + 1}`

  return (
    <li className="rounded-xl border border-cream-200 bg-white/70 p-3">
      <div className="flex items-start gap-2">
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <input
            className="input font-medium"
            placeholder="Name"
            aria-label={`Name of person ${index + 1}`}
            value={person.name}
            onChange={update('name')}
            disabled={locked}
            maxLength={60}
            autoComplete="off"
          />
          <input
            className="input"
            type="email"
            placeholder="Email (optional)"
            aria-label={`Email for ${who}`}
            value={person.email}
            onChange={update('email')}
            disabled={locked}
            maxLength={120}
            autoComplete="off"
          />
          <input
            className="input sm:col-span-2"
            placeholder="🎁 Gift hint for their Secret Santa (optional)"
            aria-label={`Gift hint for ${who}`}
            value={person.wishlist}
            onChange={update('wishlist')}
            disabled={locked}
            maxLength={300}
            autoComplete="off"
          />
          <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-pine-800">
              <input
                type="checkbox"
                className="size-4 accent-pine-600"
                checked={person.isChild}
                onChange={(e) => dispatch({ type: 'setChild', personId: person.id, isChild: e.target.checked })}
                disabled={locked}
              />
              🧒🏾 Child
            </label>
            {person.isChild && (
              <label className="flex items-center gap-2 text-sm text-pine-800">
                Age
                <input
                  className="input w-20 py-1"
                  inputMode="numeric"
                  placeholder="optional"
                  aria-label={`Age of ${who}`}
                  value={person.age}
                  onChange={update('age')}
                  disabled={locked}
                  maxLength={10}
                  autoComplete="off"
                />
              </label>
            )}
            {person.isChild && <span className="text-xs text-pine-800/55">Kids only draw other kids.</span>}
          </div>
        </div>
        {!locked && canRemove && (
          <button
            type="button"
            className="icon-btn"
            aria-label={`Remove ${who}`}
            title="Remove person"
            onClick={() => dispatch({ type: 'removePerson', personId: person.id })}
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        )}
      </div>
    </li>
  )
}
