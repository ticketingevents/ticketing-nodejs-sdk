import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { HostData, Host } from '../interface'
import { HostModel } from '../model'

export class HostService extends BaseService<HostData, Host>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/hosts", HostModel,["account"])
  }
}