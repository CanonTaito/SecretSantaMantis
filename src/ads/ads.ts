import type { Ad } from '../lib/ads.ts'

/**
 * The ads the site can show. Edit this list to add, sell or end an ad, then push.
 *
 * - The first ad that matches the visitor's region and is running today wins.
 * - If nothing matches, visitors see "Advertise here" (when the enquiry form is set up).
 * - Regions come from the device time zone: 'NZ', 'QLD' (Brisbane and the rest of
 *   Queensland) or 'OTHER'. Preview any region by adding ?region=NZ (or QLD) to the URL.
 * - Dates are 'YYYY-MM-DD' and include both the start and end day.
 */
export const ADS: Ad[] = [
  {
    id: 'dynamite-nz',
    regions: ['NZ'],
    title: 'Dynamite Screen Prints',
    text: 'Custom screen-printed tees and gear, made in New Zealand.',
    cta: 'See their work on Instagram',
    url: 'https://www.instagram.com/dynamitescreenprintsltd/',
  },

  // Example of a sold slot for Brisbane in December. Copy, fill in and remove the //.
  // {
  //   id: 'brisbane-business-dec-2026',
  //   regions: ['QLD'],
  //   start: '2026-12-01',
  //   end: '2026-12-31',
  //   title: 'Business name',
  //   text: 'One short line about them.',
  //   cta: 'Visit their site',
  //   url: 'https://example.com',
  //   image: 'ads/their-logo.png', // optional, put the file in public/ads/
  // },
]
