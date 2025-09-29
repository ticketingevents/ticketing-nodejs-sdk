import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { HostData } from '../interface/data/HostData'
import { Host } from '../interface/Host'
import { HostModel } from '../model/HostModel'

export class HostService extends BaseService<HostData, Host>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/hosts", HostModel,
      ["name","country"],
      ["alphabetical"])
  }
}