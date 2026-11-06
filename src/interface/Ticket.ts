import { Base } from './Base'
import { AccountListing } from './AccountListing'
import { TierListing } from './TierListing'
import { EventListing } from './EventListing'

export interface Ticket extends Base{
  serial: string
  status: string
  tier: TierListing
  event: EventListing
  customer: AccountListing
  issued: string
  redeemed: string
  details: {[key: string]: string}
}