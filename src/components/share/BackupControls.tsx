import { useRef, useState, type Dispatch } from 'react'
import type { SantaState } from '../../types.ts'
import type { SantaAction } from '../../hooks/useSantaState.ts'
import type { ConfirmOptions } from '../ConfirmDialog.tsx'
import { exportBackup, parseBackup } from '../../lib/storage.ts'

interface Props {
  state: SantaState
  dispatch: Dispatch<SantaAction>
  confirm: (options: ConfirmOptions) => Promise<boolean>
  /** `upload` shows only the upload button (used on the setup screen). */
  mode?: 'full' | 'upload'
  uploadLabel?: string
}

export function BackupControls({ state, dispatch, confirm, mode = 'full', uploadLabel = '⬆️ Upload backup' }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setRestored(false)
    const next = parseBackup(await file.text())
    if (input.current) input.current.value = ''
    if (!next) {
      setError("That doesn't look like a Secret Santa backup.")
      return
    }
    const hasWork = state.draw !== null || state.households.some((h) => h.people.some((p) => p.name.trim()))
    if (hasWork) {
      const ok = await confirm({
        title: 'Replace what’s here?',
        body: state.draw
          ? 'This browser already has a draw. Uploading will replace it with the one in your backup file.'
          : 'Uploading will replace the names you’ve entered with the ones in your backup file.',
        confirmLabel: 'Replace',
        danger: true,
      })
      if (!ok) return
    }
    dispatch({ type: 'restore', state: next })
    setRestored(true)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {mode === 'full' && (
          <button type="button" className="btn-green" onClick={() => exportBackup(state)}>
            ⬇️ Download backup
          </button>
        )}
        <button type="button" className="btn-secondary" onClick={() => input.current?.click()}>
          {uploadLabel}
        </button>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-berry-600">
          {error}
        </p>
      )}
      {restored && (
        <p role="status" className="mt-2 text-sm font-medium text-pine-600">
          Backup restored.
        </p>
      )}
    </div>
  )
}
