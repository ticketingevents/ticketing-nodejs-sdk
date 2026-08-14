import { Base } from './Base'
import { EventListing } from './EventListing'
import { Tier } from './Tier'
import { Account } from './Account'

export interface Sale extends Base{
  recorded: string
  order: string
  event: EventListing
  tier: Tier
  customer: Account
  quantity: number
  total: number
  status: string
}