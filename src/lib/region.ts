/**
 * Rough visitor region from the device's time zone setting.
 * Nothing leaves the browser and there is no permission prompt.
 * Time zones can't tell Brisbane from the rest of Queensland, so "QLD" covers the whole state.
 */
export type Region = 'NZ' | 'QLD' | 'OTHER'

const ZONES: Record<string, Region> = {
  'Pacific/Auckland': 'NZ',
  'Pacific/Chatham': 'NZ',
  'Antarctica/McMurdo': 'NZ',
  'Australia/Brisbane': 'QLD',
  'Australia/Lindeman': 'QLD',
}

export function regionFromTimeZone(timeZone: string | undefined): Region {
  return (timeZone && ZONES[timeZone]) || 'OTHER'
}

function deviceTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

/** `?region=NZ` in the URL overrides detection, for previewing ads from anywhere. */
export function detectRegion(search = window.location.search, timeZone = deviceTimeZone()): Region {
  const forced = new URLSearchParams(search).get('region')?.toUpperCase()
  if (forced === 'NZ' || forced === 'QLD' || forced === 'OTHER') return forced
  return regionFromTimeZone(timeZone)
}
