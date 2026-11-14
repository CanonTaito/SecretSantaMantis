import { useMemo } from 'react'

const FLAKES = 28

/** Gentle decorative snow. Hidden for people who prefer reduced motion (see index.css). */
export function Snowfall() {
  const flakes = useMemo(
    () =>
      Array.from({ length: FLAKES }, (_, i) => ({
        left: `${(i * 37 + 11) % 100}%`,
        size: 8 + ((i * 7) % 10),
        duration: 12 + ((i * 13) % 14),
        delay: -((i * 29) % 26),
        drift: (i % 2 ? 1 : -1) * (10 + ((i * 5) % 30)),
        opacity: 0.25 + ((i * 3) % 5) / 12,
      })),
    [],
  )

  return (
    <div className="snowfall pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {flakes.map((f, i) => (
        <span
          key={i}
          className="snowflake absolute -top-6 text-pine-300"
          style={
            {
              left: f.left,
              fontSize: f.size,
              opacity: f.opacity,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              '--drift': `${f.drift}px`,
            } as React.CSSProperties
          }
        >
          ❄
        </span>
      ))}
    </div>
  )
}
