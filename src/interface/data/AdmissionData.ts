import { AccountListing } from '../AccountListing'
import { TierListing } from '../TierListing'

export interface AdmissionData{
  redeemer: string
  device: string
  serials?: string[]
  serial?: string
  customer?: AccountListing | string
  tier?: TierListing | string
  admitted?: string
}