import type { Dispatch } from 'react'
import type { SantaState } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import type { ConfirmOptions } from '../ConfirmDialog.tsx'
import { formatDate, householdLabel } from '../../lib/labels.ts'
import { EventDetailsForm } from './EventDetailsForm.tsx'
import { HouseholdCard } from './HouseholdCard.tsx'
import { ExclusionsEditor } from './ExclusionsEditor.tsx'
import { BackupControls } from '../share/BackupControls.tsx'
import { CsvImport } from './CsvImport.tsx'
import { SimpleList } from './SimpleList.tsx'
import { Optional } from './Optional.tsx'

interface Props {
  state: SantaState
  dispatch: Dispatch<SantaAction>
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function SetupStep({ state, dispatch, confirm }: Props) {
  const locked = state.draw !== null
  const peopleCount = state.households.reduce((n, h) => n + h.people.filter((p) => p.name.trim()).length, 0)
  const { event } = state
  const partySummary =
    [event.name.trim(), event.budget.trim(), event.date && formatDate(event.date)].filter(Boolean).join(' · ') ||
    'Optional: name, gift budget and date'
  const rulesSummary =
    state.exclusions.length > 0
      ? plural(state.exclusions.length, 'rule', 'rules')
      : state.useHouseholds
        ? "Optional: anything households don't cover"
        : 'Optional: stop two people drawing each other'

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

  const useSimpleList = async () => {
    const shared = state.households.filter((h) => h.people.filter((p) => p.name.trim()).length > 1)
    if (shared.length > 0) {
      // "Anna and Ben", or "Anna, Ben and Cleo", for each household that has more than one person.
      const groups = shared.map((h) => {
        const names = h.people.map((p) => p.name.trim()).filter(Boolean)
        return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
      })
      const ok = await confirm({
        title: 'Switch to a simple list?',
        body: `Everyone stays on the list, but ${groups.join('; ')} will no longer be kept apart. Add a rule if two people still shouldn't draw each other.`,
        confirmLabel: 'Switch',
      })
      if (!ok) return
    }
    dispatch({ type: 'setUseHouseholds', on: false })
  }

  const next = () => {
    // Empty rows left over from typing names don't need to block the draw.
    if (!state.useHouseholds) dispatch({ type: 'dropBlankPeople' })
    dispatch({ type: 'goTo', step: 'draw' })
  }

  const allHouseholds = state.households.map((h, i) => ({ id: h.id, label: householdLabel(h, i) }))

  return (
    <div className="space-y-6">
      {locked && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-pine-200 bg-pine-50 p-4">
          <p className="text-sm text-pine-800">
            🔒 <strong>Names are drawn</strong>, so the setup is locked to keep sent links correct.
          </p>
          <button type="button" className="btn-green" onClick={() => dispatch({ type: 'goTo', step: 'share' })}>
            Back to sharing →
          </button>
        </div>
      )}

      {!state.useHouseholds ? (
        <SimpleList households={state.households} dispatch={dispatch} locked={locked} />
      ) : (
        <section aria-labelledby="households-heading">
          <div className="mb-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div>
                <h2 id="households-heading" className="text-xl font-bold">
                  Households
                </h2>
                <p className="text-sm text-pine-800/70">
                  People in the same household never draw each other. Someone living alone is a household of one.
                </p>
              </div>
              {!locked && (
                <button
                  type="button"
                  className="text-sm font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
                  onClick={useSimpleList}
                >
                  Switch to a simple list
                </button>
              )}
            </div>
            {!locked && <CsvImport households={state.households} dispatch={dispatch} withHouseholds />}
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
                allHouseholds={allHouseholds}
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
      )}

      <Optional title="Party details" summary={partySummary}>
        <EventDetailsForm event={state.event} dispatch={dispatch} locked={locked} embedded />
      </Optional>

      <Optional title="Rules" summary={rulesSummary} startOpen={state.exclusions.length > 0}>
        <ExclusionsEditor
          households={state.households}
          exclusions={state.exclusions}
          dispatch={dispatch}
          locked={locked}
          embedded
          useHouseholds={state.useHouseholds}
        />
      </Optional>

      {!locked && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-sm text-pine-800/70">
          <span>Already ran a draw on another device?</span>
          <BackupControls state={state} dispatch={dispatch} confirm={confirm} mode="upload" />
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-cream-300 bg-cream-100/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <span className="text-xs text-pine-800/80 sm:text-sm">
          <strong className="text-pine-900">{peopleCount}</strong> {peopleCount === 1 ? 'person' : 'people'}
          {state.useHouseholds && (
            <>
              {' '}
              in <strong className="text-pine-900">{state.households.length}</strong>{' '}
              {state.households.length === 1 ? 'household' : 'households'}
            </>
          )}
        </span>
        {locked ? (
          <button type="button" className="btn-green" onClick={() => dispatch({ type: 'goTo', step: 'share' })}>
            Back to sharing →
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={next}>
            Next: draw names →
          </button>
        )}
      </div>
    </div>
  )
}
