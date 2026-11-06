import { Account } from '../Account'
import { Ticket } from '../Ticket'

export interface TransferData{
  recipient: Account | string
  tickets: Array<Ticket | string>
  note?: string
}