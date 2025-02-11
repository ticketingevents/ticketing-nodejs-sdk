import { Base } from './Base'

export interface Section extends Base{
  name: string
  description: string
  basePrice: number
  salesStart: string
  salesEnd: string
  active: boolean
  capacity: number
  sold: number
  remaining: number
  reserved: number
}