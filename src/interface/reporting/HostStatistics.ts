import { Base } from '../Base'

export interface HostStatistics extends Base{
  events: number
  orders: number
  revenue: number
  tickets: number
}