import type { Dispatch } from 'react'
import type { SantaState } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import type { ConfirmOptions } from '../ConfirmDialog.tsx'
import { buildRevealUrl } from '../../lib/revealLink.ts'
import { householdLabel } from '../../lib/labels.ts'
import { ShareRow } from './ShareRow.tsx'
import { BackupControls } from './BackupControls.tsx'
import { MasterList } from './MasterList.tsx'

interface Props {
  state: SantaState
  dispatch: Dispatch<SantaAction>
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

export function ShareStep({ state, dispatch, confirm }: Props) {
  const draw = state.draw
  if (!draw) return null

  const people = state.households.flatMap((h, i) => h.people.map((p) => ({ person: p, household: householdLabel(h, i) })))
  const byId = new Map(people.map(({ person }) => [person.id, person]))
  const sentCount = people.filter(({ person }) => draw.sent[person.id]).length
  const { event } = state

  const urlFor = (giverId: string) => {
    const giver = byId.get(giverId)
    const receiver = byId.get(draw.pairs[giverId] ?? '')
    if (!giver || !receiver) return ''
    return buildRevealUrl({
      v: 1,
      g: giver.name.trim(),
      r: receiver.name.trim(),
      w: receiver.wishlist.trim(),
      e: event.name.trim(),
      b: event.budget.trim(),
      d: event.date.trim(),
    })
  }

  const redraw = async () => {
    const ok = await confirm({
      title: 'Edit and redraw?',
      body:
        sentCount > 0
          ? `You've already sent ${sentCount} ${sentCount === 1 ? 'link' : 'links'}. Redrawing makes every old link wrong, so you'll need to send new ones to everyone.`
          : 'This throws away the current draw so you can change the setup and draw again.',
      confirmLabel: 'Throw away draw',
      danger: true,
    })
    if (ok) dispatch({ type: 'clearDraw' })
  }

  const startOver = async () => {
    const ok = await confirm({
      title: 'Start over?',
      body: 'This clears every name, rule and the draw from this browser. Download a backup first if you might need the master list later.',
      confirmLabel: 'Clear everything',
      danger: true,
    })
    if (ok) dispatch({ type: 'reset' })
  }

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-pine-700 px-5 py-4 text-cream-50">
          <h2 className="text-xl font-bold">🎉 Names drawn!</h2>
          <p className="text-sm text-cream-100/85">
            Send each person their own private link. Nobody — not even you — sees the matches here.
          </p>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">
              {sentCount} of {people.length} sent
            </span>
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200 sm:max-w-48"
              role="progressbar"
              aria-label="Links sent"
              aria-valuemin={0}
              aria-valuemax={people.length}
              aria-valuenow={sentCount}
            >
              <div
                className="h-full rounded-full bg-pine-500 transition-all"
                style={{ width: `${people.length ? (sentCount / people.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <ul className="space-y-2">
            {people.map(({ person, household }) => (
              <ShareRow
                key={person.id}
                person={person}
                household={household}
                url={urlFor(person.id)}
                eventName={event.name}
                sent={!!draw.sent[person.id]}
                onSent={(sent) => dispatch({ type: 'markSent', giverId: person.id, sent })}
              />
            ))}
          </ul>
        </div>
      </section>

      <section className="card border-gold-400 bg-gold-300/15 p-5" aria-labelledby="backup-heading">
        <h2 id="backup-heading" className="text-lg font-bold">
          💾 Save a backup
        </h2>
        <p className="mt-1 mb-4 text-sm text-pine-800/80">
          The draw is only stored in <strong>this browser</strong>. Download a backup file so you can bring it back on
          another device, or if your browser data gets cleared. Links you've sent keep working either way.
        </p>
        <BackupControls state={state} dispatch={dispatch} confirm={confirm} />
      </section>

      <MasterList state={state} dispatch={dispatch} confirm={confirm} />

      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-secondary" onClick={redraw}>
          ✏️ Edit and redraw
        </button>
        <button type="button" className="btn-danger-ghost" onClick={startOver}>
          Start over
        </button>
      </div>
    </div>
  )
}
