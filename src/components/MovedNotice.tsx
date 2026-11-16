import type { SantaState } from '../types.ts'
import { exportBackup } from '../lib/storage.ts'
import { NEW_HOME } from '../lib/moved.ts'

const NEW_HOST = new URL(NEW_HOME).host

/** Shown on the old address to organisers whose list is saved there, so they can carry it across. */
export function MovedNotice({ state }: { state: SantaState }) {
  return (
    <section role="status" className="card mb-8 border-gold-300 bg-gold-300/15 p-5 text-left">
      <h2 className="text-lg font-bold text-pine-900">🏠 We've moved to {NEW_HOST}</h2>
      <p className="mt-1 text-sm text-pine-800/80">
        Your list is saved on this old address only. To carry it across:
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-pine-800/80">
        <li>Download a backup here.</li>
        <li>
          Open the new address and press <strong>Upload backup</strong> on the Set up screen.
        </li>
      </ol>
      <p className="mt-2 text-sm text-pine-800/80">Links you've already sent keep working.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-green" onClick={() => exportBackup(state)}>
          ⬇️ Download backup
        </button>
        <a className="btn-secondary" href={NEW_HOME}>
          Open {NEW_HOST} ↗
        </a>
      </div>
    </section>
  )
}
