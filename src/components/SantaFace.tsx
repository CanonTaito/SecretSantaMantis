const SKIN = '#9a5b34'
const SKIN_SHADE = '#7d4527'
const FRAME = '#2b1a10'
const RED = '#c8323b'
const RED_DARK = '#a8262f'
const WHITE = '#fffdf8'

/** Our Santa: warm brown skin, sunglasses, and 685 on his hat. */
export function SantaFace({ size = 72, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="Santa in sunglasses with 685 on his hat"
      className={className}
    >
      {/* hat */}
      <path d="M24 48 Q 34 10 84 10 Q 74 26 96 48 Z" fill={RED} />
      <path d="M60 14 Q 76 9 84 10 Q 76 20 80 32 Q 70 20 60 14 Z" fill={RED_DARK} />
      <circle cx="88" cy="11" r="8" fill={WHITE} />

      {/* ears */}
      <circle cx="33" cy="68" r="6" fill={SKIN_SHADE} />
      <circle cx="87" cy="68" r="6" fill={SKIN_SHADE} />

      {/* face */}
      <ellipse cx="60" cy="68" rx="26" ry="24" fill={SKIN} />

      {/* brim */}
      <rect x="20" y="40" width="80" height="15" rx="7.5" fill={WHITE} />

      {/* 685 on the brim */}
      <text
        x="60"
        y="51.5"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontWeight="800"
        fontSize="12"
        letterSpacing="1"
        fill={RED}
      >
        685
      </text>

      {/* cheeks */}
      <circle cx="42" cy="77" r="5" fill="#c8323b" opacity="0.28" />
      <circle cx="78" cy="77" r="5" fill="#c8323b" opacity="0.28" />

      {/* beard */}
      <path
        d="M32 72 Q 30 108 60 114 Q 90 108 88 72 Q 82 86 70 84 Q 60 92 50 84 Q 38 86 32 72 Z"
        fill={WHITE}
      />
      {/* moustache */}
      <path d="M60 82 Q 52 76 44 80 Q 48 88 60 85 Z" fill={WHITE} stroke="#e7d9bb" strokeWidth="0.8" />
      <path d="M60 82 Q 68 76 76 80 Q 72 88 60 85 Z" fill={WHITE} stroke="#e7d9bb" strokeWidth="0.8" />
      {/* smile */}
      <path d="M54 90 Q 60 95 66 90" fill="none" stroke={RED_DARK} strokeWidth="2.2" strokeLinecap="round" />

      {/* nose */}
      <ellipse cx="60" cy="75" rx="5" ry="4" fill={SKIN_SHADE} />

      {/* eyebrows */}
      <path d="M43 57 Q 50 53 56 57" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
      <path d="M64 57 Q 70 53 77 57" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />

      {/* sunglasses */}
      <path d="M41 64 L 34 62 M79 64 L 86 62" stroke={FRAME} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M57.5 63.5 Q 60 61.5 62.5 63.5" fill="none" stroke={FRAME} strokeWidth="2.6" />
      <g fill="#1a1410" stroke={FRAME} strokeWidth="2">
        <path d="M40 61 H 58 V 66 Q 58 73 49 73 Q 40 73 40 66 Z" />
        <path d="M62 61 H 80 V 66 Q 80 73 71 73 Q 62 73 62 66 Z" />
      </g>
      {/* lens shine */}
      <g stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round">
        <path d="M44 64 L 47 62.5" />
        <path d="M66 64 L 69 62.5" />
      </g>
    </svg>
  )
}
