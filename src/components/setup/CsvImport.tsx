import { useRef, useState, type Dispatch } from 'react'
import type { Household } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import { CSV_TEMPLATE, importPeopleCsv, mergeImport } from '../../lib/csvImport.ts'
import { downloadText } from '../../lib/download.ts'

interface Props {
  households: Household[]
  dispatch: Dispatch<SantaAction>
}

type Status = { kind: 'ok'; message: string; warnings: string[] } | { kind: 'error'; message: string }

const MAX_WARNINGS_SHOWN = 5
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Bulk-add people from a CSV with columns Household, Name, Email, Gift hint. */
export function CsvImport({ households, dispatch }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status | null>(null)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    if (input.current) input.current.value = ''

    const parsed = importPeopleCsv(text)
    if (!parsed.ok) {
      setStatus({ kind: 'error', message: parsed.error })
      return
    }

    const { households: merged, added, alreadyListed } = mergeImport(households, parsed.households)
    dispatch({ type: 'setHouseholds', households: merged })

    const parts = [`Added ${plural(added, 'person', 'people')} from ${file.name}.`]
    if (alreadyListed > 0) parts.push(`${plural(alreadyListed, 'person was', 'people were')} already on the list.`)
    setStatus({ kind: 'ok', message: parts.join(' '), warnings: parsed.warnings })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary" onClick={() => input.current?.click()}>
          📄 Import CSV
        </button>
        <button
          type="button"
          className="text-sm font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          onClick={() => downloadText('secret-santa-guest-list.csv', CSV_TEMPLATE, 'text/csv')}
        >
          Download template
        </button>
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="hidden"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      <p className="text-xs text-pine-800/60">Columns: Household, Name, then optional Email, Gift hint, Child (Yes) and Age</p>

      {status?.kind === 'error' && (
        <p role="alert" className="text-sm font-medium text-berry-600">
          {status.message}
        </p>
      )}
      {status?.kind === 'ok' && (
        <div role="status" className="text-sm">
          <p className="font-medium text-pine-600">✓ {status.message}</p>
          {status.warnings.length > 0 && (
            <ul className="mt-1 text-xs text-berry-600">
              {status.warnings.slice(0, MAX_WARNINGS_SHOWN).map((w) => (
                <li key={w}>{w}</li>
              ))}
              {status.warnings.length > MAX_WARNINGS_SHOWN && (
                <li>…and {status.warnings.length - MAX_WARNINGS_SHOWN} more.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
