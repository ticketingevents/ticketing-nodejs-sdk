import type { Account } from './Account'
import type { Lookup } from './Lookup'
import type { Transfer } from './Transfer'
import type { TierListing } from './TierListing'

export interface Parcel{
  initiated: string
  tickets: Array<{tier: TierListing, quantity: number}>

  add(tier: TierListing, quantity: number): Promise<boolean>
  remove(tier: TierListing, quantity: number): Promise<boolean>
  set(tier: TierListing, quantity: number): Promise<boolean>
  send(sender: Account, recipient: Lookup): Promise<Transfer>
}