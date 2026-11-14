import { useEffect, useReducer } from 'react'
import { createInitialState, loadState, saveState } from '../lib/storage.ts'
import { santaReducer } from './santaReducer.ts'

export type { SantaAction } from './santaReducer.ts'

/** The organizer's whole setup and draw, kept in this browser's localStorage. */
export function useSantaState() {
  const [state, dispatch] = useReducer(santaReducer, undefined, () => loadState() ?? createInitialState())

  useEffect(() => {
    saveState(state)
  }, [state])

  return [state, dispatch] as const
}
