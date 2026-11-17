import { canNativeShare, copyText } from './clipboard.ts'
import { NEW_HOME } from './moved.ts'

/** What gets shared when someone passes the site on. Always the main address. */
export const SITE_SHARE = {
  url: NEW_HOME,
  title: 'Secret Santa Mantis',
  text: 'Free Secret Santa draw for families: households never draw each other, kids draw kids, and everyone gets their own secret link.',
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

/** Opens the phone's share sheet when there is one, otherwise copies the text and address. */
export async function shareSite(): Promise<ShareResult> {
  if (canNativeShare()) {
    try {
      await navigator.share(SITE_SHARE)
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      // Some in-app browsers expose share() but refuse it; fall through to copying.
    }
  }
  return (await copyText(`${SITE_SHARE.text} ${SITE_SHARE.url}`)) ? 'copied' : 'failed'
}
