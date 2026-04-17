import { Base } from './Base'
import { Collection } from '../util/Collection'
import type { AccountPreferences } from './AccountPreferences'
import type { EventRevision } from './EventRevision'
import type { Ticket } from './Ticket'
import type { Transfer } from './Transfer'
import { AccountPrivilegeService, PrivilegedHostService } from '../model/AccountModel'

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
  privileges: AccountPrivilegeService
  hosts: PrivilegedHostService

  inbox: Collection<Transfer>
  outbox: Collection<Transfer>

  itinerary(pageLength: number): Collection<EventRevision>
  wallet(pageLength: number): Collection<Ticket>
  
  deactivate(message?: string): Promise<boolean>
}