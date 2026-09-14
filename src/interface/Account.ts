import { Base } from './Base'
import type { AccountPreferences } from './AccountPreferences'
import {
  AccountPrivilegeService, PrivilegedHostService, CartService,
  CustomerOrderService, CustomerItineraryService, CustomerWalletService
} from '../model/AccountModel'

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

  preferences?: Promise<AccountPreferences>
  privileges?: AccountPrivilegeService
  hosts?: PrivilegedHostService
  carts?: CartService
  orders?: CustomerOrderService
  itinerary?: CustomerItineraryService
  wallet?: CustomerWalletService
  
  deactivate?(message?: string): Promise<boolean>
}