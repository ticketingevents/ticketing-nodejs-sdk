import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { Venue } from '../interface/Venue'
import { VenueData } from '../interface/data/VenueData'
import { Region } from '../interface/Region'
import { RegionModel } from './RegionModel'

export class VenueModel extends BaseModel implements Venue{
  public name: string
  public region: Region
  public longitude: number
  public latitude: number
  public address: string
  public map: string

  constructor(venue: any, adapter: APIAdapter){
    super(venue.self, adapter)

    this.name = venue.name
    this.region = new RegionModel({self: venue.region}, adapter),
    this.longitude = venue.longitude
    this.latitude = venue.latitude
    this.address = venue.address
    this.map = venue.map
  }

  serialise(): VenueData{
    return {
      name: this.name,
      region: this.region,
      longitude: this.longitude,
      latitude: this.latitude,
      address: this.address
    }
  }
}