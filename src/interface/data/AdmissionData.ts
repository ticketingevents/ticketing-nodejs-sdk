import { Account } from './Account'
import { Section } from './Section'

export interface AdmissionData{
  redeemer: string
  device: string
  serials?: string[]
  ticket?: string
  patron?: Account
  section?: Section
  admitted?: string
}