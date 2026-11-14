import type { EventDetails, Household, Person, SantaState, Step } from '../types.ts'
import { createInitialState, newHousehold, newId, newPerson } from '../lib/storage.ts'

export type SantaAction =
  | { type: 'setEvent'; field: keyof EventDetails; value: string }
  | { type: 'addHousehold' }
  | { type: 'setHouseholds'; households: Household[] }
  | { type: 'renameHousehold'; householdId: string; name: string }
  | { type: 'removeHousehold'; householdId: string }
  | { type: 'addPerson'; householdId: string }
  | { type: 'updatePerson'; personId: string; field: keyof Omit<Person, 'id'>; value: string }
  | { type: 'removePerson'; personId: string }
  | { type: 'addExclusion'; giverId: string; receiverId: string; mutual: boolean }
  | { type: 'toggleExclusionMutual'; exclusionId: string }
  | { type: 'removeExclusion'; exclusionId: string }
  | { type: 'goTo'; step: Step }
  | { type: 'setDraw'; pairs: Record<string, string> }
  | { type: 'markSent'; giverId: string; sent: boolean }
  | { type: 'swapReceivers'; giverA: string; giverB: string }
  | { type: 'clearDraw' }
  | { type: 'restore'; state: SantaState }
  | { type: 'reset' }

const SETUP_EDITS = new Set<SantaAction['type']>([
  'setEvent',
  'addHousehold',
  'setHouseholds',
  'renameHousehold',
  'removeHousehold',
  'addPerson',
  'updatePerson',
  'removePerson',
  'addExclusion',
  'toggleExclusionMutual',
  'removeExclusion',
])

function dropExclusionsFor(state: SantaState, personIds: Set<string>): SantaState['exclusions'] {
  return state.exclusions.filter((e) => !personIds.has(e.giverId) && !personIds.has(e.receiverId))
}

export function santaReducer(state: SantaState, action: SantaAction): SantaState {
  // Once names are drawn, the setup is frozen so links already sent stay correct.
  // "Edit and redraw" (clearDraw) unlocks it.
  if (state.draw && SETUP_EDITS.has(action.type)) return state

  switch (action.type) {
    case 'setEvent':
      return { ...state, event: { ...state.event, [action.field]: action.value } }

    case 'addHousehold':
      return { ...state, households: [...state.households, newHousehold()] }

    case 'setHouseholds': {
      const ids = new Set(action.households.flatMap((h) => h.people.map((p) => p.id)))
      return {
        ...state,
        households: action.households,
        exclusions: state.exclusions.filter((e) => ids.has(e.giverId) && ids.has(e.receiverId)),
      }
    }

    case 'renameHousehold':
      return {
        ...state,
        households: state.households.map((h) => (h.id === action.householdId ? { ...h, name: action.name } : h)),
      }

    case 'removeHousehold': {
      const gone = state.households.find((h) => h.id === action.householdId)
      if (!gone) return state
      return {
        ...state,
        households: state.households.filter((h) => h.id !== action.householdId),
        exclusions: dropExclusionsFor(state, new Set(gone.people.map((p) => p.id))),
      }
    }

    case 'addPerson':
      return {
        ...state,
        households: state.households.map((h) =>
          h.id === action.householdId ? { ...h, people: [...h.people, newPerson()] } : h,
        ),
      }

    case 'updatePerson':
      return {
        ...state,
        households: state.households.map((h) => ({
          ...h,
          people: h.people.map((p) => (p.id === action.personId ? { ...p, [action.field]: action.value } : p)),
        })),
      }

    case 'removePerson':
      return {
        ...state,
        households: state.households.map((h) => ({ ...h, people: h.people.filter((p) => p.id !== action.personId) })),
        exclusions: dropExclusionsFor(state, new Set([action.personId])),
      }

    case 'addExclusion': {
      if (action.giverId === action.receiverId) return state
      const exists = state.exclusions.some(
        (e) =>
          (e.giverId === action.giverId && e.receiverId === action.receiverId) ||
          (e.mutual && e.giverId === action.receiverId && e.receiverId === action.giverId),
      )
      if (exists) return state
      return {
        ...state,
        exclusions: [
          ...state.exclusions,
          { id: newId(), giverId: action.giverId, receiverId: action.receiverId, mutual: action.mutual },
        ],
      }
    }

    case 'toggleExclusionMutual':
      return {
        ...state,
        exclusions: state.exclusions.map((e) => (e.id === action.exclusionId ? { ...e, mutual: !e.mutual } : e)),
      }

    case 'removeExclusion':
      return { ...state, exclusions: state.exclusions.filter((e) => e.id !== action.exclusionId) }

    case 'goTo':
      if (action.step === 'share' && !state.draw) return state
      if (action.step !== 'share' && state.draw) return { ...state, step: 'share' }
      return { ...state, step: action.step }

    case 'setDraw':
      return { ...state, step: 'share', draw: { createdAt: new Date().toISOString(), pairs: action.pairs, sent: {} } }

    case 'markSent': {
      if (!state.draw) return state
      const sent = { ...state.draw.sent }
      if (action.sent) sent[action.giverId] = true
      else delete sent[action.giverId]
      return { ...state, draw: { ...state.draw, sent } }
    }

    case 'swapReceivers': {
      const draw = state.draw
      const a = draw?.pairs[action.giverA]
      const b = draw?.pairs[action.giverB]
      if (!draw || a === undefined || b === undefined || action.giverA === action.giverB) return state
      // Both people's old links now show the wrong name, so they need sending again.
      const sent = { ...draw.sent }
      delete sent[action.giverA]
      delete sent[action.giverB]
      return { ...state, draw: { ...draw, pairs: { ...draw.pairs, [action.giverA]: b, [action.giverB]: a }, sent } }
    }

    case 'clearDraw':
      return { ...state, step: 'setup', draw: null }

    case 'restore':
      return action.state

    case 'reset':
      return createInitialState()
  }
}
