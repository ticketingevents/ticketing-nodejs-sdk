import { Base } from './Base'
import { HostStatistics } from './reporting/HostStatistics'
import { EventRevisionService, PrivilegeService } from '../model/HostModel'

export interface Host extends Base{
  name: string
  contact: string
  email: string
  bio: string
  phone: string
  website: string
  country: string
  firstAddressLine: string
  secondAddressLine: string
  city: string
  district: string
  businessNo: string

  events: EventRevisionService
  privileges: PrivilegeService
  statistics(): Promise<HostStatistics>
}