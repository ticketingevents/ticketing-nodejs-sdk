import { Base } from './Base'
import { AccountListing } from './AccountListing'
import { TierListing } from './TierListing'

export interface Admission extends Base{
  redeemer: string
  device: string
  serial: string
  customer: AccountListing
  tier: TierListing
  admitted: string
}