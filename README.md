# 🎅🏾 Secret Santa Mantis

A free, no-sign-up Secret Santa generator for families. People in the same household never draw each other, and everyone gets their own private link to unwrap their match.

No accounts, no server, no email service. It all runs in your browser.

**Use it at [secretsanta.taitoapps.com](https://secretsanta.taitoapps.com)**

## How it works

1. **Set up.** Add the party name, gift budget and exchange date (all optional). Then add **households** and the people in each one. Someone who lives alone is a household of one. Tick **Child** for children (with their age, if you like): children only draw other children, and adults only draw adults. Optionally, add a gift hint for each person and extra rules like "Cruz can't draw Vegeta" (handy for not repeating last year's match).
2. **Draw.** Press the button. Nobody draws themselves, anyone in their own household, or anyone a rule blocks. If the rules make a draw impossible, the app tells you why — for example, when one household is more than half the group.
3. **Share.** Every person gets a private link. Copy it into a text, use your phone's share sheet, or press **Email** to open a ready-to-send message in your own email app. Tick people off as you go.
4. **Unwrap.** When someone opens their link they see "Hi Cruz!", tap a present, and confetti reveals who they're buying for, along with that person's gift hint, the budget and the date.

As the organizer, you never see the matches unless you choose to.

## Importing a list from a spreadsheet

Got everyone in a spreadsheet already? Save it as CSV and press **Import CSV** on the Set up screen. Use these columns (press **Download template** for an example file):

| Household | Name | Email | Gift hint | Child | Age |
| --- | --- | --- | --- | --- | --- |
| The Taitos | Cruz | cruz@example.com | Loves online gaming | | |
| The Taitos | Rey | | | Yes | 8 |
| The Ottos | Vegeta | vegeta@example.com | Batman | Yes | 2 |
| Grandma Lina | Grandma Lina | | Gardening | | |

- **Name** is required. **Email**, **Gift hint**, **Child** and **Age** are optional.
- Put **Yes** in the Child column for children. Age is only used for children; it's shown on their Secret Santa's reveal page.
- Rows with the same household name (any capitalisation) go together. A blank household means that person lives on their own.
- Imported people are added to whoever is already on the list. Anyone already listed is skipped, so importing the same file twice is safe.
- Comma, semicolon and tab separated files all work, including "CSV UTF-8" from Excel.

## Where the matches are kept

There is no server, so the draw lives in three places:

| Where | What's there | Who can see it |
| --- | --- | --- |
| Your browser (local storage) | Everything: setup, full match list, sent ticks | Only you, on that browser and device |
| A backup file you download | Same as above | Whoever has the file |
| Each person's link | Only that person's own match | Whoever has the link |

**Organizer master list.** If someone loses their link or a gift goes missing, open **Show who got whom** on the Share step. It asks you to confirm first, so you don't spoil it by accident.

**Backups.** The match list exists only in your browser. Clearing your browser data, switching browsers or moving to a new device loses it, so press **Download backup** after the draw. To bring it back, use **Upload backup** (on the Set up screen or the Share step). Links you've already sent keep working no matter what.

## Privacy

- Each match is stored inside its link, in the part after `#`. Browsers never send that part to a web server, so the web host never sees names or matches.
- Links are **scrambled, not encrypted**. Names aren't readable at a glance, but someone who has a link and knows what they're doing could decode it. Treat each link like a sealed envelope: only send it to the person it's for.
- Email addresses are used only to pre-fill the "To" line in your own email app. They are never sent anywhere by this site.
- The sponsor banner picks an ad from your device's **time zone** setting. That check happens in your browser; nothing about your location is sent anywhere.
- Gift-idea links go to amazon.com.au with the site's Associates tag; nothing about the match or the people is included in them.
- The **Advertise here** form is the only thing that sends data off the page: when someone presses Send, their name, email, phone and message go to [Web3Forms](https://web3forms.com), which emails them to the site owner.

## Ads

The site has one sponsor banner, on the setup screens and on the reveal page (below the present, never covering it).

**Managing ads.** Ads live in [`src/ads/ads.ts`](src/ads/ads.ts). Each ad has a business name, one line of text, a button label, a link, an optional logo (put the file in `public/ads/`), the regions that see it, and optional start and end dates (`YYYY-MM-DD`, both days included). To sell a slot, add an entry and push; it starts and stops on its dates by itself.

**Regions** come from the visitor's time zone: `NZ` (New Zealand), `QLD` (Brisbane and the rest of Queensland; time zones can't tell them apart) and `OTHER`. To preview what a region sees, add `?region=NZ` or `?region=QLD` to the page address.

**Advertise here.** When no ad is running for a visitor's region, they see an "Advertise here" banner with an enquiry form that emails you. To switch it on:

1. Go to [web3forms.com](https://web3forms.com), enter the email address that should receive enquiries, and copy the access key they send you. Your email stays with Web3Forms; it never appears in this repo or on the site.
2. For the live site: in Cloudflare, open the `secretsantamantis` Worker, go to **Settings → Build → Variables and secrets**, add `VITE_WEB3FORMS_KEY` with that key, then redeploy. For the GitHub Pages copy, add it in the repo under **Settings → Secrets and variables → Actions → Variables** as `WEB3FORMS_KEY` (or run `gh variable set WEB3FORMS_KEY`).
3. For local testing: copy `.env.example` to `.env` and paste the key after `VITE_WEB3FORMS_KEY=`. `.env` is git-ignored.

Without a key, the "Advertise here" banner stays hidden.

## Gift ideas (Amazon)

After someone unwraps their match, the reveal page suggests a few gift ideas that fit the budget and, for children, their age. Each opens a search on amazon.com.au.

- The lists live in [`src/gifts/gifts.ts`](src/gifts/gifts.ts): adults, kids 0–3, 4–7, 8–12, and teens, each idea tagged with a price band (under $20, $20–50, $50–100, $100+). Ideas are never shown above the budget.
- The links carry the site's Amazon Associates tracking ID, set as `VITE_AMAZON_TAG` in the Cloudflare build variables (the `AMAZON_TAG` repository variable for the GitHub Pages copy, or `VITE_AMAZON_TAG` in `.env` locally). Without it, the section is hidden.
- As an Amazon Associate we earn from qualifying purchases. Prices aren't shown (Amazon only allows prices from its own API), and gift-idea links are never put in the emails organisers send.

## Run it locally

You need [Node.js](https://nodejs.org/) 22 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

Other commands:

```bash
npm test        # draw, link and backup tests
npm run build   # production build into dist/
```

## Hosting

The live site runs on Cloudflare Workers as static files (see [`wrangler.jsonc`](wrangler.jsonc)). Cloudflare builds and deploys it on every push to `main`, and serves it at [secretsanta.taitoapps.com](https://secretsanta.taitoapps.com). The GitHub Pages workflow still publishes a second copy at [canontaito.github.io/SecretSantaMantis](https://canontaito.github.io/SecretSantaMantis/); the page's canonical link points search engines at the main address.

## Put your own copy online (GitHub Pages)

1. Fork or push this repo to your GitHub account.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes the site.
4. Your site appears at `https://<your-username>.github.io/<repo-name>/`.

The build uses relative paths, so it works under any repo name. If you run your own copy, change the canonical and `og:url` links in `index.html` to your address.

## Built with

React, TypeScript, Vite, Tailwind CSS, Vitest and [canvas-confetti](https://github.com/catdad/canvas-confetti).

## License

[MIT](LICENSE)
