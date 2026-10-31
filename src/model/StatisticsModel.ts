import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Statistics } from '../interface/Statistics'

export class StatisticsModel extends BaseModel implements Statistics{
  public start: Date
  public end: Date
  public interval: string
  public gross_sales: number
  public tickets_sold: number
  public breakdown: Array<Statistics>

  constructor(statistics: any, adapter: APIAdapter){
    super("", adapter)

    this.start = statistics.start ? new Date(statistics.start) : null
    this.end = statistics.end ? new Date(statistics.end) : null
    this.interval = statistics.interval
    this.gross_sales = statistics.gross_sales
    this.tickets_sold = statistics.tickets_sold

    this.breakdown = []

    for(const breakdown of statistics.breakdown ? statistics.breakdown : []){
    	this.breakdown.push(new StatisticsModel(breakdown, adapter))
    }
  }
}