import { useEffect, useRef } from 'react'
import { useSantaState } from './hooks/useSantaState.ts'
import { useConfirm } from './components/ConfirmDialog.tsx'
import { Stepper } from './components/Stepper.tsx'
import { SetupStep } from './components/setup/SetupStep.tsx'
import { DrawStep } from './components/draw/DrawStep.tsx'
import { ShareStep } from './components/share/ShareStep.tsx'
import { RevealPage } from './components/reveal/RevealPage.tsx'
import { useHash } from './hooks/useHash.ts'
import { Snowfall } from './components/Snowfall.tsx'
import { SantaFace } from './components/SantaFace.tsx'
import { revealFromHash } from './lib/revealLink.ts'
import type { Step } from './types.ts'

function Organizer() {
  const [state, dispatch] = useSantaState()
  const [dialog, confirm] = useConfirm()
  const reachable: Step[] = state.draw ? ['setup', 'share'] : ['setup', 'draw']

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
  }, [state.step])

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 pb-16 sm:pt-12">
      <header className="mb-8 text-center">
        <SantaFace size={88} className="mx-auto drop-shadow-sm" />
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-pine-800 sm:text-5xl">Secret Santa</h1>
        <p className="mx-auto mt-2 max-w-md text-pine-800/75">
          Draw names, keep households apart, and send everyone their own secret link.
        </p>
      </header>

      <Stepper current={state.step} reachable={reachable} onSelect={(step) => dispatch({ type: 'goTo', step })} />

      {state.step === 'setup' && <SetupStep state={state} dispatch={dispatch} confirm={confirm} />}
      {state.step === 'draw' && <DrawStep state={state} dispatch={dispatch} />}
      {state.step === 'share' && <ShareStep state={state} dispatch={dispatch} confirm={confirm} />}

      {dialog}
    </div>
  )
}

export default function App() {
  const hash = useHash()
  const reveal = revealFromHash(hash)
  // `undefined` = not a reveal link; `null` = a reveal link that couldn't be read.
  return (
    <>
      <Snowfall />
      {reveal !== undefined ? <RevealPage key={hash} payload={reveal} /> : <Organizer />}
    </>
  )
}
