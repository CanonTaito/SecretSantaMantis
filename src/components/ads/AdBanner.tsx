import { useMemo, useState } from 'react'
import { ADS } from '../../ads/ads.ts'
import { localToday, pickAd } from '../../lib/ads.ts'
import { detectRegion } from '../../lib/region.ts'
import { AdvertiseDialog, ENQUIRY_KEY } from './AdvertiseDialog.tsx'

/** One sponsor slot: a running ad for the visitor's region, else "Advertise here". */
export function AdBanner({ className = '' }: { className?: string }) {
  const ad = useMemo(() => pickAd(ADS, detectRegion(), localToday()), [])
  const [enquiring, setEnquiring] = useState(false)

  if (ad) {
    return (
      <aside aria-label="Sponsored" className={`card overflow-hidden text-left ${className}`}>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          {ad.image && (
            <img
              src={`${import.meta.env.BASE_URL}${ad.image}`}
              alt=""
              className="size-14 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold tracking-widest text-pine-700/60 uppercase">Sponsored</p>
            <p className="font-display text-lg font-bold text-pine-900">{ad.title}</p>
            <p className="text-sm text-pine-800/75">{ad.text}</p>
          </div>
          <a className="btn-green self-start sm:self-center" href={ad.url} target="_blank" rel="noopener sponsored">
            {ad.cta} ↗
          </a>
        </div>
      </aside>
    )
  }

  if (!ENQUIRY_KEY) return null

  return (
    <aside
      aria-label="Advertise here"
      className={`rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50/60 text-left ${className}`}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-pine-900">📣 Advertise here</p>
          <p className="text-sm text-pine-800/75">Reach families organising their Secret Santa.</p>
        </div>
        <button type="button" className="btn-secondary self-start sm:self-center" onClick={() => setEnquiring(true)}>
          Enquire
        </button>
      </div>
      {enquiring && <AdvertiseDialog onClose={() => setEnquiring(false)} />}
    </aside>
  )
}
