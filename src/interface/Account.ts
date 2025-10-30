import { Base } from './Base'
import { Collection } from '../util/Collection'
import type { AccountPreferences } from './AccountPreferences'
import type { Event } from './Event'
import type { Ticket } from './Ticket'
import type { Host } from './Host'

export interface Account extends Base{
  number: string
  username: string
  email: string
  role: string
  verified: boolean
  activated: boolean
  firstName: string
  lastName: string
  title: string
  dateOfBirth: string
  phone: string
  country: string
  firstAddressLine: string
  secondAddressLine: string
  city: string
  state: string

  preferences: Promise<AccountPreferences>
  itinerary: Collection<Event>
  wallet: Collection<Ticket>
  hosts: Collection<Host>
}