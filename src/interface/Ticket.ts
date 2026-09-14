import { Base } from './Base'
import { TierListing } from './TierListing'

export interface Ticket extends Base{
  serial: string
  status: string
  tier: TierListing
  issued: string
  redeemed: string
}