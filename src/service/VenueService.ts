import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { BadDataError } from '../errors'
import { VenueData, Venue } from '../interface'
import { RegionModel, VenueModel } from '../model'

export class VenueService extends BaseService<VenueData, Venue>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/venues", VenueModel, ["region"])
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
}