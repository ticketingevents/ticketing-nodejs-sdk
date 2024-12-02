import { Base } from './Base'
import { Account } from './Account'

export interface Session extends Base{
  started: string
  key: string
  account: Account
}