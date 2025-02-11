import { Base } from './Base'
import { Account } from './Account'
import { Section } from './Section'

export interface Ticket extends Base{
  serial: string
  status: string
  section: Section
  owner: Account
  issued: string
  redeemed: string
}