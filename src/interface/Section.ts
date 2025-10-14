import { Base } from './Base'

export interface Section extends Base{
  name: string
  description: string
  price: {base: number, current: number, expires: string}
  fees: number
  salesStart: string
  salesEnd: string
  active: boolean
  capacity: number
  sold: number
  remaining: number
  reserved: number
}