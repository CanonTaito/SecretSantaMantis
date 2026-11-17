import { FAQ, HOW_IT_WORKS, type FaqItem } from '../content/faq.ts'
import { SantaFace } from '../components/SantaFace.tsx'

/**
 * Search pages: plain HTML made at build time (scripts/prerender-seo.mjs), one per search people
 * make. Edit the wording here; `npm run build` turns each into dist/<slug>/index.html.
 */

export interface SeoSection {
  heading: string
  paragraphs?: string[]
  list?: string[]
  /** Show the four "How it works" steps from content/faq.ts in this section. */
  steps?: boolean
}

export interface SeoPage {
  slug: string
  /** Browser tab and Google result title. Keep it under 60 characters. */
  title: string
  /** Google result snippet. Keep it under 155 characters. */
  description: string
  h1: string
  intro: string
  cta: string
  sections: SeoSection[]
  faq: FaqItem[]
  screenshot: { file: string; source: string; alt: string }
}

/** A question from the home page FAQ, so the two never disagree. */
function faq(question: string): FaqItem {
  const item = FAQ.find((f) => f.q === question)
  if (!item) throw new Error(`No FAQ item "${question}" in content/faq.ts`)
  return item
}

export const SEO_PAGES: SeoPage[] = [
  {
    slug: 'kris-kringle-generator',
    title: 'Free Kris Kringle Generator | Secret Santa Mantis',
    description:
      'Draw names for your Kris Kringle online. Households never draw each other, kids draw kids, and everyone gets their own secret link. Free, no sign-up.',
    h1: 'Free Kris Kringle generator',
    intro:
      'Kris Kringle is what most Australians and New Zealanders call Secret Santa: everyone draws one name and buys that person a present. Secret Santa Mantis does the draw for you online, keeps partners and kids sorted, and gives each person their own private link. It’s free, and nobody needs an account.',
    cta: 'Start your Kris Kringle draw →',
    sections: [
      {
        heading: 'Kris Kringle or Secret Santa? Same thing',
        paragraphs: [
          'The name comes from Christkindl, the German “Christ child” who brought presents at Christmas. Over time it became another name for Santa, and in Australia and New Zealand it now means the gift swap itself.',
          'The buttons on this site say “Secret Santa”, but it runs a Kris Kringle in exactly the same way: one name each, one present each, and nobody knows who has them until the day.',
        ],
      },
      {
        heading: 'How to run your Kris Kringle online',
        steps: true,
        paragraphs: [
          'A family or group of friends takes a couple of minutes to set up, and it all works on a phone.',
        ],
      },
      {
        heading: 'Why not just pull names out of a hat?',
        list: [
          'Someone draws their own name, or their partner’s, and you have to start again.',
          'Half the family is interstate or overseas, so they can’t reach into the hat.',
          'The kids end up buying for adults when you wanted them to swap with each other.',
          'By December, someone has forgotten who they drew.',
        ],
        paragraphs: [
          'An online draw fixes all four. The rules are applied every time, everyone gets their name wherever they live, and each person can open their link again whenever they need a reminder.',
        ],
      },
      {
        heading: 'Setting a budget and gift hints',
        paragraphs: [
          'Agree on one amount and add it to the draw, so it shows on everyone’s link. Many groups pick something between $20 and $50. One clear amount avoids the awkward moment when one present is far bigger than the rest.',
          'Ask everyone for a gift hint too, like “books” or “anything for the garden”. Each hint appears on the link of the person buying for them, along with gift ideas that fit the budget.',
        ],
      },
      {
        heading: 'Family interstate or overseas',
        paragraphs: [
          'Because everyone gets their own link, it doesn’t matter where they are. Send each link in a private message, like a text, WhatsApp or Messenger, or email it from your own email app. People can post their presents, swap them on Christmas Day, or open them together on a video call.',
        ],
      },
    ],
    faq: [
      faq('Is it free? Do I need an account?'),
      {
        q: 'Can the organiser see who everyone got?',
        a: 'Not by accident. The matches stay hidden unless you press “Show who got whom” and confirm, so the organiser can join in the Kris Kringle too.',
      },
      {
        q: 'Someone dropped out after the draw. What now?',
        a: 'Use “Edit and redraw” to take them out and draw again, then send everyone their new link. If two people just need to swap, “Show who got whom” lets you swap them, and only those two need new links.',
      },
      {
        q: 'How many people do I need?',
        a: 'At least three. Big groups work too, from a large extended family to a whole office.',
      },
    ],
    screenshot: {
      file: 'kris-kringle-reveal.png',
      source: 'marketing/alternativeto/4-reveal-open.png',
      alt: 'A Kris Kringle link after unwrapping: “You’re buying for Zara”, with her gift hint, age, budget and date',
    },
  },
  {
    slug: 'family-secret-santa',
    title: 'Family Secret Santa Generator – Keep Households Apart',
    description:
      'Run your family Secret Santa online: partners and siblings never draw each other, kids only draw kids, and everyone gets a private link. Free.',
    h1: 'Family Secret Santa, sorted',
    intro:
      'A family Secret Santa isn’t like an office one. Couples shouldn’t draw each other, the kids want to buy for kids, and Nana doesn’t want to download an app. Secret Santa Mantis is built around households, so the draw comes out right the first time.',
    cta: 'Start your family draw →',
    sections: [
      {
        heading: 'Why family draws go wrong',
        paragraphs: [
          'Pulling names from a hat ignores who lives with whom. You end up drawing again because Mum got Dad, or because a seven-year-old drew their uncle. A few simple rules let the draw take care of this for you.',
        ],
      },
      {
        heading: 'Put people in households',
        paragraphs: [
          'Add each household, like “The Harpers” or “Nana Rose”, and the people in it. Nobody draws anyone from their own household, so partners, parents and siblings who live together never end up buying for each other.',
          'Someone who lives alone is simply a household of one, so grandparents, uni students and single aunts and uncles fit in without any fuss.',
        ],
      },
      {
        heading: 'Kids only draw kids',
        paragraphs: [
          'Tick Child next to each child. Children only draw other children, and adults only draw adults, so the kids get to choose a present for someone their own age.',
          'Add a child’s age and it shows to whoever is buying for them, along with gift ideas for that age.',
        ],
      },
      {
        heading: 'Add your own “never draw” rules',
        paragraphs: [
          'Want to stop someone getting the same person as last year, or keep two cousins apart? Add a rule that one person can’t draw another, and choose whether it works both ways.',
        ],
      },
      {
        heading: 'Getting the links to everyone',
        paragraphs: [
          'After the draw, each person gets their own private link that shows only their match. Send each one in a private message, like a text, WhatsApp or Messenger, or email it from your own email app. Don’t post them all in the family group chat, or everyone can open everyone else’s.',
          'Tick each person off as you send their link, so nobody is missed.',
        ],
      },
      {
        heading: 'Keep a backup',
        paragraphs: [
          'Your list is saved in your browser, not in an account. After the draw, press “Download backup” so you can bring it back on another device or resend a lost link later. Links you’ve sent keep working either way.',
        ],
      },
    ],
    faq: [
      faq('Why does it say the draw is impossible?'),
      faq('Can I change names or matches after the draw?'),
      {
        q: 'Can I import our family list from a spreadsheet?',
        a: 'Yes. Save it as a CSV with Household and Name columns, plus optional Email, Gift hint, Child and Age, then press Import CSV on the Set up screen. “Download template” there shows the layout.',
      },
      {
        q: 'Does everyone need the app?',
        a: 'No. There’s nothing to install. Everyone opens their link in the web browser on their phone or computer, and nobody needs an account.',
      },
    ],
    screenshot: {
      file: 'family-households.png',
      source: 'marketing/alternativeto/1-setup.png',
      alt: 'Setting up a family draw: two households with their people, gift hints, and the children ticked',
    },
  },
]

