import { Account } from '../Account'
import { Lookup } from '../Lookup'

export interface TransferData{
  sender?: Account | string
  recipient?: Lookup | string
  tickets: {[key: string]: number}
}