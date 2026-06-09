import { Base } from './Base'
import { Account } from './Account'
import { TierListing } from './TierListing'

export interface Admission extends Base{
  redeemer: string
  device: string
  ticket: string
  patron: Account
  tier: TierListing
  admitted: string
}