import { Account } from '../Account'
import { Lookup } from '../Lookup'

export interface TransferData{
  id?: string | number,
  uri?: string,
  sender?: Account | string
  recipient?: Lookup | string
  tickets: {[key: string]: number}
}