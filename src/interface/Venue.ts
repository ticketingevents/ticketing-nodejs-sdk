import { Base } from './Base'
import { Region } from './Region'

export interface Venue extends Base{
  name: string
  region: Region
  longitude: number
  latitude: number
  address: string
  map: string
}