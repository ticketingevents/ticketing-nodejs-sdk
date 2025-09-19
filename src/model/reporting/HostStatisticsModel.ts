import { APIAdapter } from '../../util/APIAdapter'
import { BaseModel } from '../BaseModel'
import { HostStatistics } from '../../interface/reporting/HostStatistics'

export class HostStatisticsModel extends BaseModel implements HostStatistics{
  public events: number
  public orders: number
  public revenue: number
  public tickets: number

  constructor(statistics: any, adapter: APIAdapter){
    super(statistics.self, adapter)

    this.events = statistics.events
    this.orders = statistics.orders
    this.revenue = statistics.revenue
    this.tickets = statistics.tickets
  }
}