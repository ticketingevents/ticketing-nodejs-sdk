import { Base } from './Base'

export interface EventStatistics extends Base{
  capacity: number
  orders: number
  revenue: number
  tickets: number
}