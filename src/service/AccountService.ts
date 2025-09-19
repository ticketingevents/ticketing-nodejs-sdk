import { BaseService } from './BaseService'

import { BadDataError, PermissionError, ResourceNotFoundError } from '../errors'
import { APIAdapter } from '../util/APIAdapter'
import type { AccountData } from '../interface/data/AccountData'
import type { Account } from '../interface/Account'
import type { AccountVerification } from '../interface/AccountVerification'
import type { LookupData } from '../interface/data/LookupData'
import type { Lookup } from '../interface/Lookup'
import type { PasswordReset } from '../interface/PasswordReset'
import { AccountModel } from '../model/AccountModel'
import { AccountVerificationModel } from '../model/AccountVerificationModel'
import { PasswordResetModel } from '../model/PasswordResetModel'

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

  verify(email: string): Promise<AccountVerification>{
    return new Promise<AccountVerification>((resolve, reject) => {
      this.__apiAdapter.post("/verifications", {email: email}).then(response => {
        resolve(new AccountVerificationModel(response.data, this.__apiAdapter))
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