import { Base } from './Base'

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
}