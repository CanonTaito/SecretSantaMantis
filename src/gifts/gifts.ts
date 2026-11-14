import type { Audience, GiftIdea } from '../lib/gifts.ts'

/**
 * Gift ideas shown on the reveal page, linked to amazon.com.au searches.
 * Edit freely: each idea needs a name, one line of description, a search phrase,
 * and the price band it usually fits ('under20', '20to50', '50to100', '100plus').
 * Keep at least 3 ideas at or below every band for each audience (a test checks this).
 * Don't add prices: Amazon only allows prices that come from its own API.
 */
export const GIFT_IDEAS: Record<Audience, GiftIdea[]> = {
  adult: [
    { name: 'Gourmet chocolate box', blurb: 'An easy crowd-pleaser for anyone with a sweet tooth.', query: 'gourmet chocolate gift box', band: 'under20' },
    { name: 'Funny coffee mug', blurb: 'A daily laugh with their morning cuppa.', query: 'funny coffee mug gift', band: 'under20' },
    { name: 'Scented candle', blurb: 'Cosy and always welcome.', query: 'scented soy candle gift', band: 'under20' },
    { name: 'Card or party game', blurb: 'Something to play once the presents are open.', query: 'adult party card game', band: '20to50' },
    { name: 'Insulated drink bottle', blurb: 'Keeps drinks cold through an Aussie summer.', query: 'insulated stainless steel water bottle', band: '20to50' },
    { name: 'Cosy throw blanket', blurb: 'Soft, practical and good for movie nights.', query: 'soft throw blanket', band: '20to50' },
    { name: 'Book light or Kindle accessories', blurb: 'For the reader in the family.', query: 'rechargeable book light', band: '20to50' },
    { name: 'Bluetooth speaker', blurb: 'Music for the backyard or the beach.', query: 'portable bluetooth speaker waterproof', band: '50to100' },
    { name: 'BBQ tool set', blurb: 'For whoever runs the barbie at Christmas lunch.', query: 'bbq tool set gift', band: '50to100' },
    { name: 'Skincare or pamper set', blurb: 'A little self-care treat.', query: 'skincare gift set', band: '50to100' },
    { name: 'Wireless earbuds', blurb: 'Handy for commutes, gym and calls.', query: 'wireless earbuds', band: '100plus' },
    { name: 'Smart watch or fitness tracker', blurb: 'Steps, sleep and notifications on the wrist.', query: 'fitness tracker smart watch', band: '100plus' },
  ],
  kids0to3: [
    { name: 'Board books', blurb: 'Chunky, chewable first stories.', query: 'board books toddler', band: 'under20' },
    { name: 'Bath toys', blurb: 'Makes bath time more fun.', query: 'bath toys toddler', band: 'under20' },
    { name: 'Stacking cups or blocks', blurb: 'Simple play that builds little skills.', query: 'stacking cups baby toy', band: 'under20' },
    { name: 'Musical toy', blurb: 'Buttons, sounds and lights to explore.', query: 'musical toy toddler', band: '20to50' },
    { name: 'Shape sorter', blurb: 'A classic for curious hands.', query: 'wooden shape sorter', band: '20to50' },
    { name: 'Push-along walker', blurb: 'Helps early walkers find their feet.', query: 'baby push walker toy', band: '50to100' },
    { name: 'LEGO DUPLO set', blurb: 'Big bricks sized for small hands.', query: 'LEGO DUPLO', band: '50to100' },
    { name: 'Ride-on toy', blurb: 'Scoot around the house and yard.', query: 'toddler ride on toy', band: '100plus' },
  ],
  kids4to7: [
    { name: 'Colouring and sticker kit', blurb: 'Hours of quiet creativity.', query: 'kids colouring sticker activity kit', band: 'under20' },
    { name: 'Picture books', blurb: 'Bedtime stories to read together.', query: 'picture books kids 4-7', band: 'under20' },
    { name: 'Play-Doh set', blurb: 'Squish, mould, repeat.', query: 'Play-Doh set', band: 'under20' },
    { name: 'Kids board game', blurb: 'First games the whole family can play.', query: 'board game kids age 5', band: '20to50' },
    { name: 'Craft kit', blurb: 'Make-it-yourself fun.', query: 'craft kit kids age 5', band: '20to50' },
    { name: 'LEGO Classic set', blurb: 'Build anything they can imagine.', query: 'LEGO Classic', band: '50to100' },
    { name: 'Magnetic building tiles', blurb: 'Click-together towers and shapes.', query: 'magnetic building tiles', band: '50to100' },
    { name: 'Kids scooter', blurb: 'Outdoor fun for the school holidays.', query: 'kids scooter 3 wheel', band: '100plus' },
  ],
  kids8to12: [
    { name: 'Joke or puzzle book', blurb: 'Brain teasers and laughs.', query: 'joke book kids 8-12', band: 'under20' },
    { name: 'Card game', blurb: 'Quick games for car trips and holidays.', query: 'card game kids 8+', band: 'under20' },
    { name: 'Slime or fidget kit', blurb: 'Squishy, stretchy, endlessly fiddly.', query: 'slime kit kids', band: 'under20' },
    { name: 'Novel series box set', blurb: 'Gets them hooked on reading.', query: 'book series box set kids 8-12', band: '20to50' },
    { name: 'Science experiment kit', blurb: 'Hands-on experiments at home.', query: 'science kit kids 8-12', band: '20to50' },
    { name: 'Art set', blurb: 'Pencils, markers and paints in one case.', query: 'art set kids', band: '20to50' },
    { name: 'LEGO set', blurb: 'A bigger build for older kids.', query: 'LEGO 8+', band: '50to100' },
    { name: 'Remote control car', blurb: 'Speedy outdoor fun.', query: 'remote control car kids', band: '50to100' },
    { name: 'Kids smart watch or camera', blurb: 'A first gadget of their own.', query: 'kids digital camera', band: '100plus' },
  ],
  teen: [
    { name: 'Phone accessories', blurb: 'Grips, stands or a fun case.', query: 'phone stand accessories teen gift', band: 'under20' },
    { name: 'LED strip lights', blurb: 'A bedroom glow-up.', query: 'LED strip lights bedroom', band: 'under20' },
    { name: 'Graphic novel', blurb: 'Popular reads for teens.', query: 'graphic novel teen', band: 'under20' },
    { name: 'Gaming gift card', blurb: 'Let them choose their own game.', query: 'gaming gift card', band: '20to50' },
    { name: 'Hoodie or beanie', blurb: 'Comfy, casual, always worn.', query: 'teen hoodie', band: '20to50' },
    { name: 'Wireless headphones', blurb: 'For music, gaming and school.', query: 'wireless headphones', band: '50to100' },
    { name: 'Instant camera', blurb: 'Snap and share real photos.', query: 'instant camera', band: '50to100' },
    { name: 'Gaming headset', blurb: 'Clear sound and mic for online play.', query: 'gaming headset', band: '100plus' },
  ],
}
