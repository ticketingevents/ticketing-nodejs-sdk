import { Base } from './Base'
import { EventRevisionService, TierService, HostPrivilegeService, HostSalesService } from '../model/HostModel'
import { StatisticsModel } from '../model/StatisticsModel'

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
  tiers: TierService
  privileges: HostPrivilegeService
  sales: HostSalesService

  statistics(parameters: {
    after: string,
    before: string,
    interval: string
  }): Promise<StatisticsModel>
}