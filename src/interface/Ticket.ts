import { Base } from './Base'
import { Account } from './Account'
import { TierListing } from './TierListing'

export interface Ticket extends Base{
  serial: string
  status: string
  tier: TierListing
  issued: string
  redeemed: string
  owner: Account | string
}