import type { Lookup } from './Lookup'
import type { Transfer } from './Transfer'
import type { TierListing } from './TierListing'

export interface Parcel{
  created: string
  tickets: Array<{tier: TierListing, quantity: number}>

  add(tier: TierListing, quantity: number): Promise<boolean>
  remove(tier: TierListing, quantity: number): Promise<boolean>
  set(tier: TierListing, quantity: number): Promise<boolean>
  send(recipient: Lookup): Promise<Transfer>
}