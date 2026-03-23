import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Region } from '../interface/Region'
import type { RegionData } from '../interface/data/RegionData'

export class RegionModel extends BaseModel implements Region{
  public name: string
  public country: string
  public district: string
  public city: string
  public icon: string

  constructor(region: any, adapter: APIAdapter){
    super(region.self, adapter)

    this.name = region.name
    this.country = region.country
    this.district = region.district
    this.city = region.city
    this.icon = region.icon
  }

  serialise(): RegionData{
    return {
      id: this.id,
      uri: this.uri,
      name: this.name,
      country: this.country,
      district: this.district,
      city: this.city
    }
  }
}