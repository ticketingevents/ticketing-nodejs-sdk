import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { RegionData, Region } from '../interface'
import { RegionModel } from '../model'

export class RegionService extends BaseService<RegionData, Region>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/regions", RegionModel, ["active"])
  }
}