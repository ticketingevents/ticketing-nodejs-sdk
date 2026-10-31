import { Base } from './Base'
import { TierListing } from './TierListing'
import { EventListing } from './EventListing'

export interface AdmissionToken extends Base{
  label: string
  code: string
  tiers: Array<TierListing>
  event: EventListing
  api_key: string
}