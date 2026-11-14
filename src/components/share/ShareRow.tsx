import { useEffect, useRef, useState } from 'react'
import type { Person } from '../../types.ts'
import { buildMailto } from '../../lib/revealLink.ts'
import { canNativeShare, copyText } from '../../lib/clipboard.ts'

interface Props {
  person: Person
  household: string
  url: string
  eventName: string
  sent: boolean
  onSent: (sent: boolean) => void
}

export function ShareRow({ person, household, url, eventName, sent, onSent }: Props) {
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const name = person.name.trim()

  const copy = async () => {
    const ok = await copyText(url)
    setCopied(ok ? 'ok' : 'fail')
    if (ok) onSent(true)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(null), 2000)
  }

  const share = async () => {
    try {
      await navigator.share({
        title: `${eventName.trim() || 'Secret Santa'} 🎁`,
        text: `Hi ${name}! Here's your private Secret Santa link — keep it secret:`,
        url,
      })
      onSent(true)
    } catch {
      // Cancelled by the user; nothing to do.
    }
  }

  return (
    <li
      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 transition sm:flex-row sm:items-center ${
        sent ? 'border-pine-200 bg-pine-50/60' : 'border-cream-300 bg-white'
      }`}
    >
      <label className="flex flex-1 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="size-5 shrink-0 accent-pine-600"
          checked={sent}
          onChange={(e) => onSent(e.target.checked)}
          aria-label={`Mark ${name}'s link as sent`}
        />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{name}</span>
          <span className="block truncate text-xs text-pine-800/60">
            {household}
            {person.email && ` · ${person.email}`}
            {sent && <span className="font-semibold text-pine-600"> · Sent ✓</span>}
          </span>
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={copy} aria-label={`Copy ${name}'s link`}>
          {copied === 'ok' ? '✓ Copied' : copied === 'fail' ? 'Copy failed' : '🔗 Copy link'}
        </button>
        {canNativeShare() && (
          <button type="button" className="btn-secondary" onClick={share} aria-label={`Share ${name}'s link`}>
            📤 Share
          </button>
        )}
        <a
          className="btn-secondary"
          href={buildMailto(person.email, name, eventName, url)}
          onClick={() => onSent(true)}
          aria-label={`Email ${name} their link`}
        >
          ✉️ Email
        </a>
      </div>
    </li>
  )
}
