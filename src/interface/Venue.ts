import { Base } from './Base'

export interface Venue extends Base{
  name: string
  region: string
  longitude: number
  latitude: number
  address: string
  map: string
}