import { Lookup } from '../Lookup'
import { Ticket } from '../Ticket'

export interface TransferData{
  recipient: Lookup | string
  tickets: Array<Ticket | string>
  note?: string
}