const link = 'font-semibold text-pine-600 underline-offset-4 hover:underline'

/** One search page. Links are relative so they work on any address the site is served from. */
export function SeoLayout({ page }: { page: SeoPage }) {
  const others = SEO_PAGES.filter((p) => p.slug !== page.slug)

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:pt-12">
      <header className="text-center">
        <a href="../" className="inline-flex flex-col items-center text-pine-800 no-underline">
          <SantaFace size={64} className="drop-shadow-sm" />
          <span className="mt-1 font-display text-lg font-extrabold">Secret Santa Mantis</span>
        </a>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-pine-800 sm:text-5xl">{page.h1}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-pine-800/80">{page.intro}</p>
        <a href="../" className="btn-primary mt-6 px-6 py-3 text-base">
          {page.cta}
        </a>
        <p className="mt-2 text-sm text-pine-800/60">Free · No sign-up · Works on any phone</p>
      </header>

      <main className="mt-12 space-y-6">
        {page.sections.map((section, i) => (
          <section key={section.heading} className="card p-6">
            <h2 className="text-2xl font-extrabold text-pine-800">{section.heading}</h2>
            {section.steps && (
              <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                {HOW_IT_WORKS.map((step, n) => (
                  <li key={step.title} className="rounded-xl bg-pine-50 p-4">
                    <p className="text-2xl" aria-hidden>
                      {step.emoji}
                    </p>
                    <h3 className="mt-1 font-bold text-pine-900">
                      {n + 1}. {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-pine-800/75">{step.text}</p>
                  </li>
                ))}
              </ol>
            )}
            {section.list && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-pine-800/85">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.paragraphs?.map((p) => (
              <p key={p} className="mt-3 text-pine-800/85">
                {p}
              </p>
            ))}
            {i === 1 && (
              <img
                src={`../guides/${page.screenshot.file}`}
                alt={page.screenshot.alt}
                width={1280}
                height={800}
                loading="lazy"
                className="mt-5 h-auto w-full rounded-xl border border-cream-300 shadow-sm"
              />
            )}
          </section>
        ))}

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mt-10 text-center text-2xl font-extrabold text-pine-800">
            Questions
          </h2>
          <div className="card mt-5 divide-y divide-cream-200 overflow-hidden">
            {page.faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-pine-900 transition hover:bg-pine-50 focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    className="shrink-0 text-xl leading-none text-pine-600 transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="px-5 pb-4 text-sm text-pine-800/80">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="card border-gold-400 bg-gold-300/15 p-6 text-center">
          <h2 className="text-2xl font-extrabold text-pine-800">Ready to draw names?</h2>
          <p className="mt-2 text-pine-800/80">Set it up in a couple of minutes. Free, and nobody needs an account.</p>
          <a href="../" className="btn-primary mt-4 px-6 py-3 text-base">
            {page.cta}
          </a>
        </section>
      </main>

      <footer className="mt-12 text-center text-sm text-pine-700/70">
        <nav aria-label="More guides" className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <a className={link} href="../">
            Secret Santa Mantis
          </a>
          {others.map((p) => (
            <span key={p.slug} className="contents">
              <span aria-hidden>·</span>
              <a className={link} href={`../${p.slug}/`}>
                {p.h1}
              </a>
            </span>
          ))}
        </nav>
      </footer>
    </div>
  )
}
