import { useEffect, useRef, useState } from 'react'
import { shareSite } from '../lib/shareSite.ts'

/** Passes the site on: the phone's share sheet, or copies the text and address. */
export function ShareSiteButton({ label = '📤 Tell a friend', className = 'btn-secondary' }: { label?: string; className?: string }) {
  const [result, setResult] = useState<'copied' | 'failed' | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const share = async () => {
    const outcome = await shareSite()
    if (outcome !== 'copied' && outcome !== 'failed') return
    setResult(outcome)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setResult(null), 2500)
  }

  return (
    <button type="button" className={className} onClick={share}>
      <span aria-live="polite">{result === 'copied' ? '✓ Link copied' : result === 'failed' ? "Couldn't copy" : label}</span>
    </button>
  )
}
