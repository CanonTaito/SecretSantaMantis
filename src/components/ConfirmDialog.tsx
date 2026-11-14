import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

export interface ConfirmOptions {
  title: string
  body: ReactNode
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
}

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void }

/** `const [dialog, confirm] = useConfirm()` — render `dialog`, then `await confirm({...})`. */
export function useConfirm() {
  const [pending, setPending] = useState<Pending | null>(null)

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  )

  const dialog = pending ? (
    <ConfirmDialog
      {...pending}
      onClose={(ok) => {
        pending.resolve(ok)
        setPending(null)
      }}
    />
  ) : null

  return [dialog, confirm] as const
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  danger,
  onClose,
}: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose(false)
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-cream-300 bg-cream-50 p-0 text-pine-900 shadow-2xl backdrop:bg-pine-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="text-xl font-bold">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-pine-800/80">{body}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => onClose(false)} autoFocus>
            {cancelLabel}
          </button>
          <button type="button" className={danger ? 'btn-primary' : 'btn-green'} onClick={() => onClose(true)}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
