import { useState } from 'react'
import { AdvertiseDialog, ENQUIRY_KEY } from './ads/AdvertiseDialog.tsx'

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
        {/* Search pages made at build time (src/seo/pages.tsx); they don't exist under `npm run dev`. */}
        <span aria-hidden>·</span>
        <a className={link} href="family-secret-santa/">
          Family Secret Santa
        </a>
        <span aria-hidden>·</span>
        <a className={link} href="kris-kringle-generator/">
          Kris Kringle
        </a>
        {ENQUIRY_KEY && (
          <>
            <span aria-hidden>·</span>
            <button type="button" className={link} onClick={() => setFeedback(true)}>
              Send feedback
            </button>
          </>
        )}
      </nav>
      {feedback && <AdvertiseDialog kind="feedback" onClose={() => setFeedback(false)} />}
    </footer>
  )
}
