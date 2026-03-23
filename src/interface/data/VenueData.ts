import { Region } from '../Region'

export interface VenueData{
  id?: string | number,
  uri?: string,
  name: string
  region: Region | string
  longitude: number
  latitude: number
  address: string
}