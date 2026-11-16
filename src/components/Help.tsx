import { FAQ, HOW_IT_WORKS } from '../content/faq.ts'

/** "How it works" steps and the FAQ, at the bottom of the organiser pages. Content lives in content/faq.ts. */
export function Help({ className = '' }: { className?: string }) {
  return (
    <section id="help" aria-labelledby="help-heading" className={`scroll-mt-6 ${className}`}>
      <h2 id="help-heading" className="text-center text-2xl font-extrabold text-pine-800">
        How it works
      </h2>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_IT_WORKS.map((step, i) => (
          <li key={step.title} className="card p-4">
            <p className="text-2xl" aria-hidden>
              {step.emoji}
            </p>
            <h3 className="mt-1 font-bold text-pine-900">
              {i + 1}. {step.title}
            </h3>
            <p className="mt-1 text-sm text-pine-800/75">{step.text}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-center text-2xl font-extrabold text-pine-800">Questions</h2>
      <div className="card mt-5 divide-y divide-cream-200 overflow-hidden">
        {FAQ.map((item) => (
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
  )
}
