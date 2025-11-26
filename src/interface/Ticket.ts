import { Base } from './Base'
import { Account } from './Account'
import { Section } from './Section'

export interface Ticket extends Base{
  serial: string
  status: string
  section: Section
  issued: string
  redeemed: string
  owner: Account | string
}