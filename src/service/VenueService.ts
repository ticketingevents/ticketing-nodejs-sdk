import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { BadDataError } from '../errors'
import type { VenueData } from '../interface/data/VenueData'
import type { Venue } from '../interface/Venue'
import { RegionModel } from '../model/RegionModel'
import { VenueModel } from '../model/VenueModel'

export class VenueService extends BaseService<VenueData, Venue>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/venues", VenueModel, ["region", "name"])

    this.__apiAdapter = apiAdapter
  }

  create(data: VenueData): Promise<Venue>{
    return new Promise<Venue>((resolve, reject) => {
      if(!(data.region instanceof RegionModel)){
        reject(new BadDataError(400, "Please provide a valid region for the venue"))
      }

      const payload: VenueData = JSON.parse(JSON.stringify(data))
      payload.region = (data.region as RegionModel).id
      super.create(payload).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }

  protected _instantiateModel(data: any){
    data.region = {self: data.region}
    return new VenueModel(data, this.__apiAdapter)
  }

  protected _preprocessCriteria(criteria: {[key: string]: any}){
    criteria.region = criteria.region?criteria.region.id:null
    return criteria
  }
}