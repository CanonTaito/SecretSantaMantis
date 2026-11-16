import { useMemo, useState } from 'react'
import { inAppBrowser } from '../lib/inAppBrowser.ts'
import { copyText } from '../lib/clipboard.ts'

/** Organiser pages only: inside the Facebook, Messenger or Instagram app, suggest a real browser. */
export function InAppNotice() {
  const app = useMemo(() => inAppBrowser(), [])
  const [copied, setCopied] = useState<boolean | null>(null)
  if (!app) return null

  const copy = async () => {
    const url = window.location.origin + window.location.pathname
    setCopied(await copyText(url))
  }

  return (
    <section aria-labelledby="in-app-heading" className="card mb-8 border-gold-300 bg-gold-300/15 p-5 text-left">
      <h2 id="in-app-heading" className="text-lg font-bold text-pine-900">📱 Open this in Safari or Chrome</h2>
      <p className="mt-1 text-sm text-pine-800/80">
        You're in {app}'s built-in browser, which can lose your list and often can't download backups. Tap the{' '}
        <strong>⋯</strong> or <strong>⋮</strong> menu at the top and choose <strong>Open in browser</strong> (or Open
        in Safari / Chrome). Or copy the link and paste it there.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-green" onClick={copy}>
          📋 Copy link
        </button>
        {copied === true && (
          <span role="status" className="text-sm font-medium text-pine-600">
            Copied!
          </span>
        )}
        {copied === false && (
          <span role="alert" className="text-sm font-medium text-berry-600">
            Couldn't copy. Use the menu instead.
          </span>
        )}
      </div>
    </section>
  )
}
