import { Account } from '../Account'
import { TierListing } from '../TierListing'

export interface AdmissionData{
  redeemer: string
  device: string
  serials?: string[]
  ticket?: string
  patron?: Account | string
  tier?: TierListing | string
  admitted?: string
}