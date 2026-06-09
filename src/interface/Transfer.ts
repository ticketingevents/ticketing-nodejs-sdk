import type { Base } from './Base'
import type { Account } from './Account'
import type { EventListing } from './EventListing'
import type { TierListing } from './TierListing'

export interface Transfer extends Base{
  status: string
  initiated: string
  tickets: Array<{
    event: EventListing,
    tier: TierListing,
    quantity: number
  }>
  sender: Account | string
  recipient: Account | string

  cancel(): Promise<boolean>
  claim(): Promise<boolean>
}