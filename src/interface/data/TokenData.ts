import { TierListing } from '../TierListing'

export interface TokenData{
  tiers: Array<TierListing | string>
}