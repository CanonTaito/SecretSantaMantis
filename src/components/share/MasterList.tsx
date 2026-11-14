import { useState, type Dispatch } from 'react'
import type { SantaState } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import type { ConfirmOptions } from '../ConfirmDialog.tsx'
import { householdLabel } from '../../lib/labels.ts'
import { allowedReceivers, buildDrawInput, planReassign } from '../../lib/draw.ts'

interface Props {
  state: SantaState
  dispatch: Dispatch<SantaAction>
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

/** The full giver -> receiver list, hidden until the organizer deliberately opens it. */
export function MasterList({ state, dispatch, confirm }: Props) {
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const draw = state.draw
  if (!draw) return null

  const people = state.households.flatMap((h, i) => h.people.map((p) => ({ ...p, household: householdLabel(h, i) })))
  const byId = new Map(people.map((p) => [p.id, p]))
  const name = (id: string) => byId.get(id)?.name.trim() ?? 'Someone'
  const allowed = allowedReceivers(buildDrawInput(state.households, state.exclusions))

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

  const reassign = async (giverId: string, newReceiverId: string) => {
    const plan = planReassign(draw.pairs, allowed, giverId, newReceiverId)
    if (!plan?.ok) return
    const { otherGiverId, otherNewReceiverId } = plan
    const alreadySent = [giverId, otherGiverId].filter((id) => draw.sent[id]).map(name)

    if (alreadySent.length > 0) {
      const ok = await confirm({
        title: 'Swap after sending?',
        body: `${alreadySent.join(' and ')} already ${alreadySent.length === 1 ? 'has a link' : 'have links'}. Old links can't be taken back and will still show the old name, so make sure ${alreadySent.length === 1 ? 'they get' : 'both get'} the new one.`,
        confirmLabel: 'Swap anyway',
        danger: true,
      })
      if (!ok) return
    }

    dispatch({ type: 'swapReceivers', giverA: giverId, giverB: otherGiverId })
    setNotice(
      `Swapped: ${name(giverId)} now buys for ${name(newReceiverId)}, and ${name(otherGiverId)} now buys for ${name(otherNewReceiverId)}. Send both of them their new links.`,
    )
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
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setOpen(false)
              setNotice(null)
            }}
          >
            🙈 Hide
          </button>
        ) : (
          <button type="button" className="btn-secondary" onClick={show}>
            👀 Show who got whom
          </button>
        )}
      </div>

      {open && (
        <>
          <p className="mt-4 text-sm text-pine-800/75">
            To swap, pick someone new under <strong>Buys for</strong>. Whoever had that person takes the old match, so
            everyone still gets one gift. Choices that break a household or rule are greyed out.
          </p>

          {notice && (
            <p role="status" className="mt-3 rounded-xl bg-gold-300/20 px-3 py-2 text-sm text-pine-900">
              🔁 {notice}
            </p>
          )}

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
                  const receiverId = draw.pairs[giver.id] ?? ''
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
                        <select
                          className="input min-w-40 py-1.5 font-semibold"
                          value={receiverId}
                          aria-label={`Who ${giver.name.trim()} buys for`}
                          onChange={(e) => reassign(giver.id, e.target.value)}
                        >
                          {people
                            .filter((p) => p.id !== giver.id)
                            .map((p) => {
                              const isCurrent = p.id === receiverId
                              const plan = isCurrent ? null : planReassign(draw.pairs, allowed, giver.id, p.id)
                              const blocked = !isCurrent && !plan?.ok
                              return (
                                <option key={p.id} value={p.id} disabled={blocked}>
                                  {p.name.trim()} ({p.household}){blocked ? ' — breaks a rule' : ''}
                                </option>
                              )
                            })}
                        </select>
                      </td>
                      <td className="py-2">
                        {draw.sent[giver.id] ? '✓' : <span className="text-pine-800/40">not yet</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
