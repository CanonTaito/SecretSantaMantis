import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { hasSavedWork, planMove } from './lib/moved.ts'
import { loadState } from './lib/storage.ts'

// The old GitHub Pages address forwards visitors to the new one (see lib/moved.ts).
const move = planMove(window.location, hasSavedWork(loadState()))

if (move.kind === 'redirect') {
  window.location.replace(move.url)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App movedNotice={move.kind === 'notice'} />
    </StrictMode>,
  )
}
