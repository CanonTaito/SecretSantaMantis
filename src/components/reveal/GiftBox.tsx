export type GiftPhase = 'wrapped' | 'opening' | 'open'

interface Props {
  phase: GiftPhase
  onOpen: () => void
}

/** A CSS-drawn present that wobbles, shakes, then pops its lid. */
export function GiftBox({ phase, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={phase !== 'wrapped'}
      aria-label="Unwrap your gift to see who you're buying for"
      className={`gift relative mx-auto block h-48 w-48 cursor-pointer rounded-xl disabled:cursor-default gift-${phase}`}
    >
      {/* box */}
      <span className="gift-body absolute bottom-0 left-1/2 h-32 w-40 -translate-x-1/2 rounded-b-lg bg-berry-500 shadow-lg">
        <span className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-gold-400" />
        <span className="absolute inset-x-0 top-0 h-3 bg-berry-700/30" />
      </span>
      {/* lid */}
      <span className="gift-lid absolute bottom-30 left-1/2 h-10 w-44 -translate-x-1/2 rounded-md bg-berry-600 shadow-md">
        <span className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-gold-400" />
        {/* bow */}
        <span className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-end">
          <span className="block h-8 w-10 -rotate-12 rounded-[60%_40%_40%_60%] border-[6px] border-gold-400" />
          <span className="z-10 -mx-1 mb-0.5 block size-4 rounded-full bg-gold-500" />
          <span className="block h-8 w-10 rotate-12 rounded-[40%_60%_60%_40%] border-[6px] border-gold-400" />
        </span>
      </span>
    </button>
  )
}
