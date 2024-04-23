import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { Region } from '../interface/Region'
import { RegionData } from '../interface/data/RegionData'

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
      name: this.name,
      country: this.country,
      district: this.district,
      city: this.city
    }
  }
}