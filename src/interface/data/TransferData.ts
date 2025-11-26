import { Account } from '../Account'

export interface TransferData{
  sender?: Account | string
  recipient?: Account | string
  tickets: {[key: string]: number}
}