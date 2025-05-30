import { BaseService } from './BaseService'

import { BadDataError, PermissionError, ResourceNotFoundError } from '../errors'
import { APIAdapter } from '../util'
import { AccountData, Account, LookupData, Lookup, PasswordReset } from '../interface'
import { AccountModel, PasswordResetModel } from '../model'

export class AccountService extends BaseService<AccountData, Account>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/accounts", AccountModel,
      ["number", "email", "username"]
    )

    this.__apiAdapter = apiAdapter
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

  reset(email: string): Promise<PasswordReset>{
    return new Promise<PasswordReset>((resolve, reject) => {
      this.__apiAdapter.post("/resets", {email: email}).then(response => {
        resolve(new PasswordResetModel(response.data, this.__apiAdapter))
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }else if(error.code == 404){
          error = new ResourceNotFoundError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  lookup(query: LookupData): Promise<Lookup>{
    return new Promise<Lookup>((resolve, reject) => {
      this.__apiAdapter.post("/lookups", query).then(response => {
        resolve(response.data)
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }

        reject(error)
      })
    })
  }
}