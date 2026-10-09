import type { Base } from './Base'
import type { AccountListing } from './AccountListing'
import type { TierListing } from './TierListing'

export interface Transfer extends Base{
  status: string
  initiated: string
  completed: string
  tickets: Array<{
    tier: TierListing,
    quantity: number
  }>
  sender: AccountListing | string
  recipient: AccountListing | string

  cancel(): Promise<boolean>
  accept(): Promise<boolean>
  reject(): Promise<boolean>
}