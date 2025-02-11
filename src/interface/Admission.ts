import { Base } from './Base'
import { Account } from './Account'
import { Section } from './Section'

export interface Admission extends Base{
  redeemer: string
  device: string
  ticket: string
  patron: Account
  section: Section
  admitted: string
}