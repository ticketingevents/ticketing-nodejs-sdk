import { Base } from './Base'
import { Collection } from '../util'
import { Event } from './Event'
import { HostStatistics } from './reporting/HostStatistics'

export interface Host extends Base{
  name: string
  contact: string
  email: string
  description: string
  phone: string
  website: string
  country: string
  firstAddressLine: string
  secondAddressLine: string
  city: string
  state: string
  businessNo: string

  events: Collection<Event>
  statistics(): Promise<HostStatistics>
}