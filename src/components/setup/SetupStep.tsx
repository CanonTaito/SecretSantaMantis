import type { Dispatch } from 'react'
import type { SantaState } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import type { ConfirmOptions } from '../ConfirmDialog.tsx'
import { householdLabel } from '../../lib/labels.ts'
import { EventDetailsForm } from './EventDetailsForm.tsx'
import { HouseholdCard } from './HouseholdCard.tsx'
import { ExclusionsEditor } from './ExclusionsEditor.tsx'
import { BackupControls } from '../share/BackupControls.tsx'

interface Props {
  state: SantaState
  dispatch: Dispatch<SantaAction>
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

export function SetupStep({ state, dispatch, confirm }: Props) {
  const locked = state.draw !== null
  const peopleCount = state.households.reduce((n, h) => n + h.people.filter((p) => p.name.trim()).length, 0)

  const removeHousehold = async (index: number) => {
    const household = state.households[index]
    if (!household) return
    const named = household.people.filter((p) => p.name.trim()).length
    if (named > 0) {
      const ok = await confirm({
        title: `Remove ${householdLabel(household, index)}?`,
        body: `This removes ${named === 1 ? '1 person' : `${named} people`} and any rules about them.`,
        confirmLabel: 'Remove',
        danger: true,
      })
      if (!ok) return
    }
    dispatch({ type: 'removeHousehold', householdId: household.id })
  }

  return (
    <div className="space-y-6">
      {locked ? (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-pine-200 bg-pine-50 p-4">
          <p className="text-sm text-pine-800">
            🔒 <strong>Names are drawn</strong>, so the setup is locked to keep sent links correct.
          </p>
          <button type="button" className="btn-green" onClick={() => dispatch({ type: 'goTo', step: 'share' })}>
            Back to sharing →
          </button>
        </div>
      ) : (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-pine-800/80">
            <strong className="text-pine-900">Already ran a draw?</strong> Upload your backup to pick up where you left
            off.
          </p>
          <BackupControls state={state} dispatch={dispatch} confirm={confirm} mode="upload" />
        </div>
      )}

      <EventDetailsForm event={state.event} dispatch={dispatch} locked={locked} />

      <section aria-labelledby="households-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="households-heading" className="text-lg font-bold">
              Households
            </h2>
            <p className="text-sm text-pine-800/70">
              People in the same household never draw each other. Someone living alone is a household of one.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {state.households.map((household, i) => (
            <HouseholdCard
              key={household.id}
              household={household}
              index={i}
              dispatch={dispatch}
              locked={locked}
              onRemove={() => removeHousehold(i)}
            />
          ))}
          {!locked && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'addHousehold' })}
              className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-cream-300 text-pine-700 transition hover:border-pine-300 hover:bg-pine-50"
            >
              <span className="text-2xl" aria-hidden>
                ＋
              </span>
              <span className="font-semibold">Add household</span>
            </button>
          )}
        </div>
      </section>

      <ExclusionsEditor households={state.households} exclusions={state.exclusions} dispatch={dispatch} locked={locked} />

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-cream-300 bg-cream-100/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <span className="text-xs text-pine-800/80 sm:text-sm">
          <strong className="text-pine-900">{peopleCount}</strong> {peopleCount === 1 ? 'person' : 'people'} in{' '}
          <strong className="text-pine-900">{state.households.length}</strong>{' '}
          {state.households.length === 1 ? 'household' : 'households'}
        </span>
        {locked ? (
          <button type="button" className="btn-green" onClick={() => dispatch({ type: 'goTo', step: 'share' })}>
            Back to sharing →
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={() => dispatch({ type: 'goTo', step: 'draw' })}>
            Next: draw names →
          </button>
        )}
      </div>
    </div>
  )
}
