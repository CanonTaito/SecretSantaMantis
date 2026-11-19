import { useEffect, useRef, useState, type Dispatch } from 'react'
import type { Household, Person } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import { ChildFields, EmailField, HintField } from './PersonRow.tsx'
import { CsvImport } from './CsvImport.tsx'

interface Props {
  households: Household[]
  dispatch: Dispatch<SantaAction>
  /** Names are drawn: show the list, but nothing can change. */
  locked: boolean
}

/**
 * The default setup: one name per row. Each row is a household of one underneath, so the
 * draw, links and backups work exactly as with real households.
 */
export function SimpleList({ households, dispatch, locked }: Props) {
  const list = useRef<HTMLOListElement>(null)
  const focusLast = useRef(false)
  const rows = households.flatMap((h) => h.people.map((person) => ({ household: h, person })))

  // After "Add person" or Enter on the last row, put the cursor in the new row.
  useEffect(() => {
    if (!focusLast.current) return
    focusLast.current = false
    const inputs = list.current?.querySelectorAll<HTMLInputElement>('input[data-name]')
    inputs?.[inputs.length - 1]?.focus()
  }, [rows.length])

  const add = () => {
    focusLast.current = true
    dispatch({ type: 'addHousehold' })
  }

  const onEnter = (index: number) => {
    const inputs = list.current?.querySelectorAll<HTMLInputElement>('input[data-name]')
    const next = inputs?.[index + 1]
    if (next) next.focus()
    else add()
  }

  return (
    <section aria-labelledby="people-heading" className="card p-5">
      <h2 id="people-heading" className="text-xl font-bold">
        Who's in the draw?
      </h2>
      <p className="mt-0.5 text-sm text-pine-800/70">Add everyone's name. Each person gets their own secret link.</p>

      <ol ref={list} className="mt-4 space-y-2">
        {rows.map(({ household, person }, i) => (
          <SimpleRow
            key={person.id}
            person={person}
            index={i}
            dispatch={dispatch}
            locked={locked}
            canRemove={!locked && rows.length > 1}
            onRemove={() => dispatch({ type: 'removeHousehold', householdId: household.id })}
            onEnter={() => onEnter(i)}
          />
        ))}
      </ol>

      {!locked && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" className="btn-secondary" onClick={add}>
              + Add person
            </button>
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900">
                Import from a spreadsheet
              </summary>
              <div className="mt-2">
                <CsvImport households={households} dispatch={dispatch} withHouseholds={false} />
              </div>
            </details>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl bg-pine-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-pine-800">
              <strong className="text-pine-900">Do some people live together?</strong> Group couples and families into
              households so they never draw each other.
            </p>
            <button
              type="button"
              className="btn-secondary shrink-0 self-start sm:self-center"
              onClick={() => dispatch({ type: 'setUseHouseholds', on: true })}
            >
              🏠 Group into households
            </button>
          </div>
        </>
      )}
    </section>
  )
}

interface RowProps {
  person: Person
  index: number
  dispatch: Dispatch<SantaAction>
  locked: boolean
  canRemove: boolean
  onRemove: () => void
  onEnter: () => void
}

function SimpleRow({ person, index, dispatch, locked, canRemove, onRemove, onEnter }: RowProps) {
  const hasExtras = !!(person.email || person.wishlist || person.isChild)
  const [open, setOpen] = useState(hasExtras)
  const who = person.name.trim() || `person ${index + 1}`
  const fields = { person, who, dispatch, locked }
  const markers = [person.wishlist && '🎁', person.isChild && '🧒🏾', person.email && '✉️'].filter(Boolean).join(' ')

  return (
    <li className="rounded-xl border border-cream-200 bg-white/70 p-2">
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0 text-right text-sm font-semibold text-pine-700/50" aria-hidden>
          {index + 1}
        </span>
        <input
          data-name
          className="input font-medium"
          placeholder="Name"
          aria-label={`Name of person ${index + 1}`}
          value={person.name}
          onChange={(e) =>
            dispatch({ type: 'updatePerson', personId: person.id, field: 'name', value: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onEnter()
            }
          }}
          enterKeyHint="next"
          disabled={locked}
          maxLength={60}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn-ghost shrink-0 px-2.5 text-xs"
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} details for ${who}`}
          onClick={() => setOpen(!open)}
        >
          {markers && !open ? markers : 'Details'} {open ? '▴' : '▾'}
        </button>
        {canRemove ? (
          <button
            type="button"
            className="icon-btn shrink-0"
            aria-label={`Remove ${who}`}
            title="Remove person"
            onClick={onRemove}
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        ) : (
          <span className="size-9 shrink-0" aria-hidden />
        )}
      </div>
      {open && (
        <div className="mt-2 grid gap-2 pl-8 sm:grid-cols-2">
          <HintField {...fields} className="sm:col-span-2" />
          <EmailField {...fields} />
          <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-2">
            <ChildFields {...fields} />
          </div>
        </div>
      )}
    </li>
  )
}
