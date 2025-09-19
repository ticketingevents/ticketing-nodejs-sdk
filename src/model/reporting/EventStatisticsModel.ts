import { APIAdapter } from '../../util/APIAdapter'
import { BaseModel } from '../BaseModel'
import { EventStatistics } from '../../interface/reporting/EventStatistics'

export class EventStatisticsModel extends BaseModel implements EventStatistics{
  public capacity: number
  public orders: number
  public revenue: number
  public tickets: number

  constructor(statistics: any, adapter: APIAdapter){
    super(statistics.self, adapter)

    this.capacity = statistics.capacity
    this.orders = statistics.orders
    this.revenue = statistics.revenue
    this.tickets = statistics.tickets
  }
}