import { BaseService } from './BaseService'

import { PermissionError } from '../errors'
import { APIAdapter } from '../util'
import { AccountData, Account } from '../interface'
import { AccountModel } from '../model'

export class AccountService extends BaseService<AccountData, Account>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/accounts", AccountModel,
      ["number", "email", "username"]
    )
  }

  find(number: number|string): Promise<Account>{
    return new Promise<Account>((resolve, reject) => {
      super.find(number).then(account => {
        resolve(account)
      }).catch(error => {
        if(error.code == 403){
          error = new PermissionError(error.code, "You are not authorised to access or modify this account.")
        }

        reject(error)
      })
    })
  }
}