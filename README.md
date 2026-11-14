# 🎅 Secret Santa

A free, no-sign-up Secret Santa generator for families. People in the same household never draw each other, and everyone gets their own private link to unwrap their match.

No accounts, no server, no email service. It all runs in your browser.

## How it works

1. **Set up.** Add the party name, gift budget and exchange date (all optional). Then add **households** and the people in each one. Someone who lives alone is a household of one. Optionally, add a gift hint for each person and extra rules like "Sam can't draw Alex" (handy for not repeating last year's match).
2. **Draw.** Press the button. Nobody draws themselves, anyone in their own household, or anyone a rule blocks. If the rules make a draw impossible, the app tells you why — for example, when one household is more than half the group.
3. **Share.** Every person gets a private link. Copy it into a text, use your phone's share sheet, or press **Email** to open a ready-to-send message in your own email app. Tick people off as you go.
4. **Unwrap.** When someone opens their link they see "Hi Sam!", tap a present, and confetti reveals who they're buying for, along with that person's gift hint, the budget and the date.

As the organizer, you never see the matches unless you choose to.

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

- Each match is stored inside its link, in the part after `#`. Browsers never send that part to a web server, so GitHub Pages never sees names or matches.
- Links are **scrambled, not encrypted**. Names aren't readable at a glance, but someone who has a link and knows what they're doing could decode it. Treat each link like a sealed envelope: only send it to the person it's for.
- Email addresses are used only to pre-fill the "To" line in your own email app. They are never sent anywhere by this site.

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

## Put your own copy online (GitHub Pages)

1. Fork or push this repo to your GitHub account.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes the site.
4. Your site appears at `https://<your-username>.github.io/<repo-name>/`.

The build uses relative paths, so it works under any repo name.

## Built with

React, TypeScript, Vite, Tailwind CSS, Vitest and [canvas-confetti](https://github.com/catdad/canvas-confetti).

## License

[MIT](LICENSE)
