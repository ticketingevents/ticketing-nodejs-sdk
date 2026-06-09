import { Account } from '../Account'
import { TierListing } from '../TierListing'

export interface TicketData{
  serial: string
  status: string
  tier: TierListing | string
  owner?: Account | string
  issued: string
  redeemed: string
}