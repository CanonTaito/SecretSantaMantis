import { ShareSiteButton } from '../ShareSiteButton.tsx'

/** After the gift is opened: invites the receiver to run their own Secret Santa or pass the site on. */
export function InviteCard({ homeHref }: { homeHref: string }) {
  return (
    <section aria-labelledby="invite-heading" className="card mt-6 w-full p-5 text-left">
      <h2 id="invite-heading" className="text-lg font-bold">
        🎄 Doing Secret Santa with another group?
      </h2>
      <p className="mt-1 text-sm text-pine-800/75">
        Work, friends, sport or church: set one up in two minutes. Free, no sign-up.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a className="btn-primary" href={homeHref}>
          Start a Secret Santa →
        </a>
        <ShareSiteButton />
      </div>
    </section>
  )
}
