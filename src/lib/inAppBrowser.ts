/**
 * Spots the browsers built into the Facebook, Messenger and Instagram apps.
 * Pages opened there keep their own saved data, which can be wiped and isn't shared with
 * Safari or Chrome, and file downloads often fail, so organisers are told to switch.
 */
export type InAppBrowser = 'Facebook' | 'Messenger' | 'Instagram'

const FORCED: Record<string, InAppBrowser> = {
  facebook: 'Facebook',
  messenger: 'Messenger',
  instagram: 'Instagram',
}

/** `?inapp=facebook` (or messenger, instagram) forces it, for previewing the notice. */
export function inAppBrowser(
  userAgent = navigator.userAgent,
  search = window.location.search,
): InAppBrowser | null {
  const forced = new URLSearchParams(search).get('inapp')?.toLowerCase()
  if (forced && FORCED[forced]) return FORCED[forced]

  // Messenger's markers also contain FBAN / FB_IAB, so check it first.
  if (/MessengerForiOS|Orca-Android|FBAN\/Messenger/i.test(userAgent)) return 'Messenger'
  if (/FBAN\/|FBAV\/|FB_IAB\//.test(userAgent)) return 'Facebook'
  if (/\bInstagram\b/.test(userAgent)) return 'Instagram'
  return null
}
