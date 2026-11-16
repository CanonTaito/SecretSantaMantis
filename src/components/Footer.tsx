import { useState } from 'react'
import { AdvertiseDialog, ENQUIRY_KEY } from './ads/AdvertiseDialog.tsx'

const SOURCE_URL = 'https://github.com/CanonTaito/SecretSantaMantis'

/** Small links at the very bottom of the organiser pages. */
export function Footer({ className = '' }: { className?: string }) {
  const [feedback, setFeedback] = useState(false)
  const link = 'cursor-pointer underline-offset-4 hover:text-pine-800 hover:underline'

  return (
    <footer className={`text-center text-sm text-pine-700/70 ${className}`}>
      <nav aria-label="Site" className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <a className={link} href="#help">
          How it works
        </a>
        {ENQUIRY_KEY && (
          <>
            <span aria-hidden>·</span>
            <button type="button" className={link} onClick={() => setFeedback(true)}>
              Send feedback
            </button>
          </>
        )}
        <span aria-hidden>·</span>
        <a className={link} href={SOURCE_URL} target="_blank" rel="noopener">
          Source on GitHub ↗
        </a>
      </nav>
      {feedback && <AdvertiseDialog kind="feedback" onClose={() => setFeedback(false)} />}
    </footer>
  )
}
