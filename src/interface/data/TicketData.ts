import { Account } from '../Account'
import { Section } from '../Section'

export interface TicketData{
  serial: string
  status: string
  section: Section | string
  owner: Account | string
  issued: string
  redeemed: string
}