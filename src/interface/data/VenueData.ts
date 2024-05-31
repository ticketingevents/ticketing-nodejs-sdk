import { Region } from '../Region'

export interface VenueData{
  name: string
  region: Region | string
  longitude: number
  latitude: number
  address: string
}