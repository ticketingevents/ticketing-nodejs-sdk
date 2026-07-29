import type { Account } from './Account'
import type { Order } from './Order'
import type { TierListing } from './TierListing'

export interface Cart{
  created: string
  total: number
  items: Array<{tier: TierListing, quantity: number, total: number}>

  add(tier: TierListing, quantity: number): Promise<boolean>
  remove(tier: TierListing, quantity: number): Promise<boolean>
  set(tier: TierListing, quantity: number): Promise<boolean>
  checkout(customer: Account): Promise<Order>
}