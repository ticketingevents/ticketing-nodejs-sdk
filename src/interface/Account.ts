import { Base } from './Base'
import { AccountPreferences } from './AccountPreferences'
import { Host } from './Host'

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
  hosts: Collection<Host>
}