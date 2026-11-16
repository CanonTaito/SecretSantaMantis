import { useEffect, useRef, useState, type FormEvent } from 'react'

export const ENQUIRY_KEY = (import.meta.env.VITE_WEB3FORMS_KEY ?? '').trim()
const ENDPOINT = 'https://api.web3forms.com/submit'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }

export type FormKind = 'advertise' | 'feedback'

const COPY: Record<FormKind, { title: string; intro: string; subject: string; placeholder: string }> = {
  advertise: {
    title: '📣 Advertise here',
    intro: "Put your business in front of families organising their Secret Santa. Leave your details and we'll get back to you.",
    subject: 'advertising enquiry',
    placeholder: "Your business, where you're based, and when you'd like to advertise.",
  },
  feedback: {
    title: '💬 Send feedback',
    intro: "Found a problem, or have an idea? We read every message. Add your email if you'd like a reply.",
    subject: 'feedback',
    placeholder: 'What happened, or what would make the site better?',
  },
}

/**
 * The site's contact form: advertising enquiries or general feedback.
 * Sends through Web3Forms, which forwards it to the site owner's email.
 */
export function AdvertiseDialog({ onClose, kind = 'advertise' }: { onClose: () => void; kind?: FormKind }) {
  const copy = COPY[kind]
  const isAd = kind === 'advertise'
  const ref = useRef<HTMLDialogElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    // Bots fill in the hidden field; people never see it.
    if (data.botcheck) {
      setStatus({ kind: 'sent' })
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ENQUIRY_KEY,
          subject: `Secret Santa Mantis: ${copy.subject} from ${data.name || 'a visitor'}`,
          from_name: 'Secret Santa Mantis',
          name: data.name,
          email: data.email,
          ...(isAd ? { phone: data.phone } : { page: window.location.origin + window.location.pathname }),
          message: data.message,
        }),
      })
      const json = (await res.json().catch(() => null)) as { success?: boolean } | null
      if (res.ok && json?.success) setStatus({ kind: 'sent' })
      else setStatus({ kind: 'error', message: "That didn't go through. Please try again in a minute." })
    } catch {
      setStatus({ kind: 'error', message: "Couldn't reach the server. Check your connection and try again." })
    }
  }

  const sending = status.kind === 'sending'

  return (
    <dialog
      ref={ref}
      aria-labelledby="advertise-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-cream-300 bg-cream-50 p-0 text-pine-900 shadow-2xl backdrop:bg-pine-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 id="advertise-title" className="text-xl font-bold">
          {copy.title}
        </h2>

        {status.kind === 'sent' ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-pine-800/80" role="status">
              {isAd ? "Thanks! Your message has been sent and we'll be in touch soon." : 'Thanks! Your message has been sent.'}
            </p>
            <div className="mt-6 flex justify-end">
              <button type="button" className="btn-green" onClick={onClose} autoFocus>
                Close
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="mt-2">
            <p className="text-sm leading-relaxed text-pine-800/80">{copy.intro}</p>
            <div className="mt-4 grid gap-3">
              <div>
                <label className="label" htmlFor="ad-name">
                  {isAd ? 'Name' : 'Name (optional)'}
                </label>
                <input id="ad-name" name="name" className="input" required={isAd} maxLength={100} autoComplete="name" />
              </div>
              <div className={isAd ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3'}>
                <div>
                  <label className="label" htmlFor="ad-email">
                    {isAd ? 'Email' : 'Email (optional)'}
                  </label>
                  <input
                    id="ad-email"
                    name="email"
                    type="email"
                    className="input"
                    required={isAd}
                    maxLength={150}
                    autoComplete="email"
                  />
                </div>
                {isAd && (
                  <div>
                    <label className="label" htmlFor="ad-phone">
                      Phone (optional)
                    </label>
                    <input id="ad-phone" name="phone" type="tel" className="input" maxLength={40} autoComplete="tel" />
                  </div>
                )}
              </div>
              <div>
                <label className="label" htmlFor="ad-message">
                  Message
                </label>
                <textarea
                  id="ad-message"
                  name="message"
                  className="input min-h-28"
                  required
                  maxLength={2000}
                  placeholder={copy.placeholder}
                />
              </div>
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} />
            </div>

            {status.kind === 'error' && (
              <p role="alert" className="mt-3 text-sm font-medium text-berry-600">
                {status.message}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={sending}>
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}
