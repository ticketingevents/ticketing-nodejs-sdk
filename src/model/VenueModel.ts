import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { Venue } from '../interface/Venue'
import { VenueData } from '../interface/data/VenueData'

export class VenueModel extends BaseModel implements Venue{
  public name: string
  public region: string
  public longitude: number
  public latitude: number
  public address: string
  public map: string

  constructor(venue: any, adapter: APIAdapter){
    super(venue.self, adapter)

    this.name = venue.name
    this.region = /([A-Za-z0-9\-]+)$/.exec(venue.region)[1]
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