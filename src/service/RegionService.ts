import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { RegionData } from '../interface/data/RegionData'
import { Region } from '../interface/Region'
import { RegionModel } from '../model/RegionModel'

export class RegionService extends BaseService<RegionData, Region>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/regions", RegionModel, ["active"])
  }
}