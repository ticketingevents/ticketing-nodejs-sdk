import { Base } from './Base'
import { AccountListing } from './AccountListing'
import { TierListing } from './TierListing'

export interface Ticket extends Base{
  serial: string
  status: string
  tier: TierListing
  customer: AccountListing
  issued: string
  redeemed: string
  details: {[key: string]: string}
}