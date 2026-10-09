import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { AccountListing } from '../interface/AccountListing'

export class AccountListingModel extends BaseModel implements AccountListing{
  public username: string
  public firstName: string
  public lastName: string
  public title: string

  constructor(account: any, adapter: APIAdapter){
    super(account.self, adapter)

    this.username = account.username
    this.firstName = account.firstName
    this.lastName = account.lastName
    this.title = account.title
  }
}