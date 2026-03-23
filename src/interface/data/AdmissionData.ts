import { Account } from '../Account'
import { Section } from '../Section'

export interface AdmissionData{
  id?: string | number,
  uri?: string,
  redeemer: string
  device: string
  serials?: string[]
  ticket?: string
  patron?: Account | string
  section?: Section | string
  admitted?: string
}