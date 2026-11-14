import type { Region } from './region.ts'

export interface Ad {
  /** Any unique name, e.g. 'dynamite-nz'. */
  id: string
  /** Who sees it: 'NZ', 'QLD' (Brisbane and the rest of Queensland), 'OTHER' (everyone else). */
  regions: Region[]
  /** First day it shows, 'YYYY-MM-DD' (inclusive). Leave out to start straight away. */
  start?: string
  /** Last day it shows, 'YYYY-MM-DD' (inclusive). Leave out to run with no end. */
  end?: string
  /** Business name. */
  title: string
  /** One short line about them. */
  text: string
  /** Button label. */
  cta: string
  /** Where the button goes. */
  url: string
  /** Optional logo: a file in public/ads/, e.g. 'ads/dynamite.png'. */
  image?: string
}

/** Today's date in the visitor's own time zone, as 'YYYY-MM-DD'. */
export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** The first ad for this region that is running today, or null (show "Advertise here"). */
export function pickAd(ads: readonly Ad[], region: Region, today: string): Ad | null {
  return (
    ads.find(
      (ad) =>
        ad.regions.includes(region) && (!ad.start || ad.start <= today) && (!ad.end || today <= ad.end),
    ) ?? null
  )
}
