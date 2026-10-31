import { TierListing } from '../TierListing'

export interface AdmissionTokenData{
  label: string
  tiers: Array<TierListing | string>
}