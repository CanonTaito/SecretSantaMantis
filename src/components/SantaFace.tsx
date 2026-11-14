const SKIN = '#9a5b34'
const SKIN_SHADE = '#7d4527'
const FRAME = '#2b1a10'
const RED = '#c8323b'
const RED_DARK = '#a8262f'
const WHITE = '#fffdf8'

/** Our Santa: warm brown skin, glasses, and a frangipani tucked in his hat. */
export function SantaFace({ size = 72, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="Santa with glasses"
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

      {/* frangipani on the brim */}
      <g transform="translate(31 45)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-5.5" rx="3.6" ry="6" fill="#ffffff" stroke="#f0cf7c" strokeWidth="0.8" transform={`rotate(${angle})`} />
        ))}
        <circle r="2.6" fill="#e3b341" />
      </g>

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

      {/* eyes */}
      <circle cx="50" cy="66" r="2.6" fill={FRAME} />
      <circle cx="70" cy="66" r="2.6" fill={FRAME} />

      {/* glasses */}
      <g fill="#ffffff" fillOpacity="0.18" stroke={FRAME} strokeWidth="2.4">
        <circle cx="50" cy="66" r="8" />
        <circle cx="70" cy="66" r="8" />
      </g>
      <path d="M58 65 Q 60 62.5 62 65" fill="none" stroke={FRAME} strokeWidth="2.2" />
      <path d="M42 65 L 34 63 M78 65 L 86 63" stroke={FRAME} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
