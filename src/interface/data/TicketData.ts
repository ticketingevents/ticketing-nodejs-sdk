import { AccountListing } from '../AccountListing'
import { TierListing } from '../TierListing'
import { EventListing } from '../EventListing'

export interface TicketData{
  serial: string
  status: string
  tier: TierListing | string
  event: EventListing | string
  customer: AccountListing | string
  issued: string
  redeemed: string,
  details: {[key: string]: string}
}