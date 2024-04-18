import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { Region } from '../interface/Region'


export class RegionService extends BaseService<Region>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/regions")
  }
}