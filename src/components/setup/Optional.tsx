import { useState, type ReactNode } from 'react'

interface Props {
  title: string
  /** Shown next to the title while closed: what's set, or what it's for. */
  summary: string
  /** Open to begin with, e.g. when something is already filled in. */
  startOpen?: boolean
  children: ReactNode
}

/** A card that stays folded away until someone wants it. */
export function Optional({ title, summary, startOpen = false, children }: Props) {
  const [open, setOpen] = useState(startOpen)
  return (
    <details className="card group" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 transition hover:bg-pine-50 focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="font-display text-lg font-bold text-pine-900">{title}</span>
          <span className="block truncate text-sm text-pine-800/65">{summary}</span>
        </span>
        <span className="shrink-0 text-xl leading-none text-pine-600 transition group-open:rotate-45" aria-hidden>
          +
        </span>
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  )
}
