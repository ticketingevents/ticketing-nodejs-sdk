import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { AccountData, Account } from '../interface'
import { AccountModel } from '../model'

export class AccountService extends BaseService<AccountData, Account>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/accounts", AccountModel)
  }
}