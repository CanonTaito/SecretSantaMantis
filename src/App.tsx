import { useSantaState } from './hooks/useSantaState.ts'
import { useConfirm } from './components/ConfirmDialog.tsx'
import { Stepper } from './components/Stepper.tsx'
import { SetupStep } from './components/setup/SetupStep.tsx'
import { DrawStep } from './components/draw/DrawStep.tsx'
import type { Step } from './types.ts'

function Organizer() {
  const [state, dispatch] = useSantaState()
  const [dialog, confirm] = useConfirm()
  const reachable: Step[] = state.draw ? ['setup', 'share'] : ['setup', 'draw']

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 pb-16 sm:pt-12">
      <header className="mb-8 text-center">
        <div className="text-5xl" aria-hidden>
          🎅
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-pine-800 sm:text-5xl">Secret Santa</h1>
        <p className="mx-auto mt-2 max-w-md text-pine-800/75">
          Draw names, keep households apart, and send everyone their own secret link.
        </p>
      </header>

      <Stepper current={state.step} reachable={reachable} onSelect={(step) => dispatch({ type: 'goTo', step })} />

      {state.step === 'setup' && <SetupStep state={state} dispatch={dispatch} confirm={confirm} />}
      {state.step === 'draw' && <DrawStep state={state} dispatch={dispatch} />}
      {state.step === 'share' && <p className="card p-6 text-center">Coming next.</p>}

      {dialog}
    </div>
  )
}

export default function App() {
  return <Organizer />
}
