import { Base } from './Base'

export interface Statistics extends Base{
  start?: Date
  end?: Date
  interval?: string
  gross_sales: number
  tickets_sold: number
  breakdown?: Array<Statistics>
}