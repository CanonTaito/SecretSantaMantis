import { useState, type Dispatch } from 'react'
import type { Exclusion, Household } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import { householdLabel } from '../../lib/labels.ts'

interface Props {
  households: Household[]
  exclusions: Exclusion[]
  dispatch: Dispatch<SantaAction>
  locked: boolean
}

export function ExclusionsEditor({ households, exclusions, dispatch, locked }: Props) {
  const [giverId, setGiverId] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [mutual, setMutual] = useState(true)

  const named = households.flatMap((h, i) =>
    h.people.filter((p) => p.name.trim()).map((p) => ({ ...p, householdId: h.id, household: householdLabel(h, i) })),
  )
  const name = (id: string) => named.find((p) => p.id === id)?.name.trim() ?? 'Someone'
  const giver = named.find((p) => p.id === giverId)
  const receiverOptions = named.filter((p) => p.id !== giverId && p.householdId !== giver?.householdId)
  const canAdd = !!giver && receiverOptions.some((p) => p.id === receiverId)

  const add = () => {
    if (!canAdd) return
    dispatch({ type: 'addExclusion', giverId, receiverId, mutual })
    setReceiverId('')
  }

  return (
    <section className="card p-5">
      <h2 className="text-lg font-bold">Extra rules</h2>
      <p className="mt-0.5 text-sm text-pine-800/70">
        Households never draw each other automatically. Add a rule for anything else — like not repeating last year's
        match.
      </p>

      {exclusions.length > 0 && (
        <ul className="mt-4 space-y-2">
          {exclusions.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-berry-50 px-3 py-2 text-sm">
              <span className="flex-1">
                <strong>{name(e.giverId)}</strong> {e.mutual ? 'and' : "can't draw"} <strong>{name(e.receiverId)}</strong>
                {e.mutual && " can't draw each other"}
              </span>
              {!locked && (
                <>
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-pine-800">
                    <input
                      type="checkbox"
                      className="size-4 accent-pine-600"
                      checked={e.mutual}
                      onChange={() => dispatch({ type: 'toggleExclusionMutual', exclusionId: e.id })}
                    />
                    Both ways
                  </label>
                  <button
                    type="button"
                    className="icon-btn size-7"
                    aria-label={`Remove rule for ${name(e.giverId)} and ${name(e.receiverId)}`}
                    onClick={() => dispatch({ type: 'removeExclusion', exclusionId: e.id })}
                  >
                    <span aria-hidden className="text-lg leading-none">
                      ×
                    </span>
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {!locked &&
        (named.length < 2 ? (
          <p className="mt-4 text-sm text-pine-700/60 italic">Add some names first, then you can set rules here.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="sm:w-44">
              <label className="label" htmlFor="rule-giver">
                Who
              </label>
              <select
                id="rule-giver"
                className="input"
                value={giverId}
                onChange={(e) => {
                  setGiverId(e.target.value)
                  setReceiverId('')
                }}
              >
                <option value="">Choose…</option>
                {named.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.trim()}
                  </option>
                ))}
              </select>
            </div>
            <span className="pb-2 text-sm font-semibold text-berry-600 sm:px-1">can't draw</span>
            <div className="sm:w-44">
              <label className="label" htmlFor="rule-receiver">
                Whom
              </label>
              <select
                id="rule-receiver"
                className="input"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                disabled={!giver}
              >
                <option value="">Choose…</option>
                {receiverOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.trim()} ({p.household})
                  </option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium">
              <input type="checkbox" className="size-4 accent-pine-600" checked={mutual} onChange={(e) => setMutual(e.target.checked)} />
              Both ways
            </label>
            <button type="button" className="btn-secondary sm:mb-0.5" onClick={add} disabled={!canAdd}>
              Add rule
            </button>
          </div>
        ))}
    </section>
  )
}
