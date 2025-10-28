import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { HostModel } from '../model/HostModel'
import type { Account } from '../interface/Account'
import type { HostData } from '../interface/data/HostData'
import type { Host } from '../interface/Host'

export class ManagedHostService extends BaseService<HostData, Host>{
  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/hosts`, HostModel)
  }
}