import { AccountListing } from '../AccountListing'
import { TierListing } from '../TierListing'

export interface TicketData{
  serial: string
  status: string
  tier: TierListing | string
  customer: AccountListing | string
  issued: string
  redeemed: string,
  details: {[key: string]: string}
}