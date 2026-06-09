import { Base } from './Base'
import { TierListing } from './TierListing'

export interface Token extends Base{
  code: string
  global: boolean
  tiers: Array<TierListing>

  allow(tier: TierListing)
  deny(tier: TierListing)
}