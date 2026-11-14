import { useState } from 'react'
import type { SantaState } from '../../types.ts'
import type { ConfirmOptions } from '../ConfirmDialog.tsx'
import { householdLabel } from '../../lib/labels.ts'

interface Props {
  state: SantaState
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

/** The full giver -> receiver list, hidden until the organizer deliberately opens it. */
export function MasterList({ state, confirm }: Props) {
  const [open, setOpen] = useState(false)
  const draw = state.draw
  if (!draw) return null

  const people = state.households.flatMap((h, i) => h.people.map((p) => ({ ...p, household: householdLabel(h, i) })))
  const byId = new Map(people.map((p) => [p.id, p]))

  const show = async () => {
    const ok = await confirm({
      title: 'Spoil the surprise?',
      body: "You'll see who everyone is buying for — including your own match if you're taking part. Only do this if you need to sort something out.",
      confirmLabel: 'Show me',
      cancelLabel: 'Keep it secret',
      danger: true,
    })
    if (ok) setOpen(true)
  }

  return (
    <section className="card p-5" aria-labelledby="master-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="master-heading" className="text-lg font-bold">
            🗝️ Organizer master list
          </h2>
          <p className="text-sm text-pine-800/70">
            For when a link goes missing or you need to check who's buying for whom.
          </p>
        </div>
        {open ? (
          <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
            🙈 Hide
          </button>
        ) : (
          <button type="button" className="btn-secondary" onClick={show}>
            👀 Show who got whom
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-300 text-xs tracking-wide text-pine-700/70 uppercase">
                <th className="py-2 pr-3 font-semibold">Giver</th>
                <th className="py-2 pr-3 font-semibold" aria-label="buys for" />
                <th className="py-2 pr-3 font-semibold">Buys for</th>
                <th className="py-2 font-semibold">Link sent</th>
              </tr>
            </thead>
            <tbody>
              {people.map((giver) => {
                const receiver = byId.get(draw.pairs[giver.id] ?? '')
                return (
                  <tr key={giver.id} className="border-b border-cream-200 last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{giver.name}</span>
                      <span className="block text-xs text-pine-800/55">{giver.household}</span>
                    </td>
                    <td className="py-2 pr-3 text-berry-500" aria-hidden>
                      →
                    </td>
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{receiver?.name ?? '—'}</span>
                      {receiver && <span className="block text-xs text-pine-800/55">{receiver.household}</span>}
                    </td>
                    <td className="py-2">{draw.sent[giver.id] ? '✓' : <span className="text-pine-800/40">not yet</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
