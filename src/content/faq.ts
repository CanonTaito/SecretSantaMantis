/**
 * The "How it works" steps and FAQ shown at the bottom of the home page.
 * Edit the wording here and push. Keep answers short: a few sentences each.
 */

export interface HowStep {
  emoji: string
  title: string
  text: string
}

export interface FaqItem {
  q: string
  a: string
}

export const HOW_IT_WORKS: HowStep[] = [
  {
    emoji: '🏠',
    title: 'Set up',
    text: 'Add everyone’s name. If you like, group people who live together into households, tick Child for kids, and add gift hints or rules.',
  },
  {
    emoji: '🎲',
    title: 'Draw',
    text: 'Press the button. Nobody draws themselves, anyone in their own household, or anyone a rule blocks.',
  },
  {
    emoji: '🔗',
    title: 'Share',
    text: 'Everyone gets their own private link. Copy it into a text, share it, or email it from your own email app.',
  },
  {
    emoji: '🎁',
    title: 'Unwrap',
    text: 'Each person opens their link, taps the present, and finds out who they’re buying for.',
  },
]

export const FAQ: FaqItem[] = [
  {
    q: 'Is it free? Do I need an account?',
    a: 'It’s free, with no sign-up and no app to install. Everything runs in your web browser.',
  },
  {
    q: 'Can the organiser see who got whom?',
    a: 'Not unless you choose to. On the Share step, “Show who got whom” opens the full list after asking you to confirm, so you won’t spoil it by accident. It’s there for when someone loses their link or a gift goes missing.',
  },
  {
    q: 'Where is my list saved? What if I close the page?',
    a: 'Your list and the draw are saved in this browser on this device, so closing the page is fine. Clearing your browser data or switching devices loses them, so press “Download backup” after the draw. Use “Upload backup” to bring it back anywhere.',
  },
  {
    q: 'Someone lost their link, or never got it. What now?',
    a: 'Open the Share step on the device you drew on (or upload your backup) and send that person’s link again. Links never expire.',
  },
  {
    q: 'Can I change names or matches after the draw?',
    a: 'To change who’s in the draw, use “Edit and redraw”. That makes a fresh draw, so everyone needs a new link. To change a single match, open “Show who got whom” and swap two people. Only those two people need new links.',
  },
  {
    q: 'How do children work?',
    a: 'Tick Child next to anyone who is a child. Children only draw other children, and adults only draw adults. Their age is optional and is shown to whoever draws them, along with gift ideas for that age.',
  },
  {
    q: 'Why does it say the draw is impossible?',
    a: 'Usually one household is more than half the group, so there aren’t enough people outside it to go around. Or the rules block too many matches. The message says which. Add more people, split a household, or remove a rule.',
  },
  {
    q: 'Does the site send emails for me?',
    a: 'No. The Email button opens a ready-written message in your own email app, so it comes from you. Email addresses are never sent anywhere by this site.',
  },
  {
    q: 'Are the links private?',
    a: 'Each link holds only that person’s own match, scrambled so it isn’t readable at a glance. It isn’t encryption, so treat each link like a sealed envelope and only send it to the person it’s for.',
  },
  {
    q: 'What does the site know about me?',
    a: 'Very little. Your list, the names and the matches never leave your browser. The site keeps anonymous totals: visits (with Cloudflare Web Analytics, no cookies), how many draws are made and how many people were in each, and how many gifts are unwrapped. These are plain numbers that can’t be tied to you. The feedback and advertising forms only send what you type into them.',
  },
  {
    q: 'Why are there ads and Amazon links?',
    a: 'They keep the site free. The gift ideas link to Amazon, and as an Amazon Associate we earn from qualifying purchases, at no extra cost to you. Nothing about your group or the matches is included in those links.',
  },
]
