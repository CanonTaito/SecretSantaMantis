export interface Person {
  id: string
  name: string
  email: string
  wishlist: string
  /** Children only draw, and are only drawn by, other children. */
  isChild: boolean
  /** Optional, only used for children. Free text so "7" or "7½" both work. */
  age: string
}

export interface Household {
  id: string
  name: string
  people: Person[]
}

/** `giverId` may not draw `receiverId`. When `mutual`, the reverse is blocked too. */
export interface Exclusion {
  id: string
  giverId: string
  receiverId: string
  mutual: boolean
}

/** All fields are optional free text; empty string means "not set". */
export interface EventDetails {
  name: string
  budget: string
  date: string
}

export interface Draw {
  createdAt: string
  /** giverId -> receiverId */
  pairs: Record<string, string>
  /** giverId -> whether the organizer has marked their link as sent */
  sent: Record<string, boolean>
}

export type Step = 'setup' | 'draw' | 'share'

export interface SantaState {
  version: 1
  step: Step
  event: EventDetails
  households: Household[]
  exclusions: Exclusion[]
  draw: Draw | null
}
