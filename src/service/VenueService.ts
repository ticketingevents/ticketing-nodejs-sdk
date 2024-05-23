import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { VenueData, Venue } from '../interface'
import { VenueModel } from '../model'

export class VenueService extends BaseService<VenueData, Venue>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/venues", VenueModel, ["region"])
  }
}